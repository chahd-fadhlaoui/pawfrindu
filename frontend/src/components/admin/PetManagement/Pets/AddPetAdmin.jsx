import React, { useState, useEffect } from "react";
import { X, Loader2, PawPrint } from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";
import ImageUpload from "../../../ImageUpload";

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

const AddPetAdmin = ({ onClose, onPetAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "adult",
    city: "",
    gender: "male",
    species: "dog",
    fee: "0",
    isTrained: false,
    description: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableBreeds, setAvailableBreeds] = useState(dogBreeds);
  const [availableAges, setAvailableAges] = useState(ageRanges.dog);

  useEffect(() => {
    console.log("Current formData.image:", formData.image);
    if (formData.species === "dog") {
      setAvailableBreeds(dogBreeds);
      setAvailableAges(ageRanges.dog);
      setFormData((prev) => ({ ...prev, breed: dogBreeds[0], age: "puppy" }));
    } else if (formData.species === "cat") {
      setAvailableBreeds(catBreeds);
      setAvailableAges(ageRanges.cat);
      setFormData((prev) => ({ ...prev, breed: catBreeds[0], age: "kitten" }));
    } else {
      setAvailableBreeds([]);
      setAvailableAges(ageRanges.other);
      setFormData((prev) => ({ ...prev, breed: "", age: "adult" }));
    }
  }, [formData.species]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleImageSelected = (imageUrl) => {
    console.log("handleImageSelected called with:", imageUrl);
    setFormData((prev) => {
      console.log("Updating formData.image to:", imageUrl);
      return { ...prev, image: imageUrl };
    });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Pet name is required";
    if (!formData.breed.trim() && formData.species !== "other")
      return "Breed is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.age) return "Please select an age range";
    if (!formData.image) return "Please upload an image";
    if (!formData.description.trim()) return "Please provide a description";
    if (isNaN(formData.fee) || Number(formData.fee) < 0)
      return "Please enter a valid fee amount";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const petData = {
        ...formData,
        fee: Number(formData.fee),
        isTrained: Boolean(formData.isTrained),
      };
      console.log("Submitting petData:", petData);
      const response = await axiosInstance.post("/api/pet/addpet", petData);
      console.log("Server response:", response.data);
      if (response.data.success) {
        onPetAdded();
        onClose();
      } else {
        setError(response.data.message || "Failed to add pet");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.message || "Error adding pet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-6 mx-4 bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute z-50 text-gray-500 top-4 right-4 hover:text-rose-700"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 mb-6">
          <PawPrint className="w-6 h-6 text-[#ffc929]" />
          <h3 className="text-xl font-bold text-rose-700">Add New Pet</h3>
        </div>

        {error && (
          <div className="p-2 mb-4 text-red-700 rounded bg-red-50">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Pet Image
            </label>
            <div className="relative w-36 h-36">
              <ImageUpload
                currentImage={formData.image}
                onImageSelected={handleImageSelected}
                className="w-full h-full rounded-full border-4 border-[#ffc929] shadow-lg"
                maxSize={5}
                showRemove={true}
                onRemove={() => handleImageSelected("")}
                loading={loading}
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter pet name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929]"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Species
            </label>
            <select
              value={formData.species}
              onChange={(e) => handleInputChange("species", e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929]"
            >
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Breed
            </label>
            {formData.species === "other" ? (
              <input
                type="text"
                placeholder="Enter breed"
                value={formData.breed}
                onChange={(e) => handleInputChange("breed", e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929]"
              />
            ) : (
              <select
                value={formData.breed}
                onChange={(e) => handleInputChange("breed", e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929]"
                required
              >
                {availableBreeds.map((breed) => (
                  <option key={breed} value={breed}>
                    {breed}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Age
            </label>
            <select
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929]"
              required
            >
              {availableAges.map((age) => (
                <option key={age} value={age}>
                  {age.charAt(0).toUpperCase() + age.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              City
            </label>
            <select
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929]"
              required
            >
              <option value="">Select city...</option>
              {tunisianCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929]"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Fee (DT)
            </label>
            <input
              type="number"
              placeholder="Enter fee (0 for free)"
              value={formData.fee}
              onChange={(e) => handleInputChange("fee", e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929]"
              min="0"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isTrained}
                onChange={(e) => handleInputChange("isTrained", e.target.checked)}
                className="w-4 h-4 text-[#ffc929] border-gray-300 rounded focus:ring-[#ffc929]"
              />
              <span className="text-sm font-medium text-gray-700">Trained</span>
            </label>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              placeholder="Describe your pet"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929]"
              rows="4"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-white bg-[#ffc929] rounded-md hover:bg-[#e6b625] disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Pet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPetAdmin;