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
    gender: {
      type: String,
      enum: ["Femme", "Homme"],
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
        governorate: {
          type: String,
          enum: [
            "Ariana", "Beja", "Ben Arous", "Bizerte", "Gabes", "Gafsa", "Jendouba", 
            "Kairouan", "Kasserine", "Kebili", "Kef", "Mahdia", "Manouba", "Medenine", 
            "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", 
            "Tataouine", "Tozeur", "Tunis", "Zaghouan"
          ],
          required: function () {
            return this.role === "Trainer";
          },
        },
        delegation: {
          type: String, // e.g., "Menzah" in Tunis or "Hammamet" in Nabeul
          required: function () {
            return this.role === "Trainer";
          },
        },
        geolocation: {
          latitude: { 
            type: Number, 
            default: 36.81897, // Tunis as default
          },
          longitude: { 
            type: Number, 
            default: 10.16579, // Tunis as default
          },
        },
        trainingFacilityType: {
          type: String,
          enum: [
            "Fixed Facility", // Dedicated training center (requires geolocation)
            "Public Space",   // Specific public area like a park (requires geolocation)
            "Mobile",         // Travels to clients or various locations (uses serviceAreas)
            "Rural Area"      // Operates in a rural/farm setting (requires geolocation)
          ],
          required: true,
        },
        serviceAreas: [{
          governorate: {
            type: String,
            enum: [
              "Ariana", "Beja", "Ben Arous", "Bizerte", "Gabes", "Gafsa", "Jendouba", 
              "Kairouan", "Kasserine", "Kebili", "Kef", "Mahdia", "Manouba", "Medenine", 
              "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", 
              "Tataouine", "Tozeur", "Tunis", "Zaghouan"
            ],
            required: true,
          },
          delegations: [{
            type: String, // e.g., "La Marsa", "El Mourouj"
          }],
        }],
        businessCardImage: {
          type: String, // URL or path to uploaded business card image
        },
        certificationImage: {
          type: String, // URL or path to uploaded certification photo
          required: function () {
            return this.role === "Trainer";
          },
        },
        experienceYears: { 
          type: Number, 
          min: 0, 
          default: 0,
          required: true,
        },
        phone: {
          type: String, // e.g., "+216 98 123 456"
          required: function () {
            return this.role === "Trainer";
          },
        },
        landlinePhone: {
          type: String, // Optional for fixed locations
        },
        languagesSpoken: {
          type: [String],
          enum: ["Arabe", "Français", "Anglais", "Italien", "Tunisian Dialect"],
          default: ["Arabe"],
          required: true,
        },
        services: [{
          serviceName: { 
            type: String, 
            required: true, // e.g., "Basic Obedience", "Guard Training"
          },
          description: { 
            type: String, 
          },
          fee: { 
            type: Number, 
            min: 0, 
            required: true, // In Tunisian Dinar (TND)
          },
          duration: { 
            type: Number, 
            enum: [30, 45, 60, 90, 120], // Session duration in minutes
          },
        }],
        openingHours: {
          monday: { 
            type: String, 
            enum: ["Single Session", "Double Session", "Closed"], 
            default: "Closed" 
          },
          mondayStart: { type: String, default: "" }, // e.g., "08:00"
          mondayEnd: { type: String, default: "" },   // e.g., "12:00"
          mondayStart2: { type: String, default: "" }, // For Double Session
          mondayEnd2: { type: String, default: "" },
          tuesday: { 
            type: String, 
            enum: ["Single Session", "Double Session", "Closed"], 
            default: "Closed" 
          },
          tuesdayStart: { type: String, default: "" },
          tuesdayEnd: { type: String, default: "" },
          tuesdayStart2: { type: String, default: "" },
          tuesdayEnd2: { type: String, default: "" },
          wednesday: { 
            type: String, 
            enum: ["Single Session", "Double Session", "Closed"], 
            default: "Closed" 
          },
          wednesdayStart: { type: String, default: "" },
          wednesdayEnd: { type: String, default: "" },
          wednesdayStart2: { type: String, default: "" },
          wednesdayEnd2: { type: String, default: "" },
          thursday: { 
            type: String, 
            enum: ["Single Session", "Double Session", "Closed"], 
            default: "Closed" 
          },
          thursdayStart: { type: String, default: "" },
          thursdayEnd: { type: String, default: "" },
          thursdayStart2: { type: String, default: "" },
          thursdayEnd2: { type: String, default: "" },
          friday: { 
            type: String, 
            enum: ["Single Session", "Double Session", "Closed"], 
            default: "Closed" 
          },
          fridayStart: { type: String, default: "" },
          fridayEnd: { type: String, default: "" },
          fridayStart2: { type: String, default: "" },
          fridayEnd2: { type: String, default: "" },
          saturday: { 
            type: String, 
            enum: ["Single Session", "Double Session", "Closed"], 
            default: "Closed" 
          },
          saturdayStart: { type: String, default: "" },
          saturdayEnd: { type: String, default: "" },
          saturdayStart2: { type: String, default: "" },
          saturdayEnd2: { type: String, default: "" },
          sunday: { 
            type: String, 
            enum: ["Single Session", "Double Session", "Closed"], 
            default: "Closed" 
          },
          sundayStart: { type: String, default: "" },
          sundayEnd: { type: String, default: "" },
          sundayStart2: { type: String, default: "" },
          sundayEnd2: { type: String, default: "" },
        },
        trainingPhotos: [String], // Array of URLs or paths to training session photos
        breedsTrained: [{
          breedName: { 
            type: String, // e.g., "Malinois", "Husky", "Sloughi"
          },
        }],
        averageSessionDuration: {
          type: Number,
          enum: [30, 45, 60, 75, 90, 120], // In minutes
          default: 60,
        },
        professionalAffiliations: {
          type: String, // e.g., "Association Tunisienne des Dresseurs de Chiens"
        },
        reviews: [
          {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            comment: String,
            rating: { 
              type: Number, 
              min: 1, 
              max: 5, 
              required: true 
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        rating: {
          type: Number,
          default: 0,
          min: 0,
          max: 5,
        },
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
        businessCardImage: {
          type: String, // URL or path to the uploaded business card image
          
        },
        specializations: [{
          specializationName: {
            type: String,
          },
        }],
         title: {
          type: String,
          enum: ["Doctor", "Professor"], 
        }, 
        governorate: {
          type: String,
          enum: ["Ariana", "Beja", "Ben Arous", "Bizerte", "Gabes", "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kebili", "Kef", "Mahdia", "Manouba", "Medenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"],
        },
        delegation: {
          type: String,
        },
        landlinePhone: String,
        geolocation: {
          latitude: { type: Number, default: 36.8665367 }, // Default to a sample value
          longitude: { type: Number, default: 10.1647233 }, // Default to a sample value
        },
        diplomasAndTraining: String,
        services: [{
          serviceName: String,
          fee: { type: Number, min: 0 },
        }],
        languagesSpoken: {
          type: [String],
          enum: ["Français", "Anglais","Arabe"], // Select field with options
        },
        averageConsultationDuration: {
          type: Number,
          enum: [10, 15, 20, 25, 30, 45, 50, 55, 60], // Select field in minutes
        },
        openingHours: {
          monday: { type: String, enum: ["Single Session", "Double Session", "Closed"], default: "Closed" },
          mondayStart: { type: String, default: "" },
          mondayEnd: { type: String, default: "" },
          mondayStart2: { type: String, default: "" },
          mondayEnd2: { type: String, default: "" },
          tuesday: { type: String, enum: ["Single Session", "Double Session", "Closed"], default: "Closed" },
          tuesdayStart: { type: String, default: "" },
          tuesdayEnd: { type: String, default: "" },
          tuesdayStart2: { type: String, default: "" },
          tuesdayEnd2: { type: String, default: "" },
          wednesday: { type: String, enum: ["Single Session", "Double Session", "Closed"], default: "Closed" },
          wednesdayStart: { type: String, default: "" },
          wednesdayEnd: { type: String, default: "" },
          wednesdayStart2: { type: String, default: "" },
          wednesdayEnd2: { type: String, default: "" },
          thursday: { type: String, enum: ["Single Session", "Double Session", "Closed"], default: "Closed" },
          thursdayStart: { type: String, default: "" },
          thursdayEnd: { type: String, default: "" },
          thursdayStart2: { type: String, default: "" },
          thursdayEnd2: { type: String, default: "" },
          friday: { type: String, enum: ["Single Session", "Double Session", "Closed"], default: "Closed" },
          fridayStart: { type: String, default: "" },
          fridayEnd: { type: String, default: "" },
          fridayStart2: { type: String, default: "" },
          fridayEnd2: { type: String, default: "" },
          saturday: { type: String, enum: ["Single Session", "Double Session", "Closed"], default: "Closed" },
          saturdayStart: { type: String, default: "" },
          saturdayEnd: { type: String, default: "" },
          saturdayStart2: { type: String, default: "" },
          saturdayEnd2: { type: String, default: "" },
          sunday: { type: String, enum: ["Single Session", "Double Session", "Closed"], default: "Closed" },
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
