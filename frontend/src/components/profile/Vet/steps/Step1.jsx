import { Camera, CheckCircle, Globe, Info, Loader2, LucideUserPen, Phone, User } from "lucide-react";
import React, { useState } from "react";
import { FaFemale, FaMale, FaTransgender } from "react-icons/fa";
import { Tooltip } from "../../../Tooltip";
import { SectionHeader } from "../../common/SectionHeader";
import { ErrorMessage } from "../../common/ErrorMessage";

const Step1 = ({
  formData,
  formErrors,
  handleInputChange,
  handleImageUpload,
  handleLanguageChange,
  defaultImageUrl,
  isUploading,
}) => {
  const [imageHover, setImageHover] = useState(false);

  // For better mobile UX, check if the user prefers reduced motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animationClass = prefersReducedMotion ? "" : "transition-all duration-300";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SectionHeader
        title="Personal Information"
        icon={LucideUserPen}
        description="Required fields are marked with *"
      />

      {/* Profile Image Section */}
      <section className="space-y-4" aria-labelledby="profile-image-section">
        <div className="flex items-center gap-2">
          <label id="profile-image-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <User size={16} className="text-[#ffc929]" />
            </span>
            Profile Photo <span className="text-red-500">*</span>
          </label>
          <Tooltip
            text="Upload a clear portrait photo for your profile. Maximum size is 5MB."
            ariaLabel="Profile photo information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">Profile photo information</span>
              <Info size={16} className="text-gray-400" />
            </button>
          </Tooltip>
        </div>

        <div className="flex flex-col items-center">
          <div
            className="relative group"
            onMouseEnter={() => setImageHover(true)}
            onMouseLeave={() => setImageHover(false)}
          >
            <div
              className={`relative w-40 h-40 rounded-full overflow-hidden border-4 border-[#ffc929]/30 shadow-lg hover:shadow-xl group-hover:border-[#ffc929] group-hover:ring-2 group-hover:ring-[#ffc929]/50 ${animationClass}`}
            >
              <img
                src={formData.image || defaultImageUrl}
                alt="Profile preview"
                className={`w-full h-full object-cover ${animationClass} ${imageHover ? "scale-110 blur-sm" : ""}`}
              />
              <label
                htmlFor="profile-upload"
                className={`absolute inset-0 flex flex-col items-center justify-center ${animationClass} cursor-pointer bg-black/60 ${imageHover ? "opacity-100" : "opacity-0"}`}
                aria-label="Upload profile photo"
              >
                {isUploading.profile ? (
                  <Loader2 size={32} className="text-white animate-spin" />
                ) : (
                  <>
                    <Camera size={32} className="mb-2 text-white" />
                    <span className="text-sm font-medium text-white">Upload Photo</span>
                  </>
                )}
                <input
                  id="profile-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "profile")}
                  disabled={isUploading.profile}
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
          <ErrorMessage id="image-error" error={formErrors.image} />
        </div>
      </section>

      {/* Gender Section */}
      <section className="space-y-3" aria-labelledby="gender-section">
        <div className="flex items-center gap-2">
          <label id="gender-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <FaTransgender size={16} className="text-[#ffc929]" />
            </span>
            Gender <span className="text-red-500">*</span>
          </label>
          <Tooltip
            text="Please select your gender identity."
            ariaLabel="Gender information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">Gender information</span>
              <Info size={16} className="text-gray-400" />
            </button>
          </Tooltip>
        </div>

        <div className="flex space-x-4">
          {["Female", "Male"].map((option) => (
            <div
              key={option}
              onClick={() => handleInputChange("root", "gender", option)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                handleInputChange("root", "gender", option)
              }
              tabIndex={0}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm border-2 rounded-xl cursor-pointer ${animationClass} group ${
                formData.gender === option
                  ? "bg-[#ffc929]/10 border-[#ffc929] text-[#ffc929] font-medium shadow-md scale-105"
                  : "border-gray-200 hover:border-[#ffc929]/50 hover:bg-[#ffc929]/10"
              }`}
              role="button"
              aria-label={`Select ${option}`}
              aria-pressed={formData.gender === option}
            >
              {option === "Female" ? (
                <FaFemale
                  size={16}
                  className={formData.gender === option ? "text-pink-500" : "text-gray-500 group-hover:text-pink-500"}
                />
              ) : (
                <FaMale
                  size={16}
                  className={formData.gender === option ? "text-[#ffc929]" : "text-gray-500 group-hover:text-[#ffc929]"}
                />
              )}
              {option}
            </div>
          ))}
        </div>
        <ErrorMessage id="gender-error" error={formErrors.gender} />
      </section>

      {/* Contact Section */}
      <section className="space-y-3" aria-labelledby="contact-section">
        <div className="flex items-center gap-2">
          <label id="contact-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <Phone size={16} className="text-[#ffc929]" />
            </span>
            Contact Numbers <span className="text-red-500">*</span>
          </label>
          <Tooltip
            text="Provide at least one contact number where clients can reach you."
            ariaLabel="Contact information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">Contact information</span>
              <Info size={16} className="text-gray-400" />
            </button>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <label htmlFor="phone" className="flex items-center gap-1.5 text-sm text-gray-600">
              Primary Phone <span className="text-red-500">*</span>
              <Tooltip
                text="8 digits, starts with 2, 3, 4, 5, 7, or 9"
                ariaLabel="Primary phone format information"
                className="text-xs -top-8"
              >
                <span className="inline-block ml-1 cursor-help">
                  <Info size={14} className="text-gray-400" />
                </span>
              </Tooltip>
            </label>
            <div
              className={`flex items-center w-full px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#ffc929]/50 focus-within:border-[#ffc929] ${animationClass} ${
                formErrors.phone ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"
              }`}
            >
              <span className="mr-2 font-medium text-gray-500">+216</span>
              <input
                type="tel"
                value={formData.veterinarianDetails.phone || ""}
                onChange={(e) => handleInputChange("veterinarianDetails", "phone", e.target.value)}
                className="w-full bg-transparent focus:outline-none"
                placeholder="58123456"
                pattern="[0-9]*"
                maxLength={8}
                id="phone"
                aria-invalid={!!formErrors.phone}
                aria-describedby={formErrors.phone ? "phone-error" : undefined}
              />
            </div>
            <ErrorMessage id="phone-error" error={formErrors.phone} />
          </div>
          <div className="space-y-3">
            <label htmlFor="secondaryPhone" className="text-sm text-gray-600">
              Secondary Phone (Optional)
            </label>
            <div
              className={`flex items-center w-full px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#ffc929]/50 focus-within:border-[#ffc929] ${animationClass} ${
                formErrors.secondaryPhone ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"
              }`}
            >
              <span className="mr-2 font-medium text-gray-500">+216</span>
              <input
                type="tel"
                value={formData.veterinarianDetails.secondaryPhone || ""}
                onChange={(e) => handleInputChange("veterinarianDetails", "secondaryPhone", e.target.value)}
                className="w-full bg-transparent focus:outline-none"
                placeholder="58123456"
                pattern="[0-9]*"
                maxLength={8}
                id="secondaryPhone"
                aria-invalid={!!formErrors.secondaryPhone}
                aria-describedby={formErrors.secondaryPhone ? "secondaryPhone-error" : undefined}
              />
            </div>
            <ErrorMessage id="secondaryPhone-error" error={formErrors.secondaryPhone} />
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section className="space-y-3" aria-labelledby="languages-section">
        <div className="flex items-center gap-2">
          <label id="languages-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <Globe size={16} className="text-[#ffc929]" />
            </span>
            Languages Spoken <span className="text-red-500">*</span>
          </label>
          <Tooltip
            text="Select all languages you can communicate fluently in with your clients."
            ariaLabel="Languages information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">Languages information</span>
              <Info size={16} className="text-gray-400" />
            </button>
          </Tooltip>
        </div>

        <p className="text-sm text-gray-500">
          Select all languages you can speak fluently with clients.
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {["Arabic", "French", "English"].map((lang) => (
            <div
              key={lang}
              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer ${animationClass} ${
                formData.veterinarianDetails.languagesSpoken.includes(lang)
                  ? "bg-[#ffc929]/10 border-[#ffc929] text-gray-800"
                  : "border-gray-200 hover:border-[#ffc929]/50 hover:bg-[#ffc929]/5"
              }`}
              onClick={() => handleLanguageChange(lang)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                handleLanguageChange(lang)
              }
              tabIndex={0}
              role="checkbox"
              aria-checked={formData.veterinarianDetails.languagesSpoken.includes(lang)}
            >
              <div className="relative flex items-center justify-center w-5 h-5">
                <input
                  type="checkbox"
                  checked={formData.veterinarianDetails.languagesSpoken.includes(lang)}
                  onChange={() => handleLanguageChange(lang)}
                  className="w-5 h-5 text-[#ffc929] border-gray-300 rounded focus:ring-[#ffc929]"
                  aria-label={`Select ${lang} language`}
                  id={`lang-${lang}`}
                />
              </div>
              <label htmlFor={`lang-${lang}`} className="flex-1 text-sm cursor-pointer select-none">
                {lang}
              </label>
            </div>
          ))}
        </div>
        <ErrorMessage id="languagesSpoken-error" error={formErrors.languagesSpoken} />
      </section>
    </div>
  );
};

export default Step1;
