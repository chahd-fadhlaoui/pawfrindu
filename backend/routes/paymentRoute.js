import express from 'express';
import { handlePaymentWebhook, initiatePayment } from '../controllers/paymentController.js';

const PaymentRouter = express.Router();

// Initiate payment
PaymentRouter.post('/initiate-payment', initiatePayment);

// Webhook for payment confirmation
PaymentRouter.post('/payment-webhook', handlePaymentWebhook);

export default PaymentRouter;