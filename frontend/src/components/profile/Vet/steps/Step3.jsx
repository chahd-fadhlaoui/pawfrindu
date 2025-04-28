import { Award, Camera, CheckCircle, FileText, GraduationCap, Info, Loader2, Plus, Stethoscope, X } from "lucide-react";
import React, { useState } from "react";
import { FaUserDoctor } from "react-icons/fa6";
import { TiBusinessCard } from "react-icons/ti";
import { Tooltip } from "../../../Tooltip";
import { ErrorMessage } from "../../common/ErrorMessage";
import { SectionHeader } from "../../common/SectionHeader";

const Step2 = ({
  formData,
  formErrors,
  handleInputChange,
  handleImageUpload,
  addSpecialization,
  removeSpecialization,
  specializationInput,
  setSpecializationInput,
  diplomaPlaceholderUrl,
  businessCardPlaceholderUrl,
  isUploading,
}) => {
  const [imageHover, setImageHover] = useState({ diploma: false, businessCard: false });

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && specializationInput.trim()) {
      e.preventDefault();
      addSpecialization();
    }
  };

  // Calculate remaining characters for about section
  const aboutCharCount = (formData.about || "").length;
  const aboutMaxLength = 500;
  const aboutRemaining = aboutMaxLength - aboutCharCount;
  const isNearLimit = aboutRemaining <= 50;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animationClass = prefersReducedMotion ? "" : "transition-all duration-300";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SectionHeader
        title="Professional Credentials"
        icon={FaUserDoctor}
        description="Required fields are marked with *"
      />

      {/* Documentation Section */}
      <section className="space-y-4" aria-labelledby="documentation-section">
        <div className="flex items-center gap-2">
          <label id="documentation-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <GraduationCap size={16} className="text-[#ffc929]" />
            </span>
            Documentation <span className="text-red-500">*</span>
          </label>
          <Tooltip
            text="Upload clear images of your diploma and business card (max 5MB each)."
            ariaLabel="Documentation information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">Documentation information</span>
              <Info size={16} className="text-gray-400" />
            </button>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Diploma Upload */}
          <div className="flex flex-col items-center">
            <div
              className="relative group"
              onMouseEnter={() => setImageHover((prev) => ({ ...prev, diploma: true }))}
              onMouseLeave={() => setImageHover((prev) => ({ ...prev, diploma: false }))}
            >
              <div
                className={`relative w-40 h-40 rounded-xl overflow-hidden border-4 border-[#ffc929]/30 shadow-lg hover:shadow-xl group-hover:border-[#ffc929] group-hover:ring-2 group-hover:ring-[#ffc929]/50 ${animationClass}`}
              >
                {formData.veterinarianDetails.diplomasAndTraining ? (
                  <img
                    src={formData.veterinarianDetails.diplomasAndTraining}
                    alt="Diploma preview"
                    className={`w-full h-full object-cover ${animationClass} ${imageHover.diploma ? "scale-110 blur-sm" : ""}`}
                  />
                ) : (
                  <div className={`flex items-center justify-center w-full h-full bg-gray-100 ${animationClass}`}>
                    <GraduationCap size={40} className="text-gray-400" />
                  </div>
                )}
                <label
                  htmlFor="diploma-upload"
                  className={`absolute inset-0 flex flex-col items-center justify-center ${animationClass} cursor-pointer bg-black/60 ${imageHover.diploma ? "opacity-100" : "opacity-0"}`}
                  aria-label="Upload diploma photo"
                >
                  {isUploading.diploma ? (
                    <Loader2 size={32} className="text-white animate-spin" />
                  ) : (
                    <>
                      <Camera size={32} className="mb-2 text-white" />
                      <span className="text-sm font-medium text-white">Upload Diploma</span>
                    </>
                  )}
                  <input
                    id="diploma-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "diplomasAndTraining")}
                    disabled={isUploading.diploma}
                  />
                </label>
              </div>
              {formData.veterinarianDetails.diplomasAndTraining && (
                <div className="absolute -top-2 -right-2 bg-[#ffc929] text-white p-1.5 rounded-full shadow-md">
                  <CheckCircle size={18} />
                </div>
              )}
            </div>
            <p className="flex items-center gap-1.5 mt-4 text-sm text-gray-600">
              <Info size={16} className="text-[#ffc929]" />
              Upload a clear diploma photo (max 5MB)
            </p>
            <ErrorMessage id="diplomasAndTraining-error" error={formErrors.diplomasAndTraining} />
          </div>

          {/* Business Card Upload */}
          <div className="flex flex-col items-center">
            <div
              className="relative group"
              onMouseEnter={() => setImageHover((prev) => ({ ...prev, businessCard: true }))}
              onMouseLeave={() => setImageHover((prev) => ({ ...prev, businessCard: false }))}
            >
              <div
                className={`relative w-40 h-40 rounded-xl overflow-hidden border-4 border-[#ffc929]/30 shadow-lg hover:shadow-xl group-hover:border-[#ffc929] group-hover:ring-2 group-hover:ring-[#ffc929]/50 ${animationClass}`}
              >
                {formData.veterinarianDetails.businessCardImage ? (
                  <img
                    src={formData.veterinarianDetails.businessCardImage}
                    alt="Business card preview"
                    className={`w-full h-full object-cover ${animationClass} ${imageHover.businessCard ? "scale-110 blur-sm" : ""}`}
                  />
                ) : (
                  <div className={`flex items-center justify-center w-full h-full bg-gray-100 ${animationClass}`}>
                    <TiBusinessCard size={40} className="text-gray-400" />
                  </div>
                )}
                <label
                  htmlFor="businessCard-upload"
                  className={`absolute inset-0 flex flex-col items-center justify-center ${animationClass} cursor-pointer bg-black/60 ${imageHover.businessCard ? "opacity-100" : "opacity-0"}`}
                  aria-label="Upload business card image"
                >
                  {isUploading.businessCard ? (
                    <Loader2 size={32} className="text-white animate-spin" />
                  ) : (
                    <>
                      <Camera size={32} className="mb-2 text-white" />
                      <span className="text-sm font-medium text-white">Upload Card</span>
                    </>
                  )}
                  <input
                    id="businessCard-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "businessCardImage")}
                    disabled={isUploading.businessCard}
                  />
                </label>
              </div>
              {formData.veterinarianDetails.businessCardImage && (
                <div className="absolute -top-2 -right-2 bg-[#ffc929] text-white p-1.5 rounded-full shadow-md">
                  <CheckCircle size={18} />
                </div>
              )}
            </div>
            <p className="flex items-center gap-1.5 mt-4 text-sm text-gray-600">
              <Info size={16} className="text-[#ffc929]" />
              Upload a clear business card (max 5MB)
            </p>
            <ErrorMessage id="businessCardImage-error" error={formErrors.businessCardImage} />
          </div>
        </div>
      </section>

      {/* Basic Information Section */}
      <section className="space-y-4" aria-labelledby="basic-info-section">
        <div className="flex items-center gap-2">
          <label id="basic-info-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <Award size={16} className="text-[#ffc929]" />
            </span>
            Basic Information <span className="text-red-500">*</span>
          </label>
          <Tooltip
            text="Provide your professional title and consultation duration for scheduling."
            ariaLabel="Basic information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">Basic information</span>
              <Info size={16} className="text-gray-400" />
            </button>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <label htmlFor="title" className="text-sm text-gray-600">
              Professional Title <span className="text-red-500">*</span>
            </label>
            <select
              id="title"
              value={formData.veterinarianDetails.title || ""}
              onChange={(e) => handleInputChange("veterinarianDetails", "title", e.target.value)}
              className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                formErrors.title ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"
              }`}
              aria-invalid={!!formErrors.title}
              aria-describedby={formErrors.title ? "title-error" : undefined}
            >
              <option value="" disabled>
                Select Title
              </option>
              <option value="Doctor">Doctor</option>
              <option value="Professor">Professor</option>
            </select>
            <ErrorMessage id="title-error" error={formErrors.title} />
          </div>

          <div className="space-y-3">
            <label htmlFor="averageConsultationDuration" className="text-sm text-gray-600">
              Consultation Duration <span className="text-red-500">*</span>
            </label>
            <select
              id="averageConsultationDuration"
              value={formData.veterinarianDetails.averageConsultationDuration || ""}
              onChange={(e) => handleInputChange("veterinarianDetails", "averageConsultationDuration", e.target.value)}
              className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                formErrors.averageConsultationDuration ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"
              }`}
              aria-invalid={!!formErrors.averageConsultationDuration}
              aria-describedby={formErrors.averageConsultationDuration ? "duration-error" : undefined}
            >
              <option value="" disabled>
                Select Duration
              </option>
              <optgroup label="Common Durations">
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
              </optgroup>
              <optgroup label="Other Options">
                <option value={10}>10 mins</option>
                <option value={20}>20 mins</option>
                <option value={25}>25 mins</option>
                <option value={50}>50 mins</option>
                <option value={55}>55 mins</option>
              </optgroup>
            </select>
            <ErrorMessage id="duration-error" error={formErrors.averageConsultationDuration} />
          </div>
        </div>
      </section>

      {/* Specializations Section */}
      <section className="space-y-4" aria-labelledby="specializations-section">
        <div className="flex items-center gap-2">
          <label id="specializations-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <Stethoscope size={16} className="text-[#ffc929]" />
            </span>
            Areas of Expertise <span className="text-red-500">*</span>
          </label>
          <Tooltip
            text="Add your areas of expertise like Surgery, Dermatology, Cardiology, etc. Press Enter or click Add after typing each one."
            ariaLabel="Specializations information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">Specializations information</span>
              <Info size={16} className="text-gray-400" />
            </button>
          </Tooltip>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              id="specialization-input"
              type="text"
              value={specializationInput}
              onChange={(e) => setSpecializationInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter specialization (e.g., Surgery)"
              className={`flex-1 px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                formErrors.specializations ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20 hover:border-[#ffc929]/50"
              }`}
              aria-label="Add specialization"
              aria-describedby={formErrors.specializations ? "specializations-error" : "specializations-hint"}
            />
            <button
              type="button"
              onClick={addSpecialization}
              className={`p-3 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] disabled:opacity-70 disabled:cursor-not-allowed ${animationClass}`}
              disabled={!specializationInput.trim()}
              aria-label="Add specialization"
            >
              <Plus size={20} />
            </button>
          </div>
          <p id="specializations-hint" className="flex items-center gap-1.5 text-sm text-gray-600">
            <Info size={16} className="text-[#ffc929]" />
            Add multiple specializations to highlight your expertise areas
          </p>

          {formData.veterinarianDetails.specializations?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.veterinarianDetails.specializations.map((spec, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[#ffc929]/10 text-gray-800 rounded-full ${animationClass}`}
                >
                  <span>{spec.specializationName}</span>
                  <button
                    type="button"
                    onClick={() => removeSpecialization(index)}
                    className="text-gray-500 hover:text-red-600"
                    aria-label={`Remove ${spec.specializationName} specialization`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-gray-500">No specializations added yet</p>
          )}
          <ErrorMessage id="specializations-error" error={formErrors.specializations} />
        </div>
      </section>

      {/* About Section */}
      <section className="space-y-4" aria-labelledby="about-section">
        <div className="flex items-center gap-2">
          <label id="about-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <FileText size={16} className="text-[#ffc929]" />
            </span>
            About Your Practice <span className="text-red-500">*</span>
          </label>
          <Tooltip
            text="Describe your veterinary practice approach, philosophy, and what makes your service unique for pet owners."
            ariaLabel="About information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">About information</span>
              <Info size={16} className="text-gray-400" />
            </button>
          </Tooltip>
        </div>

        <div className="space-y-3">
          <textarea
            id="about"
            value={formData.about || ""}
            onChange={(e) => handleInputChange("root", "about", e.target.value)}
            className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
              formErrors.about ? "border-red-500 bg-red-50/30" : isNearLimit ? "border-amber-300" : "border-[#ffc929]/20"
            }`}
            rows={5}
            placeholder="Tell us about your veterinary practice and expertise..."
            maxLength={aboutMaxLength}
            aria-invalid={!!formErrors.about}
            aria-describedby={formErrors.about ? "about-error" : "about-hint"}
          />
          <div className="flex items-center justify-between">
            <p id="about-hint" className="flex items-center gap-1.5 text-sm text-gray-600">
              <Info size={16} className="text-[#ffc929]" />
              Be concise but informative about your practice philosophy
            </p>
            <span
              className={`text-sm ${isNearLimit ? "text-amber-600" : "text-gray-600"}`}
              aria-live="polite"
            >
              {aboutRemaining} characters remaining
            </span>
          </div>
          <ErrorMessage id="about-error" error={formErrors.about} />
        </div>
      </section>
    </div>
  );
};

export default Step2;