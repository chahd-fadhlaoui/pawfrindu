import React from "react";
import axiosInstance from "../../utils/axiosInstance";
import MapPicker from "../map/MapPicker";
import { governorates, delegationsByGovernorate } from "../../assets/locations";

const Step4Location = ({ formData, setFormData, formErrors, setFormErrors }) => {
  const handleImageUpload = async (e, field) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const uploadPromises = Array.from(files).map(async (file) => {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return null;
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);
      try {
        const response = await axiosInstance.post("/api/upload", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.url;
      } catch (error) {
        console.error("Image upload failed:", error);
        return null;
      }
    });
    const urls = (await Promise.all(uploadPromises)).filter((url) => url);
    if (field === "trainingPhotos") {
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
        trainerDetails: { ...prev.trainerDetails, [field]: urls[0] || "" },
      }));
    }
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

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => {
      if (section === "trainerDetails" && field === "governorate") {
        return {
          ...prev,
          trainerDetails: { ...prev.trainerDetails, [field]: value, delegation: "" },
        };
      }
      return { ...prev, [section]: { ...prev[section], [field]: value } };
    });
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleMapPositionChange = async (newPosition) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition.latitude}&lon=${newPosition.longitude}&zoom=16&addressdetails=1`,
        { headers: { "User-Agent": "TrainerApp/1.0" } }
      );
      const data = await response.json();
      console.log("Nominatim response:", data);
  
      setFormData((prev) => {
        const trainerDetails = { ...prev.trainerDetails, geolocation: newPosition };
  
        if (data && data.address) {
          // Extract governorate, removing "Gouvernorat" prefix
          const governorateRaw = (data.address.state || "Tunis").replace(/^Gouvernorat\s+/i, "");
          const normalizedGovernorate = governorateRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const matchedGovernorate =
            governorates.find((gov) => {
              const normalizedGov = gov.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              return (
                normalizedGov === normalizedGovernorate ||
                normalizedGov.includes(normalizedGovernorate) ||
                normalizedGovernorate.includes(normalizedGov)
              );
            }) || "Tunis";
  
          // Get available delegations for the matched governorate
          const availableDelegations = delegationsByGovernorate[matchedGovernorate] || [];
  
          // Log full address for debugging
          console.log("Full address:", data.address);
  
          // Extract delegation with cleanup
          const delegationRaw = (
            data.address.town || // e.g., "Hammam-Lif", "Mornag"
            data.address.suburb || // Specific areas
            data.address.county || // e.g., "Hammem Lif Ville 2", "Borj Cedria"
            data.address.village || // e.g., "Boujrida"
            data.address.city || // Urban areas
            data.address.municipality || // Less common
            data.address.neighbourhood || // Very granular
            governorateRaw // Fallback
          )
            .replace(/Ville\s*\d*/i, "") // Remove "Ville" and numbers
            .replace(/Hammem/, "Hammam") // Correct typo
            .replace(/Ouest|Est|Nord|Sud/i, "") // Strip directional suffixes
            .trim();
  
          const normalizedDelegation = delegationRaw
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[- ]/g, ""); // Handle hyphens and spaces
  
          // Extract state_district as a fallback (e.g., "Délégation Hammam Chott")
          const stateDistrictRaw = (data.address.state_district || "")
            .replace(/^Délégation\s+/i, "") // Remove "Délégation" prefix
            .trim();
          const normalizedStateDistrict = stateDistrictRaw
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[- ]/g, "");
  
          // Exact match with delegationRaw
          let matchedDelegation = availableDelegations.find((del) => {
            const normalizedDel = del
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[- ]/g, "");
            return normalizedDel === normalizedDelegation;
          });
  
          // If no match, try state_district
          if (!matchedDelegation && stateDistrictRaw) {
            matchedDelegation = availableDelegations.find((del) => {
              const normalizedDel = del
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[- ]/g, "");
              return normalizedDel === normalizedStateDistrict;
            });
          }
  
          // Fallback: prefer a delegation over governorate name
          if (!matchedDelegation) {
            matchedDelegation =
              availableDelegations.find((del) => del.toLowerCase().includes("ville")) || // "Ville" default
              availableDelegations[0] || // First in list
              governorateRaw; // Last resort
            console.warn(
              `No match for "${delegationRaw}" or "${stateDistrictRaw}" in ${matchedGovernorate} delegations, using: "${matchedDelegation}"`
            );
          }
  
          console.log("Raw Governorate:", governorateRaw);
          console.log("Matched Governorate:", matchedGovernorate);
          console.log("Raw Delegation:", delegationRaw);
          console.log("Matched Delegation:", matchedDelegation);
  
          return {
            ...prev,
            trainerDetails: {
              ...trainerDetails,
              governorate: matchedGovernorate,
              delegation: matchedDelegation, // Return exact string from list
            },
          };
        }
  
        // Fallback for no data
        return {
          ...prev,
          trainerDetails: {
            ...trainerDetails,
            governorate: "Tunis",
            delegation: delegationsByGovernorate["Tunis"]?.[0] || "Tunis",
          },
        };
      });
    } catch (error) {
      console.error("Nominatim reverse geocoding error:", error);
      setFormData((prev) => ({
        ...prev,
        trainerDetails: {
          ...prev.trainerDetails,
          geolocation: newPosition,
          governorate: "Tunis",
          delegation: delegationsByGovernorate["Tunis"]?.[0] || "Tunis",
        },
      }));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleMapPositionChange({ latitude, longitude });
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to retrieve your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b border-[#ffc929] pb-2">Step 4: Location Details</h3>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Governorate <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.trainerDetails.governorate || ""}
                onChange={(e) => handleInputChange("trainerDetails", "governorate", e.target.value)}
                className={`w-full pl-4 pr-10 py-3 text-sm border rounded-lg appearance-none focus:ring-teal-500 focus:border-teal-500 ${
                  formErrors.governorate ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="" disabled>Select Governorate</option>
                {governorates.map((gov) => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="h-5 w-5"
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
            {formErrors.governorate && (
              <p className="text-sm text-red-500 mt-1">{formErrors.governorate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delegation <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.trainerDetails.delegation || ""}
                onChange={(e) => handleInputChange("trainerDetails", "delegation", e.target.value)}
                className={`w-full pl-4 pr-10 py-3 text-sm border rounded-lg appearance-none focus:ring-teal-500 focus:border-teal-500 ${
                  formErrors.delegation ? "border-red-500" : "border-gray-300"
                }`}
                disabled={!formData.trainerDetails.governorate}
              >
                <option value="" disabled>Select Delegation</option>
                {formData.trainerDetails.governorate &&
                  delegationsByGovernorate[formData.trainerDetails.governorate]?.map((delegation) => (
                    <option key={delegation} value={delegation}>{delegation}</option>
                  ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="h-5 w-5"
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
            {formErrors.delegation && (
              <p className="text-sm text-red-500 mt-1">{formErrors.delegation}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Map Location</label>
          <MapPicker
            position={formData.trainerDetails.geolocation || { latitude: 36.8665367, longitude: 10.1647233 }}
            setPosition={handleMapPositionChange}
          />
          <button
            type="button"
            onClick={getCurrentLocation}
            className="mt-2 w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Use Current Location
          </button>
          <p className="text-xs text-gray-500 mt-1">
            Click the map to update your governorate and delegation automatically. Powered by{" "}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
              OpenStreetMap
            </a>
            .
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Card Image</label>
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <label className="px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg cursor-pointer transition-colors inline-flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
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
              Upload Business Card
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "businessCardImage")}
              />
            </label>
            {formData.trainerDetails.businessCardImage && (
              <div className="relative">
                <img
                  src={formData.trainerDetails.businessCardImage}
                  alt="Business Card Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => handleInputChange("trainerDetails", "businessCardImage", null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
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
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Training Photos</label>
          <div className="flex flex-col items-center p-5 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-500 mb-2">Drag & drop images here, or click to select</p>
            <label className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 cursor-pointer transition-colors">
              Upload Images
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e, "trainingPhotos")}
              />
            </label>
          </div>
          {(formData.trainerDetails.trainingPhotos || []).length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {formData.trainerDetails.trainingPhotos.map((img, index) => (
                <div key={index} className="relative h-24 rounded-lg overflow-hidden">
                  <img src={img} alt={`Training image ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeTrainingPhoto(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step4Location;