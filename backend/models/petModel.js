import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  breed: { type: String, required: true },
  age: { 
    type: String, 
    enum: ["puppy", "kitten", "young", "adult", "senior"], // Define age ranges
    required: true 
  },
  city: { type: String, required: true },
  gender: { type: String, required: true },
  species: { // Renamed from "category"
    type: String, 
    enum: ["dog", "cat", "other"], 
    required: true 
  },
  fee: { type: Number, required: true },
  isTrained: { type: Boolean, required: true }, // Changed to Boolean for consistency
  status: { type: String, enum: ["pending", "accepted","adoptionPending","adopted", "sold"], default: "pending" },
  image: { type: String, required: true },
  description: { type: String, required: true },
  candidates: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"], 
      default: "pending" 
    },
  }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  isApproved: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false } // Nouveau champ pour l'archivage
}, { timestamps: true });

const Pet = mongoose.models.Pet || mongoose.model("Pet", petSchema);

export default Pet;