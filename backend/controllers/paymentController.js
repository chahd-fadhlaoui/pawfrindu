import axios from "axios";
import Pet from "../models/petModel.js";
import { io } from "../server.js";

// Initiate payment with Konnect
const initiatePayment = async (req, res) => {
  const { petId, userId } = req.body;

  try {
    // Validate pet
    const pet = await Pet.findById(petId).populate("owner");
    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }
    if (pet.fee === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Pet is free, use adoption form" });
    }
    if (pet.status !== "pending" && pet.status !== "accepted") {
      return res
        .status(400)
        .json({ success: false, message: "Pet is not available for purchase" });
    }

    // Call Konnect API
    const response = await axios.post(
      "https://api.sandbox.konnect.network/api/v2/payments/init-payment",
      {
        receiverWalletId: "6810abffff8215536ac1fb86",
        token: "TND",
        amount: pet.fee * 1000, // Convert to millimes
        type: "immediate",
        description: `Purchase of ${pet.name} (Pet ID: ${petId})`,
        acceptedPaymentMethods: ["bank_card"],
        lifespan: 10,
        checkoutForm: false,
        addPaymentFeesToAmount: false,
        firstName: pet.owner?.fullName?.split(" ")[0] || "Test",
        lastName: pet.owner?.fullName?.split(" ")[1] || "User",
        phoneNumber: pet.owner?.petOwnerDetails?.phone || "22777777",
        email: pet.owner?.email || "test.user@gmail.com",
        orderId: petId,
        theme: "light",
        successUrl: "http://localhost:5173/payment-success",
        failUrl: "http://localhost:5173/payment-failed",
      },
      {
        headers: {
          "x-api-key": process.env.KONNECT_API_KEY,
        },
        maxRedirects: 0,
      }
    );

    // Save payment details
    pet.paymentDetails = {
      paymentRef: response.data.paymentRef,
      paymentStatus: "pending",
    };
    await pet.save();

    // Emit Socket.io event
    io.emit("paymentInitiated", {
      petId,
      userId,
      paymentRef: response.data.paymentRef,
      status: "pending",
    });

    res.json({
      success: true,
      payUrl: response.data.payUrl,
      paymentRef: response.data.paymentRef,
    });
  } catch (error) {
    console.error(
      "Payment initiation error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Failed to initiate payment",
    });
  }
};

// Handle Konnect payment webhook
const handlePaymentWebhook = async (req, res) => {
  const { paymentRef, status, orderId } = req.body;

  try {
    // Find pet by paymentRef or orderId
    const pet = await Pet.findOne({
      $or: [{ "paymentDetails.paymentRef": paymentRef }, { _id: orderId }],
    });

    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    // Update payment status
    pet.paymentDetails.paymentStatus =
      status === "completed" ? "completed" : "failed";
    pet.paymentDetails.paymentDate = new Date();

    // Update pet status if payment is successful
    if (status === "completed") {
      pet.status = "sold";
      pet.candidates = []; // Clear candidates as pet is sold
    }

    await pet.save();

    // Emit Socket.io event
    io.emit("paymentStatusUpdated", {
      petId: pet._id,
      paymentRef,
      status,
      userId: pet.owner?._id,
    });

    res.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Webhook processing failed" });
  }
};
export { initiatePayment, handlePaymentWebhook };
