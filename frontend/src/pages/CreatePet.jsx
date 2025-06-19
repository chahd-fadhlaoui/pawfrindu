import {
  ChevronLeft,
  Heart,
  PawPrint
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SPECIES_OPTIONS, ageRanges, breeds } from "../assets/Pet";
import HelpSection from "../components/common/HelpSection";
import ImageUpload from "../components/ImageUpload";
import { useApp } from "../context/AppContext";
import axiosInstance from "../utils/axiosInstance";
import { governorates, delegationsByGovernorate } from "../assets/locations";

const CreatePet = () => {
  const navigate = useNavigate();
  const { user, error, loading, clearError, setError, fetchPets } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "adult",
    governorate: "",
    delegation: "",
    city: "",
    gender: "male",
    species: "dog",
    feeOption: "Free",
    fee: "0",
    isTrained: false,
    image: "",
    description: "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [availableBreeds, setAvailableBreeds] = useState(breeds.dog);
  const [availableAges, setAvailableAges] = useState(ageRanges.dog);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [availableDelegations, setAvailableDelegations] = useState([]);

  useEffect(() => {
    if (formData.species === "dog") {
      setAvailableBreeds(breeds.dog);
      setAvailableAges(ageRanges.dog);
      setFormData((prev) => ({
        ...prev,
        breed: breeds.dog[0],
        age: ageRanges.dog[0].value,
      }));
    } else if (formData.species === "cat") {
      setAvailableBreeds(breeds.cat);
      setAvailableAges(ageRanges.cat);
      setFormData((prev) => ({
        ...prev,
        breed: breeds.cat[0],
        age: ageRanges.cat[0].value,
      }));
    } else {
      setAvailableBreeds(breeds.other);
      setAvailableAges(ageRanges.other);
      setFormData((prev) => ({
        ...prev,
        breed: breeds.other[0],
        age: ageRanges.other[0].value,
      }));
    }
  }, [formData.species]);

  useEffect(() => {
    if (formData.governorate) {
      setAvailableDelegations(delegationsByGovernorate[formData.governorate] || []);
      setFormData((prev) => ({
        ...prev,
        delegation: "",
        city: "",
      }));
    } else {
      setAvailableDelegations([]);
      setFormData((prev) => ({ ...prev, delegation: "", city: "" }));
    }
  }, [formData.governorate]);

  useEffect(() => {
    if (formData.governorate && formData.delegation) {
      setFormData((prev) => ({
        ...prev,
        city: `${formData.delegation}, ${formData.governorate}`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  }, [formData.governorate, formData.delegation]);

  const handleImageSelected = (imageUrl) => {
    setFormData((prev) => ({ ...prev, image: imageUrl }));
    setIsFormDirty(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Pet name is required");
      return false;
    }
    if (!formData.breed.trim()) {
      setError("Breed is required");
      return false;
    }
    if (!formData.city.trim()) {
      setError("Please select a governorate and delegation");
      return false;
    }
    if (!formData.age) {
      setError("Please select an age range");
      return false;
    }
    if (!formData.image) {
      setError("Please upload a pet image");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Please provide a description");
      return false;
    }
    if (
      formData.feeOption === "With Fee" &&
      (!formData.fee || Number(formData.fee) <= 0)
    ) {
      setError("Please enter a valid fee amount greater than 0");
      return false;
    }
    return true;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsFormDirty(true);
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    try {
      if (!user) {
        throw new Error("You must be logged in to create a pet profile");
      }

      const petData = {
        ...formData,
        fee: formData.feeOption === "Free" ? 0 : Number(formData.fee),
        isTrained: Boolean(formData.isTrained),
      };
      delete petData.feeOption;
      delete petData.governorate;
      delete petData.delegation;

      const result = await axiosInstance.post("/api/pet/addpet", petData);

      if (result.data) {
        await fetchPets();
        navigate("/list", { state: { success: "Pet profile created successfully!" } });
      }
    } catch (error) {
      clearError();
      setError(error.response?.data?.message || "Error creating pet profile");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBackClick = () => {
    if (isFormDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-pink-50 to-[#ffc929]/10">
        <div className="p-8 text-center bg-white shadow-xl rounded-2xl animate-pulse">
          <PawPrint size={72} className="mx-auto text-[#ffc929]" />
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Loading...</h2>
          <p className="mt-2 text-gray-500">Getting ready to find a home for your pet!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-pink-50 to-[#ffc929]/10">
      <div className="mx-auto space-y-12 max-w-7xl">
        {/* Header */}
        <div className="pt-16 space-y-6 text-center animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <button
            onClick={handleBackClick}
            className="absolute left-0 top-16 group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ffc929] to-[#ffa726] text-white font-medium rounded-full shadow-md hover:shadow-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300"
            aria-label="Back to previous page"
          >
            <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Back
          </button>
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
            <Heart className="w-4 h-4 mr-2 text-[#ffc929]" />
            Pet Profile
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="block">Create a</span>
            <span className="block text-pink-500">Pet Profile</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
            Share your pet's details to find them a loving forever home.
          </p>
        </div>

        {/* Main Content */}
        <main className="space-y-10">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#ffc929]/10 overflow-hidden">
            <div className="grid gap-12 p-8 md:grid-cols-2 lg:p-12">
              {/* Image Upload Section */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-br from-[#ffc929]/20 to-pink-200/20 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                <ImageUpload
                  currentImage={formData.image}
                  onImageSelected={handleImageSelected}
                  className="relative z-10 object-cover w-full shadow-lg aspect-square rounded-3xl"
                  maxSize={5}
                  showRemove={true}
                  onRemove={() => handleImageSelected("")}
                />
                <p className="mt-4 text-sm text-center text-gray-500">
                  Upload a clear photo (max 5MB)
                </p>
              </div>

              {/* Form Section */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="petName">
                    Pet Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="petName"
                    type="text"
                    placeholder="e.g., Max"
                    className="w-full px-4 py-3 text-lg text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffc929] focus:border-transparent transition-all duration-200"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    aria-required="true"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="species">
                      Species
                    </label>
                    <select
                      id="species"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffc929] focus:border-transparent transition-all duration-200"
                      value={formData.species}
                      onChange={(e) => handleInputChange("species", e.target.value)}
                    >
                      {SPECIES_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="breed">
                      Breed <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="breed"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffc929] focus:border-transparent transition-all duration-200"
                      value={formData.breed}
                      onChange={(e) => handleInputChange("breed", e.target.value)}
                      required
                      aria-required="true"
                    >
                      {availableBreeds.map((breed) => (
                        <option key={breed} value={breed}>
                          {breed}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="description">
                    About Your Pet <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    placeholder="e.g., Friendly, loves walks, good with kids..."
                    className="w-full p-4 h-32 text-base text-gray-600 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffc929] focus:border-transparent resize-none transition-all duration-200"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    required
                    aria-required="true"
                  />
                  <p className="text-xs text-gray-500">Tell us what makes your pet special!</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="age">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="age"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffc929] focus:border-transparent transition-all duration-200"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      required
                      aria-required="true"
                    >
                      {availableAges.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="gender">
                      Gender
                    </label>
                    <select
                      id="gender"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffc929] focus:border-transparent transition-all duration-200"
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="governorate">
                      Governorate <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="governorate"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffc929] focus:border-transparent transition-all duration-200"
                      value={formData.governorate}
                      onChange={(e) => handleInputChange("governorate", e.target.value)}
                      required
                      aria-required="true"
                    >
                      <option value="">Select a governorate</option>
                      {governorates.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="delegation">
                      Delegation <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="delegation"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffc929] focus:border-transparent transition-all duration-200"
                      value={formData.delegation}
                      onChange={(e) => handleInputChange("delegation", e.target.value)}
                      required
                      aria-required="true"
                      disabled={!formData.governorate}
                    >
                      <option value="">Select a delegation</option>
                      {availableDelegations.map((del) => (
                        <option key={del} value={del}>
                          {del}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="isTrained">
                      Training
                    </label>
                    <select
                      id="isTrained"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffc929] focus:border-transparent transition-all duration-200"
                      value={formData.isTrained}
                      onChange={(e) => handleInputChange("isTrained", e.target.value === "true")}
                    >
                      <option value="true">Trained</option>
                      <option value="false">Not Trained</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="feeOption">
                      Fee Option
                    </label>
                    <select
                      id="feeOption"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffc929] focus:border-transparent transition-all duration-200"
                      value={formData.feeOption}
                      onChange={(e) => handleInputChange("feeOption", e.target.value)}
                    >
                      <option value="Free">Free</option>
                      <option value="With Fee">With Fee</option>
                    </select>
                  </div>
                  {formData.feeOption === "With Fee" && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700" htmlFor="fee">
                        Fee Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="fee"
                        type="number"
                        placeholder="e.g., 50"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffc929] focus:border-transparent transition-all duration-200"
                        value={formData.fee}
                        onChange={(e) => handleInputChange("fee", e.target.value)}
                        min="1"
                        required
                        aria-required="true"
                      />
                    </div>
                  )}
                </div>

                {/* Donation Information Text */}
                {formData.feeOption === "With Fee" && (
                  <div className="flex items-start p-4 space-x-3 border-l-4 border-[#ffc929] bg-gradient-to-r from-[#ffc929]/5 to-pink-50/50 rounded-xl">
                    <Heart className="w-6 h-6 text-[#ffc929] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        💝 Supporting Animal Welfare
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        The adoption fee you set will go towards supporting local animal shelters and rescue organizations. 
                        Your contribution helps provide food, medical care, and shelter for animals in need. 
                        Thank you for making a difference! 🐾
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center p-4 space-x-3 border-l-4 border-red-500 bg-red-50 rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p className="font-medium text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitLoading}
                  className={`w-full py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 
                    bg-gradient-to-r from-[#ffc929] to-[#ffa726] text-white 
                    hover:from-[#ffdd58] hover:to-[#ffab00] hover:scale-[1.02] 
                    focus:outline-none focus:ring-4 focus:ring-[#ffc929]/50 
                    disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {submitLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-3 text-white animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                        />
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create Your Pet"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Help Section */}
          <HelpSection
            show={true}
            title="How to Create a Pet Profile"
            className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-6 border border-[#ffc929]/10"
          >
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="text-gray-700">
                  Upload a clear photo of your pet using the image uploader on the left.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="text-gray-700">
                  Fill in all required fields marked with <span className="text-red-500">*</span> (e.g.,{" "}
                  <span className="font-medium">name</span>,{" "}
                  <span className="font-medium">breed</span>,{" "}
                  <span className="font-medium">governorate</span>,{" "}
                  <span className="font-medium">delegation</span>).
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="text-gray-700">
                  Write a brief <span className="font-medium">description</span> to share your pet's personality.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="text-gray-700">
                  Choose <span className="font-medium">Free</span> or{" "}
                  <span className="font-medium">With Fee</span> and set a fee if needed.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="text-gray-700">
                  If you set a fee, the money will go to support local animal welfare organizations.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="text-gray-700">
                  Click <span className="font-medium">Create Pet Profile</span> to submit your listing.
                </div>
              </li>
            </ul>
          </HelpSection>
        </main>
      </div>
    </div>
  );
};

export default CreatePet;