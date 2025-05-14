import { Calendar, ChevronLeft, Info } from "lucide-react";
import React from "react";
import { ConsultationCategories } from "../../../../assets/trainer";

const Step3ConfirmDetails = ({
  professional,
  professionalType,
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
  setStep,
}) => {
  const isPetSelected = selectedPet || customPetName.trim();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">Confirm Details</h3>
        <button
          className="flex items-center gap-1 text-sm font-medium text-pink-500 hover:text-pink-600"
          onClick={() => setStep(2)}
        >
          <ChevronLeft size={16} />
          Change Time
        </button>
      </div>
      <div className="p-4 border border-yellow-100 bg-gradient-to-r from-yellow-50 to-pink-50 rounded-xl">
        <div className="flex items-start gap-3">
          <Calendar className="mt-1 text-pink-500" size={24} />
          <div>
            <h4 className="text-sm font-semibold text-gray-800">
              Appointment Summary
            </h4>
            <p className="mt-2 text-sm text-gray-700">
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
              <span className="font-medium">{professionalType}:</span> {professionalType === "Vet" ? "Dr." : ""} {professional.fullName}
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
            className="block mb-1 text-sm font-medium text-gray-700"
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
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Pet Name
              </label>
              <div className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg">
                {selectedPet.name || "N/A"}
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Pet Type
              </label>
              <div className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg">
                {selectedPet.species || "Unknown"}
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Pet Age
              </label>
              <div className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg">
                {selectedPet.age || "Unknown"}
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Breed
              </label>
              <div className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg">
                {selectedPet.breed || "Unknown"}
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Gender
              </label>
              <div className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg">
                {selectedPet.gender || "Unknown"}
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg">
                {address || "N/A"}
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Trained
              </label>
              <div className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg">
                {selectedPet.isTrained ? "Yes" : "No"}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="customPetName"
                className="block mb-1 text-sm font-medium text-gray-700"
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
                className="block mb-1 text-sm font-medium text-gray-700"
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
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Breed
              </label>
              <select
                id="breed"
                name="breed"
                value={breed}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
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
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Pet Age
              </label>
              <select
                id="customPetAge"
                name="customPetAge"
                value={customPetAge}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
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
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
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
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <div className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg">
                {address || "N/A"}
              </div>
            </div>
            <div>
              <label
                htmlFor="isTrained"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Trained
              </label>
              <input
                type="checkbox"
                id="isTrained"
                name="isTrained"
                checked={isTrained}
                onChange={(e) => setIsTrained(e.target.checked)}
                className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-200"
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
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Phone Number*
          </label>
          {isPetSelected ? (
            <div className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg">
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
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Email*
          </label>
          {isPetSelected ? (
            <div className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg">
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
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Reason for Visit*
          </label>
          {professionalType === "Trainer" ? (
            <select
              id="reason"
              name="reason"
              value={reason}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                formErrors.reason
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-pink-200"
              } focus:outline-none focus:ring-2 text-sm`}
            >
              <option value="">Select Reason</option>
              {ConsultationCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          ) : (
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
          )}
          {formErrors.reason && (
            <p className="mt-1 text-xs text-red-500">{formErrors.reason}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={notes}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
            placeholder="Any additional information about your pet's condition"
          ></textarea>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50">
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