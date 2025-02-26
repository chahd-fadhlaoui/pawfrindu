import React, { useState, useEffect } from "react";
import ImageUpload from "../components/ImageUpload";
import {
  ArrowLeft,
  Calendar,
  Coins,
  MapPin,
  PawPrint,
  Star,
  Zap,
} from "lucide-react";

// Breed lists
const dogBreeds = [
  "German Shepherd",
  "Labrador Retriever",
  "Golden Retriever",
  "Bulldog",
  "Rottweiler",
  "Beagle",
  "Poodle",
  "Siberian Husky",
  "Boxer",
  "Great Dane",
];

const catBreeds = [
  "Persian",
  "Siamese",
  "Maine Coon",
  "British Shorthair",
  "Ragdoll",
  "Bengal",
  "Sphynx",
  "Russian Blue",
  "American Shorthair",
  "Scottish Fold",
];

// Age ranges
const ageRanges = {
  dog: ["puppy", "young", "adult", "senior"],
  cat: ["kitten", "young", "adult", "senior"],
  other: ["young", "adult", "senior"],
};

// Tunisian cities
const tunisianCities = [
  "Tunis",
  "Sfax",
  "Sousse",
  "Kairouan",
  "Bizerte",
  "Gabès",
  "Ariana",
  "Gafsa",
  "Monastir",
  "Nabeul",
  "Ben Arous",
  "La Marsa",
  "Kasserine",
  "Médenine",
  "Hammamet",
];

const EditForm = ({ formData, onChange, onSubmit, onCancel, loading }) => {
  const [availableBreeds, setAvailableBreeds] = useState(dogBreeds);
  const [availableAges, setAvailableAges] = useState(ageRanges.dog);

  useEffect(() => {
    if (formData.species === "dog") {
      setAvailableBreeds(dogBreeds);
      setAvailableAges(ageRanges.dog);
    } else if (formData.species === "cat") {
      setAvailableBreeds(catBreeds);
      setAvailableAges(ageRanges.cat);
    } else {
      setAvailableBreeds([]);
      setAvailableAges(ageRanges.other);
    }
  }, [formData.species]);

  const handleInputChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-3xl shadow-lg border-2 border-[#ffc929]/20 overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 z-50 group flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-[#ffc929]/20 hover:bg-[#ffc929]/10 hover:border-[#ffc929]/50 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
        >
          <ArrowLeft className="w-5 h-5 text-[#ffc929] transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="text-sm font-medium text-gray-700 transition-colors duration-300 group-hover:text-[#ffc929]">
            Close
          </span>
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-1/2">
            <ImageUpload
              currentImage={formData.image}
              onImageSelected={(url) => handleInputChange("image", url)}
              className="object-cover w-full h-96 md:h-full bg-gradient-to-br from-white to-pink-50"
              maxSize={5}
              showRemove={true}
              onRemove={() => handleInputChange("image", "")}
            />
          </div>

          <div className="flex flex-col p-6 space-y-6 bg-white md:w-1/2 md:p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    placeholder="Pet Name"
                    className="text-3xl font-semibold text-gray-800 placeholder-gray-400 bg-transparent border-none focus:outline-none focus:ring-0"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-gray-600">
                  <div className="flex items-center gap-2 bg-[#ffc929]/10 px-3 py-1.5 rounded-full border border-[#ffc929]/20">
                    <PawPrint size={14} className="text-[#ffc929]" />
                    <select
                      className="w-32 text-sm text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0"
                      value={formData.species}
                      onChange={(e) => handleInputChange("species", e.target.value)}
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 bg-[#ffc929]/10 px-3 py-1.5 rounded-full border border-[#ffc929]/20">
                    <Star size={14} className="text-[#ffc929]" />
                    {formData.species === "other" ? (
                      <input
                        type="text"
                        placeholder="Enter breed..."
                        className="w-32 text-sm text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0"
                        value={formData.breed}
                        onChange={(e) => handleInputChange("breed", e.target.value)}
                      />
                    ) : (
                      <select
                        className="w-32 text-sm text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0"
                        value={formData.breed}
                        onChange={(e) => handleInputChange("breed", e.target.value)}
                        required
                      >
                        <option value="">Select Breed</option>
                        {availableBreeds.map((breed) => (
                          <option key={breed} value={breed}>
                            {breed}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#ffc929]/20 shadow-sm">
                <p className="flex items-center gap-2 mb-3 text-lg font-semibold text-gray-800">
                  <PawPrint size={24} className="text-[#ffc929]" />
                  About
                </p>
                <textarea
                  placeholder="Tell us about your pet..."
                  className="w-full h-32 p-3 text-base leading-relaxed text-gray-600 bg-white rounded-xl border border-[#ffc929]/20 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30 hover:border-[#ffc929]/50 transition-all duration-300"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-[#ffc929]/10 border-[#ffc929]/20">
                  <Calendar size={18} className="text-[#ffc929]" />
                  <select
                    className="text-sm text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    required
                  >
                    <option value="">Select Age</option>
                    {availableAges.map((age) => (
                      <option key={age} value={age}>
                        {age.charAt(0).toUpperCase() + age.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-[#ffc929]/10 border-[#ffc929]/20">
                  <Zap size={18} className="text-[#ffc929]" />
                  <select
                    className="text-sm text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0"
                    value={formData.isTrained}
                    onChange={(e) => handleInputChange("isTrained", e.target.value === "true")}
                  >
                    <option value="true">Trained</option>
                    <option value="false">Not Trained</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-[#ffc929]/10 border-[#ffc929]/20">
                  <PawPrint size={18} className="text-[#ffc929]" />
                  <select
                    className="text-sm text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0"
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-[#ffc929]/10 border-[#ffc929]/20">
                  <MapPin size={18} className="text-[#ffc929]" />
                  <select
                    className="text-sm text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  >
                    <option value="">Select City</option>
                    {tunisianCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-[#ffc929]/10 border-[#ffc929]/20">
                  <Coins size={18} className="text-[#ffc929]" />
                  <select
                    className="text-sm text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0"
                    value={formData.feeOption || (formData.fee > 0 ? "With Fee" : "Free")}
                    onChange={(e) => {
                      handleInputChange("feeOption", e.target.value);
                      if (e.target.value === "Free") handleInputChange("fee", 0);
                    }}
                  >
                    <option value="Free">Free</option>
                    <option value="With Fee">With Fee</option>
                  </select>
                </div>

                {formData.feeOption === "With Fee" && (
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-[#ffc929]/10 border-[#ffc929]/20">
                    <Coins size={18} className="text-[#ffc929]" />
                    <input
                      type="number"
                      placeholder="Enter fee..."
                      className="w-24 text-sm text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0"
                      value={formData.fee}
                      onChange={(e) => handleInputChange("fee", e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-between gap-4 pt-4 border-t border-[#ffc929]/20 sm:flex-row">
                <p className="text-xs text-gray-500">
                  Note: Significant changes may require admin approval.
                </p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 text-sm font-medium text-gray-600 transition-all duration-300 transform bg-gray-100 shadow-sm rounded-xl hover:bg-gray-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full sm:w-auto text-center px-6 py-2 text-sm font-medium text-white transition-all duration-300 transform bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-sm hover:from-[#ffa726] hover:to-[#ffc929] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditForm;