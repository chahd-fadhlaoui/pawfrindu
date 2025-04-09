import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import PetOwnerProfile from "../components/profile/PetOwnerProfile";
import TrainerProfile from "../components/profile/TrainerProfile";
import VetProfile from "../components/profile/VetProfile";

const CreateProfile = () => {
  const navigate = useNavigate();
  const { user, createProfile, error, loading, clearError } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    image: "",
    gender: "",
    petOwnerDetails: {
      address: "",
      phone: "",
      petExperience: {
        hasPreviousPets: false,
        yearsOfExperience: "",
        experience_description: "",
      },
    },
    trainerDetails: {
      governorate: "",
      delegation: "",
      certificationImage: "",
      trainingFacilityType: "",
      geolocation: { latitude: 36.81897, longitude: 10.16579 }, // Tunis default
      serviceAreas: [],
      businessCardImage: "",
      experienceYears: 0,
      phone: "",
      landlinePhone: "",
      languagesSpoken: ["Arabe"],
      services: [{ serviceName: "", fee: "", duration: "" }],
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
      professionalAffiliations: "",
    },
    veterinarianDetails: {
      governorate: "",
      delegation: "",
      landlinePhone: "",
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
    },
  });
  const [userRole, setUserRole] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [progressPercentage, setProgressPercentage] = useState(0);

  const totalSteps = userRole === "PetOwner" ? 3 : 5; // Trainer and Vet get 5 steps

  useEffect(() => {
    if (!user) navigate("/login");
    else setUserRole(user.role);
  }, [user, navigate]);

  useEffect(() => {
    setProgressPercentage((currentStep / totalSteps) * 100);
  }, [currentStep, userRole]);

  const renderRoleComponent = () => {
    switch (userRole) {
      case "PetOwner":
        return <PetOwnerProfile {...commonProps} />;
      case "Trainer":
        return <TrainerProfile {...commonProps} />;
      case "Vet":
        return <VetProfile {...commonProps} />;
      default:
        return null;
    }
  };

  const commonProps = {
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    currentStep,
    setCurrentStep,
    totalSteps,
    userRole,
    createProfile,
    clearError,
    navigate,
    loading,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#ffc929]/5 to-pink-50">
      <div className="container flex items-center justify-center min-h-screen p-4 mx-auto">
        <div className="w-full max-w-2xl p-8 bg-white shadow-xl rounded-2xl">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">Complete Your Profile</h2>

          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#ffc929] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-center text-gray-600 mt-1">
              Step {currentStep} of {totalSteps} ({Math.round(progressPercentage)}%)
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-500 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          {renderRoleComponent()}
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;