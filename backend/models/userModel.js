import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["PetOwner", "Trainer", "Veterinarian", "Admin"],
      required: true,
    },
    isArchieve: {
      type: Boolean,
      default: false,
    },
    image: String,
    lastLogin: Date,
    petOwnerDetails: {
      currentPets: [], // the pets he adopted via our platform
      address: String,
      phone: String,
      occupation: String, // Have money or not to take care of the pet
      // Lifestyle (formulaire)
      workSchedule: {
        type: String,
        enum: ["full-time", "part-time", "remote", "flexible", "other"],
      },
      // Living Situation (formulaire)
      housing: {
        type: {
          type: String,
          enum: ["villa", "house", "apartment", "condo", "other"],
        },
        ownership: {
          type: String,
          enum: ["own", "rent"],
        },
        familySize: { type: Number, min: 1 },
        landlordApproval: {
          type: Boolean,
          required: function () {
            return this.housing?.ownership === "rent";
          },
        },
      },
      // Pet Experience will appear in the creation of the profile if the user has hasPreviousPets set to true he will fill the yearsOfExperience and the experinece_description
      petExperience: {
        hasPreviousPets: {
          type: Boolean,
        },

        yearsOfExperience: {
          type: Number,
          min: 0,
        },
        experinece_description: String, // Detailed description of pet experience
      },
    },
    trainerDetails: {
      location: String,
      certification: String,
      specialization: String,
      experienceYears: { type: Number, min: 0 },
      availableHours: String,
    },
    veterinarianDetails: {
      location: String,
      degree: String,
      specialization: String,
      experienceYears: { type: Number, min: 0 },
      availableHours: String,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model('user',userSchema)

export default userModel