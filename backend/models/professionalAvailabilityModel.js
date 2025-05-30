import mongoose from 'mongoose';

const professionalAvailabilitySchema = new mongoose.Schema({
  professionalId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  professionalType: { type: String, enum: ['Vet', 'Trainer'], required: true },
  unavailableSlots: [{
    date: { type: String, required: true }, // e.g., "2025-06-28"
    isAvailable: { type: Boolean, default: false },
  }],
});

export default mongoose.model('ProfessionalAvailability', professionalAvailabilitySchema);