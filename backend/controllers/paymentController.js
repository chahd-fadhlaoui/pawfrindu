import axios from 'axios';
import Pet from '../models/petModel.js';
import Payment from '../models/paymentModel.js';
import User from '../models/userModel.js';
import { sendEmail } from '../services/emailService.js';
import { io } from '../server.js';

// Initiate payment with Konnect
export const initiatePayment = async (req, res) => {
  const { petId, userId } = req.body;

  try {
    // Validate input
    if (!petId || !userId) {
      return res.status(400).json({ success: false, message: 'petId and userId are required' });
    }

    // Validate pet and user
    const pet = await Pet.findById(petId).populate('owner');
    const user = await User.findById(userId);

    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (pet.fee === 0) {
      return res.status(400).json({ success: false, message: 'Pet is free, use adoption form' });
    }
    if (pet.status !== 'pending' && pet.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Pet is not available for purchase' });
    }

    // Call Konnect API
    const response = await axios.post(
      'https://api.sandbox.konnect.network/api/v2/payments/init-payment',
      {
        receiverWalletId: process.env.KONNECT_RECEIVER_WALLET_ID || '6810abffff8215536ac1fb86',
        token: 'TND',
        amount: pet.fee * 1000, // Convert to millimes
        type: 'immediate',
        description: `Purchase of ${pet.name} (Pet ID: ${petId})`,
        acceptedPaymentMethods: ['bank_card'],
        lifespan: 10,
        checkoutForm: false,
        addPaymentFeesToAmount: false,
        firstName: pet.owner?.fullName?.split(' ')[0] || 'Test',
        lastName: pet.owner?.fullName?.split(' ')[1] || 'User',
        phoneNumber: pet.owner?.petOwnerDetails?.phone || '22777777',
        email: pet.owner?.email || 'test.user@gmail.com',
        orderId: petId,
        webhook: 'https://6823-41-226-63-222.ngrok-free.app/api/payment/payment-webhook',
        theme: 'light',
        successUrl: 'https://6823-41-226-63-222.ngrok-free.app/payment-success',
        failUrl: 'https://6823-41-226-63-222.ngrok-free.app/payment-failed',
      },
      {
        headers: {
          'x-api-key': process.env.KONNECT_API_KEY,
        },
        maxRedirects: 0,
      }
    );

    // Validate payUrl
    if (!response.data.payUrl || !response.data.payUrl.startsWith('https://test.clictopay.com')) {
      console.error('Invalid payUrl:', response.data.payUrl);
      throw new Error('Invalid payment URL returned by Konnect');
    }

    // Create new payment record
    const payment = new Payment({
      pet: petId,
      user: userId,
      amount: pet.fee,
      currency: 'TND',
      paymentRef: response.data.paymentRef,
      orderId: petId,
      status: 'pending',
    });
    await payment.save();

    // Update pet payment details
    pet.paymentDetails = {
      paymentRef: response.data.paymentRef,
      paymentStatus: 'pending',
      paymentDate: new Date(),
    };
    await pet.save();

    // Emit Socket.io event
    io.emit('paymentInitiated', {
      petId,
      userId,
      paymentRef: response.data.paymentRef,
      status: 'pending',
    });

    console.log('Payment initiated:', {
      paymentRef: response.data.paymentRef,
      payUrl: response.data.payUrl,
      petId,
      userId,
    });

    res.json({
      success: true,
      payUrl: response.data.payUrl,
      paymentRef: response.data.paymentRef,
    });
  } catch (error) {
    console.error('Payment initiation error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to initiate payment',
      error: error.message,
    });
  }
};

// Handle Konnect payment webhook (POST and GET)
export const handlePaymentWebhook = async (req, res) => {
  // Log all query parameters for GET, body for POST
  const params = req.method === 'GET' ? req.query : req.body;
  console.log('Webhook received:', {
    params,
    method: req.method,
    query: req.query,
    body: req.body,
    userAgent: req.headers['user-agent'],
  });

  // Extract paymentRef, status, orderId
  let { paymentRef, status, orderId } = params;

  // Map alternative parameter names
  paymentRef = paymentRef || params.payment_ref || params.transactionId || params.mdOrder;
  status = status || params.payment_status || params.statusCode;
  orderId = orderId || params.order_id || params.orderId;

  try {
    // If orderId is missing, infer from Payment collection
    if (!orderId && paymentRef) {
      const payment = await Payment.findOne({ paymentRef });
      if (payment) {
        orderId = payment.orderId;
        console.log('Inferred orderId from Payment:', orderId);
      }
    }

    // If status is missing, query Konnect API with retry
    if (!status && paymentRef) {
      let attempts = 0;
      const maxAttempts = 3;
      const retryDelay = 1000; // 1 second

      while (attempts < maxAttempts) {
        try {
          const konnectResponse = await axios.get(
            `https://api.sandbox.konnect.network/api/v2/payments/${paymentRef}`,
            {
              headers: {
                'x-api-key': process.env.KONNECT_API_KEY,
              },
            }
          );
          console.log('Konnect API response:', {
            paymentRef,
            status: konnectResponse.data.payment?.status,
            fullResponse: konnectResponse.data,
          });

          // Map Konnect statuses to internal statuses
          const konnectStatus = konnectResponse.data.payment?.status?.toLowerCase();
          if (['completed', 'success', 'approved', 'succeeded'].includes(konnectStatus)) {
            status = 'completed';
          } else {
            status = 'failed';
          }
          console.log('Inferred status from Konnect API:', status);
          break; // Exit loop on success
        } catch (error) {
          attempts++;
          console.error(`Konnect API attempt ${attempts} failed:`, {
            paymentRef,
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
          if (attempts === maxAttempts) {
            console.error('Max attempts reached, defaulting to failed status.');
            status = 'failed';
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }

    // Validate parameters
    if (!paymentRef || !status || !orderId) {
      console.error('Missing webhook parameters:', { paymentRef, status, orderId, params });
      const userAgent = req.headers['user-agent'] || '';
      const isBrowser = /Mozilla|Chrome|Safari|Firefox|Edge/i.test(userAgent);
      if (req.method === 'GET' && isBrowser) {
        return res.redirect('https://6823-41-226-63-222.ngrok-free.app/payment-failed');
      }
      return res.status(400).json({
        success: false,
        message: 'Missing paymentRef, status, or orderId',
        receivedParams: params,
      });
    }

    // Validate status
    if (!['completed', 'failed'].includes(status)) {
      console.error('Invalid webhook status:', { status, params });
      const userAgent = req.headers['user-agent'] || '';
      const isBrowser = /Mozilla|Chrome|Safari|Firefox|Edge/i.test(userAgent);
      if (req.method === 'GET' && isBrowser) {
        return res.redirect('https://6823-41-226-63-222.ngrok-free.app/payment-failed');
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid status, must be "completed" or "failed"',
        receivedParams: params,
      });
    }

    // Find pet and payment
    const pet = await Pet.findOne({
      $or: [{ 'paymentDetails.paymentRef': paymentRef }, { _id: orderId }],
    }).populate('owner');
    const payment = await Payment.findOne({ paymentRef });

    if (!pet) {
      console.error('Pet not found for paymentRef:', paymentRef, 'or orderId:', orderId);
      const userAgent = req.headers['user-agent'] || '';
      const isBrowser = /Mozilla|Chrome|Safari|Firefox|Edge/i.test(userAgent);
      if (req.method === 'GET' && isBrowser) {
        return res.redirect('https://6823-41-226-63-222.ngrok-free.app/payment-failed');
      }
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    if (!payment) {
      console.error('Payment record not found for paymentRef:', paymentRef);
      const userAgent = req.headers['user-agent'] || '';
      const isBrowser = /Mozilla|Chrome|Safari|Firefox|Edge/i.test(userAgent);
      if (req.method === 'GET' && isBrowser) {
        return res.redirect('https://6823-41-226-63-222.ngrok-free.app/payment-failed');
      }
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Check if pet is already sold
    if (pet.status === 'sold') {
      console.warn('Pet already sold:', { petId: pet._id, paymentRef });
      const userAgent = req.headers['user-agent'] || '';
      const isBrowser = /Mozilla|Chrome|Safari|Firefox|Edge/i.test(userAgent);
      if (req.method === 'GET' && isBrowser) {
        return res.redirect('https://6823-41-226-63-222.ngrok-free.app/payment-failed');
      }
      return res.status(400).json({ success: false, message: 'Pet is already sold' });
    }

    // Update payment status
    pet.paymentDetails.paymentStatus = status;
    payment.status = status;

    // Handle successful payment
    if (status === 'completed') {
      // Store previous owner (unchanged)
      const previousOwner = pet.owner;
      pet.status = 'sold';
      pet.candidates = []; // Clear candidates, as this is a sale

      // Fetch buyer
      const buyer = await User.findById(payment.user);
      if (!buyer) {
        console.error('Buyer not found:', { userId: payment.user, paymentRef });
        throw new Error('Buyer not found');
      }

      // Initialize petOwnerDetails if undefined
      if (!buyer.petOwnerDetails) {
        buyer.petOwnerDetails = { currentPets: [] };
      }
      // Ensure currentPets is an array and filter out invalid entries
      if (!Array.isArray(buyer.petOwnerDetails.currentPets)) {
        buyer.petOwnerDetails.currentPets = [];
      }
      buyer.petOwnerDetails.currentPets = buyer.petOwnerDetails.currentPets.filter(
        pet => pet && pet.petId // Remove null/undefined entries or those missing petId
      );

      // Add pet to buyer's currentPets with full details
      const petDetails = {
        petId: pet._id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        image: pet.image,
      };
      // Check if pet is already in currentPets
      const isPetInCurrentPets = buyer.petOwnerDetails.currentPets.some(p => 
        p.petId && p.petId.toString() === pet._id.toString()
      );
      if (!isPetInCurrentPets) {
        buyer.petOwnerDetails.currentPets.push(petDetails);
        await buyer.save();
        console.log('Buyer updated with pet:', { userId: buyer._id, petId: pet._id, petDetails });
      } else {
        console.log('Pet already in buyer\'s currentPets:', { petId: pet._id, userId: buyer._id });
      }

      // Send email notifications
      if (previousOwner && buyer) {
        // Email to former owner
        const formerOwnerEmailData = {
          formerOwnerFullName: previousOwner.fullName,
          petName: pet.name,
          newOwnerFullName: buyer.fullName,
          newOwnerEmail: buyer.email,
          newOwnerPhone: buyer.petOwnerDetails?.phone || 'Not provided',
        };
        const emailToFormerOwner = await sendEmail({
          to: previousOwner.email,
          template: 'petSoldToFormerOwner',
          data: formerOwnerEmailData,
        });
        console.log('Email to former owner sent:', emailToFormerOwner);

        // Email to buyer
        const buyerEmailData = {
          newOwnerFullName: buyer.fullName,
          petName: pet.name,
          formerOwnerFullName: previousOwner.fullName,
          formerOwnerEmail: previousOwner.email,
          formerOwnerPhone: previousOwner.petOwnerDetails?.phone || 'Not provided',
        };
        const emailToNewOwner = await sendEmail({
          to: buyer.email,
          template: 'petPurchaseToNewOwner',
          data: buyerEmailData,
        });
        console.log('Email to buyer sent:', emailToNewOwner);
      } else {
        console.error('Failed to send emails: missing owner information', {
          previousOwnerExists: !!previousOwner,
          buyerExists: !!buyer,
        });
      }
    }

    await Promise.all([pet.save(), payment.save()]);

    // Emit Socket.IO event
    io.emit('paymentStatusUpdated', {
      petId: pet._id,
      paymentRef,
      status,
      userId: payment.user,
      message: `Payment ${status} for pet ${pet.name}`,
    });

    console.log('Webhook processed successfully:', {
      petId: pet._id,
      paymentRef,
      status,
    });

    // Handle browser redirects
    const userAgent = req.headers['user-agent'] || '';
    const isBrowser = /Mozilla|Chrome|Safari|Firefox|Edge/i.test(userAgent);
    if (req.method === 'GET' && isBrowser) {
      return res.redirect(
        status === 'completed'
          ? 'https://6823-41-226-63-222.ngrok-free.app/payment-success'
          : 'https://6823-41-226-63-222.ngrok-free.app/payment-failed'
      );
    }

    // Return JSON for server-to-server requests
    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', {
      message: error.message,
      stack: error.stack,
      params,
    });
    const userAgent = req.headers['user-agent'] || '';
    const isBrowser = /Mozilla|Chrome|Safari|Firefox|Edge/i.test(userAgent);
    if (req.method === 'GET' && isBrowser) {
      return res.redirect('https://6823-41-226-63-222.ngrok-free.app/payment-failed');
    }
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      receivedParams: params,
    });
  }
};