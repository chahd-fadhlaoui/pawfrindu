import React from "react";
import axiosInstance from "../../utils/axiosInstance";

const PetOwnerProfile = ({
  formData,
  setFormData,
  formErrors,
  setFormErrors,
  currentStep,
  setCurrentStep,
  totalSteps,
  userRole,
  createProfile,
  clearError,
  navigate,
  loading,
}) => {
  const defaultImageUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNMTYwIDE4MEgzOUM0MSAxNDAgODAgMTIwIDEwMCAxMjBDMTIwIDEyMCAxNTggMTQwIDE2MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg=="; // Shortened for brevity

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;

    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      const response = await axiosInstance.post("/api/upload", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.url) {
        setFormData((prev) => ({ ...prev, image: response.data.url }));
      }
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

  const handlePetExperienceChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      petOwnerDetails: {
        ...prev.petOwnerDetails,
        petExperience: { ...prev.petOwnerDetails.petExperience, [field]: value },
      },
    }));
  };

  const validateCurrentStep = () => {
    const errors = {};
    if (currentStep === 1) {
      if (!formData.gender) errors.gender = "Gender is required";
      if (!formData.image) errors.image = "Profile image is required";
    } else if (currentStep === 2) {
      if (!formData.petOwnerDetails.address) errors.address = "Address is required";
      if (!formData.petOwnerDetails.phone) errors.phone = "Phone number is required";
    }
    return errors;
  };

  const nextStep = () => {
    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const profileDetails = {
        image: formData.image,
        gender: formData.gender,
        petOwnerDetails: formData.petOwnerDetails,
      };
      const result = await createProfile(profileDetails);
      if (result.success) navigate(result.redirectTo, { replace: true });
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-gray-900">Basic Information</h3>
      <div className="flex flex-col items-center justify-center">
        <img
          src={formData.image || defaultImageUrl}
          alt="Profile preview"
          className="object-cover w-32 h-32 rounded-full border-2 border-[#ffc929] mb-4"
        />
        <label className="px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg hover:bg-[#e6b625] cursor-pointer">
          Upload Profile Photo
          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
        </label>
        {formErrors.image && <p className="text-sm text-red-500">{formErrors.image}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
        <select
          value={formData.gender}
          onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
          className={`w-full px-4 py-3 text-sm border rounded-lg ${formErrors.gender ? "border-red-500" : "border-gray-300"}`}
        >
          <option value="" disabled>Select Gender</option>
          <option value="Femme">Femme</option>
          <option value="Homme">Homme</option>
        </select>
        {formErrors.gender && <p className="text-sm text-red-500">{formErrors.gender}</p>}
      </div>
    </div>
  );

  const renderPetOwnerDetails = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-gray-900">Pet Owner Details</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Address <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.petOwnerDetails.address}
            onChange={(e) => handleInputChange("petOwnerDetails", "address", e.target.value)}
            className={`w-full px-4 py-3 text-sm border rounded-lg ${formErrors.address ? "border-red-500" : "border-gray-300"}`}
          />
          {formErrors.address && <p className="text-sm text-red-500">{formErrors.address}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
          <input
            type="tel"
            value={formData.petOwnerDetails.phone}
            onChange={(e) => handleInputChange("petOwnerDetails", "phone", e.target.value)}
            className={`w-full px-4 py-3 text-sm border rounded-lg ${formErrors.phone ? "border-red-500" : "border-gray-300"}`}
          />
          {formErrors.phone && <p className="text-sm text-red-500">{formErrors.phone}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.petOwnerDetails.petExperience.hasPreviousPets}
              onChange={(e) => handlePetExperienceChange("hasPreviousPets", e.target.checked)}
            />
            <label className="text-sm text-gray-700">I have previous experience with pets</label>
          </div>
          {formData.petOwnerDetails.petExperience.hasPreviousPets && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Years of Pet Experience</label>
                <input
                  type="number"
                  value={formData.petOwnerDetails.petExperience.yearsOfExperience}
                  onChange={(e) => handlePetExperienceChange("yearsOfExperience", e.target.value)}
                  className="w-full px-4 py-3 text-sm border rounded-lg border-gray-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Experience Description</label>
                <textarea
                  value={formData.petOwnerDetails.petExperience.experience_description}
                  onChange={(e) => handlePetExperienceChange("experience_description", e.target.value)}
                  className="w-full px-4 py-3 text-sm border rounded-lg border-gray-300"
                  rows={4}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {currentStep === 1 && renderBasicInfo()}
      {currentStep === 2 && renderPetOwnerDetails()}
      <div className="flex justify-between mt-6">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Previous
          </button>
        )}
        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={nextStep}
            className="ml-auto px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg hover:bg-[#e6b625]"
          >
            Save & Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="ml-auto px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-lg hover:bg-[#e6b625] disabled:bg-gray-300"
          >
            {loading ? "Completing Profile..." : "Submit"}
          </button>
        )}
      </div>
    </form>
  );
};

export default PetOwnerProfile;