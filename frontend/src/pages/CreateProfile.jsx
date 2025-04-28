import { PawPrint } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PetOwnerProfile from "../components/profile/PetOwnerProfile";
import TrainerProfile from "../components/profile/trainer/TrainerProfile";
import VetProfile from "../components/profile/Vet/VetProfile";
import { useApp } from "../context/AppContext";

const CreateProfile = () => {
  const navigate = useNavigate();
  const { user, createProfile, error, loading, clearError } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    image: "",
    gender: "",
    about: "",
    acceptedTerms: false,
    petOwnerDetails: {
      address: {
        governorate: "",
        delegation: "",
        street: "",
      },
      phone: "",
    },
    trainerDetails: {
      governorate: "",
      delegation: "",
      certificationImage: "",
      trainingFacilityType: "",
      geolocation: { latitude: 36.81897, longitude: 10.16579 },
      serviceAreas: [],
      businessCardImage: "",
      phone: "",
      secondaryPhone: "",
      languagesSpoken: ["Arabic"],
      services: [{ serviceName: "", fee: "" }],
      openingHours: {
        monday: "Closed", mondayStart: "", mondayEnd: "", mondayStart2: "", mondayEnd2: "",
        tuesday: "Closed", tuesdayStart: "", tuesdayEnd: "", tuesdayStart2: "", tuesdayEnd2: "",
        wednesday: "Closed", wednesdayStart: "", wednesdayEnd: "", wednesdayStart2: "", wednesdayEnd2: "",
        thursday: "Closed", thursdayStart: "", thursdayEnd: "", thursdayStart2: "", thursdayEnd2: "",
        friday: "Closed", fridayStart: "", fridayEnd: "", fridayStart2: "", fridayEnd2: "",
        saturday: "Closed", saturdayStart: "", saturdayEnd: "", saturdayStart2: "", saturdayEnd2: "",
        sunday: "Closed", sundayStart: "", sundayEnd: "", sundayStart2: "", sundayEnd2: "",
      },
      trainingPhotos: [],
      breedsTrained: [],
      averageSessionDuration: 60,
      socialLinks: {
        facebook: "",
        instagram: "",
        website: "",
      },
    },
    veterinarianDetails: {
      governorate: "",
      delegation: "",
      phone: "",
      secondaryPhone: "",
      geolocation: { latitude: 36.8665367, longitude: 10.1647233 },
      diplomasAndTraining: "",
      services: [{ serviceName: "", fee: "" }],
      languagesSpoken: [],
      averageConsultationDuration: "",
      openingHours: {
        monday: "Closed", mondayStart: "", mondayEnd: "", mondayStart2: "", mondayEnd2: "",
        tuesday: "Closed", tuesdayStart: "", tuesdayEnd: "", tuesdayStart2: "", tuesdayEnd2: "",
        wednesday: "Closed", wednesdayStart: "", wednesdayEnd: "", wednesdayStart2: "", wednesdayEnd2: "",
        thursday: "Closed", thursdayStart: "", thursdayEnd: "", thursdayStart2: "", thursdayEnd2: "",
        friday: "Closed", fridayStart: "", fridayEnd: "", fridayStart2: "", fridayEnd2: "",
        saturday: "Closed", saturdayStart: "", saturdayEnd: "", saturdayStart2: "", saturdayEnd2: "",
        sunday: "Closed", sundayStart: "", sundayEnd: "", sundayStart2: "", sundayEnd2: "",
      },
      clinicPhotos: [],
      businessCardImage: "",
      specializations: [],
      title: "",
    },
  });
  const [userRole, setUserRole] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState({});

  const totalSteps = userRole === "PetOwner" ? 2 : userRole === "Trainer" ? 5 : 5; 
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setUserRole(user.role);
    }
  }, [user, navigate]);

  const renderRoleComponent = () => {
    if (!userRole) {
      return (
        <div className="text-center text-gray-600">
          Loading user role...
        </div>
      );
    }
    switch (userRole) {
      case "PetOwner":
        return <PetOwnerProfile {...commonProps} />;
      case "Trainer":
        return <TrainerProfile {...commonProps} />;
      case "Vet":
        return <VetProfile {...commonProps} />;
      default:
        return (
          <div className="text-center text-red-600">
            Invalid user role
          </div>
        );
    }
  };

  const commonProps = {
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    formSuccess,
    setFormSuccess,
    currentStep,
    setCurrentStep,
    totalSteps,
    userRole,
    createProfile,
    clearError,
    navigate,
    loading,
  };

  const PawBackground = () => (
    Array(6)
      .fill(null)
      .map((_, index) => (
        <PawPrint
          key={index}
          className={`absolute w-8 h-8 opacity-10 animate-float text-[#ffc929] ${
            index % 2 === 0 ? "top-1/4" : "top-3/4"
          } ${index % 3 === 0 ? "left-1/4" : index % 3 === 1 ? "left-1/2" : "left-3/4"}`}
          style={{ animationDelay: `${index * 0.5}s`, transform: `rotate(${index * 45}deg)` }}
        />
      ))
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-pink-50 to-[#ffc929]/10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <PawBackground />
      </div>
      <div className="relative max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-[#ffc929]/10 p-8 animate-fadeIn">
          <div className="mb-8 space-y-4 text-center">
            <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
              <PawPrint className="w-4 h-4 mr-2 text-[#ffc929]" />
              Create Your Profile
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              Set Up Your {userRole || "Profile"}
            </h2>
            <p className="max-w-md mx-auto text-gray-600">
              Share a bit about yourself to connect with the pet community!
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 mb-6 border border-red-200 bg-red-50 rounded-xl animate-fadeIn">
              <PawPrint size={20} className="text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-center gap-4 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <button
                key={step}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 ${
                  step <= currentStep
                    ? "bg-[#ffc929] text-white shadow-md"
                    : "bg-gray-200 text-gray-600 hover:bg-[#ffc929]/20"
                }`}
                onClick={() => setCurrentStep(step)}
                disabled={loading}
                aria-label={`Go to step ${step}`}
              >
                {step}
              </button>
            ))}
          </div>

          {renderRoleComponent()}
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;