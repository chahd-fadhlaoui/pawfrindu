import { Award, Camera, CheckCircle, FileText, GraduationCap, Info, Loader2, Plus, X } from "lucide-react";
import React, { useState } from "react";
import { FaFacebook, FaGlobe, FaInstagram } from "react-icons/fa";
import { TiBusinessCard } from "react-icons/ti";
import { breeds, SPECIES_OPTIONS } from "../../../../assets/Pet";
import { Tooltip } from "../../../Tooltip";
import { ErrorMessage } from "../../common/ErrorMessage";
import { SectionHeader } from "../../common/SectionHeader";

const Step2 = ({
  formData,
  formErrors,
  handleInputChange,
  handleImageUpload,
  addBreed,
  removeBreed,
  defaultImageUrl,
  isUploading,
  removeTrainingPhoto,
}) => {
  const [imageHover, setImageHover] = useState({
    certification: false,
    businessCard: false,
    trainingPhotos: false,
  });
  const [selectedSpecies, setSelectedSpecies] = useState("dog"); // Default to "dog"
  const [selectedBreed, setSelectedBreed] = useState(""); // Track selected breed

  // Calculate remaining characters for about section
  const aboutCharCount = (formData.about || "").length;
  const aboutMaxLength = 500;
  const aboutRemaining = aboutMaxLength - aboutCharCount;
  const isNearLimit = aboutRemaining <= 50;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animationClass = prefersReducedMotion ? "" : "transition-all duration-300";

  // Validate URL format
  const validateUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Safely access trainerDetails
  const trainerDetails = formData.trainerDetails || {};

  // Filter available breeds based on already added breeds for the selected species
  const availableBreeds = breeds[selectedSpecies].filter(
    (breed) =>
      !trainerDetails.breedsTrained?.some(
        (addedBreed) =>
          addedBreed.species === selectedSpecies &&
          addedBreed.breedName === breed
      )
  );

  // Handle adding a breed
  const handleAddBreed = () => {
    if (selectedBreed) {
      addBreed({ species: selectedSpecies, breedName: selectedBreed });
      setSelectedBreed(""); // Reset breed selection
    }
  };

  // Handle keydown for accessibility
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && selectedBreed) {
      e.preventDefault();
      handleAddBreed();
    }
  };

  // Format breed display
  const formatBreedDisplay = (breed) => {
    if (!breed) return "Unknown Breed";
    const species = breed.species || "Unknown";
    const breedName = breed.breedName || "Unknown";
    return `${breedName} (${species})`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SectionHeader
        title="Professional Credentials"
        icon={GraduationCap}
        description="Required fields are marked with *"
      />

      {/* Documentation Section */}
      <section className="space-y-4" aria-labelledby="documentation-section">
        <div className="flex items-center gap-2">
          <label
            id="documentation-section"
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <GraduationCap size={16} className="text-[#ffc929]" />
            </span>
            Documentation <span className="text-red-500">*</span>
          </label>
          <Tooltip
            text="Upload clear images of your certification and business card (max 5MB each)."
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
          {/* Certification Upload */}
          <div className="flex flex-col items-center">
            <div
              className="relative group"
              onMouseEnter={() =>
                setImageHover((prev) => ({ ...prev, certification: true }))
              }
              onMouseLeave={() =>
                setImageHover((prev) => ({ ...prev, certification: false }))
              }
            >
              <div
                className={`relative w-40 h-40 rounded-xl overflow-hidden border-4 border-[#ffc929]/30 shadow-lg hover:shadow-xl group-hover:border-[#ffc929] group-hover:ring-2 group-hover:ring-[#ffc929]/50 ${animationClass}`}
              >
                {trainerDetails.certificationImage ? (
                  <img
                    src={trainerDetails.certificationImage}
                    alt="Certification preview"
                    className={`w-full h-full object-cover ${animationClass} ${
                      imageHover.certification ? "scale-110 blur-sm" : ""
                    }`}
                  />
                ) : (
                  <div
                    className={`flex items-center justify-center w-full h-full bg-gray-100 ${animationClass}`}
                  >
                    <GraduationCap size={40} className="text-gray-400" />
                  </div>
                )}
                <label
                  htmlFor="certification-upload"
                  className={`absolute inset-0 flex flex-col items-center justify-center ${animationClass} cursor-pointer bg-black/60 ${
                    imageHover.certification ? "opacity-100" : "opacity-0"
                  }`}
                  aria-label="Upload certification photo"
                >
                  {isUploading.certification ? (
                    <Loader2 size={32} className="text-white animate-spin" />
                  ) : (
                    <>
                      <Camera size={32} className="mb-2 text-white" />
                      <span className="text-sm font-medium text-white">
                        Upload Certification
                      </span>
                    </>
                  )}
                  <input
                    id="certification-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "certificationImage")}
                    disabled={isUploading.certification}
                  />
                </label>
              </div>
              {trainerDetails.certificationImage && (
                <div className="absolute -top-2 -right-2 bg-[#ffc929] text-white p-1.5 rounded-full shadow-md">
                  <CheckCircle size={18} />
                </div>
              )}
            </div>
            <p className="flex items-center gap-1.5 mt-4 text-sm text-gray-600">
              <Info size={16} className="text-[#ffc929]" />
              Upload a clear certification photo (max 5MB)
            </p>
            <ErrorMessage
              id="certificationImage-error"
              error={formErrors.certificationImage}
            />
          </div>

          {/* Business Card Upload */}
          <div className="flex flex-col items-center">
            <div
              className="relative group"
              onMouseEnter={() =>
                setImageHover((prev) => ({ ...prev, businessCard: true }))
              }
              onMouseLeave={() =>
                setImageHover((prev) => ({ ...prev, businessCard: false }))
              }
            >
              <div
                className={`relative w-40 h-40 rounded-xl overflow-hidden border-4 border-[#ffc929]/30 shadow-lg hover:shadow-xl group-hover:border-[#ffc929] group-hover:ring-2 group-hover:ring-[#ffc929]/50 ${animationClass}`}
              >
                {trainerDetails.businessCardImage ? (
                  <img
                    src={trainerDetails.businessCardImage}
                    alt="Business card preview"
                    className={`w-full h-full object-cover ${animationClass} ${
                      imageHover.businessCard ? "scale-110 blur-sm" : ""
                    }`}
                  />
                ) : (
                  <div
                    className={`flex items-center justify-center w-full h-full bg-gray-100 ${animationClass}`}
                  >
                    <TiBusinessCard size={40} className="text-gray-400" />
                  </div>
                )}
                <label
                  htmlFor="businessCard-upload"
                  className={`absolute inset-0 flex flex-col items-center justify-center ${animationClass} cursor-pointer bg-black/60 ${
                    imageHover.businessCard ? "opacity-100" : "opacity-0"
                  }`}
                  aria-label="Upload business card image"
                >
                  {isUploading.businessCard ? (
                    <Loader2 size={32} className="text-white animate-spin" />
                  ) : (
                    <>
                      <Camera size={32} className="mb-2 text-white" />
                      <span className="text-sm font-medium text-white">
                        Upload Card
                      </span>
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
              {trainerDetails.businessCardImage && (
                <div className="absolute -top-2 -right-2 bg-[#ffc929] text-white p-1.5 rounded-full shadow-md">
                  <CheckCircle size={18} />
                </div>
              )}
            </div>
            <p className="flex items-center gap-1.5 mt-4 text-sm text-gray-600">
              <Info size={16} className="text-[#ffc929]" />
              Upload a clear business card (max 5MB)
            </p>
            <ErrorMessage
              id="businessCardImage-error"
              error={formErrors.businessCardImage}
            />
          </div>
        </div>
      </section>

      {/* Basic Information Section */}
      <section className="space-y-4" aria-labelledby="basic-info-section">
        <div className="flex items-center gap-2">
          <label
            id="basic-info-section"
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <Award size={16} className="text-[#ffc929]" />
            </span>
            Basic Information <span className="text-red-500">*</span>
          </label>
          <Tooltip
            text="Provide the average duration of your training sessions."
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
            <label
              htmlFor="averageSessionDuration"
              className="text-sm text-gray-600"
            >
              Average Session Duration <span className="text-red-500">*</span>
            </label>
            <select
              id="averageSessionDuration"
              value={trainerDetails.averageSessionDuration || ""}
              onChange={(e) =>
                handleInputChange(
                  "trainerDetails",
                  "averageSessionDuration",
                  e.target.value
                )
              }
              className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                formErrors.averageSessionDuration
                  ? "border-red-500 bg-red-50/30"
                  : "border-[#ffc929]/20"
              }`}
              aria-invalid={!!formErrors.averageSessionDuration}
              aria-describedby={
                formErrors.averageSessionDuration
                  ? "duration-error"
                  : undefined
              }
            >
              <option value="" disabled>
                Select Duration
              </option>
              <optgroup label="Common Durations">
                <option value={60}>1 hour</option>
              </optgroup>
              <optgroup label="Other Options">
                <option value={90}>1 hour 30 mins</option>
                <option value={120}>2 hours</option>
                <option value={150}>2 hours 30 mins</option>
                <option value={180}>3 hours</option>
              </optgroup>
            </select>
            <ErrorMessage
              id="duration-error"
              error={formErrors.averageSessionDuration}
            />
          </div>
        </div>
      </section>

      {/* Breeds Trained Section */}
      <section className="space-y-4" aria-labelledby="breeds-trained-section">
        <div className="flex items-center gap-2">
          <label
            id="breeds-trained-section"
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <GraduationCap size={16} className="text-[#ffc929]" />
            </span>
            Breeds Trained
          </label>
          <Tooltip
            text="Select the species and breeds you have experience training. Add each breed to your list."
            ariaLabel="Breeds trained information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">Breeds trained information</span>
              <Info size={16} className="text-gray-400" />
            </button>
          </Tooltip>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* Species Selector */}
            <select
              id="species-select"
              value={selectedSpecies}
              onChange={(e) => {
                setSelectedSpecies(e.target.value);
                setSelectedBreed(""); // Reset breed when species changes
              }}
              className={`w-1/3 px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} border-[#ffc929]/20 hover:border-[#ffc929]/50`}
              aria-label="Select species"
            >
              {SPECIES_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Breed Selector */}
            <select
              id="breed-select"
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                formErrors.breedsTrained
                  ? "border-red-500 bg-red-50/30"
                  : "border-[#ffc929]/20 hover:border-[#ffc929]/50"
              }`}
              aria-label="Select breed"
              aria-describedby={
                formErrors.breedsTrained
                  ? "breeds-trained-error"
                  : "breeds-trained-hint"
              }
            >
              <option value="" disabled>
                Select a breed
              </option>
              {availableBreeds.length > 0 ? (
                availableBreeds.map((breed) => (
                  <option key={breed} value={breed}>
                    {breed}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No breeds available
                </option>
              )}
            </select>

            <button
              type="button"
              onClick={handleAddBreed}
              className={`p-3 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] disabled:opacity-70 disabled:cursor-not-allowed ${animationClass}`}
              disabled={!selectedBreed}
              aria-label="Add breed"
            >
              <Plus size={20} />
            </button>
          </div>
          <p
            id="breeds-trained-hint"
            className="flex items-center gap-1.5 text-sm text-gray-600"
          >
            <Info size={16} className="text-[#ffc929]" />
            Select a species and breed to add to your expertise
          </p>

          {trainerDetails.breedsTrained?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {trainerDetails.breedsTrained.map((breed, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[#ffc929]/10 text-gray-800 rounded-full ${animationClass}`}
                >
                  <span>{formatBreedDisplay(breed)}</span>
                  <button
                    type="button"
                    onClick={() => removeBreed(index)}
                    className="text-gray-500 hover:text-red-600"
                    aria-label={`Remove ${breed.breedName || "breed"}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-gray-500">No breeds added yet</p>
          )}
          <ErrorMessage
            id="breeds-trained-error"
            error={formErrors.breedsTrained}
          />
        </div>
      </section>

      {/* About Section */}
      <section className="space-y-4" aria-labelledby="about-section">
        <div className="flex items-center gap-2">
          <label
            id="about-section"
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <FileText size={16} className="text-[#ffc929]" />
            </span>
            About Your Training <span className="text-red-500">*</span>
          </label>
          <Tooltip
            text="Describe your training approach, philosophy, and what makes your service unique."
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
              formErrors.about
                ? "border-red-500 bg-red-50/30"
                : isNearLimit
                ? "border-amber-300"
                : "border-[#ffc929]/20"
            }`}
            rows={5}
            placeholder="Tell us about your training methods and expertise..."
            maxLength={aboutMaxLength}
            aria-invalid={!!formErrors.about}
            aria-describedby={formErrors.about ? "about-error" : "about-hint"}
          />
          <div className="flex items-center justify-between">
            <p
              id="about-hint"
              className="flex items-center gap-1.5 text-sm text-gray-600"
            >
              <Info size={16} className="text-[#ffc929]" />
              Be concise but informative about your training philosophy
            </p>
            <span
              className={`text-sm ${
                isNearLimit ? "text-amber-600" : "text-gray-600"
              }`}
              aria-live="polite"
            >
              {aboutRemaining} characters remaining
            </span>
          </div>
          <ErrorMessage id="about-error" error={formErrors.about} />
        </div>
      </section>

      {/* Social Media Section */}
      <section className="space-y-4" aria-labelledby="social-media-section">
        <div className="flex items-center gap-2">
          <label
            id="social-media-section"
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <FaGlobe size={16} className="text-[#ffc929]" />
            </span>
            Social Media
          </label>
          <Tooltip
            text="Provide links to your professional social media profiles or website."
            ariaLabel="Social media information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">Social media information</span>
              <Info size={16} className="text-gray-400" />
            </button>
          </Tooltip>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FaFacebook size={20} className="text-[#3b5998]" />
            <input
              type="url"
              value={trainerDetails.socialLinks?.facebook || ""}
              onChange={(e) =>
                handleInputChange("trainerDetails", "socialLinks", {
                  facebook: e.target.value,
                })
              }
              placeholder="https://facebook.com/yourprofile"
              className={`flex-1 px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                formErrors.facebook ||
                (trainerDetails.socialLinks?.facebook &&
                  !validateUrl(trainerDetails.socialLinks.facebook))
                  ? "border-red-500 bg-red-50/30"
                  : "border-[#ffc929]/20"
              }`}
              aria-label="Facebook profile URL"
              aria-describedby={
                formErrors.facebook ? "facebook-error" : undefined
              }
            />
          </div>
          <ErrorMessage
            id="facebook-error"
            error={
              formErrors.facebook ||
              (trainerDetails.socialLinks?.facebook &&
                !validateUrl(trainerDetails.socialLinks.facebook)
                ? "Please enter a valid URL"
                : "")
            }
          />

          <div className="flex items-center gap-3">
            <FaInstagram size={20} className="text-[#e1306c]" />
            <input
              type="url"
              value={trainerDetails.socialLinks?.instagram || ""}
              onChange={(e) =>
                handleInputChange("trainerDetails", "socialLinks", {
                  instagram: e.target.value,
                })
              }
              placeholder="https://instagram.com/yourprofile"
              className={`flex-1 px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                formErrors.instagram ||
                (trainerDetails.socialLinks?.instagram &&
                  !validateUrl(trainerDetails.socialLinks.instagram))
                  ? "border-red-500 bg-red-50/30"
                  : "border-[#ffc929]/20"
              }`}
              aria-label="Instagram profile URL"
              aria-describedby={
                formErrors.instagram ? "instagram-error" : undefined
              }
            />
          </div>
          <ErrorMessage
            id="instagram-error"
            error={
              formErrors.instagram ||
              (trainerDetails.socialLinks?.instagram &&
                !validateUrl(trainerDetails.socialLinks.instagram)
                ? "Please enter a valid URL"
                : "")
            }
          />

          <div className="flex items-center gap-3">
            <FaGlobe size={20} className="text-[#4b5eAA]" />
            <input
              type="url"
              value={trainerDetails.socialLinks?.website || ""}
              onChange={(e) =>
                handleInputChange("trainerDetails", "socialLinks", {
                  website: e.target.value,
                })
              }
              placeholder="https://yourwebsite.com"
              className={`flex-1 px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                formErrors.website ||
                (trainerDetails.socialLinks?.website &&
                  !validateUrl(trainerDetails.socialLinks.website))
                  ? "border-red-500 bg-red-50/30"
                  : "border-[#ffc929]/20"
              }`}
              aria-label="Website URL"
              aria-describedby={formErrors.website ? "website-error" : undefined}
            />
          </div>
          <ErrorMessage
            id="website-error"
            error={
              formErrors.website ||
              (trainerDetails.socialLinks?.website &&
                !validateUrl(trainerDetails.socialLinks.website)
                ? "Please enter a valid URL"
                : "")
            }
          />
        </div>
      </section>

      {/* Training Photos Section */}
      <section className="space-y-4" aria-labelledby="training-photos-section">
        <div className="flex items-center gap-2">
          <label
            id="training-photos-section"
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <Camera size={16} className="text-[#ffc929]" />
            </span>
            Training Photos
          </label>
          <Tooltip
            text="Upload photos of your training sessions or facility (max 5MB each)."
            ariaLabel="Training photos information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">Training photos information</span>
              <Info size={16} className="text-gray-400" />
            </button>
          </Tooltip>
        </div>

        <div
          className={`flex flex-col items-center p-6 border-2 border-dashed border-[#ffc929]/30 rounded-xl hover:border-[#ffc929]/60 ${animationClass}`}
          onMouseEnter={() =>
            setImageHover((prev) => ({ ...prev, trainingPhotos: true }))
          }
          onMouseLeave={() =>
            setImageHover((prev) => ({ ...prev, trainingPhotos: false }))
          }
        >
          <Camera
            size={32}
            className={`text-[#ffc929] mb-2 ${
              imageHover.trainingPhotos ? "scale-110" : ""
            } ${animationClass}`}
          />
          <p className="mb-2 text-sm text-gray-600">
            Drag & drop images or click to upload
          </p>
          <label
            htmlFor="trainingPhotos-upload"
            className={`px-4 py-3.5 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] cursor-pointer ${animationClass}`}
            aria-label="Upload training photos"
          >
            {isUploading.trainingPhotos ? (
              <Loader2 size={18} className="inline animate-spin" />
            ) : (
              "Upload Photos"
            )}
            <input
              id="trainingPhotos-upload"
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e, "trainingPhotos")}
              disabled={isUploading.trainingPhotos}
            />
          </label>
        </div>
        {trainerDetails.trainingPhotos?.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3">
            {trainerDetails.trainingPhotos.map((img, index) => (
              <div
                key={index}
                className="relative h-24 overflow-hidden rounded-xl group"
              >
                <img
                  src={img || defaultImageUrl}
                  alt={`Training image ${index + 1}`}
                  className={`object-cover w-full h-full border-2 border-[#ffc929]/30 group-hover:border-[#ffc929] ${animationClass}`}
                />
                <button
                  type="button"
                  onClick={() => removeTrainingPhoto(index)}
                  className={`absolute p-1 text-white bg-red-500 rounded-full top-1 right-1 hover:bg-red-600 ${animationClass}`}
                  aria-label={`Remove training photo ${index + 1}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        <ErrorMessage
          id="trainingPhotos-error"
          error={formErrors.trainingPhotos}
        />
      </section>
    </div>
  );
};

export default Step2;