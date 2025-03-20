import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  AlertCircle,
  PawPrint,
  Info,
  X,
  Save,
  Camera,
  Calendar,
  Star,
  MapPin,
  Coins,
  Zap
} from "lucide-react";
import { createPortal } from "react-dom";
import ImageUpload from "../../../ImageUpload";

// Constants for form options
const SPECIES_OPTIONS = [
  { value: "", label: "Select Species" },
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "other", label: "Other" }
];

const DOG_BREEDS = [
  "German Shepherd", "Labrador Retriever", "Golden Retriever", "Bulldog", "Rottweiler",
  "Beagle", "Poodle", "Siberian Husky", "Boxer", "Great Dane",
];

const CAT_BREEDS = [
  "Persian", "Siamese", "Maine Coon", "British Shorthair", "Ragdoll",
  "Bengal", "Sphynx", "Russian Blue", "American Shorthair", "Scottish Fold",
];

const AGE_OPTIONS = {
  dog: ["puppy", "young", "adult", "senior"],
  cat: ["kitten", "young", "adult", "senior"],
  other: ["young", "adult", "senior"],
};

const GENDER_OPTIONS = [
  { value: "", label: "Select Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const FORM_FIELDS = {
  name: {
    required: true,
    errorMessage: "Pet name is required",
  },
  species: {
    required: true,
    errorMessage: "Species is required",
  },
  breed: {
    required: (data) => data.species !== "other",
    errorMessage: "Breed is required",
  },
  description: {
    required: true,
    errorMessage: "Description is required",
  },
  age: {
    required: true,
    errorMessage: "Age is required",
  },
  city: {
    required: true,
    errorMessage: "City is required",
  },
  gender: {
    required: true,
    errorMessage: "Gender is required",
  },
  fee: {
    required: (data) => data.feeOption === "With Fee",
    errorMessage: "Fee must be at least 1 TND",
    validator: (value, data) => data.feeOption !== "With Fee" || value >= 1,
  },
  image: {
    required: true,
    errorMessage: "Please upload an image",
  }
};

// Reusable form components
export const FormField = ({ label, error, icon, children }) => (
  <div>
    <label className="flex items-center block gap-1 mb-1 text-sm font-medium text-gray-700">
      {icon && React.cloneElement(icon, { size: 14, className: "text-pink-500" })}
      {label}
      {label && <span className="text-pink-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

export const SelectField = ({ icon, value, onChange, error, options, disabled = false, required = false, placeholder = "Select" }) => (
  <div className="relative">
    {icon && React.cloneElement(icon, { 
      size: 16, 
      className: "absolute transform -translate-y-1/2 left-2 top-1/2 text-pink-500" 
    })}
    <select
      className={`w-full ${icon ? "pl-8" : "pl-3"} pr-2 py-2 text-sm text-gray-800 bg-white border rounded-lg transition-all duration-300 ${
        error ? "border-red-400" : "border-gray-200 hover:border-pink-300 focus:border-pink-400"
      } focus:outline-none focus:ring-2 focus:ring-pink-200`}
      value={value || ""}
      onChange={onChange}
      required={required}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={typeof option === 'string' ? option : option.value} value={typeof option === 'string' ? option : option.value}>
          {typeof option === 'string' ? option : option.label}
        </option>
      ))}
    </select>
  </div>
);

export const InputField = ({ icon, type = "text", value, onChange, error, placeholder, min, required = false }) => (
  <div className="relative">
    {icon && React.cloneElement(icon, { 
      size: 16, 
      className: "absolute transform -translate-y-1/2 left-2 top-1/2 text-pink-500" 
    })}
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full ${icon ? "pl-8" : "pl-3"} pr-3 py-2 text-sm text-gray-800 bg-white border rounded-lg transition-all duration-300 ${
        error ? "border-red-400" : "border-gray-200 hover:border-pink-300 focus:border-pink-400"
      } focus:outline-none focus:ring-2 focus:ring-pink-200`}
      value={value || ""}
      onChange={onChange}
      min={min}
      required={required}
    />
  </div>
);

const CreatePetModal = ({ isOpen, onClose, onCreate }) => {
  const [petData, setPetData] = useState({
    name: "",
    breed: "",
    age: "",
    city: "",
    gender: "",
    species: "",
    fee: "",
    feeOption: "Free",
    isTrained: false,
    image: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Memoized breed and age options based on selected species
  const availableBreeds = useMemo(() => {
    switch (petData.species) {
      case "dog": return DOG_BREEDS;
      case "cat": return CAT_BREEDS;
      default: return [];
    }
  }, [petData.species]);

  const availableAges = useMemo(() => {
    return petData.species ? AGE_OPTIONS[petData.species] || AGE_OPTIONS.other : [];
  }, [petData.species]);

  // Handle input changes with validation
  const handleInputChange = useCallback((field, value) => {
    setPetData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.entries(FORM_FIELDS).forEach(([field, config]) => {
      const isRequired = typeof config.required === 'function' 
        ? config.required(petData) 
        : config.required;

      if (isRequired && !petData[field]) {
        newErrors[field] = config.errorMessage;
      } else if (config.validator && !config.validator(petData[field], petData)) {
        newErrors[field] = config.errorMessage;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [petData]);

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onCreate({
        ...petData,
        fee: petData.feeOption === "Free" ? 0 : Number(petData.fee),
      });
      setPetData({
        name: "",
        breed: "",
        age: "",
        city: "",
        gender: "",
        species: "",
        fee: "",
        feeOption: "Free",
        isTrained: false,
        image: "",
        description: "",
      });
      onClose();
    } catch (err) {
      setErrors(prev => ({ ...prev, form: err.message || "Failed to create pet" }));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden bg-white shadow-xl rounded-xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500 to-pink-500">
          <h3 className="flex items-center gap-2 text-xl font-bold text-white">
            <PawPrint className="w-6 h-6" />
            New Pet Profile
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
                  currentImage={petData.image}
                  onImageSelected={(url) => handleInputChange("image", url)}
                  loading={loading}
                  className="w-full h-full transition-all duration-300 border-2 border-dashed rounded-lg border-pink-400/70 hover:border-pink-500"
                  showRemove={!!petData.image}
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
              {/* Basic Information */}
              <h4 className="flex items-center gap-2 pb-2 mb-3 text-lg font-medium text-gray-700 border-b border-gray-200">
                <Info className="w-5 h-5 text-pink-500" />
                Basic Information
              </h4>

              {/* Name */}
              <FormField 
                label="Pet Name" 
                error={errors.name}
                icon={<PawPrint />}
              >
                <InputField
                  placeholder="e.g., Max"
                  value={petData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  error={errors.name}
                  required
                  icon={<PawPrint />}
                />
              </FormField>

              {/* Species and Breed */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField 
                  label="Species" 
                  error={errors.species}
                  icon={<PawPrint />}
                >
                  <SelectField
                    value={petData.species}
                    onChange={(e) => handleInputChange("species", e.target.value)}
                    options={SPECIES_OPTIONS.filter(opt => opt.value !== "")}
                    error={errors.species}
                    placeholder="Select Species"
                    required
                    icon={<PawPrint />}
                  />
                </FormField>
                
                <FormField 
                  label="Breed" 
                  error={errors.breed}
                  icon={<Star />}
                >
                  {petData.species === "other" ? (
                    <InputField
                      placeholder="e.g., Rabbit"
                      value={petData.breed}
                      onChange={(e) => handleInputChange("breed", e.target.value)}
                      error={errors.breed}
                      icon={<Star />}
                    />
                  ) : (
                    <SelectField
                      value={petData.breed}
                      onChange={(e) => handleInputChange("breed", e.target.value)}
                      options={availableBreeds}
                      error={errors.breed}
                      required={petData.species !== "other"}
                      disabled={!petData.species}
                      placeholder="Select Breed"
                      icon={<Star />}
                    />
                  )}
                </FormField>
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField 
                  label="Age" 
                  error={errors.age}
                  icon={<Calendar />}
                >
                  <SelectField
                    value={petData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    options={availableAges.map(age => ({
                      value: age,
                      label: age.charAt(0).toUpperCase() + age.slice(1)
                    }))}
                    error={errors.age}
                    required
                    disabled={!petData.species}
                    placeholder="Select Age"
                    icon={<Calendar />}
                  />
                </FormField>
                
                <FormField 
                  label="Gender" 
                  error={errors.gender}
                  icon={<PawPrint />}
                >
                  <SelectField
                    value={petData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    options={GENDER_OPTIONS.filter(opt => opt.value !== "")}
                    error={errors.gender}
                    required
                    placeholder="Select Gender"
                    icon={<PawPrint />}
                  />
                </FormField>
              </div>

              {/* City and Training */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField 
                  label="City" 
                  error={errors.city}
                  icon={<MapPin />}
                >
                  <InputField
                    placeholder="e.g., Tunis"
                    value={petData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    error={errors.city}
                    required
                    icon={<MapPin />}
                  />
                </FormField>

                <FormField 
                  label="Training"
                  icon={<Zap />}
                >
                  <SelectField
                    value={petData.isTrained ? "true" : "false"}
                    onChange={(e) => handleInputChange("isTrained", e.target.value === "true")}
                    options={[
                      { value: "true", label: "Trained" },
                      { value: "false", label: "Not Trained" }
                    ]}
                    icon={<Zap />}
                  />
                </FormField>
              </div>

              {/* Fee */}
              <FormField 
                label="Adoption Fee"
                icon={<Coins />}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <SelectField
                    value={petData.feeOption}
                    onChange={(e) => {
                      handleInputChange("feeOption", e.target.value);
                      if (e.target.value === "Free") handleInputChange("fee", 0);
                    }}
                    options={[
                      { value: "Free", label: "Free" },
                      { value: "With Fee", label: "With Fee" }
                    ]}
                    icon={<Coins />}
                  />
                  
                  {petData.feeOption === "With Fee" && (
                    <div className="relative">
                      <Coins size={16} className="absolute text-pink-500 transform -translate-y-1/2 left-2 top-1/2" />
                      <input
                        type="number"
                        placeholder="e.g., 50"
                        className={`w-full pl-8 pr-10 py-2 text-sm text-gray-800 bg-white border rounded-lg transition-all duration-300 ${
                          errors.fee ? "border-red-400" : "border-gray-200 hover:border-pink-300 focus:border-pink-400"
                        } focus:outline-none focus:ring-2 focus:ring-pink-200`}
                        value={petData.fee || ""}
                        onChange={(e) => handleInputChange("fee", e.target.value)}
                        min="1"
                        required={petData.feeOption === "With Fee"}
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
              <FormField 
                label="Description" 
                error={errors.description}
                icon={<Info />}
              >
                <textarea
                  placeholder="Describe the pet (e.g., temperament, needs, history)"
                  className={`w-full p-3 text-sm text-gray-800 bg-white border rounded-lg transition-all duration-300 ${
                    errors.description ? "border-red-400" : "border-gray-200 hover:border-pink-300 focus:border-pink-400"
                  } focus:outline-none focus:ring-2 focus:ring-pink-200 min-h-[80px]`}
                  value={petData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                />
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
              onClick={handleCreate}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-md bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                </svg>
              )}
              {loading ? "Creating..." : "Create Pet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreatePetModal;