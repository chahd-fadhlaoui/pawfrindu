import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    about:String,
    role: {
      type: String,
      enum: ["PetOwner", "Trainer", "Vet", "Admin"],
      required: true,
    },
    adminType: {  
      type: String,
      enum: ["Super Admin", "Admin Adoption", "Admin Vet", "Admin Trainer", "Admin Lost & Found"],
      required: function () {
        return this.role === "Admin"; // Obligatoire uniquement pour les admins
      },
    },
    isActive: {
      type: Boolean,
      default: function () {
        return this.role === "Vet" || this.role === "Trainer" ? false : true;
      },
    },
    isArchieve: {
      type: Boolean,
      default: false,
    },
    image: String,
    lastLogin: Date,
    petOwnerDetails: {
      type: {
        currentPets: { type: Array, default: [] },
        address: {
          type: String,
          required: function () {
            return this.role === "PetOwner";
          },
        },
        phone: {
          type: String,
          required: function () {
            return this.role === "PetOwner";
          },
        },
        occupation: String,
        workSchedule: {
          type: String,
          enum: ["full-time", "part-time", "remote", "flexible", "other"],
        },
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
        petExperience: {
          hasPreviousPets: Boolean,
          yearsOfExperience: { type: Number, min: 0 },
          experience_description: String,
        },
        reasonForAdoption: String, // Nouveau champ
        readiness: {
          type: String,
          enum: ["immediate", "within_a_month", "later"],
        }, // Nouveau champ
      },
      default: undefined,
    },
    trainerDetails: {
      type: {
        location: {
          type: String,
          required: function () {
            return this.role === "Trainer";
          },
        },
        certification: {
          type: String,
          required: function () {
            return this.role === "Trainer";
          },
        },
        specialization: String,
        experienceYears: { type: Number, min: 0 },
        availableHours: String,
      },
      default: undefined,
    },
    veterinarianDetails: {
      type: {
        location: {
          type: String,
          required: function () {
            return this.role === "Vet";
          },
        },
        degree: {
          type: String,
          required: function () {
            return this.role === "Vet";
          },
        },
        specialization: String,
        experienceYears: { type: Number, min: 0 },
        availableHours: String,
      },
      default: undefined,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
