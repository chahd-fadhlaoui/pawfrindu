import React from "react";
import { ChevronLeft, Calendar, Info } from "lucide-react";

const Step3ConfirmDetails = ({
  vet,
  selectedDate,
  selectedTime,
  selectedPet,
  customPetName,
  customPetType,
  customPetAge,
  breed,
  gender,
  address,
  isTrained,
  phone,
  email,
  reason,
  notes,
  formErrors,
  allPets,
  petsLoading,
  availableBreeds,
  availableAges,
  handlePetSelect,
  handleInputChange,
  setIsTrained,
  formatTimeSlot,
  consultationDuration,
  SPECIES_OPTIONS,
  user,
}) => {
  const isPetSelected = selectedPet || customPetName.trim();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">Confirm Details</h3>
        <button
          className="flex items-center gap-1 text-pink-500 hover:text-pink-600 text-sm font-medium"
          onClick={() => setStep(2)}
        >
          <ChevronLeft size={16} />
          Change Time
        </button>
      </div>
      <div className="bg-gradient-to-r from-yellow-50 to-pink-50 rounded-xl p-4 border border-yellow-100">
        <div className="flex items-start gap-3">
          <Calendar className="text-pink-500 mt-1" size={24} />
          <div>
            <h4 className="text-sm font-semibold text-gray-800">
              Appointment Summary
            </h4>
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-medium">Date:</span>{" "}
              {selectedDate?.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Time:</span>{" "}
              {formatTimeSlot(selectedTime)}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Vet:</span> Dr. {vet.fullName}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Duration:</span>{" "}
              {consultationDuration} minutes
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="petSelect"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Pet*
          </label>
          <select
            id="petSelect"
            value={
              selectedPet
                ? `${selectedPet.name}-${selectedPet.source}`
                : customPetName
                ? "other"
                : ""
            }
            onChange={handlePetSelect}
            className={`w-full px-3 py-2 rounded-lg border ${
              formErrors.petName
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-pink-200"
            } focus:outline-none focus:ring-2 text-sm`}
            disabled={petsLoading}
          >
            {petsLoading ? (
              <option value="" disabled>
                Loading pets...
              </option>
            ) : (
              <option value="">Select a pet</option>
            )}
            {allPets.length > 0 ? (
              allPets.map((pet, index) => (
                <option
                  key={`${pet._id}-${index}`}
                  value={`${pet.name}-adopted`}
                >
                  {pet.name} (Adopted - {pet.species || "Unknown"} -{" "}
                  {pet.age || "Unknown"})
                </option>
              ))
            ) : !petsLoading ? (
              <option value="" disabled>
                No adopted pets available
              </option>
            ) : null}
            <option value="other">Other (Not on platform)</option>
          </select>
          {formErrors.petName && (
            <p className="mt-1 text-xs text-red-500">{formErrors.petName}</p>
          )}
        </div>

        {selectedPet ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Name
              </label>
              <div className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-sm text-gray-700">
                {selectedPet.name || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Type
              </label>
              <div className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-sm text-gray-700">
                {selectedPet.species || "Unknown"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Age
              </label>
              <div className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-sm text-gray-700">
                {selectedPet.age || "Unknown"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breed
              </label>
              <div className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-sm text-gray-700">
                {selectedPet.breed || "Unknown"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <div className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-sm text-gray-700">
                {selectedPet.gender || "Unknown"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-sm text-gray-700">
                {address || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trained
              </label>
              <div className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-sm text-gray-700">
                {selectedPet.isTrained ? "Yes" : "No"}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="customPetName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pet Name*
              </label>
              <input
                type="text"
                id="customPetName"
                name="customPetName"
                value={customPetName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  formErrors.petName
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-pink-200"
                } focus:outline-none focus:ring-2 text-sm`}
                placeholder="Enter pet's name"
              />
              {formErrors.petName && (
                <p className="mt-1 text-xs text-red-500">{formErrors.petName}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="customPetType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pet Type*
              </label>
              <select
                id="customPetType"
                name="customPetType"
                value={customPetType}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  formErrors.customPetType
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-pink-200"
                } focus:outline-none focus:ring-2 text-sm`}
              >
                <option value="">Select Pet Type</option>
                {SPECIES_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formErrors.customPetType && (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.customPetType}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="breed"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Breed
              </label>
              <select
                id="breed"
                name="breed"
                value={breed}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                disabled={!customPetType || availableBreeds.length === 0}
              >
                <option value="">Select Breed</option>
                {availableBreeds.length > 0 ? (
                  availableBreeds.map((breedOption) => (
                    <option key={breedOption} value={breedOption}>
                      {breedOption}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {customPetType
                      ? "No breeds available for this species"
                      : "Select a pet type first"}
                  </option>
                )}
              </select>
            </div>
            <div>
              <label
                htmlFor="customPetAge"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pet Age
              </label>
              <select
                id="customPetAge"
                name="customPetAge"
                value={customPetAge}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                disabled={!customPetType || availableAges.length === 0}
              >
                <option value="">Select Age Range</option>
                {availableAges.length > 0 ? (
                  availableAges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {customPetType
                      ? "No age ranges available for this species"
                      : "Select a pet type first"}
                  </option>
                )}
              </select>
            </div>
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address
              </label>
              <div className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-sm text-gray-700">
                {address || "N/A"}
              </div>
            </div>
            <div>
              <label
                htmlFor="isTrained"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Trained
              </label>
              <input
                type="checkbox"
                id="isTrained"
                name="isTrained"
                checked={isTrained}
                onChange={(e) => setIsTrained(e.target.checked)}
                className="h-4 w-4 text-pink-500 focus:ring-pink-200 border-gray-300 rounded"
              />
            </div>
          </div>
        )}

        <input
          type="hidden"
          id="ownerName"
          name="ownerName"
          value={user?.fullName || ""}
        />

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number*
          </label>
          {isPetSelected ? (
            <div className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-sm text-gray-700">
              {phone || "N/A"}
            </div>
          ) : (
            <input
              type="text"
              id="phone"
              name="phone"
              value={phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                formErrors.phone
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-pink-200"
              } focus:outline-none focus:ring-2 text-sm`}
              placeholder="Your phone number"
            />
          )}
          {formErrors.phone && (
            <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email*
          </label>
          {isPetSelected ? (
            <div className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-sm text-gray-700">
              {email || "N/A"}
            </div>
          ) : (
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                formErrors.email
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-pink-200"
              } focus:outline-none focus:ring-2 text-sm`}
              placeholder="Your email address"
            />
          )}
          {formErrors.email && (
            <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Reason for Visit*
          </label>
          <input
            type="text"
            id="reason"
            name="reason"
            value={reason}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 rounded-lg border ${
              formErrors.reason
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-pink-200"
            } focus:outline-none focus:ring-2 text-sm`}
            placeholder="e.g., Vaccination, Check-up, Illness"
          />
          {formErrors.reason && (
            <p className="mt-1 text-xs text-red-500">{formErrors.reason}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={notes}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
            placeholder="Any additional information about your pet's condition"
          ></textarea>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
          <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            By confirming this booking, you agree to our cancellation policy.
            Please arrive 10 minutes before your appointment time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step3ConfirmDetails;