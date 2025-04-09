// components/profile/Step2Credentials.jsx
import React from "react";
import axiosInstance from "../../utils/axiosInstance";
import { governorates } from "../../assets/locations";

const Step2Credentials = ({ formData, setFormData, formErrors, setFormErrors }) => {
  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);
    try {
      const response = await axiosInstance.post("/api/upload", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({
        ...prev,
        trainerDetails: { ...prev.trainerDetails, [field]: response.data.url },
      }));
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleServiceAreasChange = (gov) => {
    const currentAreas = formData.trainerDetails.serviceAreas || [];
    const updatedAreas = currentAreas.includes(gov)
      ? currentAreas.filter((area) => area !== gov) // Deselect
      : [...currentAreas, gov]; // Select
    handleInputChange("trainerDetails", "serviceAreas", updatedAreas);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b border-[#ffc929] pb-2">Step 2: Professional Credentials</h3>
      <div className="space-y-5">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Certification Image <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col items-start space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
            <label className="px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg cursor-pointer transition-colors inline-flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Upload Certification
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "certificationImage")}
              />
            </label>
           
            {formData.trainerDetails.certificationImage && (
              <div className="relative">
                <img
                  src={formData.trainerDetails.certificationImage}
                  alt="Certification Preview"
                  className="object-cover w-32 h-32 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleInputChange("trainerDetails", "certificationImage", null)}
                  className="absolute p-1 text-white transition-colors bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          {formErrors.certificationImage && (
            <p className="mt-1 text-sm text-red-500">{formErrors.certificationImage}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Training Facility Type <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={formData.trainerDetails.trainingFacilityType || ""}
              onChange={(e) => handleInputChange("trainerDetails", "trainingFacilityType", e.target.value)}
              className={`w-full pl-4 pr-10 py-3 text-sm border rounded-lg appearance-none focus:ring-teal-500 focus:border-teal-500 ${
                formErrors.trainingFacilityType ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="" disabled>Select Facility Type</option>
              <option value="Fixed Facility">Fixed Facility - Permanent training center</option>
              <option value="Public Space">Public Space - Parks or public areas</option>
              <option value="Mobile">Mobile - Travel to clients’ locations</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Choose how you provide training: Fixed (a set location), Public (open areas) or Mobile (visiting clients).
          </p>
          {formErrors.trainingFacilityType && (
            <p className="mt-1 text-sm text-red-500">{formErrors.trainingFacilityType}</p>
          )}
        </div>
        {formData.trainerDetails.trainingFacilityType === "Mobile" && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Service Areas <span className="text-red-500">*</span>
            </label>
            <div className="p-2 overflow-y-auto border border-gray-300 rounded-lg max-h-32">
              {governorates.map((gov) => (
                <label key={gov} className="flex items-center p-1 space-x-2 cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={(formData.trainerDetails.serviceAreas || []).includes(gov)}
                    onChange={() => handleServiceAreasChange(gov)}
                    className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">{gov}</span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">Select the governorates where you offer services.</p>
            {formErrors.serviceAreas && (
              <p className="mt-1 text-sm text-red-500">{formErrors.serviceAreas}</p>
            )}
          </div>
        )}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Average Session Duration</label>
          <div className="relative">
            <select
              value={formData.trainerDetails.averageSessionDuration || ""}
              onChange={(e) => handleInputChange("trainerDetails", "averageSessionDuration", e.target.value)}
              className="w-full py-3 pl-4 pr-10 text-sm border border-gray-300 rounded-lg appearance-none focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="" disabled>Select Duration</option>
              {[30, 45, 60, 90, 120].map((dur) => (
                <option key={dur} value={dur}>{dur} mins</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2Credentials;