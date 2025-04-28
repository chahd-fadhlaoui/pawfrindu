import { Camera, Info, Loader2, MapPin } from "lucide-react";
import React from "react";
import { FaMapMarkedAlt } from "react-icons/fa";
import { delegationsByGovernorate, governorates } from "../../../../assets/locations";
import Select from "../../../common/Select";
import MapPicker from "../../../map/MapPicker";
import { Tooltip } from "../../../Tooltip";
import { ErrorMessage } from "../../common/ErrorMessage";
import { SectionHeader } from "../../common/SectionHeader";

const Step5 = ({
  formData,
  formErrors,
  handleInputChange,
  handleImageUpload,
  removeClinicPhoto,
  defaultImageUrl, 
  isUploading,
}) => {
  // For better mobile UX, check if the user prefers reduced motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animationClass = prefersReducedMotion ? "" : "transition-all duration-300";

  // Handle map position change with reverse geocoding
  const handleMapPositionChange = async (newPosition) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition.latitude}&lon=${newPosition.longitude}&zoom=16&addressdetails=1`,
        { headers: { "User-Agent": "VetApp/1.0" } }
      );
      const data = await response.json();
      console.log("Nominatim response:", data);

      handleInputChange("veterinarianDetails", "geolocation", newPosition);

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

        // Extract delegation with cleanup
        const delegationRaw = (
          data.address.town ||
          data.address.suburb ||
          data.address.county ||
          data.address.village ||
          data.address.city ||
          data.address.municipality ||
          data.address.neighbourhood ||
          governorateRaw
        )
          .replace(/Ville\s*\d*/i, "")
          .replace(/Hammem/, "Hammam")
          .replace(/Ouest|Est|Nord|Sud/i, "")
          .trim();

        const normalizedDelegation = delegationRaw
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[- ]/g, "");

        // Extract state_district as a fallback
        const stateDistrictRaw = (data.address.state_district || "").replace(/^Délégation\s+/i, "").trim();
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

        // Try state_district if no match
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
            availableDelegations.find((del) => del.toLowerCase().includes("ville")) ||
            availableDelegations[0] ||
            governorateRaw;
          console.warn(
            `No match for "${delegationRaw}" or "${stateDistrictRaw}" in ${matchedGovernorate} delegations, using: "${matchedDelegation}"`
          );
        }

        console.log("Raw Governorate:", governorateRaw);
        console.log("Matched Governorate:", matchedGovernorate);
        console.log("Raw Delegation:", delegationRaw);
        console.log("Matched Delegation:", matchedDelegation);

        // Update governorate and delegation
        handleInputChange("veterinarianDetails", "governorate", matchedGovernorate);
        handleInputChange("veterinarianDetails", "delegation", matchedDelegation);
      } else {
        // Fallback for no data
        handleInputChange("veterinarianDetails", "governorate", "Tunis");
        handleInputChange("veterinarianDetails", "delegation", delegationsByGovernorate["Tunis"]?.[0] || "Tunis");
      }
    } catch (error) {
      console.error("Nominatim reverse geocoding error:", error);
      handleInputChange("veterinarianDetails", "geolocation", newPosition);
      handleInputChange("veterinarianDetails", "governorate", "Tunis");
      handleInputChange("veterinarianDetails", "delegation", delegationsByGovernorate["Tunis"]?.[0] || "Tunis");
    }
  };

  // Get current location
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
    <div className="max-w-4xl mx-auto space-y-8">
      <SectionHeader
        title="Location Details"
        icon={MapPin}
        description="Required fields are marked with *"
      />

      {/* Governorate and Delegation Section */}
      <section className="space-y-4" aria-labelledby="location-section">
        <div className="flex items-center gap-2">
          <label id="location-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <FaMapMarkedAlt size={16} className="text-[#ffc929]" />
            </span>
            Location <span className="text-red-500">*</span>
          </label>
          <Tooltip
            text="Select your clinic's governorate and delegation for accurate location details."
            ariaLabel="Location information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">Location information</span>
              <Info size={16} className="text-gray-400" />
            </button>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <label htmlFor="governorate" className="text-sm text-gray-600">
              Governorate <span className="text-red-500">*</span>
            </label>
            <Select
              id="governorate"
              value={formData.veterinarianDetails.governorate || ""}
              onChange={(e) => handleInputChange("veterinarianDetails", "governorate", e.target.value)}
              className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                formErrors.governorate ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"
              }`}
              aria-describedby={formErrors.governorate ? "governorate-error" : undefined}
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
            <ErrorMessage id="governorate-error" error={formErrors.governorate} />
          </div>
          <div className="space-y-3">
            <label htmlFor="delegation" className="text-sm text-gray-600">
              Delegation <span className="text-red-500">*</span>
            </label>
            <Select
              id="delegation"
              value={formData.veterinarianDetails.delegation || ""}
              onChange={(e) => handleInputChange("veterinarianDetails", "delegation", e.target.value)}
              className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                formErrors.delegation ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"
              } ${!formData.veterinarianDetails.governorate ? "opacity-60 cursor-not-allowed" : ""}`}
              disabled={!formData.veterinarianDetails.governorate}
              aria-describedby={formErrors.delegation ? "delegation-error" : undefined}
            >
              <option value="" disabled>
                {!formData.veterinarianDetails.governorate ? "Select governorate first" : "Select Delegation"}
              </option>
              {formData.veterinarianDetails.governorate &&
                delegationsByGovernorate[formData.veterinarianDetails.governorate]?.map((del) => (
                  <option key={del} value={del}>
                    {del}
                  </option>
                ))}
            </Select>
            <ErrorMessage id="delegation-error" error={formErrors.delegation} />
          </div>
        </div>
      </section>

      {/* Clinic Location Section */}
      <section className="space-y-4" aria-labelledby="clinic-location-section">
        <div className="flex items-center gap-2">
          <label id="clinic-location-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <MapPin size={16} className="text-[#ffc929]" />
            </span>
            Clinic Location <span className="text-red-500">*</span>
          </label>
          <Tooltip
            text="Click the map to select your clinic's exact location or use your current location. This will automatically update the governorate and delegation."
            ariaLabel="Clinic location information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">Clinic location information</span>
              <Info size={16} className="text-gray-400" />
            </button>
          </Tooltip>
        </div>
        <MapPicker
          position={formData.veterinarianDetails.geolocation || { latitude: 36.8665367, longitude: 10.1647233 }}
          setPosition={handleMapPositionChange}
        />
        <p className="mt-1 text-xs text-gray-500">
          Click the map to update your governorate and delegation automatically.
        </p>
        <button
          type="button"
          onClick={getCurrentLocation}
          className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#ffc929]/50 focus:outline-none ${animationClass}`}
          aria-label="Use current location"
        >
          <MapPin size={18} />
          Use Current Location
        </button>
        <ErrorMessage id="geolocation-error" error={formErrors.geolocation} />
      </section>

      {/* Clinic Photos Section */}
      <section className="space-y-4" aria-labelledby="clinic-photos-section">
        <div className="flex items-center gap-2">
          <label id="clinic-photos-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <Camera size={16} className="text-[#ffc929]" />
            </span>
            Clinic Photos
          </label>
          <Tooltip
            text="Upload photos of your clinic to showcase your facility. Multiple images can be added."
            ariaLabel="Clinic photos information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">Clinic photos information</span>
              <Info size={16} className="text-gray-400" />
            </button>
          </Tooltip>
        </div>
        <div className={`flex flex-col items-center p-6 border-2 border-dashed border-[#ffc929]/30 rounded-xl hover:border-[#ffc929]/60 ${animationClass}`}>
          <Camera size={32} className="text-[#ffc929] mb-2" />
          <p className="mb-2 text-sm text-gray-600">Drag & drop images or click to upload</p>
          <label
            htmlFor="clinicPhotos-upload"
            className={`px-4 py-3.5 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] cursor-pointer ${animationClass}`}
            aria-label="Upload clinic photos"
          >
            {isUploading.clinic ? <Loader2 size={18} className="inline animate-spin" /> : "Upload Photos"}
            <input
              id="clinicPhotos-upload"
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e, "clinicPhotos")}
              disabled={isUploading.clinic}
            />
          </label>
        </div>
        {formData.veterinarianDetails.clinicPhotos.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3">
            {formData.veterinarianDetails.clinicPhotos.map((img, index) => (
              <div key={index} className="relative h-24 overflow-hidden rounded-xl group">
                <img
                  src={img}
                  alt={`Clinic image ${index + 1}`}
                  className={`object-cover w-full h-full border-2 border-[#ffc929]/30 group-hover:border-[#ffc929] ${animationClass}`}
                />
                <button
                  type="button"
                  onClick={() => removeClinicPhoto(index)}
                  className={`absolute p-1 text-white bg-red-500 rounded-full top-1 right-1 hover:bg-red-600 ${animationClass}`}
                  aria-label={`Remove clinic photo ${index + 1}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <ErrorMessage id="clinicPhotos-error" error={formErrors.clinicPhotos} />
      </section>
    </div>
  );
};

export default Step5;