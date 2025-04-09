import React, { useState } from "react";
import Step1PersonalInfo from "./Step1PersonalInfo";
import Step2Credentials from "./Step2Credentials";
import Step3ServicesSchedule from "./Step3ServicesSchedule";
import Step4Location from "./Step4Location";
import Step5Review from "./Step5Review";

const TrainerProfile = ({
  formData,
  setFormData,
  formErrors,
  setFormErrors,
  currentStep,
  setCurrentStep,
  totalSteps,
  createProfile,
  clearError,
  navigate,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => {
    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

    const allErrors = {};
    for (let step = 1; step <= 5; step++) {
      setCurrentStep(step);
      Object.assign(allErrors, validateCurrentStep());
    }
    setCurrentStep(totalSteps);

    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const profileDetails = {
        image: formData.image,
        gender: formData.gender,
        trainerDetails: formData.trainerDetails,
      };
      const result = await createProfile(profileDetails);
      if (result.success) {
        navigate("/trainer-pending-approval", { replace: true });
      }
    } catch (error) {
      console.error("Submission error:", error);
      setFormErrors({ submit: error.response?.data?.message || "Failed to create profile" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateCurrentStep = () => {
    const errors = {};
    if (currentStep === 1) {
      if (!formData.image) errors.image = "Profile photo is required";
      if (!formData.gender) errors.gender = "Gender is required";
      if (!(formData.trainerDetails.languagesSpoken || []).length)
        errors.languagesSpoken = "At least one language is required";
      if (!formData.trainerDetails.phone) errors.phone = "Phone number is required";
    } else if (currentStep === 2) {
      if (!formData.trainerDetails.certificationImage)
        errors.certificationImage = "Certification image is required";
      if (!formData.trainerDetails.trainingFacilityType)
        errors.trainingFacilityType = "Training facility type is required";
      if (
        ["Fixed Facility", "Public Space", "Rural Area"].includes(formData.trainerDetails.trainingFacilityType) &&
        (!formData.trainerDetails.geolocation.latitude || !formData.trainerDetails.geolocation.longitude)
      ) {
        errors.geolocation = "Geolocation is required for this facility type";
      }
      if (formData.trainerDetails.trainingFacilityType === "Mobile" && !(formData.trainerDetails.serviceAreas || []).length) {
        errors.serviceAreas = "At least one service area is required for mobile trainers";
      }
    } else if (currentStep === 3) {
      if (!(formData.trainerDetails.services || []).length)
        errors.services = "At least one service is required";
    } else if (currentStep === 4) {
      if (!formData.trainerDetails.governorate) errors.governorate = "Governorate is required";
      if (!formData.trainerDetails.delegation) errors.delegation = "Delegation is required";
    } else if (currentStep === 5) {
      if (!formData.acceptedTerms) errors.acceptedTerms = "You must accept the terms and conditions";
    }
    return errors;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {currentStep === 1 && (
        <Step1PersonalInfo
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
        />
      )}
      {currentStep === 2 && (
        <Step2Credentials
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
        />
      )}
      {currentStep === 3 && (
        <Step3ServicesSchedule
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
        />
      )}
      {currentStep === 4 && (
        <Step4Location
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
        />
      )}
      {currentStep === 5 && (
        <Step5Review
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
        />
      )}
      {formErrors.submit && <p className="text-sm text-red-500">{formErrors.submit}</p>}
      {currentStep < 5 && (
        <div className="flex justify-between mt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Previous
            </button>
          )}
          <button
            type="button"
            onClick={nextStep}
            className="ml-auto px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg hover:bg-[#e6b625]"
          >
            Save & Continue
          </button>
        </div>
      )}
    </form>
  );
};

export default TrainerProfile;