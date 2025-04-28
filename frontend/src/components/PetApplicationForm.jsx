import React, { useState, useEffect } from "react";
import {
  X,
  PawPrint,
  Check,
  Info,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import axiosInstance from "../utils/axiosInstance";

function Step1({ formData, handleChange, submitting, getFieldError }) {
  return (
    <>
      <h3 className="p-2 mb-6 text-xl font-semibold text-gray-800 bg-[#ffc929]/10 rounded-xl">
        Employment Information
      </h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="occupation"
          >
            Your Occupation <span className="text-[#ffc929]">*</span>
          </label>
          <input
            type="text"
            id="occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            className={`w-full p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30 focus:border-[#ffc929] hover:border-[#ffc929]/50 transition-all duration-300 shadow-sm ${
              getFieldError(formData.occupation)
                ? "border-red-500"
                : "border-[#ffc929]/20"
            }`}
            placeholder="e.g., Software Engineer"
            required
            disabled={submitting}
            aria-required="true"
            aria-describedby="occupation-error"
          />
          {getFieldError(formData.occupation) && (
            <p
              id="occupation-error"
              className="text-xs text-red-500"
              aria-live="polite"
            >
              {getFieldError(formData.occupation)}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Work Schedule <span className="text-[#ffc929]">*</span>
          </label>
          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
            role="radiogroup"
            aria-label="Work schedule options"
            aria-describedby="workSchedule-error"
          >
            {["Full-Time", "Part-Time", "Remote", "Flexible", "Other"].map(
              (option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    !submitting &&
                    handleChange({
                      target: {
                        name: "workSchedule",
                        value: option.toLowerCase(),
                      },
                    })
                  }
                  className={`p-3 border rounded-xl text-center text-sm font-medium transition-all duration-300 ${
                    formData.workSchedule === option.toLowerCase()
                      ? "bg-[#ffc929]/10 border-[#ffc929]/50 text-[#ffc929]"
                      : "bg-white border-[#ffc929]/20 text-gray-700 hover:bg-[#ffc929]/5"
                  } focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30 shadow-sm disabled:opacity-50`}
                  disabled={submitting}
                  aria-checked={formData.workSchedule === option.toLowerCase()}
                  role="radio"
                >
                  {option}
                </button>
              )
            )}
          </div>
          {getFieldError(formData.workSchedule) && (
            <p
              id="workSchedule-error"
              className="text-xs text-red-500"
              aria-live="polite"
            >
              {getFieldError(formData.workSchedule)}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function Step2({ formData, handleChange, submitting, getFieldError }) {
  return (
    <>
      <h3 className="p-2 mb-6 text-xl font-semibold text-gray-800 bg-[#ffc929]/10 rounded-xl">
        Housing Information
      </h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Housing Type <span className="text-[#ffc929]">*</span>
          </label>
          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            role="radiogroup"
            aria-label="Housing type options"
            aria-describedby="housingType-error"
          >
            {["Villa", "House", "Apartment", "Other"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  !submitting &&
                  handleChange({
                    target: {
                      name: "housing.type",
                      value: option.toLowerCase(),
                    },
                  })
                }
                className={`p-3 border rounded-xl text-center text-sm font-medium transition-all duration-300 ${
                  formData.housing.type === option.toLowerCase()
                    ? "bg-[#ffc929]/10 border-[#ffc929]/50 text-[#ffc929]"
                    : "bg-white border-[#ffc929]/20 text-gray-700 hover:bg-[#ffc929]/5"
                } focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30 shadow-sm disabled:opacity-50`}
                disabled={submitting}
                aria-checked={formData.housing.type === option.toLowerCase()}
                role="radio"
              >
                {option}
              </button>
            ))}
          </div>
          {getFieldError(formData.housing.type) && (
            <p
              id="housingType-error"
              className="text-xs text-red-500"
              aria-live="polite"
            >
              {getFieldError(formData.housing.type)}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Ownership <span className="text-[#ffc929]">*</span>
          </label>
          <div
            className="grid grid-cols-2 gap-3"
            role="radiogroup"
            aria-label="Ownership options"
            aria-describedby="housingOwnership-error"
          >
            {["Own", "Rent"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  !submitting &&
                  handleChange({
                    target: {
                      name: "housing.ownership",
                      value: option.toLowerCase(),
                    },
                  })
                }
                className={`p-3 border rounded-xl text-center text-sm font-medium transition-all duration-300 ${
                  formData.housing.ownership === option.toLowerCase()
                    ? "bg-[#ffc929]/10 border-[#ffc929]/50 text-[#ffc929]"
                    : "bg-white border-[#ffc929]/20 text-gray-700 hover:bg-[#ffc929]/5"
                } focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30 shadow-sm disabled:opacity-50`}
                disabled={submitting}
                aria-checked={
                  formData.housing.ownership === option.toLowerCase()
                }
                role="radio"
              >
                {option}
              </button>
            ))}
          </div>
          {getFieldError(formData.housing.ownership) && (
            <p
              id="housingOwnership-error"
              className="text-xs text-red-500"
              aria-live="polite"
            >
              {getFieldError(formData.housing.ownership)}
            </p>
          )}
        </div>
        {formData.housing.ownership === "rent" && (
          <div
            className="flex items-start gap-3 p-4 border border-[#ffc929]/20 shadow-sm bg-[#ffc929]/5 rounded-xl"
            aria-label="Landlord approval section"
          >
            <Info size={18} className="text-[#ffc929] mt-0.5" />
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Landlord Approval
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="housing.landlordApproval"
                  name="housing.landlordApproval"
                  checked={formData.housing.landlordApproval}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#ffc929] border-[#ffc929]/20 rounded focus:ring-2 focus:ring-[#ffc929]/30 disabled:opacity-50"
                  disabled={submitting}
                  aria-label="Confirm landlord approval for pet ownership"
                />
                <label
                  htmlFor="housing.landlordApproval"
                  className="text-sm text-gray-700"
                >
                  My landlord approves pet ownership
                </label>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Family Size <span className="text-[#ffc929]">*</span>
          </label>
          <div
            className="flex items-center gap-2"
            aria-label="Family size controls"
          >
            <button
              type="button"
              onClick={() =>
                !submitting &&
                formData.housing.familySize > 1 &&
                handleChange({
                  target: {
                    name: "housing.familySize",
                    value: formData.housing.familySize - 1,
                  },
                })
              }
              className="p-2 text-[#ffc929] transition-all duration-300 border border-[#ffc929]/20 rounded-full bg-[#ffc929]/5 hover:bg-[#ffc929]/10 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
              disabled={submitting || formData.housing.familySize <= 1}
              aria-label="Decrease family size"
            >
              -
            </button>
            <span className="px-4 py-2 text-sm font-medium text-center text-gray-700 bg-white border border-[#ffc929]/20 rounded-xl min-w-12">
              {formData.housing.familySize}
            </span>
            <button
              type="button"
              onClick={() =>
                !submitting &&
                handleChange({
                  target: {
                    name: "housing.familySize",
                    value: formData.housing.familySize + 1,
                  },
                })
              }
              className="p-2 text-[#ffc929] transition-all duration-300 border border-[#ffc929]/20 rounded-full bg-[#ffc929]/5 hover:bg-[#ffc929]/10 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
              disabled={submitting}
              aria-label="Increase family size"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Step3({ formData, handleChange, submitting, getFieldError }) {
  return (
    <>
      <h3 className="p-2 mb-6 text-xl font-semibold text-gray-800 bg-[#ffc929]/10 rounded-xl">
        Adoption Information
      </h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="reasonForAdoption"
          >
            Why do you want to adopt this pet?{" "}
            <span className="text-[#ffc929]">*</span>
          </label>
          <textarea
            id="reasonForAdoption"
            name="reasonForAdoption"
            value={formData.reasonForAdoption}
            onChange={handleChange}
            className={`w-full p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30 focus:border-[#ffc929] hover:border-[#ffc929]/50 transition-all duration-300 shadow-sm resize-none scrollbar-thin scrollbar-thumb-[#ffc929]/50 scrollbar-track-[#ffc929]/10 ${
              getFieldError(formData.reasonForAdoption, 20)
                ? "border-red-500"
                : "border-[#ffc929]/20"
            }`}
            placeholder="Share your reasons (min 20 characters)"
            rows="5"
            required
            disabled={submitting}
            aria-required="true"
            maxLength={500}
            aria-describedby="reasonForAdoption-error"
          />
          <p className="text-xs text-gray-500">
            {formData.reasonForAdoption.length}/500 characters
          </p>
          {getFieldError(formData.reasonForAdoption, 20) && (
            <p
              id="reasonForAdoption-error"
              className="text-xs text-red-500"
              aria-live="polite"
            >
              {getFieldError(formData.reasonForAdoption, 20)}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            When are you ready to adopt?{" "}
            <span className="text-[#ffc929]">*</span>
          </label>
          <div
            className="grid grid-cols-3 gap-3"
            role="radiogroup"
            aria-label="Readiness options"
            aria-describedby="readiness-error"
          >
            {[
              { value: "immediate", label: "Right Now" },
              { value: "within_a_month", label: "Within a Month" },
              { value: "later", label: "Later" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  !submitting &&
                  handleChange({
                    target: { name: "readiness", value: option.value },
                  })
                }
                className={`p-3 border rounded-xl text-center text-sm font-medium transition-all duration-300 ${
                  formData.readiness === option.value
                    ? "bg-[#ffc929]/10 border-[#ffc929]/50 text-[#ffc929]"
                    : "bg-white border-[#ffc929]/20 text-gray-700 hover:bg-[#ffc929]/5"
                } focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30 shadow-sm disabled:opacity-50`}
                disabled={submitting}
                aria-checked={formData.readiness === option.value}
                role="radio"
              >
                {option.label}
              </button>
            ))}
          </div>
          {getFieldError(formData.readiness) && (
            <p
              id="readiness-error"
              className="text-xs text-red-500"
              aria-live="polite"
            >
              {getFieldError(formData.readiness)}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function Step4({ formData, setCurrentStep }) {
  return (
    <>
      <h3 className="p-2 mb-6 text-xl font-semibold text-gray-800 bg-[#ffc929]/10 rounded-xl">
        Review Your Application
      </h3>
      <div className="space-y-4">
        <div className="flex items-start justify-between p-4 border border-[#ffc929]/20 shadow-sm bg-[#ffc929]/5 rounded-xl">
          <div>
            <h4 className="mb-2 font-semibold text-gray-800">
              Employment Information
            </h4>
            <dl className="grid grid-cols-2 text-sm gap-x-4 gap-y-2">
              <dt className="text-gray-600">Occupation:</dt>
              <dd className="text-gray-800">{formData.occupation}</dd>
              <dt className="text-gray-600">Work Schedule:</dt>
              <dd className="text-gray-800">
                {formData.workSchedule
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </dd>
            </dl>
          </div>
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="text-sm font-semibold text-[#ffc929] transition-all duration-300 hover:text-[#ffa726] focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
            aria-label="Edit employment information"
          >
            Edit
          </button>
        </div>
        <div className="flex items-start justify-between p-4 border border-[#ffc929]/20 shadow-sm bg-[#ffc929]/5 rounded-xl">
          <div>
            <h4 className="mb-2 font-semibold text-gray-800">
              Housing Information
            </h4>
            <dl className="grid grid-cols-2 text-sm gap-x-4 gap-y-2">
              <dt className="text-gray-600">Housing Type:</dt>
              <dd className="text-gray-800">
                {formData.housing.type.charAt(0).toUpperCase() +
                  formData.housing.type.slice(1)}
              </dd>
              <dt className="text-gray-600">Ownership:</dt>
              <dd className="text-gray-800">
                {formData.housing.ownership.charAt(0).toUpperCase() +
                  formData.housing.ownership.slice(1)}
              </dd>
              {formData.housing.ownership === "rent" && (
                <>
                  <dt className="text-gray-600">Landlord Approval:</dt>
                  <dd className="text-gray-800">
                    {formData.housing.landlordApproval ? "Yes" : "No"}
                  </dd>
                </>
              )}
              <dt className="text-gray-600">Family Size:</dt>
              <dd className="text-gray-800">
                {formData.housing.familySize} person
                {formData.housing.familySize !== 1 ? "s" : ""}
              </dd>
            </dl>
          </div>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="text-sm font-semibold text-[#ffc929] transition-all duration-300 hover:text-[#ffa726] focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
            aria-label="Edit housing information"
          >
            Edit
          </button>
        </div>
        <div className="flex items-start justify-between p-4 border border-[#ffc929]/20 shadow-sm bg-[#ffc929]/5 rounded-xl">
          <div>
            <h4 className="mb-2 font-semibold text-gray-800">
              Adoption Information
            </h4>
            <dl className="grid grid-cols-1 text-sm gap-y-2">
              <dt className="text-gray-600">Readiness:</dt>
              <dd className="text-gray-800">
                {formData.readiness === "immediate"
                  ? "Right Now"
                  : formData.readiness === "within_a_month"
                  ? "Within a Month"
                  : "Later"}
              </dd>
              <dt className="text-gray-600">Reason for Adoption:</dt>
              <dd className="p-3 text-gray-800 bg-white border border-[#ffc929]/20 rounded-xl shadow-sm">
                {formData.reasonForAdoption}
              </dd>
            </dl>
          </div>
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="text-sm font-semibold text-[#ffc929] transition-all duration-300 hover:text-[#ffa726] focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
            aria-label="Edit adoption information"
          >
            Edit
          </button>
        </div>
      </div>
    </>
  );
}

function PetApplicationForm({ petId, petName, petImage, onClose, onSubmitSuccess }) {
  const { user } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    const savedData = JSON.parse(
      localStorage.getItem(`petApplication_${petId}`)
    ) || {
      occupation: "",
      workSchedule: "",
      housing: {
        type: "",
        ownership: "",
        familySize: 1,
        landlordApproval: false,
      },
      reasonForAdoption: "",
      readiness: "",
    };
    return savedData;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (
      user?.petOwnerDetails &&
      !localStorage.getItem(`petApplication_${petId}`)
    ) {
      setFormData((prev) => ({
        ...prev,
        occupation: user.petOwnerDetails.occupation || prev.occupation,
        workSchedule: user.petOwnerDetails.workSchedule || prev.workSchedule,
        housing: {
          type: user.petOwnerDetails.housing?.type || prev.housing.type,
          ownership:
            user.petOwnerDetails.housing?.ownership || prev.housing.ownership,
          familySize:
            user.petOwnerDetails.housing?.familySize || prev.housing.familySize,
          landlordApproval:
            user.petOwnerDetails.housing?.landlordApproval ||
            prev.housing.landlordApproval,
        },
      }));
    }
  }, [user, petId]);

  useEffect(() => {
    localStorage.setItem(`petApplication_${petId}`, JSON.stringify(formData));
  }, [formData, petId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("housing.")) {
      const [parent, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== 4) return;
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setSubmitting(true);
    setError("");
    setShowConfirm(false);
    try {
      const applicationData = { ...formData, petId, applicantId: user._id };
      const response = await axiosInstance.post(`/api/pet/${petId}/apply`, applicationData);
      if (response.data.success) {
        setSuccess(true);
        localStorage.removeItem(`petApplication_${petId}`);
        if (typeof onSubmitSuccess === 'function') {
          onSubmitSuccess();
        }
        onClose(); // Close immediately
      } else {
        setError(response.data.message);
        if (response.data.message === "You have already applied to adopt this pet") {
          if (typeof onSubmitSuccess === 'function') {
            onSubmitSuccess();
          }
          onClose();
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An error occurred";
      setError(errorMessage);
      if (errorMessage === "You have already applied to adopt this pet") {
        if (typeof onSubmitSuccess === 'function') {
          onSubmitSuccess();
        }
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      occupation: "",
      workSchedule: "",
      housing: {
        type: "",
        ownership: "",
        familySize: 1,
        landlordApproval: false,
      },
      reasonForAdoption: "",
      readiness: "",
    });
    setCurrentStep(1);
    localStorage.removeItem(`petApplication_${petId}`);
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return formData.occupation && formData.workSchedule;
      case 2:
        return (
          formData.housing.type &&
          formData.housing.ownership &&
          formData.housing.familySize >= 1
        );
      case 3:
        return (
          formData.reasonForAdoption &&
          formData.readiness &&
          formData.reasonForAdoption.length >= 20
        );
      case 4:
        return true;
      default:
        return true;
    }
  };

  const getFieldError = (field, minLength = 0) => {
    if (!field) return "This field is required";
    if (minLength && field.length < minLength)
      return `Must be at least ${minLength} characters`;
    return "";
  };

  if (success) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="w-full max-w-md p-8 mx-auto text-center bg-white border-2 border-[#ffc929]/20 shadow-lg rounded-3xl">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full shadow-md bg-green-50">
              <Check size={40} className="text-green-600" />
            </div>
          </div>
          <h3 className="mb-2 text-2xl font-semibold text-gray-800">
            Application Submitted!
          </h3>
          <p className="mb-6 text-gray-600">
            Your application for {petName || "this pet"} has been successfully
            submitted. The shelter will review it and contact you soon.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 font-semibold text-white transition-all duration-300 shadow-md bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
            aria-label="Close success message"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const renderProgressBar = () => {
    const steps = ["Employment", "Housing", "Adoption Info", "Review"];
    return (
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label={`Application progress: Step ${currentStep} of ${steps.length}`}
        className="mb-8"
      >
        <div className="flex justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {steps[currentStep - 1]}
          </span>
        </div>
        <div className="h-2 overflow-hidden bg-[#ffc929]/20 rounded-full">
          <div
            className="h-full transition-all duration-300 ease-in-out bg-gradient-to-r from-[#ffc929] to-[#ffa726]"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      style={{ animationDelay: "0s" }}
    >
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-lg mx-auto p-6 relative max-h-[95vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#ffc929]/50 scrollbar-track-[#ffc929]/10 border-2 border-[#ffc929]/20">
        <button
          onClick={onClose}
          className="absolute z-10 p-2 text-gray-500 transition-all duration-300 rounded-full top-4 right-4 hover:text-[#ffc929] hover:bg-[#ffc929]/10 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
          disabled={submitting}
          aria-label="Close form"
        >
          <X size={24} />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <PawPrint className="text-[#ffc929]" size={28} />
          <h2 className="text-2xl font-semibold text-gray-800">
            Adoption Application
          </h2>
        </div>
        {petName && (
          <div className="flex items-center gap-3 p-3 mb-6 border border-[#ffc929]/20 shadow-sm bg-[#ffc929]/5 rounded-xl">
            {petImage && (
              <div className="w-12 h-12 overflow-hidden bg-gray-200 rounded-full shadow-inner">
                <img
                  src={petImage}
                  alt={petName}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Applying for</p>
              <p className="font-semibold text-gray-800">{petName}</p>
            </div>
          </div>
        )}
        {error && (
          <div
            className="flex items-start gap-2 p-3 mb-6 text-red-700 border border-red-100 shadow-sm bg-red-50 rounded-xl"
            aria-live="polite"
          >
            <Info size={18} className="text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {renderProgressBar()}
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <Step1
              formData={formData}
              handleChange={handleChange}
              submitting={submitting}
              getFieldError={getFieldError}
            />
          )}
          {currentStep === 2 && (
            <Step2
              formData={formData}
              handleChange={handleChange}
              submitting={submitting}
              getFieldError={getFieldError}
            />
          )}
          {currentStep === 3 && (
            <Step3
              formData={formData}
              handleChange={handleChange}
              submitting={submitting}
              getFieldError={getFieldError}
            />
          )}
          {currentStep === 4 && (
            <Step4 formData={formData} setCurrentStep={setCurrentStep} />
          )}
          <div className="flex flex-wrap gap-3 pt-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center justify-center flex-1 gap-1 py-3 font-semibold text-gray-600 transition-all duration-300 bg-white border border-[#ffc929]/20 rounded-xl hover:bg-[#ffc929]/5 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                disabled={submitting}
                aria-label="Go to previous step"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-3 font-semibold text-gray-600 transition-all duration-300 bg-white border border-[#ffc929]/20 rounded-xl hover:bg-[#ffc929]/5 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
              aria-label="Reset form"
            >
              Reset
            </button>
            <button
              type={currentStep < 4 ? "button" : "submit"}
              onClick={currentStep < 4 ? nextStep : undefined}
              className="flex items-center justify-center flex-1 gap-1 py-3 font-semibold text-white transition-all duration-300 shadow-md bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30 hover:shadow-lg"
              disabled={submitting || !isStepComplete()}
              aria-label={
                currentStep < 4 ? "Go to next step" : "Submit application"
              }
            >
              {currentStep < 4
                ? "Next"
                : submitting
                ? "Submitting..."
                : "Submit"}
              {currentStep < 4 && <ChevronRight size={16} />}
            </button>
          </div>
        </form>
        {showConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            style={{ animationDelay: "0s" }}
          >
            <div className="w-full max-w-sm p-6 mx-auto text-center bg-white border-2 border-[#ffc929]/20 shadow-lg rounded-3xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Confirm Submission
              </h3>
              <p className="mb-6 text-gray-600">
                Are you sure you want to submit your application for{" "}
                {petName || "this pet"}?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 font-semibold text-gray-600 transition-all duration-300 bg-white border border-[#ffc929]/20 rounded-xl hover:bg-[#ffc929]/5 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                  aria-label="Cancel submission"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  className="flex-1 py-2 font-semibold text-white transition-all duration-300 shadow-md bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30 disabled:opacity-50"
                  disabled={submitting}
                  aria-label="Confirm submission"
                >
                  {submitting ? "Submitting..." : "Yes, Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
        {submitting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div
              className="w-12 h-12 border-4 border-[#ffc929]/20 rounded-full border-t-[#ffc929] animate-spin"
              aria-label="Submitting application"
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PetApplicationForm;