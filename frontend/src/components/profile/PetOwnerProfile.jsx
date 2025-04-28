import { AlertCircle, Camera, CheckCircle, Contact, Info, Loader2, LucideUserPen, Phone, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { FaFemale, FaMale, FaMapMarkedAlt, FaTransgender } from "react-icons/fa";
import { MdContactSupport, MdLocationCity } from "react-icons/md";
import { delegationsByGovernorate, governorates } from "../../assets/locations";
import axiosInstance from "../../utils/axiosInstance";

const Input = ({ error, className, id, ...props }) => (
  <div className="relative">
    <input
      className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] transition-all duration-300 ${
        error ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"
      } ${className}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      id={id}
      {...props}
    />
    {error && (
      <p id={`${id}-error`} className="flex items-center gap-1.5 px-4 py-1.5 mt-1 text-sm font-medium text-red-600 rounded-full bg-red-50" aria-live="polite">
        <AlertCircle size={14} className="text-red-500" />
        {error}
      </p>
    )}
  </div>
);

const Select = ({ error, className, id, children, ...props }) => (
  <div className="relative">
    <select
      className={`w-full appearance-none px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] transition-all duration-300 ${error ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"} ${className}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      id={id}
      {...props}
    >
      {children}
    </select>
    <div className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2">
      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>
    {error && (
      <p id={`${id}-error`} className="flex items-center gap-1.5 px-4 py-1.5 mt-1 text-sm font-medium text-red-600 rounded-full bg-red-50" aria-live="polite">
        <AlertCircle size={14} className="text-red-500" />
        {error}
      </p>
    )}
  </div>
);

const PetOwnerProfile = ({
  formData = {
    image: "",
    gender: "",
    about: "",
    petOwnerDetails: {
      address: { governorate: "", delegation: "", street: "" },
      phone: "",
    },
  },
  setFormData,
  formErrors = {},
  setFormErrors,
  currentStep,
  setCurrentStep,
  totalSteps,
  userRole,
  createProfile,
  clearError,
  navigate,
  loading,
}) => {
  const [imageHover, setImageHover] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const defaultImageUrl =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNMTYwIDE4MEgzOUM0MSAxNDAgODAgMTIwIDEwMCAxMjBDMTIwIDEyMCAxNTggMTQwIDE2MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==";

  useEffect(() => {
    setFormErrors({});
  }, [currentStep, setFormErrors]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({ ...prev, image: "Invalid image or file too large (max 5MB)" }));
      return;
    }

    setIsUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      const response = await axiosInstance.post("/api/upload", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.url) {
        setFormData((prev) => ({ ...prev, image: response.data.url }));
        setFormErrors((prev) => ({ ...prev, image: "" }));
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      setFormErrors((prev) => ({ ...prev, image: "Image upload failed" }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleTopLevelInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      petOwnerDetails: {
        ...prev.petOwnerDetails,
        address: { ...prev.petOwnerDetails.address, [field]: value },
      },
    }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "governorate") {
      setFormData((prev) => ({
        ...prev,
        petOwnerDetails: {
          ...prev.petOwnerDetails,
          address: { ...prev.petOwnerDetails.address, delegation: "" },
        },
      }));
    }
  };

  const validateCurrentStep = () => {
    const errors = {};
    if (currentStep === 1) {
      if (!formData.image) errors.image = "Profile image is required";
      if (!formData.gender) errors.gender = "Gender is required";
      if (!formData.petOwnerDetails.phone) errors.phone = "Phone number is required";
      else if (!/^[234579]\d{7}$/.test(formData.petOwnerDetails.phone))
        errors.phone = "Phone must be 8 digits, starting with 2, 3, 4, 5, 7, or 9";
    } else if (currentStep === 2) {
      if (!formData.about) errors.about = "About section is required";
      else if (formData.about.length < 10) errors.about = "About must be at least 10 characters";
      if (!formData.petOwnerDetails.address.governorate)
        errors.governorate = "Governorate is required";
      if (!formData.petOwnerDetails.address.delegation)
        errors.delegation = "Delegation is required";
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

    try {
      const profileDetails = {
        image: formData.image,
        gender: formData.gender,
        about: formData.about,
        petOwnerDetails: {
          address: `${
            formData.petOwnerDetails.address.governorate
          }, ${formData.petOwnerDetails.address.delegation}${
            formData.petOwnerDetails.address.street
              ? `, ${formData.petOwnerDetails.address.street}`
              : ""
          }`.trim(),
          phone: formData.petOwnerDetails.phone,
        },
      };
      console.log("Submitting profileDetails:", profileDetails);
      const result = await createProfile(profileDetails);
      if (result.success) {
        navigate(result.redirectTo, { replace: true });
      }
    } catch (error) {
      console.error("Submission error:", error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message || "Failed to create profile";
      setFormErrors((prev) => ({ ...prev, submit: errorMessage }));
      const errorElement = document.querySelector(".bg-red-50");
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-3 pb-3 border-b border-[#ffc929]/30">
        <div className="p-2.5 bg-[#ffc929]/10 rounded-full">
          <LucideUserPen size={24} className="text-[#ffc929]" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-800">
          Basic Information
        </h3>
      </div>
      
      <div className="flex flex-col items-center">
        <div 
          className="relative group"
          onMouseEnter={() => setImageHover(true)}
          onMouseLeave={() => setImageHover(false)}
        >
          <div className={`relative w-40 h-40 transition-all duration-300 rounded-full overflow-hidden border-4 border-[#ffc929]/30 shadow-lg hover:shadow-xl group-hover:border-[#ffc929] group-hover:ring-2 group-hover:ring-[#ffc929]/50`}>
            <img
              src={formData.image || defaultImageUrl}
              alt="Profile preview"
              className={`w-full h-full object-cover transition-all duration-300 ${imageHover ? 'scale-110 blur-sm' : ''}`}
            />
            <label className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer bg-black/60 ${imageHover ? 'opacity-100' : 'opacity-0'}`}>
              {isUploading ? (
                <Loader2 size={32} className="text-white animate-spin" />
              ) : (
                <>
                  <Camera size={32} className="mb-2 text-white" />
                  <span className="text-sm font-medium text-white">Upload Photo</span>
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          {formData.image && (
            <div className="absolute -top-2 -right-2 bg-[#ffc929] text-white p-1.5 rounded-full shadow-md">
              <CheckCircle size={18} />
            </div>
          )}
        </div>
        <p className="flex items-center gap-1.5 mt-4 text-sm text-gray-600">
          <Info size={16} className="text-[#ffc929]" />
          Upload a clear portrait photo (max 5MB)
        </p>
        {formErrors.image && (
          <p id="image-error" className="flex items-center gap-1.5 px-4 py-1.5 mt-2 text-sm font-medium text-red-600 rounded-full bg-red-50" aria-live="polite">
            <AlertCircle size={14} className="text-red-500" />
            {formErrors.image}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <FaTransgender size={16} className="text-[#ffc929]" />
            </span>
            Gender <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            {["Female", "Male"].map((option) => (
              <div 
                key={option}
                onClick={() => handleTopLevelInputChange("gender", option)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm border-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                  formData.gender === option
                    ? "bg-[#ffc929]/10 border-[#ffc929] text-[#ffc929] font-medium shadow-md scale-105"
                    : "border-gray-200 hover:border-[#ffc929]/50 hover:bg-[#ffc929]/10"
                }`}
                role="button"
                aria-label={`Select ${option}`}
              >
                {option === "Female" ? (
                  <FaFemale size={16} className={formData.gender === option ? "text-pink-500" : "text-gray-500 group-hover:text-pink-500"} title="Female" />
                ) : (
                  <FaMale size={16} className={formData.gender === option ? "text-[#ffc929]" : "text-gray-500 group-hover:text-[#ffc929]"} title="Male" />
                )}
                {option}
              </div>
            ))}
          </div>
          {formErrors.gender && (
            <p id="gender-error" className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-red-600 rounded-full bg-red-50" aria-live="polite">
              <AlertCircle size={14} className="text-red-500" />
              {formErrors.gender}
            </p>
          )}
        </div>
        <div className="space-y-3">
          <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <Phone size={16} className="text-[#ffc929]" />
            </span>
            Phone Number <span className="text-red-500">*</span>
            <div className="relative group cursor-help">
              <Info size={14} className="text-gray-400" />
              <span className="absolute z-10 hidden px-3 py-1.5 text-xs text-white transform -translate-x-1/2 bg-gray-800 rounded -top-8 left-1/2 group-hover:block whitespace-nowrap">
                8 digits, starts with 2, 3, 4, 5, 7, or 9
              </span>
            </div>
          </label>
          <div className={`flex items-center w-full px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#ffc929]/50 focus-within:border-[#ffc929] transition-all duration-300 ${formErrors.phone ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"}`}>
            <span className="mr-2 font-medium text-gray-500">+216</span>
            <input
              type="tel"
              value={formData.petOwnerDetails?.phone || ""}
              onChange={(e) => handleInputChange("petOwnerDetails", "phone", e.target.value)}
              className="w-full bg-transparent focus:outline-none"
              placeholder="58123456"
              pattern="[0-9]*"
              maxLength={8}
              id="phone"
              aria-invalid={!!formErrors.phone}
              aria-describedby={formErrors.phone ? "phone-error" : undefined}
            />
          </div>
          {formErrors.phone && (
            <p id="phone-error" className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-red-600 rounded-full bg-red-50" aria-live="polite">
            <AlertCircle size={14} className="text-red-500" />
              {formErrors.phone}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderAboutAndAddress = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-3 pb-3 border-b border-[#ffc929]/30">
        <div className="p-2.5 bg-[#ffc929]/10 rounded-full">
          <Contact  size={24} className="text-[#ffc929]" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-800">
          About & Address
        </h3>
      </div>
      
      <div className="space-y-3">
        <label htmlFor="about" className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
            <MdContactSupport  size={16} className="text-[#ffc929]" />
          </span>
          About You <span className="text-red-500">*</span>
        </label>
        <div className="relative overflow-hidden transition-all duration-300 rounded-xl">
          <textarea
            value={formData.about || ""}
            onChange={(e) => handleTopLevelInputChange("about", e.target.value)}
            className={`w-full px-4 py-3.5 text-sm border-2 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] transition-all duration-300 rounded-xl ${formErrors.about ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"}`}
            rows={5}
            placeholder="Tell us about yourself, your pets, and your love for animals..."
            id="about"
            aria-invalid={!!formErrors.about}
            aria-describedby={formErrors.about ? "about-error" : undefined}
          />
          <div className={`absolute text-xs font-medium ${formData.about?.length > 400 ? 'text-amber-500' : 'text-gray-500'} right-4 bottom-4`}>
            {(formData.about || "").length}/500
          </div>
        </div>
        {formErrors.about && (
          <p id="about-error" className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-red-600 rounded-full bg-red-50" aria-live="polite">
            <AlertCircle size={14} className="text-red-500" />
            {formErrors.about}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <label htmlFor="governorate" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <FaMapMarkedAlt  size={16} className="text-[#ffc929]" />
            </span>
            Governorate <span className="text-red-500">*</span>
          </label>
          <Select
            id="governorate"
            value={formData.petOwnerDetails?.address?.governorate || ""}
            onChange={(e) => handleAddressChange("governorate", e.target.value)}
            error={formErrors.governorate}
          >
            <option value="" disabled>
              Select Governorate
            </option>
            {governorates.map((gov) => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-3">
          <label htmlFor="delegation" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <MdLocationCity  size={16} className="text-[#ffc929]" />
            </span>
            Delegation <span className="text-red-500">*</span>
          </label>
          <Select
            id="delegation"
            value={formData.petOwnerDetails?.address?.delegation || ""}
            onChange={(e) => handleAddressChange("delegation", e.target.value)}
            error={formErrors.delegation}
            className={!formData.petOwnerDetails?.address?.governorate ? "opacity-60 cursor-not-allowed" : ""}
            disabled={!formData.petOwnerDetails?.address?.governorate}
          >
            <option value="" disabled>
              {!formData.petOwnerDetails?.address?.governorate ? "Select governorate first" : "Select Delegation"}
            </option>
            {formData.petOwnerDetails?.address?.governorate &&
              delegationsByGovernorate[formData.petOwnerDetails.address.governorate]?.map(
                (del) => (
                  <option key={del} value={del}>
                    {del}
                  </option>
                )
              )}
          </Select>
        </div>
      </div>
      <div className="space-y-3">
        <label htmlFor="street" className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
            <AiOutlineHome  size={16} className="text-[#ffc929]" />
          </span>
          Street Address (Optional)
        </label>
        <Input
          id="street"
          type="text"
          value={formData.petOwnerDetails?.address?.street || ""}
          onChange={(e) => handleAddressChange("street", e.target.value)}
          placeholder="Enter your street address (optional)"
        />
      </div>
    </div>
  );

  return (
      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-[#ffc929]/10 relative">
        {formErrors.submit && (
          <div className="flex items-center gap-3 p-4 border border-red-200 bg-red-50 rounded-xl">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <p className="text-sm font-medium text-red-600">{formErrors.submit}</p>
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
          <div 
            className="bg-gradient-to-r from-[#ffc929] to-[#ffa726] h-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        
        {currentStep === 1 && renderBasicInfo()}
        {currentStep === 2 && renderAboutAndAddress()}
        
        <div className="flex justify-between mt-10 border-t pt-6 border-[#ffc929]/20">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-[#ffc929] border border-[#ffc929]/20 transition-all duration-300 bg-[#ffc929]/5 group rounded-xl hover:bg-[#ffc929]/10 hover:shadow-md"
              disabled={loading}
            >
              <svg className="w-5 h-5 transition-transform duration-300 transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Previous Step
            </button>
          ) : (
            <div></div>
          )}
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="group ml-auto px-6 py-3.5 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading}
            >
              Save & Continue
              <svg className="w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="group ml-auto px-6 py-3.5 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
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

        {/* Step Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index < currentStep 
                  ? 'bg-[#ffc929]' 
                  : index === currentStep - 1 
                    ? 'bg-[#ffc929] scale-125' 
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </form>
  );
};

export default PetOwnerProfile;