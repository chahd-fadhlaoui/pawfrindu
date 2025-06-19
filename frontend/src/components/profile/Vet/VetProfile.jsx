import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";
import Step6 from "./steps/Step6";

const VetProfile = ({
  formData = {
    image: "",
    gender: "",
    about: "",
    acceptedTerms: false,
    veterinarianDetails: {
      businessCardImage: "",
      specializations: [],
      title: "",
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
    diploma: false,
    businessCard: false,
    clinic: false,
  });
  const [specializationInput, setSpecializationInput] = useState("");

  const defaultImageUrl =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNMTYwIDE4MEgzOUM0MSAxNDAgODAgMTIwIDEwMCAxMjBDMTIwIDEyMCAxNTggMTQwIDE2MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==";

  useEffect(() => {
    setFormErrors({});
    setScheduleErrors({});
  }, [currentStep, setFormErrors]);

  const validateSchedule = () => {
    const errors = {};
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    days.forEach((day) => {
      const schedule = formData.veterinarianDetails.openingHours;
      const status = schedule[day];
      if (status === "Single Session") {
        if (!schedule[`${day}Start`] || !schedule[`${day}End`]) {
          errors[day] = "Start and End times are required for Single Session.";
        }
      } else if (status === "Double Session") {
        if (
          !schedule[`${day}Start`] ||
          !schedule[`${day}End`] ||
          !schedule[`${day}Start2`] ||
          !schedule[`${day}End2`]
        ) {
          errors[day] = "All time fields are required for Double Session.";
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
      if (!formData.veterinarianDetails.languagesSpoken.length)
        errors.languagesSpoken = "At least one language is required";
      if (!formData.veterinarianDetails.phone)
        errors.phone = "Phone number is required";
      else if (!/^[234579]\d{7}$/.test(formData.veterinarianDetails.phone))
        errors.phone = "Phone must be 8 digits, starting with 2, 3, 4, 5, 7, or 9";
      if (
        formData.veterinarianDetails.secondaryPhone &&
        !/^[234579]\d{7}$/.test(formData.veterinarianDetails.secondaryPhone)
      )
        errors.secondaryPhone = "Secondary phone must be 8 digits, starting with 2, 3, 4, 5, 7, or 9";
    } else if (currentStep === 2) {
      if (!formData.about) errors.about = "About section is required";
      else if (formData.about.length < 10)
        errors.about = "About must be at least 10 characters";
      if (!formData.veterinarianDetails.diplomasAndTraining)
        errors.diplomasAndTraining = "Diploma photo is required";
      if (!formData.veterinarianDetails.title)
        errors.title = "Title is required";
      if (!formData.veterinarianDetails.businessCardImage)
        errors.businessCardImage = "Business card image is required";
      if (!formData.veterinarianDetails.averageConsultationDuration)
        errors.averageConsultationDuration = "Consultation duration is required";
    } else if (currentStep === 3) {
      const firstService = formData.veterinarianDetails.services[0];
      if (!firstService?.serviceName || firstService?.fee === "")
        errors.services = "At least one service with name and fee is required";
      const scheduleValidation = validateSchedule();
      if (Object.keys(scheduleValidation).length > 0) {
        setScheduleErrors(scheduleValidation);
        errors.schedule = "Please correct the schedule errors.";
      } else {
        // Ensure at least one day is not "Closed"
        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        const hasOpenDay = days.some((day) => formData.veterinarianDetails.openingHours[day] !== "Closed");
        if (!hasOpenDay) {
          errors.schedule = "At least one day must be set to Single or Double Session.";
        }
      }
    } else if (currentStep === 4) {
      if (!formData.veterinarianDetails.governorate)
        errors.governorate = "Governorate is required";
      if (!formData.veterinarianDetails.delegation)
        errors.delegation = "Delegation is required";
      if (
        !formData.veterinarianDetails.geolocation.latitude ||
        !formData.veterinarianDetails.geolocation.longitude
      )
        errors.geolocation = "Clinic location is required";
    } else if (currentStep === 5) {
      if (!formData.acceptedTerms)
        errors.acceptedTerms = "You must accept the terms and conditions";
    }
    return errors;
  };

  const nextStep = () => {
    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorElement = document.querySelector(".text-red-500");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorElement.closest("input, select, textarea")?.focus();
      }
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
        veterinarianDetails: {
          ...formData.veterinarianDetails,
          address: `${formData.veterinarianDetails.governorate}, ${formData.veterinarianDetails.delegation}`,
        },
      };
      const result = await createProfile(profileDetails);
      if (result.success) {
        navigate("/vet-pending-approval", { replace: true });
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
    setFormData((prev) => {
      if (section === "root") return { ...prev, [field]: value };
      if (field === "openingHours") {
        const updatedOpeningHours = {
          ...prev.veterinarianDetails.openingHours,
          [value.day]: value.value,
        };
        if (value.day.includes("Start") || value.day.includes("End")) {
          updatedOpeningHours[value.day] = value.value;
        } else {
          // Reset time fields when switching to "Closed"
          if (value.value === "Closed") {
            updatedOpeningHours[`${value.day}Start`] = "";
            updatedOpeningHours[`${value.day}End`] = "";
            updatedOpeningHours[`${value.day}Start2`] = "";
            updatedOpeningHours[`${value.day}End2`] = "";
          }
        }
        return {
          ...prev,
          veterinarianDetails: {
            ...prev.veterinarianDetails,
            openingHours: updatedOpeningHours,
          },
        };
      }
      if (field === "governorate") {
        return {
          ...prev,
          veterinarianDetails: {
            ...prev.veterinarianDetails,
            [field]: value,
            delegation: "",
          },
        };
      }
      if (field === "geolocation") {
        return {
          ...prev,
          veterinarianDetails: {
            ...prev.veterinarianDetails,
            geolocation: value || {
              latitude: 36.8665367,
              longitude: 10.1647233,
            },
          },
        };
      }
      return {
        ...prev,
        veterinarianDetails: { ...prev.veterinarianDetails, [field]: value },
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
      } else if (field === "clinicPhotos") {
        setFormData((prev) => ({
          ...prev,
          veterinarianDetails: {
            ...prev.veterinarianDetails,
            clinicPhotos: [...(prev.veterinarianDetails.clinicPhotos || []), ...urls],
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          veterinarianDetails: {
            ...prev.veterinarianDetails,
            [field]: urls[0],
          },
        }));
        setFormErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
    setIsUploading((prev) => ({ ...prev, [field]: false }));
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
                const languages = prev.veterinarianDetails.languagesSpoken.includes(lang)
                  ? prev.veterinarianDetails.languagesSpoken.filter((l) => l !== lang)
                  : [...prev.veterinarianDetails.languagesSpoken, lang];
                return {
                  ...prev,
                  veterinarianDetails: {
                    ...prev.veterinarianDetails,
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
            addSpecialization={() => {
              if (specializationInput.trim()) {
                setFormData((prev) => ({
                  ...prev,
                  veterinarianDetails: {
                    ...prev.veterinarianDetails,
                    specializations: [
                      ...(prev.veterinarianDetails.specializations || []),
                      { specializationName: specializationInput.trim() },
                    ],
                  },
                }));
                setSpecializationInput("");
                setFormErrors((prev) => ({ ...prev, specializations: "" }));
              }
            }}
            removeSpecialization={(index) => {
              setFormData((prev) => ({
                ...prev,
                veterinarianDetails: {
                  ...prev.veterinarianDetails,
                  specializations: (
                    prev.veterinarianDetails.specializations || []
                  ).filter((_, i) => i !== index),
                },
              }));
            }}
            specializationInput={specializationInput}
            setSpecializationInput={setSpecializationInput}
            defaultImageUrl={defaultImageUrl}
            isUploading={isUploading}
          />
        );
      case 3:
        return (
          <Step4
            formData={formData}
            formErrors={formErrors}
            scheduleErrors={scheduleErrors}
            handleInputChange={handleInputChange}
            handleServiceChange={(index, field, value) => {
              setFormData((prev) => {
                const updatedServices = [...(prev.veterinarianDetails.services || [])];
                updatedServices[index] = {
                  ...updatedServices[index],
                  [field]: value,
                };
                return {
                  ...prev,
                  veterinarianDetails: {
                    ...prev.veterinarianDetails,
                    services: updatedServices,
                  },
                };
              });
              setFormErrors((prev) => ({ ...prev, services: "" }));
            }}
            addService={() => {
              setFormData((prev) => ({
                ...prev,
                veterinarianDetails: {
                  ...prev.veterinarianDetails,
                  services: [
                    ...(prev.veterinarianDetails.services || []),
                    { serviceName: "", fee: "" },
                  ],
                },
              }));
            }}
            removeService={(index) => {
              setFormData((prev) => ({
                ...prev,
                veterinarianDetails: {
                  ...prev.veterinarianDetails,
                  services: (prev.veterinarianDetails.services || []).filter(
                    (_, i) => i !== index
                  ),
                },
              }));
            }}
            copyMondayScheduleToAll={() => {
              const mondaySchedule = {
                status: formData.veterinarianDetails.openingHours.monday,
                start: formData.veterinarianDetails.openingHours.mondayStart,
                end: formData.veterinarianDetails.openingHours.mondayEnd,
                start2: formData.veterinarianDetails.openingHours.mondayStart2,
                end2: formData.veterinarianDetails.openingHours.mondayEnd2,
              };

              setFormData((prev) => ({
                ...prev,
                veterinarianDetails: {
                  ...prev.veterinarianDetails,
                  openingHours: {
                    ...prev.veterinarianDetails.openingHours,
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
            }}
          />
        );
      case 4:
        return (
          <Step5
            formData={formData}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
            handleImageUpload={handleImageUpload}
            removeClinicPhoto={(index) => {
              setFormData((prev) => ({
                ...prev,
                veterinarianDetails: {
                  ...prev.veterinarianDetails,
                  clinicPhotos: (
                    prev.veterinarianDetails.clinicPhotos || []
                  ).filter((_, i) => i !== index),
                },
              }));
            }}
            defaultImageUrl={defaultImageUrl}
            isUploading={isUploading}
          />
        );
      case 5:
        return (
          <Step6
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
            disabled={loading}
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
            disabled={loading}
          >
            Continue
            <svg className="w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
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

export default VetProfile;