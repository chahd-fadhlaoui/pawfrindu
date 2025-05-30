import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    petOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    professionalType: {
      type: String,
      enum: ["Vet", "Trainer"],
      required: true,
    },
    date: {
      type: String, // Format: "YYYY-MM-DD"
      required: true,
    },
    time: {
      type: String, // Format: "HH:mm"
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    petName: {
      type: String,
      required: true,
    },
    petType: {
      type: String,
      required: true,
    },
    petAge: {
      type: String,
    },
    petSource: {
      type: String,
      enum: ["owned", "adopted", "other"],
      required: true,
    },
    breed: { type: String, default: "Unknown" }, // Add breed
    gender: { type: String, default: "Unknown" }, // Add gender
    address: { type: String, default: "Unknown" }, // Add address
    isTrained: { type: Boolean, default: false }, // Add isTrained
    reason: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled","notAvailable"],
      default: "pending",
    },
    cancellationReason: {
      type: String, // Stores reason for cancellation
    },
    completedAt: {
      type: Date, // Tracks when the appointment was marked as completed
    },
    completionNotes: {
      type: String, // Notes added by vet upon completion, e.g., treatment summary
    },
    confirmedAt: {
      type: Date, // Tracks when the appointment was confirmed
    },

  },
  { timestamps: true }
);

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema);

export default appointmentModel;