import { Info, MapPin, Plus, X } from "lucide-react";
import React from "react";
import { FaMapMarkedAlt } from "react-icons/fa";
import { delegationsByGovernorate, governorates } from "../../../../assets/locations";
import Select from "../../../common/Select";
import MapPicker from "../../../map/MapPicker";
import { Tooltip } from "../../../Tooltip";
import { ErrorMessage } from "../../common/ErrorMessage";
import { SectionHeader } from "../../common/SectionHeader";

const Step3 = ({
  formData,
  formErrors,
  handleInputChange,
  serviceAreaGov,
  setServiceAreaGov,
  addServiceArea,
  removeServiceArea,
}) => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animationClass = prefersReducedMotion ? "" : "transition-all duration-300";
  const trainerDetails = formData.trainerDetails || {};

  // Handle map position change with reverse geocoding
  const handleMapPositionChange = async (newPosition) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition.latitude}&lon=${newPosition.longitude}&zoom=16&addressdetails=1`,
        { headers: { "User-Agent": "TrainerApp/1.0" } }
      );
      const data = await response.json();

      handleInputChange("trainerDetails", "geolocation", newPosition);

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

        // Update governorate and delegation
        handleInputChange("trainerDetails", "governorate", matchedGovernorate);
        handleInputChange("trainerDetails", "delegation", matchedDelegation);
      } else {
        // Fallback for no data
        handleInputChange("trainerDetails", "governorate", "Tunis");
        handleInputChange("trainerDetails", "delegation", delegationsByGovernorate["Tunis"]?.[0] || "Tunis");
      }
    } catch (error) {
      console.error("Nominatim reverse geocoding error:", error);
      handleInputChange("trainerDetails", "geolocation", newPosition);
      handleInputChange("trainerDetails", "governorate", "Tunis");
      handleInputChange("trainerDetails", "delegation", delegationsByGovernorate["Tunis"]?.[0] || "Tunis");
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
        title="Facility Details"
        icon={FaMapMarkedAlt}
        description="Required fields are marked with *"
      />

      {/* Training Facility Type Section */}
      <section className="space-y-4" aria-labelledby="facility-type-section">
        <div className="flex items-center gap-2">
          <label
            id="facility-type-section"
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
              <FaMapMarkedAlt size={16} className="text-[#ffc929]" />
            </span>
            Training Facility Type <span className="text-red-500">*</span>
          </label>
          <Tooltip
            text="Choose whether you operate from a fixed facility or provide mobile training services."
            ariaLabel="Facility type information"
          >
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
            >
              <span className="sr-only">Facility type information</span>
              <Info size={16} className="text-gray-400" />
            </button>
          </Tooltip>
        </div>
        <div className="space-y-3">
          <Select
            id="trainingFacilityType"
            value={trainerDetails.trainingFacilityType || ""}
            onChange={(e) =>
              handleInputChange("trainerDetails", "trainingFacilityType", e.target.value)
            }
            className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
              formErrors.trainingFacilityType ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"
            }`}
            aria-describedby={formErrors.trainingFacilityType ? "facility-type-error" : undefined}
          >
            <option value="" disabled>
              Select facility type
            </option>
            <option value="Fixed Facility">Fixed Facility</option>
            <option value="Mobile">Mobile</option>
          </Select>
          <ErrorMessage id="facility-type-error" error={formErrors.trainingFacilityType} />
        </div>
      </section>

      {/* Conditional Fields Based on Facility Type */}
      {trainerDetails.trainingFacilityType === "Fixed Facility" && (
        <>
          {/* Governorate and Delegation Section */}
          <section className="space-y-4" aria-labelledby="location-section">
            <div className="flex items-center gap-2">
              <label
                id="location-section"
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
                  <FaMapMarkedAlt size={16} className="text-[#ffc929]" />
                </span>
                Location <span className="text-red-500">*</span>
              </label>
              <Tooltip
                text="Select your facility's governorate and delegation for accurate location details."
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
                  value={trainerDetails.governorate || ""}
                  onChange={(e) =>
                    handleInputChange("trainerDetails", "governorate", e.target.value)
                  }
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
                  value={trainerDetails.delegation || ""}
                  onChange={(e) =>
                    handleInputChange("trainerDetails", "delegation", e.target.value)
                  }
                  className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                    formErrors.delegation ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"
                  } ${!trainerDetails.governorate ? "opacity-60 cursor-not-allowed" : ""}`}
                  disabled={!trainerDetails.governorate}
                  aria-describedby={formErrors.delegation ? "delegation-error" : undefined}
                >
                  <option value="" disabled>
                    {!trainerDetails.governorate ? "Select governorate first" : "Select Delegation"}
                  </option>
                  {trainerDetails.governorate &&
                    delegationsByGovernorate[trainerDetails.governorate]?.map((del) => (
                      <option key={del} value={del}>
                        {del}
                      </option>
                    ))}
                </Select>
                <ErrorMessage id="delegation-error" error={formErrors.delegation} />
              </div>
            </div>
          </section>

          {/* Training Facility Location Section */}
          <section className="space-y-4" aria-labelledby="facility-location-section">
            <div className="flex items-center gap-2">
              <label
                id="facility-location-section"
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
                  <MapPin size={16} className="text-[#ffc929]" />
                </span>
                Training Facility Location <span className="text-red-500">*</span>
              </label>
              <Tooltip
                text="Click the map to select your facility's exact location or use your current location. This will automatically update the governorate and delegation."
                ariaLabel="Facility location information"
              >
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
                >
                  <span className="sr-only">Facility location information</span>
                  <Info size={16} className="text-gray-400" />
                </button>
              </Tooltip>
            </div>
            <MapPicker
              position={trainerDetails.geolocation || { latitude: 36.8665367, longitude: 10.1647233 }}
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
        </>
      )}

      {trainerDetails.trainingFacilityType === "Mobile" && (
        <section className="space-y-4" aria-labelledby="service-areas-section">
          <div className="flex items-center gap-2">
            <label
              id="service-areas-section"
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
                <FaMapMarkedAlt size={16} className="text-[#ffc929]" />
              </span>
              Service Areas <span className="text-red-500">*</span>
            </label>
            <Tooltip
              text="Select the governorates where you provide mobile training services."
              ariaLabel="Service areas information"
            >
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
              >
                <span className="sr-only">Service areas information</span>
                <Info size={16} className="text-gray-400" />
              </button>
            </Tooltip>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Select
                id="serviceAreaGov"
                value={serviceAreaGov}
                onChange={(e) => setServiceAreaGov(e.target.value)}
                className={`flex-1 px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                  formErrors.serviceAreas ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"
                }`}
                aria-label="Add service area governorate"
                aria-describedby={formErrors.serviceAreas ? "service-areas-error" : "service-areas-hint"}
              >
                <option value="" disabled>
                  Select Governorate
                </option>
                {governorates
                  .filter(
                    (gov) =>
                      !trainerDetails.serviceAreas?.some(
                        (area) => area.governorate === gov
                      )
                  )
                  .map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
              </Select>
              <button
                type="button"
                onClick={addServiceArea}
                className={`p-3 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] disabled:opacity-70 disabled:cursor-not-allowed ${animationClass}`}
                disabled={!serviceAreaGov}
                aria-label="Add service area"
              >
                <Plus size={20} />
              </button>
            </div>
            <p
              id="service-areas-hint"
              className="flex items-center gap-1.5 text-sm text-gray-600"
            >
              <Info size={16} className="text-[#ffc929]" />
              Add the governorates where you offer mobile training
            </p>
            {trainerDetails.serviceAreas?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {trainerDetails.serviceAreas.map((area, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[#ffc929]/10 text-gray-800 rounded-full ${animationClass}`}
                  >
                    <span>{area.governorate}</span>
                    <button
                      type="button"
                      onClick={() => removeServiceArea(index)}
                      className="text-gray-500 hover:text-red-600"
                      aria-label={`Remove ${area.governorate} service area`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-gray-500">No service areas added yet</p>
            )}
            <ErrorMessage id="service-areas-error" error={formErrors.serviceAreas} />
          </div>
        </section>
      )}
    </div>
  );
};

export default Step3;