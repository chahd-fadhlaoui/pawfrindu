import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  race: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: String, required: true },   
  city: { type: String, required: true },
  gender: { type: String, required: true },
  category: { type: String, required: true },
  fee: { type: Number, required: true },
  isTrained: { type: String, required: true },
  status: { type: String, enum: ['pending', 'available', 'adopted', 'sold'], default: 'pending' },
  image: { type: String, required: true },
  description: { type: String, required: true },
  candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],  // Référence aux utilisateurs qui postulent pour adopter
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },  // Référence à l'utilisateur qui possède le pet
  isApproved: { type: Boolean, default: false }  // Champ pour gérer l'approbation par l'admin
}, { timestamps: true });

const Pet = mongoose.models.Pet || mongoose.model('Pet', petSchema);

export default Pet;