import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    about: String,
    role: {
      type: String,
      enum: ["PetOwner", "Trainer", "Vet", "Admin"],
      required: true,
    },
    adminType: {
      type: String,
      enum: [
        "Super Admin",
        "Admin Adoption",
        "Admin Vet",
        "Admin Trainer",
        "Admin Lost & Found",
      ],
      required: function () {
        return this.role === "Admin";
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
    gender: {
      type: String,
      enum: ["Female", "Male"],
    },
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
        reasonForAdoption: String,
        readiness: {
          type: String,
          enum: ["immediate", "within_a_month", "later"],
        },
      },
      default: undefined,
    },
    trainerDetails: {
      type: {
        governorate: {
          type: String,
          required: function () {
            return this.role === "Trainer";
          },
        },
        delegation: {
          type: String,
          required: function () {
            return this.role === "Trainer";
          },
        },
        geolocation: {
          latitude: { type: Number, default: 36.81897 },
          longitude: { type: Number, default: 10.16579 },
        },
        trainingFacilityType: {
          type: String,
          enum: ["Fixed Facility", "Mobile"],
          required: true,
        },
        serviceAreas: [
          {
            governorate: { type: String, required: true },
            delegations: [{ type: String }],
          },
        ],
        businessCardImage: { type: String },
        certificationImage: {
          type: String,
          required: function () {
            return this.role === "Trainer";
          },
        },
        phone: {
          type: String,
          required: function () {
            return this.role === "Trainer";
          },
        },
        secondaryPhone: { type: String },
        languagesSpoken: {
          type: [String],
          default: ["Arabic"],
          required: true,
        },
        services: [
          {
            serviceName: String,
            fee: { type: Number, min: 0 },
          },
        ],
        openingHours: {
          monday: {
            type: String,
            enum: ["Single Session", "Double Session", "Closed"],
            default: "Closed",
          },
          mondayStart: { type: String, default: "" },
          mondayEnd: { type: String, default: "" },
          mondayStart2: { type: String, default: "" },
          mondayEnd2: { type: String, default: "" },
          tuesday: {
            type: String,
            enum: ["Single Session", "Double Session", "Closed"],
            default: "Closed",
          },
          tuesdayStart: { type: String, default: "" },
          tuesdayEnd: { type: String, default: "" },
          tuesdayStart2: { type: String, default: "" },
          tuesdayEnd2: { type: String, default: "" },
          wednesday: {
            type: String,
            enum: ["Single Session", "Double Session", "Closed"],
            default: "Closed",
          },
          wednesdayStart: { type: String, default: "" },
          wednesdayEnd: { type: String, default: "" },
          wednesdayStart2: { type: String, default: "" },
          wednesdayEnd2: { type: String, default: "" },
          thursday: {
            type: String,
            enum: ["Single Session", "Double Session", "Closed"],
            default: "Closed",
          },
          thursdayStart: { type: String, default: "" },
          thursdayEnd: { type: String, default: "" },
          thursdayStart2: { type: String, default: "" },
          thursdayEnd2: { type: String, default: "" },
          friday: {
            type: String,
            enum: ["Single Session", "Double Session", "Closed"],
            default: "Closed",
          },
          fridayStart: { type: String, default: "" },
          fridayEnd: { type: String, default: "" },
          fridayStart2: { type: String, default: "" },
          fridayEnd2: { type: String, default: "" },
          saturday: {
            type: String,
            enum: ["Single Session", "Double Session", "Closed"],
            default: "Closed",
          },
          saturdayStart: { type: String, default: "" },
          saturdayEnd: { type: String, default: "" },
          saturdayStart2: { type: String, default: "" },
          saturdayEnd2: { type: String, default: "" },
          sunday: {
            type: String,
            enum: ["Single Session", "Double Session", "Closed"],
            default: "Closed",
          },
          sundayStart: { type: String, default: "" },
          sundayEnd: { type: String, default: "" },
          sundayStart2: { type: String, default: "" },
          sundayEnd2: { type: String, default: "" },
        },
        trainingPhotos: [String],
        breedsTrained: [
          {
            species: { type: String },
            breedName: { type: String },
          },
        ],
        averageSessionDuration: {
          type: Number,
        },
        reviews: {
          type: [
            {
              userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
              comment: String,
              rating: { type: Number, min: 1, max: 5, required: true },
              createdAt: { type: Date, default: Date.now },
            },
          ],
          default: [],
        },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        socialLinks: {
          facebook: { type: String },
          instagram: { type: String },
          website: { type: String },
        },
      },
      default: undefined,
    },
    veterinarianDetails: {
      type: {
        businessCardImage: { type: String },
        specializations: [{ specializationName: { type: String } }],
        title: {
          type: String,
          enum: ["Doctor", "Professor"],
        },
        governorate: { type: String },
        delegation: { type: String },
        phone: {
          type: String,
          required: function () {
            return this.role === "Vet";
          },
        },
        secondaryPhone: { type: String },
        geolocation: {
          latitude: { type: Number, default: 36.8665367 },
          longitude: { type: Number, default: 10.1647233 },
        },
        diplomasAndTraining: String,
        services: [
          {
            serviceName: String,
            fee: { type: Number, min: 0 },
          },
        ],
        languagesSpoken: { type: [String] },
        averageConsultationDuration: {
          type: Number,
          enum: [10, 15, 20, 25, 30, 45, 50, 55, 60],
        },
        openingHours: {
          monday: {
            type: String,
            enum: ["Single Session", "Double Session", "Closed"],
            default: "Closed",
          },
          mondayStart: { type: String, default: "" },
          mondayEnd: { type: String, default: "" },
          mondayStart2: { type: String, default: "" },
          mondayEnd2: { type: String, default: "" },
          tuesday: {
            type: String,
            enum: ["Single Session", "Double Session", "Closed"],
            default: "Closed",
          },
          tuesdayStart: { type: String, default: "" },
          tuesdayEnd: { type: String, default: "" },
          tuesdayStart2: { type: String, default: "" },
          tuesdayEnd2: { type: String, default: "" },
          wednesday: {
            type: String,
            enum: ["Single Session", "Double Session", "Closed"],
            default: "Closed",
          },
          wednesdayStart: { type: String, default: "" },
          wednesdayEnd: { type: String, default: "" },
          wednesdayStart2: { type: String, default: "" },
          wednesdayEnd2: { type: String, default: "" },
          thursday: {
            type: String,
            enum: ["Single Session", "Double Session", "Closed"],
            default: "Closed",
          },
          thursdayStart: { type: String, default: "" },
          thursdayEnd: { type: String, default: "" },
          thursdayStart2: { type: String, default: "" },
          thursdayEnd2: { type: String, default: "" },
          friday: {
            type: String,
            enum: ["Single Session", "Double Session", "Closed"],
            default: "Closed",
          },
          fridayStart: { type: String, default: "" },
          fridayEnd: { type: String, default: "" },
          fridayStart2: { type: String, default: "" },
          fridayEnd2: { type: String, default: "" },
          saturday: {
            type: String,
            enum: ["Single Session", "Double Session", "Closed"],
            default: "Closed",
          },
          saturdayStart: { type: String, default: "" },
          saturdayEnd: { type: String, default: "" },
          saturdayStart2: { type: String, default: "" },
          saturdayEnd2: { type: String, default: "" },
          sunday: {
            type: String,
            enum: ["Single Session", "Double Session", "Closed"],
            default: "Closed",
          },
          sundayStart: { type: String, default: "" },
          sundayEnd: { type: String, default: "" },
          sundayStart2: { type: String, default: "" },
          sundayEnd2: { type: String, default: "" },
        },
        clinicPhotos: [String],
      },
      default: undefined,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
