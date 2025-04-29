import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "TND" },
  paymentRef: { type: String, required: true },
  orderId: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "canceled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;