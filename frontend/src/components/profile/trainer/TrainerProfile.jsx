import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";
import { CheckCircle } from "lucide-react";

const TrainerProfile = ({
  formData = {
    image: "",
    gender: "",
    about: "",
    acceptedTerms: false,
    trainerDetails: {
      governorate: "",
      delegation: "",
      geolocation: { latitude: 36.81897, longitude: 10.16579 },
      trainingFacilityType: "",
      serviceAreas: [],
      businessCardImage: "",
      certificationImage: "",
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
      averageSessionDuration: "",
      reviews: [],
      rating: 0,
      socialLinks: { facebook: "", instagram: "", website: "" },
    },
  },
  setFormData,
  formErrors = {},
  setFormErrors,
  formSuccess = {},
  setFormSuccess,
  currentStep,
  setCurrentStep,
  totalSteps = 5,
  userRole,
  createProfile,
  clearError,
  navigate,
  loading,
}) => {
  const [scheduleErrors, setScheduleErrors] = useState({});
  const [isUploading, setIsUploading] = useState({
    profile: false,
    certification: false,
    businessCard: false,
    training: false,
  });
  const [isValidating, setIsValidating] = useState(false);
  const [serviceAreaGov, setServiceAreaGov] = useState("");

  const defaultImageUrl =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNMTYwIDE4MEgzOUM0MSAxNDAgODAgMTIwIDEwMCAxMjBDMTIwIDEyMCAxNTggMTQwIDE2MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==";

  useEffect(() => {
    console.log("Current step:", currentStep, "formData:", JSON.stringify(formData, null, 2));
    setFormErrors({});
    setScheduleErrors({});
  }, [currentStep, setFormErrors]);

  const addServiceArea = () => {
    if (serviceAreaGov) {
      setFormData((prev) => ({
        ...prev,
        trainerDetails: {
          ...prev.trainerDetails,
          serviceAreas: [
            ...(prev.trainerDetails.serviceAreas || []),
            { governorate: serviceAreaGov },
          ],
        },
      }));
      setServiceAreaGov("");
      setFormErrors((prev) => ({ ...prev, serviceAreas: "" }));
    }
  };

  const removeServiceArea = (index) => {
    setFormData((prev) => ({
      ...prev,
      trainerDetails: {
        ...prev.trainerDetails,
        serviceAreas: (prev.trainerDetails.serviceAreas || []).filter((_, i) => i !== index),
      },
    }));
  };

  const addBreed = (breed) => {
    if (breed.breedName && breed.species) {
      // Prevent duplicates
      if (
        !formData.trainerDetails.breedsTrained?.some(
          (b) =>
            (b.species || "") === breed.species &&
            (b.breedName || "") === breed.breedName
        )
      ) {
        setFormData((prev) => ({
          ...prev,
          trainerDetails: {
            ...prev.trainerDetails,
            breedsTrained: [
              ...(prev.trainerDetails.breedsTrained || []),
              { species: breed.species, breedName: breed.breedName },
            ],
          },
        }));
        setFormErrors((prev) => ({ ...prev, breedsTrained: "" }));
      }
    }
  };

  const removeBreed = (index) => {
    setFormData((prev) => ({
      ...prev,
      trainerDetails: {
        ...prev.trainerDetails,
        breedsTrained: (prev.trainerDetails.breedsTrained || []).filter((_, i) => i !== index),
      },
    }));
  };

  const validateSchedule = () => {
    const errors = {};
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    days.forEach((day) => {
      const schedule = formData.trainerDetails.openingHours;
      const status = schedule[day];
      if (status === "Single Session") {
        if (!schedule[`${day}Start`] || !schedule[`${day}End`]) {
          errors[day] = "Start and End times are required for Single Session.";
        } else if (schedule[`${day}Start`] >= schedule[`${day}End`]) {
          errors[day] = "End time must be after start time.";
        }
      } else if (status === "Double Session") {
        if (
          !schedule[`${day}Start`] ||
          !schedule[`${day}End`] ||
          !schedule[`${day}Start2`] ||
          !schedule[`${day}End2`]
        ) {
          errors[day] = "All time fields are required for Double Session.";
        } else {
          if (schedule[`${day}Start`] >= schedule[`${day}End`]) {
            errors[day] = "Morning end time must be after morning start time.";
          }
          if (schedule[`${day}Start2`] >= schedule[`${day}End2`]) {
            errors[day] = "Afternoon end time must be after afternoon start time.";
          }
          if (schedule[`${day}End`] >= schedule[`${day}Start2`]) {
            errors[day] = "Afternoon start time must be after morning end time.";
          }
        }
      }
    });
    return errors;
  };

  const validateCurrentStep = () => {
    const errors = {};
    if (currentStep === 1) {
      if (!formData.image) errors.image = "Profile photo is required";
      if (!formData.gender) errors.gender = "Gender is required";
      if (!formData.trainerDetails.languagesSpoken?.length)
        errors.languagesSpoken = "At least one language is required";
      if (!formData.trainerDetails.phone)
        errors.phone = "Phone number is required";
      else if (!/^[234579]\d{7}$/.test(formData.trainerDetails.phone))
        errors.phone = "Phone must be 8 digits, starting with 2, 3, 4, 5, 7, or 9";
      if (
        formData.trainerDetails.secondaryPhone &&
        !/^[234579]\d{7}$/.test(formData.trainerDetails.secondaryPhone)
      )
        errors.secondaryPhone = "Secondary phone must be 8 digits, starting with 2, 3, 4, 5, 7, or 9";
    } else if (currentStep === 2) {
      if (!formData.about) errors.about = "About section is required";
      else if (formData.about.length < 10)
        errors.about = "About must be at least 10 characters";
      if (!formData.trainerDetails.averageSessionDuration)
        errors.averageSessionDuration = "Average session duration is required";
      else if (![15, 20, 25, 30, 45, 50, 55, 60, 75, 90, 120].includes(parseInt(formData.trainerDetails.averageSessionDuration)))
        errors.averageSessionDuration = "Invalid session duration";
      if (!formData.trainerDetails.certificationImage)
        errors.certificationImage = "Certification image is required";
    } else if (currentStep === 3) {
      if (!formData.trainerDetails.trainingFacilityType)
        errors.trainingFacilityType = "Training facility type is required";
      if (formData.trainerDetails.trainingFacilityType === "Fixed Facility") {
        if (!formData.trainerDetails.governorate)
          errors.governorate = "Governorate is required";
        if (!formData.trainerDetails.delegation)
          errors.delegation = "Delegation is required";
        if (
          !formData.trainerDetails.geolocation?.latitude ||
          !formData.trainerDetails.geolocation?.longitude
        )
          errors.geolocation = "Training facility location is required";
      } else if (formData.trainerDetails.trainingFacilityType === "Mobile") {
        if (!formData.trainerDetails.serviceAreas?.length)
          errors.serviceAreas = "At least one service area is required";
      }
    } else if (currentStep === 4) {
      if (!formData.trainerDetails.services?.length)
        errors.services = "At least one service is required";
      else {
        formData.trainerDetails.services.forEach((service, index) => {
          if (!service?.serviceName)
            errors[`services[${index}].serviceName`] = `Service ${index + 1}: Name is required`;
          if (service?.fee === "" || isNaN(parseFloat(service?.fee)) || parseFloat(service.fee) < 0)
            errors[`services[${index}].fee`] = `Service ${index + 1}: Valid fee is required`;
        });
      }
      const scheduleValidation = validateSchedule();
      if (Object.keys(scheduleValidation).length > 0) {
        setScheduleErrors(scheduleValidation);
        errors.schedule = "Please correct the schedule errors.";
      } else {
        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        const hasOpenDay = days.some((day) => formData.trainerDetails.openingHours[day] !== "Closed");
        if (!hasOpenDay) {
          errors.schedule = "At least one day must be set to Single or Double Session.";
        }
      }
    } else if (currentStep === 5) {
      if (!formData.acceptedTerms)
        errors.acceptedTerms = "You must accept the terms and conditions";
    }
    console.log("Validation errors for step", currentStep, ":", errors);
    return errors;
  };

  const nextStep = async () => {
    if (isValidating) return;
    setIsValidating(true);

    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      console.log("Blocking navigation due to errors:", errors);
      setFormErrors(errors);
      const firstErrorElement = document.querySelector(".text-red-500");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorElement.closest("input, select, textarea")?.focus();
      } else {
        console.warn("No error element found with class .text-red-500");
      }
      setIsValidating(false);
      return;
    }

    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    setIsValidating(false);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const allErrors = {};
    for (let step = 1; step <= totalSteps; step++) {
      setCurrentStep(step);
      Object.assign(allErrors, validateCurrentStep());
    }
    setCurrentStep(totalSteps);

    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      const firstErrorElement = document.querySelector(".text-red-500");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorElement.closest("input, select, textarea")?.focus();
      }
      return;
    }

    try {
      const profileDetails = {
        image: formData.image,
        gender: formData.gender,
        about: formData.about,
        acceptedTerms: formData.acceptedTerms,
        trainerDetails: {
          ...formData.trainerDetails,
          address: `${formData.trainerDetails.governorate}, ${formData.trainerDetails.delegation}`,
        },
      };
      const result = await createProfile(profileDetails);
      if (result.success) {
        navigate("/trainer-pending-approval", { replace: true });
        setFormSuccess({ submit: "Profile created successfully!" });
      }
    } catch (error) {
      console.error("Submission error:", error);
      setFormErrors({
        submit: error.response?.data?.message || "Failed to create profile",
      });
      const errorElement = document.querySelector(".bg-red-50");
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleInputChange = (section, field, value) => {
    console.log("Input change:", { section, field, value });
    let sanitizedValue = value;
    if (field === "about") {
      sanitizedValue = value.replace(/<[^>]+>/g, "").slice(0, 500);
    }
    setFormData((prev) => {
      if (section === "root") return { ...prev, [field]: sanitizedValue };
      if (field === "openingHours") {
        const updatedOpeningHours = {
          ...prev.trainerDetails.openingHours,
          [value.day]: value.value,
        };
        if (value.day.includes("Start") || value.day.includes("End")) {
          updatedOpeningHours[value.day] = value.value;
        } else if (value.value === "Closed") {
          updatedOpeningHours[`${value.day}Start`] = "";
          updatedOpeningHours[`${value.day}End`] = "";
          updatedOpeningHours[`${value.day}Start2`] = "";
          updatedOpeningHours[`${value.day}End2`] = "";
        }
        return {
          ...prev,
          trainerDetails: {
            ...prev.trainerDetails,
            openingHours: updatedOpeningHours,
          },
        };
      }
      if (field === "governorate") {
        return {
          ...prev,
          trainerDetails: {
            ...prev.trainerDetails,
            [field]: value,
            delegation: "",
          },
        };
      }
      if (field === "geolocation") {
        return {
          ...prev,
          trainerDetails: {
            ...prev.trainerDetails,
            geolocation: value || {
              latitude: 36.81897,
              longitude: 10.16579,
            },
          },
        };
      }
      if (field === "socialLinks") {
        return {
          ...prev,
          trainerDetails: {
            ...prev.trainerDetails,
            socialLinks: {
              ...prev.trainerDetails.socialLinks,
              ...value,
            },
          },
        };
      }
      return {
        ...prev,
        trainerDetails: {
          ...prev.trainerDetails,
          [field]: value,
        },
      };
    });
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "openingHours") {
      setScheduleErrors((prev) => ({
        ...prev,
        [value.day.replace(/Start|End|Start2|End2/, "")]: "",
      }));
    }
  };

  const handleImageUpload = async (e, field) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading((prev) => ({ ...prev, [field]: true }));
    const uploadPromises = Array.from(files).map(async (file) => {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          [field]: "Invalid file type or size (max 5MB, images only)",
        }));
        return null;
      }
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);
      try {
        const response = await axiosInstance.post("/api/upload", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.url;
      } catch (error) {
        console.error("Image upload failed:", error);
        setFormErrors((prev) => ({
          ...prev,
          [field]: "Failed to upload image",
        }));
        return null;
      }
    });

    const urls = (await Promise.all(uploadPromises)).filter((url) => url);
    if (urls.length > 0) {
      if (field === "profile") {
        setFormData((prev) => ({ ...prev, image: urls[0] }));
        setFormErrors((prev) => ({ ...prev, image: "" }));
      } else if (field === "trainingPhotos") {
        setFormData((prev) => ({
          ...prev,
          trainerDetails: {
            ...prev.trainerDetails,
            trainingPhotos: [...(prev.trainerDetails.trainingPhotos || []), ...urls],
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          trainerDetails: {
            ...prev.trainerDetails,
            [field]: urls[0],
          },
        }));
        setFormErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
    setIsUploading((prev) => ({ ...prev, [field]: false }));
  };

  const handleServiceChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedServices = [...(prev.trainerDetails.services || [])];
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: value,
      };
      return {
        ...prev,
        trainerDetails: {
          ...prev.trainerDetails,
          services: updatedServices,
        },
      };
    });
    setFormErrors((prev) => ({
      ...prev,
      services: "",
      [`services[${index}].${field}`]: "",
    }));
  };

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      trainerDetails: {
        ...prev.trainerDetails,
        services: [
          ...(prev.trainerDetails.services || []),
          { serviceName: "", fee: "" },
        ],
      },
    }));
  };

  const removeService = (index) => {
    setFormData((prev) => {
      const services = prev.trainerDetails.services || [];
      if (services.length <= 1) {
        return prev;
      }
      return {
        ...prev,
        trainerDetails: {
          ...prev.trainerDetails,
          services: services.filter((_, i) => i !== index),
        },
      };
    });
  };

  const removeTrainingPhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      trainerDetails: {
        ...prev.trainerDetails,
        trainingPhotos: (prev.trainerDetails.trainingPhotos || []).filter((_, i) => i !== index),
      },
    }));
  };

  const copyMondayScheduleToAll = () => {
    const mondaySchedule = {
      status: formData.trainerDetails.openingHours.monday,
      start: formData.trainerDetails.openingHours.mondayStart,
      end: formData.trainerDetails.openingHours.mondayEnd,
      start2: formData.trainerDetails.openingHours.mondayStart2,
      end2: formData.trainerDetails.openingHours.mondayEnd2,
    };

    setFormData((prev) => ({
      ...prev,
      trainerDetails: {
        ...prev.trainerDetails,
        openingHours: {
          ...prev.trainerDetails.openingHours,
          tuesday: mondaySchedule.status,
          tuesdayStart: mondaySchedule.start,
          tuesdayEnd: mondaySchedule.end,
          tuesdayStart2: mondaySchedule.start2,
          tuesdayEnd2: mondaySchedule.end2,
          wednesday: mondaySchedule.status,
          wednesdayStart: mondaySchedule.start,
          wednesdayEnd: mondaySchedule.end,
          wednesdayStart2: mondaySchedule.start2,
          wednesdayEnd2: mondaySchedule.end2,
          thursday: mondaySchedule.status,
          thursdayStart: mondaySchedule.start,
          thursdayEnd: mondaySchedule.end,
          thursdayStart2: mondaySchedule.start2,
          thursdayEnd2: mondaySchedule.end2,
          friday: mondaySchedule.status,
          fridayStart: mondaySchedule.start,
          fridayEnd: mondaySchedule.end,
          fridayStart2: mondaySchedule.start2,
          fridayEnd2: mondaySchedule.end2,
          saturday: mondaySchedule.status,
          saturdayStart: mondaySchedule.start,
          saturdayEnd: mondaySchedule.end,
          saturdayStart2: mondaySchedule.start2,
          saturdayEnd2: mondaySchedule.end2,
          sunday: mondaySchedule.status,
          sundayStart: mondaySchedule.start,
          sundayEnd: mondaySchedule.end,
          sundayStart2: mondaySchedule.start2,
          sundayEnd2: mondaySchedule.end2,
        },
      },
    }));
    setScheduleErrors({});
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            formData={formData}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
            handleImageUpload={handleImageUpload}
            handleLanguageChange={(lang) => {
              setFormData((prev) => {
                const languages = prev.trainerDetails.languagesSpoken.includes(lang)
                  ? prev.trainerDetails.languagesSpoken.filter((l) => l !== lang)
                  : [...prev.trainerDetails.languagesSpoken, lang];
                return {
                  ...prev,
                  trainerDetails: {
                    ...prev.trainerDetails,
                    languagesSpoken: languages,
                  },
                };
              });
              setFormErrors((prev) => ({ ...prev, languagesSpoken: "" }));
            }}
            defaultImageUrl={defaultImageUrl}
            isUploading={isUploading}
          />
        );
      case 2:
        return (
          <Step2
            formData={formData}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
            handleImageUpload={handleImageUpload}
            removeTrainingPhoto={removeTrainingPhoto}
            defaultImageUrl={defaultImageUrl}
            isUploading={isUploading}
            addBreed={addBreed}
            removeBreed={removeBreed}
          />
        );
      case 3:
        return (
          <Step3
            formData={formData}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
            defaultImageUrl={defaultImageUrl}
            serviceAreaGov={serviceAreaGov}
            setServiceAreaGov={setServiceAreaGov}
            addServiceArea={addServiceArea}
            removeServiceArea={removeServiceArea}
          />
        );
      case 4:
        return (
          <Step4
            formData={formData}
            formErrors={formErrors}
            scheduleErrors={scheduleErrors}
            handleInputChange={handleInputChange}
            handleServiceChange={handleServiceChange}
            addService={addService}
            removeService={removeService}
            copyMondayScheduleToAll={copyMondayScheduleToAll}
          />
        );
      case 5:
        return (
          <Step5
            formData={formData}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
            setCurrentStep={setCurrentStep}
            defaultImageUrl={defaultImageUrl}
          />
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-[#ffc929]/10 relative">
      {/* Error and Success Messages */}
      {formErrors.submit && (
        <div className="sticky top-0 z-10 flex items-center gap-3 p-5 border border-red-200 shadow-sm bg-red-50 rounded-xl">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <p className="text-sm font-medium text-red-600">{formErrors.submit}</p>
        </div>
      )}
      {formSuccess.submit && (
        <div className="sticky top-0 z-10 flex items-center gap-3 p-5 border border-green-200 shadow-sm bg-green-50 rounded-xl">
          <div className="p-2 bg-green-100 rounded-full">
            <CheckCircle size={20} className="text-green-500" />
          </div>
          <p className="text-sm font-medium text-green-600">{formSuccess.submit}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div>
        <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
          <div
            className="bg-gradient-to-r from-[#ffc929] to-[#ffa726] h-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <p className="mt-2 text-sm text-center text-gray-600">Step {currentStep} of {totalSteps}</p>
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mt-10 border-t pt-6 border-[#ffc929]/20">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-[#ffc929] border border-[#ffc929]/20 transition-all duration-300 bg-[#ffc929]/5 group rounded-xl hover:bg-[#ffc929]/10 hover:shadow-md"
            disabled={loading || isValidating}
          >
            <svg className="w-5 h-5 transition-transform duration-300 transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Previous
          </button>
        )}
        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={nextStep}
            className="group px-6 py-3.5 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={loading || isValidating}
          >
            Continue
            <svg className="w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || isValidating}
            className="group px-6 py-3.5 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Creating Profile...
              </span>
            ) : (
              <>
                <span>Complete Profile</span>
                <Sparkles size={18} className="transition-transform duration-300 transform group-hover:scale-110" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-100/50" aria-live="polite">
          <Loader2 size={32} className="animate-spin text-[#ffc929]" />
        </div>
      )}

      {/* Step Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index < currentStep
                ? "bg-[#ffc929]"
                : index === currentStep - 1
                ? "bg-[#ffc929] scale-125"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </form>
  );
};

export default TrainerProfile;