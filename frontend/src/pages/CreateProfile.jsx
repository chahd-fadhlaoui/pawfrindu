import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import axiosInstance from "../utils/axiosInstance";

const CreateProfile = () => {
  const navigate = useNavigate();
  const { user, createProfile, error, loading, clearError } = useApp();
  const [formData, setFormData] = useState({
    image: "",
    petOwnerDetails: {
      address: "",
      phone: "",
      petExperience: {
        hasPreviousPets: false,
        yearsOfExperience: "",
        experinece_description: "",
      },
    },
    trainerDetails: {
      location: "",
      certification: "",
      specialties: "",
      experience: "",
    },
    veterinarianDetails: {
      location: "",
      degree: "",
      specialization: "",
      yearsOfPractice: "",
    },
  });
  
  const [userRole, setUserRole] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const defaultImageUrl =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNMTYwIDE4MEgzOUM0MSAxNDAgODAgMTIwIDEwMCAxMjBDMTIwIDEyMCAxNTggMTQwIDE2MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==";

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setUserRole(user.role);
    }
  }, [user, navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      clearError();
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      clearError();
      setError("Image must be less than 5MB");
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axiosInstance.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.url) {
        setFormData((prev) => ({
          ...prev,
          image: response.data.url,
        }));
        setImagePreview(response.data.url);
      }
    } catch (error) {
      clearError();
      setError(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handlePetExperienceChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      petOwnerDetails: {
        ...prev.petOwnerDetails,
        petExperience: {
          ...prev.petOwnerDetails.petExperience,
          [field]: value,
        },
      },
    }));
  };

  const validateForm = (role, data) => {
    if (role === "PetOwner" && (!data.address || !data.phone)) {
      throw new Error("Address and phone are required for Pet Owner.");
    }
    if (role === "Trainer" && (!data.location || !data.certification)) {
      throw new Error("Location and certification are required for Trainer.");
    }
    if (role === "Vet" && (!data.location || !data.degree)) {
      throw new Error("Location and degree are required for Veterinarian.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      if (!user) {
        throw new Error("No authentication token found");
      }

      let profileDetails = {
        image: formData.image,
      };

      if (userRole === "PetOwner") {
        profileDetails = {
          ...profileDetails,
          petOwnerDetails: formData.petOwnerDetails,
        };
        validateForm("PetOwner", formData.petOwnerDetails);
      } else if (userRole === "Trainer") {
        profileDetails = {
          ...profileDetails,
          trainerDetails: formData.trainerDetails,
        };
        validateForm("Trainer", formData.trainerDetails);
      } else if (userRole === "Vet") {
        profileDetails = {
          ...profileDetails,
          veterinarianDetails: formData.veterinarianDetails,
        };
        validateForm("Vet", formData.veterinarianDetails);
      }

      const result = await createProfile(profileDetails);
      
      if (result.success) {
        navigate(userRole === "PetOwner" ? "/" : `/${userRole.toLowerCase()}`);
      }
    } catch (error) {
      clearError();
      setError(error.message || "Error completing profile");
    }
  };
  const renderImageUpload = () => (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-4">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Profile preview"
              className="object-cover w-full h-full rounded-full"
              onError={(e) => {
                setImgError(true);
                e.target.src = defaultImageUrl;
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full overflow-hidden bg-gray-100 rounded-full">
              <img
                src={defaultImageUrl}
                alt="Default profile"
                className="object-cover w-full h-full"
              />
            </div>
          )}
          {uploadLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="w-8 h-8 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
            </div>
          )}
        </div>
        <label className="px-4 py-2 text-sm font-medium text-white transition-colors bg-[#ffc929] rounded-lg hover:bg-[#e6b625] cursor-pointer">
          Upload Photo
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadLoading}
          />
        </label>
      </div>
    </div>
  );

  const renderPetOwnerForm = () => (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Address"
          className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
          value={formData.petOwnerDetails.address}
          onChange={(e) =>
            handleInputChange("petOwnerDetails", "address", e.target.value)
          }
          required
        />
      </div>
      <div>
        <input
          type="tel"
          placeholder="Phone Number"
          className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
          value={formData.petOwnerDetails.phone}
          onChange={(e) =>
            handleInputChange("petOwnerDetails", "phone", e.target.value)
          }
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hasPreviousPets"
            className="w-4 h-4 border rounded focus:ring-2 focus:ring-[#ffc929]"
            checked={formData.petOwnerDetails.petExperience.hasPreviousPets}
            onChange={(e) =>
              handlePetExperienceChange("hasPreviousPets", e.target.checked)
            }
          />
          <label htmlFor="hasPreviousPets" className="text-sm text-gray-700">
            I have previous experience with pets
          </label>
        </div>

        {formData.petOwnerDetails.petExperience.hasPreviousPets && (
          <>
            <div>
              <input
                type="number"
                placeholder="Years of Pet Experience"
                className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                value={formData.petOwnerDetails.petExperience.yearsOfExperience}
                onChange={(e) =>
                  handlePetExperienceChange("yearsOfExperience", e.target.value)
                }
                min="0"
              />
            </div>
            <div>
              <textarea
                placeholder="Describe your experience with pets"
                className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                value={
                  formData.petOwnerDetails.petExperience.experinece_description
                }
                onChange={(e) =>
                  handlePetExperienceChange(
                    "experinece_description",
                    e.target.value
                  )
                }
                rows={4}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderTrainerForm = () => (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Location"
          className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
          value={formData.trainerDetails.location}
          onChange={(e) =>
            handleInputChange("trainerDetails", "location", e.target.value)
          }
          required
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Certification"
          className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
          value={formData.trainerDetails.certification}
          onChange={(e) =>
            handleInputChange("trainerDetails", "certification", e.target.value)
          }
          required
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Specialties"
          className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
          value={formData.trainerDetails.specialties}
          onChange={(e) =>
            handleInputChange("trainerDetails", "specialties", e.target.value)
          }
        />
      </div>
      <div>
        <textarea
          placeholder="Tell us about your experience"
          className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
          value={formData.trainerDetails.experience}
          onChange={(e) =>
            handleInputChange("trainerDetails", "experience", e.target.value)
          }
          rows={4}
        />
      </div>
    </div>
  );

  const renderVetForm = () => (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Location"
          className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
          value={formData.veterinarianDetails.location}
          onChange={(e) =>
            handleInputChange("veterinarianDetails", "location", e.target.value)
          }
          required
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Degree"
          className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
          value={formData.veterinarianDetails.degree}
          onChange={(e) =>
            handleInputChange("veterinarianDetails", "degree", e.target.value)
          }
          required
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Specialization"
          className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
          value={formData.veterinarianDetails.specialization}
          onChange={(e) =>
            handleInputChange(
              "veterinarianDetails",
              "specialization",
              e.target.value
            )
          }
        />
      </div>
      <div>
        <input
          type="number"
          placeholder="Years of Practice"
          className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
          value={formData.veterinarianDetails.yearsOfPractice}
          onChange={(e) =>
            handleInputChange(
              "veterinarianDetails",
              "yearsOfPractice",
              e.target.value
            )
          }
          min="0"
        />
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#ffc929]/5 to-pink-50">
      <div className="container flex items-center justify-center min-h-screen p-4 mx-auto">
        <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">
            Complete Your Profile
          </h2>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-500 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderImageUpload()}
            {userRole === "PetOwner" && renderPetOwnerForm()}
            {userRole === "Trainer" && renderTrainerForm()}
            {userRole === "Vet" && renderVetForm()}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-sm font-medium text-white transition-colors bg-[#ffc929] rounded-lg hover:bg-[#e6b625] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffc929] disabled:bg-gray-300"
            >
              {loading ? "Completing Profile..." : "Complete Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;