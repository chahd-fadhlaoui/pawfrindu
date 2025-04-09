// components/profile/Step5Review.jsx
import React from "react";

const Step5Review = ({ formData, setFormData, formErrors, isSubmitting, handleSubmit, setCurrentStep }) => {
  const defaultImageUrl =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNMTYwIDE4MEgzOUM0MSAxNDAgODAgMTIwIDEwMCAxMjBDMTIwIDEyMCAxNTggMTQwIDE2MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==";

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section === "root" ? field : "trainerDetails"]: section === "root"
        ? value
        : { ...prev.trainerDetails, [field]: value },
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b border-[#ffc929] pb-2">Step 5: Review & Submit</h3>
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Personal Information</h4>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-teal-600 hover:text-teal-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <img
                src={formData.image || defaultImageUrl}
                alt="Profile preview"
                className="h-16 w-16 rounded-full object-cover border border-gray-200"
              />
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Gender:</span> {formData.gender || "Not specified"}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Languages:</span>{" "}
                  {(formData.trainerDetails.languagesSpoken || []).join(", ") || "None specified"}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Phone:</span> {formData.trainerDetails.phone || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Professional Credentials</h4>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-teal-600 hover:text-teal-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Facility Type:</span>{" "}
                  {formData.trainerDetails.trainingFacilityType || "Not specified"}
                </p>
                {formData.trainerDetails.trainingFacilityType === "Mobile" && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Service Areas:</span>{" "}
                    {(formData.trainerDetails.serviceAreas || []).join(", ") || "None specified"}
                  </p>
                )}
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Session Duration:</span>{" "}
                  {formData.trainerDetails.averageSessionDuration
                    ? `${formData.trainerDetails.averageSessionDuration} mins`
                    : "Not specified"}
                </p>
              </div>
              <div className="flex flex-col items-start space-y-2">
                {formData.trainerDetails.certificationImage && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Certification</p>
                    <img
                      src={formData.trainerDetails.certificationImage}
                      alt="Certification"
                      className="h-12 w-20 object-cover rounded border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Services & Schedule</h4>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="text-teal-600 hover:text-teal-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Services Offered</h5>
                {(formData.trainerDetails.services || []).length > 0 ? (
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    {formData.trainerDetails.services.map((service, index) => (
                      <li key={index}>
                        {service.serviceName} - {service.fee} TND ({service.duration} mins)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No services specified</p>
                )}
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Training Hours</h5>
                <div className="overflow-hidden border border-gray-200 rounded">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left font-medium text-gray-500">Day</th>
                        <th className="px-2 py-2 text-left font-medium text-gray-500">Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.keys(formData.trainerDetails.openingHours)
                        .filter((key) => key.match(/^[a-z]+$/))
                        .map((day) => (
                          <tr key={day}>
                            <td className="px-2 py-2 whitespace-nowrap capitalize">{day}</td>
                            <td className="px-2 py-2">
                              {formData.trainerDetails.openingHours[day] === "Closed" ? (
                                <span className="text-red-500">Closed</span>
                              ) : formData.trainerDetails.openingHours[day] === "Single Session" ? (
                                <span>
                                  {formData.trainerDetails.openingHours[`${day}Start`] || "N/A"} -{" "}
                                  {formData.trainerDetails.openingHours[`${day}End`] || "N/A"}
                                </span>
                              ) : (
                                <span>
                                  {formData.trainerDetails.openingHours[`${day}Start`] || "N/A"} -{" "}
                                  {formData.trainerDetails.openingHours[`${day}End`] || "N/A"},{" "}
                                  {formData.trainerDetails.openingHours[`${day}Start2`] || "N/A"} -{" "}
                                  {formData.trainerDetails.openingHours[`${day}End2`] || "N/A"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Location Details</h4>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="text-teal-600 hover:text-teal-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Location:</span>{" "}
              {formData.trainerDetails.delegation && formData.trainerDetails.governorate
                ? `${formData.trainerDetails.delegation}, ${formData.trainerDetails.governorate}`
                : "Not specified"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Coordinates:</span>{" "}
              {formData.trainerDetails.geolocation.latitude && formData.trainerDetails.geolocation.longitude
                ? `${formData.trainerDetails.geolocation.latitude}, ${formData.trainerDetails.geolocation.longitude}`
                : "Not specified"}
            </p>
            {(formData.trainerDetails.trainingPhotos || []).length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Training Photos:</p>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {formData.trainerDetails.trainingPhotos.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Training image ${index + 1}`}
                      className="h-16 w-24 object-cover rounded flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}
            {formData.trainerDetails.businessCardImage && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Business Card:</p>
                <img
                  src={formData.trainerDetails.businessCardImage}
                  alt="Business Card"
                  className="h-12 w-20 object-cover rounded border border-gray-200"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              checked={formData.acceptedTerms || false}
              onChange={(e) => handleInputChange("root", "acceptedTerms", e.target.checked)}
              className="h-5 w-5 mt-0.5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <div>
              <label htmlFor="terms" className="text-sm font-medium text-gray-700">
                I accept the Terms and Conditions <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                By checking this box, you agree to our{" "}
                <a href="#" className="text-teal-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and acknowledge that you have read our{" "}
                <a href="#" className="text-teal-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
              {formErrors.acceptedTerms && (
                <p className="text-sm text-red-500 mt-1">{formErrors.acceptedTerms}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full px-6 py-3 text-base font-medium text-white bg-[#ffc929] rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </div>
  );
};

export default Step5Review;