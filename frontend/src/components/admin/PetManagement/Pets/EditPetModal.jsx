import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  PawPrint,
  X,
  Camera,
  Calendar,
  Star,
  MapPin,
  Coins,
  Zap,
  Info,
} from "lucide-react";
import ImageUpload from "../../../ImageUpload";
import { FormField, SelectField, InputField } from "./CreatePetModal"; // Import reusable components
import { SPECIES_OPTIONS, breeds, ageRanges } from "../../../../assets/Pet"; // Import from pet data file

// Constants (aligned with CreatePetModal)
const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const EditPetModal = ({ isOpen, onClose, petData, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize formData with petData
  useEffect(() => {
    if (petData) {
      setFormData({
        ...petData,
        feeOption: petData.fee > 0 ? "With Fee" : "Free",
        isTrained: petData.isTrained || false,
      });
    }
  }, [petData]);

  // Reset breed and age when species changes
  useEffect(() => {
    if (formData.species) {
      const newBreeds = breeds[formData.species] || [];
      const newAges = ageRanges[formData.species] || [];
      setFormData((prev) => ({
        ...prev,
        breed: newBreeds.includes(prev.breed) ? prev.breed : (newBreeds.length > 0 ? newBreeds[0] : ""),
        age: newAges.some(age => age.value === prev.age) ? prev.age : (newAges.length > 0 ? newAges[0].value : ""),
      }));
    }
  }, [formData.species]);

  // Memoized breed and age options
  const availableBreeds = useMemo(() => {
    return formData.species ? breeds[formData.species] || [] : [];
  }, [formData.species]);

  const availableAges = useMemo(() => {
    return formData.species ? ageRanges[formData.species] || [] : [];
  }, [formData.species]);

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  // Form validation (aligned with CreatePetModal)
  const validateForm = useCallback(() => {
    const newErrors = {};
    const requiredFields = {
      name: "Pet name is required",
      species: "Species is required",
      breed: formData.species !== "other" ? "Breed is required" : null,
      description: "Description is required",
      age: "Age is required",
      city: "City is required",
      gender: "Gender is required",
      image: "Please upload an image",
      fee: formData.feeOption === "With Fee" ? "Fee must be at least 1 TND" : null,
    };

    Object.entries(requiredFields).forEach(([field, errorMessage]) => {
      if (errorMessage && !formData[field]) {
        newErrors[field] = errorMessage;
      } else if (field === "fee" && formData.feeOption === "With Fee" && (!formData.fee || Number(formData.fee) < 1)) {
        newErrors.fee = errorMessage;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onUpdate({
        ...formData,
        fee: formData.feeOption === "Free" ? 0 : Number(formData.fee),
      });
      onClose();
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: err.message || "Failed to update pet" }));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !petData) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden bg-white shadow-xl rounded-xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500 to-pink-500">
          <h3 className="flex items-center gap-2 text-xl font-bold text-white">
            <PawPrint className="w-6 h-6" />
            Edit Pet Profile
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 text-white transition-colors duration-200 rounded-full hover:text-gray-200 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row md:max-h-[70vh]">
          {/* Image Upload Section */}
          <div className="p-4 md:w-2/5 lg:w-1/3 md:sticky md:top-0 md:self-start">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-full overflow-hidden rounded-lg shadow-md aspect-square bg-gray-50">
                <ImageUpload
                  currentImage={formData.image}
                  onImageSelected={(url) => handleInputChange("image", url)}
                  loading={loading}
                  className="w-full h-full transition-all duration-300 border-2 border-dashed rounded-lg border-pink-400/70 hover:border-pink-500"
                  showRemove={!!formData.image}
                  onRemove={() => handleInputChange("image", "")}
                />
              </div>
              <div className="text-center">
                <p className="flex items-center justify-center gap-1 text-xs text-gray-600">
                  <Camera size={14} className="text-pink-500" />
                  Upload a clear, high-quality image
                </p>
                <p className="text-xs text-gray-500">JPG, PNG, GIF formats</p>
              </div>
              {errors.image && (
                <p className="flex items-center justify-center gap-1 text-xs text-red-500">
                  <AlertCircle size={12} />
                  {errors.image}
                </p>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex-1 p-4 md:border-l border-gray-100 md:max-h-[calc(70vh-130px)] overflow-y-auto">
            {errors.form && (
              <div className="flex items-center gap-2 p-3 mb-4 text-sm font-medium text-red-600 border border-red-200 rounded-md bg-red-50">
                <AlertCircle className="flex-shrink-0 w-5 h-5" />
                {errors.form}
              </div>
            )}

            <div className="space-y-4">
              <h4 className="flex items-center gap-2 pb-2 mb-3 text-lg font-medium text-gray-700 border-b border-gray-200">
                <Info className="w-5 h-5 text-pink-500" />
                Pet Information
              </h4>

              {/* Name */}
              <FormField label="Pet Name" error={errors.name} icon={<PawPrint />}>
                <InputField
                  placeholder="e.g., Max"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  error={errors.name}
                  required
                  icon={<PawPrint />}
                />
              </FormField>

              {/* Species and Breed */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Species" error={errors.species} icon={<PawPrint />}>
                  <SelectField
                    value={formData.species}
                    onChange={(e) => handleInputChange("species", e.target.value)}
                    options={SPECIES_OPTIONS}
                    error={errors.species}
                    required
                    icon={<PawPrint />}
                  />
                </FormField>
                <FormField label="Breed" error={errors.breed} icon={<Star />}>
                  {formData.species === "other" ? (
                    <InputField
                      placeholder="e.g., Rabbit"
                      value={formData.breed}
                      onChange={(e) => handleInputChange("breed", e.target.value)}
                      error={errors.breed}
                      icon={<Star />}
                    />
                  ) : (
                    <SelectField
                      value={formData.breed}
                      onChange={(e) => handleInputChange("breed", e.target.value)}
                      options={availableBreeds}
                      error={errors.breed}
                      required={formData.species !== "other"}
                      disabled={!formData.species}
                      placeholder="Select Breed"
                      icon={<Star />}
                    />
                  )}
                </FormField>
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Age" error={errors.age} icon={<Calendar />}>
                  <SelectField
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    options={availableAges.map((age) => ({
                      value: age.value,
                      label: age.label,
                    }))}
                    error={errors.age}
                    required
                    disabled={!formData.species}
                    placeholder="Select Age"
                    icon={<Calendar />}
                  />
                </FormField>
                <FormField label="Gender" error={errors.gender} icon={<PawPrint />}>
                  <SelectField
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    options={GENDER_OPTIONS}
                    error={errors.gender}
                    required
                    icon={<PawPrint />}
                  />
                </FormField>
              </div>

              {/* City and Training */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="City" error={errors.city} icon={<MapPin />}>
                  <InputField
                    placeholder="e.g., Tunis"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    error={errors.city}
                    required
                    icon={<MapPin />}
                  />
                </FormField>
                <FormField label="Training" icon={<Zap />}>
                  <SelectField
                    value={formData.isTrained ? "true" : "false"}
                    onChange={(e) => handleInputChange("isTrained", e.target.value === "true")}
                    options={[
                      { value: "true", label: "Trained" },
                      { value: "false", label: "Not Trained" },
                    ]}
                    icon={<Zap />}
                  />
                </FormField>
              </div>

              {/* Fee */}
              <FormField label="Adoption Fee" icon={<Coins />}>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <SelectField
                    value={formData.feeOption}
                    onChange={(e) => {
                      handleInputChange("feeOption", e.target.value);
                      if (e.target.value === "Free") handleInputChange("fee", 0);
                    }}
                    options={[
                      { value: "Free", label: "Free" },
                      { value: "With Fee", label: "With Fee" },
                    ]}
                    icon={<Coins />}
                  />
                  {formData.feeOption === "With Fee" && (
                    <div className="relative">
                      <Coins size={16} className="absolute text-pink-500 transform -translate-y-1/2 left-2 top-1/2" />
                      <input
                        type="number"
                        placeholder="e.g., 50"
                        className={`w-full pl-8 pr-10 py-2 text-sm text-gray-800 bg-white border rounded-lg transition-all duration-300 ${
                          errors.fee ? "border-red-400" : "border-gray-200 hover:border-pink-300 focus:border-pink-400"
                        } focus:outline-none focus:ring-2 focus:ring-pink-200`}
                        value={formData.fee || ""}
                        onChange={(e) => handleInputChange("fee", e.target.value)}
                        min="1"
                        required={formData.feeOption === "With Fee"}
                      />
                      <span className="absolute text-xs font-medium text-gray-600 transform -translate-y-1/2 right-3 top-1/2">TND</span>
                      {errors.fee && (
                        <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                          <AlertCircle size={12} /> {errors.fee}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </FormField>

              {/* Description */}
              <FormField label="Description" error={errors.description} icon={<Info />}>
                <textarea
                  placeholder="Describe the pet (e.g., temperament, needs, history)"
                  className={`w-full p-3 text-sm text-gray-800 bg-white border rounded-lg transition-all duration-300 ${
                    errors.description ? "border-red-400" : "border-gray-200 hover:border-pink-300 focus:border-pink-400"
                  } focus:outline-none focus:ring-2 focus:ring-pink-200 min-h-[80px]`}
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Minimum 30 characters recommended</span>
                  <span className={formData.description?.length < 30 ? "text-red-500" : "text-green-500"}>
                    {formData.description?.length || 0} characters
                  </span>
                </div>
              </FormField>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <AlertCircle className="w-4 h-4" />
            Required fields marked with <span className="text-pink-500">*</span>
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-md bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                </svg>
              )}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EditPetModal;