import { CheckCircle, Edit, GraduationCap, Info } from "lucide-react";
import React from "react";
import { TiBusinessCard } from "react-icons/ti";
import MapViewer from "../../../map/MapViewer";
import { Tooltip } from "../../../Tooltip";
import { ErrorMessage } from "../../common/ErrorMessage";
import { SectionHeader } from "../../common/SectionHeader";

const Step6 = ({
  formData,
  formErrors,
  handleInputChange,
  setCurrentStep,
  defaultImageUrl,
}) => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animationClass = prefersReducedMotion ? "" : "transition-all duration-300";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SectionHeader
        title="Review & Submit"
        icon={CheckCircle}
        description="Review your information before submitting. Required fields are marked with *"
      />

      {/* Personal Information */}
      <section className="space-y-4" aria-labelledby="personal-info-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 id="personal-info-section" className="text-sm font-medium text-gray-700">
              Personal Information
            </h4>
            <Tooltip
              text="Review your personal details, including profile photo, gender, and contact information."
              ariaLabel="Personal information review"
            >
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
              >
                <span className="sr-only">Personal information review</span>
                <Info size={16} className="text-gray-400" />
              </button>
            </Tooltip>
          </div>
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`text-sm font-medium text-[#ffc929] hover:text-[#ffa726] flex items-center gap-1 ${animationClass}`}
            aria-label="Edit personal information"
          >
            <Edit size={16} />
            Edit
          </button>
        </div>
        <div className={`p-4 border-2 border-[#ffc929]/20 rounded-xl bg-[#ffc929]/5 ${animationClass}`}>
          <div className="flex items-center gap-4">
            <img
              src={formData.image || defaultImageUrl}
              alt="Profile preview"
              className={`w-16 h-16 object-cover rounded-full border-2 border-[#ffc929]/30 shadow-sm ${animationClass}`}
            />
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="font-medium">Gender:</span> {formData.gender || "Not specified"}</p>
              <p><span className="font-medium">Phone:</span> {formData.veterinarianDetails.phone || "Not provided"}</p>
              <p><span className="font-medium">Secondary Phone:</span> {formData.veterinarianDetails.secondaryPhone || "Not provided"}</p>
              <p><span className="font-medium">Languages:</span> {formData.veterinarianDetails.languagesSpoken.join(", ") || "None selected"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Credentials */}
      <section className="space-y-4" aria-labelledby="credentials-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 id="credentials-section" className="text-sm font-medium text-gray-700">
              Professional Credentials
            </h4>
            <Tooltip
              text="Review your professional title, specializations, consultation duration, practice description, and uploaded documents."
              ariaLabel="Professional credentials review"
            >
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
              >
                <span className="sr-only">Professional credentials review</span>
                <Info size={16} className="text-gray-400" />
              </button>
            </Tooltip>
          </div>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`text-sm font-medium text-[#ffc929] hover:text-[#ffa726] flex items-center gap-1 ${animationClass}`}
            aria-label="Edit professional credentials"
          >
            <Edit size={16} />
            Edit
          </button>
        </div>
        <div className={`p-4 border-2 border-[#ffc929]/20 rounded-xl bg-[#ffc929]/5 ${animationClass}`}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Title:</span> {formData.veterinarianDetails.title || "Not specified"}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Specializations:</span>{" "}
                {formData.veterinarianDetails.specializations?.map((spec) => spec.specializationName).join(", ") || "None added"}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Consultation Duration:</span>{" "}
                {formData.veterinarianDetails.averageConsultationDuration
                  ? `${formData.veterinarianDetails.averageConsultationDuration} mins`
                  : "Not specified"}
              </p>
              <div>
                <p className="text-sm font-medium text-gray-700">About Your Practice:</p>
                <p className="text-sm text-gray-700">{formData.about || "No description provided"}</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">Diploma Photo:</p>
                {formData.veterinarianDetails.diplomasAndTraining ? (
                  <img
                    src={formData.veterinarianDetails.diplomasAndTraining}
                    alt="Diploma preview"
                    className={`w-24 h-24 object-cover rounded-xl border-2 border-[#ffc929]/30 ${animationClass}`}
                  />
                ) : (
                  <div
                    className={`flex items-center justify-center w-24 h-24 bg-gray-100 rounded-xl border-2 border-[#ffc929]/30 ${animationClass}`}
                  >
                    <GraduationCap size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">Business Card:</p>
                {formData.veterinarianDetails.businessCardImage ? (
                  <img
                    src={formData.veterinarianDetails.businessCardImage}
                    alt="Business card preview"
                    className={`w-24 h-24 object-cover rounded-xl border-2 border-[#ffc929]/30 ${animationClass}`}
                  />
                ) : (
                  <div
                    className={`flex items-center justify-center w-24 h-24 bg-gray-100 rounded-xl border-2 border-[#ffc929]/30 ${animationClass}`}
                  >
                    <TiBusinessCard size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">Professional Card:</p>
                {formData.veterinarianDetails.professionalCardImage ? (
                  <img
                    src={formData.veterinarianDetails.professionalCardImage}
                    alt="Professional card preview"
                    className={`w-24 h-24 object-cover rounded-xl border-2 border-[#ffc929]/30 ${animationClass}`}
                  />
                ) : (
                  <div
                    className={`flex items-center justify-center w-24 h-24 bg-gray-100 rounded-xl border-2 border-[#ffc929]/30 ${animationClass}`}
                  >
                    <TiBusinessCard size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services & Schedule */}
      <section className="space-y-4" aria-labelledby="services-schedule-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 id="services-schedule-section" className="text-sm font-medium text-gray-700">
              Services & Schedule
            </h4>
            <Tooltip
              text="Review the services you offer and your clinic's operating hours."
              ariaLabel="Services and schedule review"
            >
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
              >
                <span className="sr-only">Services and schedule review</span>
                <Info size={16} className="text-gray-400" />
              </button>
            </Tooltip>
          </div>
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`text-sm font-medium text-[#ffc929] hover:text-[#ffa726] flex items-center gap-1 ${animationClass}`}
            aria-label="Edit services and schedule"
          >
            <Edit size={16} />
            Edit
          </button>
        </div>
        <div className={`p-4 border-2 border-[#ffc929]/20 rounded-xl bg-[#ffc929]/5 ${animationClass}`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Services:</p>
              {formData.veterinarianDetails.services.length > 0 ? (
                <ul className="text-sm text-gray-700 list-disc list-inside">
                  {formData.veterinarianDetails.services.map((service, index) => (
                    <li key={index}>
                      {service.serviceName} - {service.fee} TND
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-700">No services added</p>
              )}
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Schedule:</p>
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                  const schedule = formData.veterinarianDetails.openingHours[day];
                  const start = formData.veterinarianDetails.openingHours[`${day}Start`];
                  const end = formData.veterinarianDetails.openingHours[`${day}End`];
                  const start2 = formData.veterinarianDetails.openingHours[`${day}Start2`];
                  const end2 = formData.veterinarianDetails.openingHours[`${day}End2`];
                  return (
                    <p key={day} className="capitalize">
                      <span className="font-medium">{day}:</span>{" "}
                      {schedule === "Closed"
                        ? "Closed"
                        : schedule === "Single Session"
                        ? `${start} - ${end}`
                        : `${start} - ${end}, ${start2} - ${end2}`}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Details */}
      <section className="space-y-4" aria-labelledby="location-details-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 id="location-details-section" className="text-sm font-medium text-gray-700">
              Location Details
            </h4>
            <Tooltip
              text="Review your clinic's location on the map and uploaded photos."
              ariaLabel="Location details review"
            >
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
              >
                <span className="sr-only">Location details review</span>
                <Info size={16} className="text-gray-400" />
              </button>
            </Tooltip>
          </div>
          <button
            type="button"
            onClick={() => setCurrentStep(4)}
            className={`text-sm font-medium text-[#ffc929] hover:text-[#ffa726] flex items-center gap-1 ${animationClass}`}
            aria-label="Edit location details"
          >
            <Edit size={16} />
            Edit
          </button>
        </div>
        <div className={`p-4 border-2 border-[#ffc929]/20 rounded-xl bg-[#ffc929]/5 ${animationClass}`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Governorate:</span> {formData.veterinarianDetails.governorate || "Not specified"}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Delegation:</span> {formData.veterinarianDetails.delegation || "Not specified"}
              </p>
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">Clinic Location:</p>
                {formData.veterinarianDetails.geolocation.latitude && formData.veterinarianDetails.geolocation.longitude ? (
                  <MapViewer position={formData.veterinarianDetails.geolocation} />
                ) : (
                  <p className="text-sm text-gray-700">No location set</p>
                )}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Clinic Photos:</p>
              {formData.veterinarianDetails.clinicPhotos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {formData.veterinarianDetails.clinicPhotos.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Clinic photo ${index + 1}`}
                      className={`w-full h-16 object-cover rounded-xl border-2 border-[#ffc929]/30 ${animationClass}`}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-700">No photos added</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Terms and Conditions */}
      <section className="space-y-4" aria-labelledby="terms-section">
        <div className="flex items-center gap-2">
          <label id="terms-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <CheckCircle size={16} className="text-[#ffc929]" />
            </span>
            Terms and Conditions <span className="text-red-500">*</span>
          </label>
          <Tooltip
            text="You must agree to the terms and conditions and privacy policy to submit your profile."
            ariaLabel="Terms and conditions information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">Terms and conditions information</span>
              <Info size={16} className="text-gray-400" />
              </button>
            </Tooltip>
          </div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.acceptedTerms || false}
              onChange={(e) => handleInputChange("root", "acceptedTerms", e.target.checked)}
              className={`w-5 h-5 text-[#ffc929] border-gray-300 rounded focus:ring-[#ffc929] ${animationClass}`}
              aria-label="Accept terms and conditions"
              id="acceptedTerms"
            />
            <span className="text-sm text-gray-700">
              I agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ffc929] hover:text-[#ffa726] underline"
              >
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ffc929] hover:text-[#ffa726] underline"
              >
                Privacy Policy
              </a>{" "}
              <span className="text-red-500">*</span>
            </span>
          </label>
          <ErrorMessage id="acceptedTerms-error" error={formErrors.acceptedTerms} />
        </section>
  
        {/* Submission Error */}
        <ErrorMessage id="submit-error" error={formErrors.submit} />
      </div>
    );
};
  
export default Step6;