import mongoose from "mongoose";

const lostAndFoundSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Lost", "Found"], required: true },
    name: { type: String, required: false },
    species: { type: String, required: true },
    breed: { type: String, required: false },
    gender: { type: String, enum: ["Male", "Female"], required: false },
    isPregnant: { type: Boolean, required: false, default: null },
    colorType: { type: String, required: false },
    color: { type: [String], required: true },
    size: { type: String, required: false },
    age: { type: String, required: false },
    date: { type: Date, required: true },
    location: {
      governorate: { type: String, required: true },
      delegation: { type: String, required: true },
      coordinates: {
        type: { type: String, enum: ["Point"], required: false },
        coordinates: { type: [Number], required: false }, // [longitude, latitude]
      },
    },
    photos: { type: [String], required: false },
    email: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    description: { type: String, required: false },
    microchipNumber: { type: String, required: false },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: false },
    status: { type: String, enum: ["Pending", "Matched", "Reunited"], required: true, default: "Pending" },
    isApproved: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    matchedReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LostAndFound",
      required: false,
    },
  },
  { timestamps: true }
);

// Define indexes
lostAndFoundSchema.index({ type: 1 });
lostAndFoundSchema.index({ species: 1 });
lostAndFoundSchema.index({ status: 1 });
lostAndFoundSchema.index({ isApproved: 1 });
lostAndFoundSchema.index({ isArchived: 1 });
lostAndFoundSchema.index({ "location.governorate": 1 });
lostAndFoundSchema.index({ "location.delegation": 1 });
lostAndFoundSchema.index({ breed: 1 });
lostAndFoundSchema.index({ gender: 1 });
lostAndFoundSchema.index({ isPregnant: 1 });
lostAndFoundSchema.index({ color: 1 });
lostAndFoundSchema.index({ size: 1 });
lostAndFoundSchema.index({ age: 1 });
lostAndFoundSchema.index({ colorType: 1 });
lostAndFoundSchema.index({ microchipNumber: 1 });
lostAndFoundSchema.index({ date: 1 });
lostAndFoundSchema.index({ "location.coordinates": "2dsphere" });

const LostAndFound = mongoose.models.LostAndFound || mongoose.model("LostAndFound", lostAndFoundSchema);

export default LostAndFound;