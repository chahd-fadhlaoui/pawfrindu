import {
  AlertCircle,
  Calendar,
  Camera,
  Coins,
  Info,
  MapPin,
  PawPrint,
  Star,
  X,
  Zap,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import ImageUpload from "../components/ImageUpload";
import { breeds, ageRanges, SPECIES_OPTIONS } from "../assets/Pet"; // Adjust the path as needed


const TUNISIAN_CITIES = [
  "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès", "Ariana", "Gafsa",
  "Monastir", "Nabeul", "Ben Arous", "La Marsa", "Kasserine", "Médenine", "Hammamet",
];

// Form field config for easy maintenance
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
    required: (data) => true, // Breed is required for all species now since breeds.other exists
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
  fee: {
    required: (data) => data.feeOption === "With Fee",
    errorMessage: "Fee must be at least 1 TND",
    validator: (value, data) => data.feeOption !== "With Fee" || value >= 1,
  },
};

const FormField = ({ label, error, icon, children }) => (
  <div>
    <label className="flex items-center block gap-1 mb-1 text-sm font-medium text-gray-700">
      {icon && React.cloneElement(icon, { size: 14, className: "text-amber-500" })}
      {label}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

const SelectField = ({ icon, value, onChange, error, options, disabled = false, required = false, placeholder = "Select" }) => (
  <div className="relative">
    {icon && React.cloneElement(icon, { 
      size: 16, 
      className: "absolute transform -translate-y-1/2 left-2 top-1/2 text-amber-500" 
    })}
    <select
      className={`w-full pl-8 pr-2 py-2 text-sm text-gray-800 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300 ${
        error ? "border-red-400" : "hover:border-amber-300"
      }`}
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

const InputField = ({ icon, type = "text", value, onChange, error, placeholder, min, required = false }) => (
  <div className="relative">
    {icon && React.cloneElement(icon, { 
      size: 16, 
      className: "absolute transform -translate-y-1/2 left-2 top-1/2 text-amber-500" 
    })}
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full ${icon ? "pl-8" : "pl-3"} pr-3 py-2 text-sm text-gray-800 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300 ${
        error ? "border-red-400" : "hover:border-amber-300"
      }`}
      value={value || ""}
      onChange={onChange}
      min={min}
      required={required}
    />
  </div>
);

/**
 * EditForm Component - A professional, reusable form for pet editing
 * 
 * @param {Object} props
 * @param {Object} props.formData - Current form values
 * @param {Function} props.onChange - Field change handler
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onCancel - Cancel action handler
 * @param {boolean} props.loading - Loading state for submission
 */
const EditForm = ({ formData, onChange, onSubmit, onCancel, loading }) => {
  const [errors, setErrors] = useState({});

  // Memoized breed and age options based on selected species
  const availableBreeds = useMemo(() => {
    switch (formData.species) {
      case "dog": return breeds.dog;
      case "cat": return breeds.cat;
      case "other": return breeds.other;
      default: return [];
    }
  }, [formData.species]);

  const availableAges = useMemo(() => {
    return ageRanges[formData.species] || ageRanges.other;
  }, [formData.species]);

  // Handle input changes with validation
  const handleInputChange = useCallback((field, value) => {
    onChange(field, value);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [onChange, errors]);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.entries(FORM_FIELDS).forEach(([field, config]) => {
      const isRequired = typeof config.required === 'function' 
        ? config.required(formData) 
        : config.required;

      if (isRequired && !formData[field]) {
        newErrors[field] = config.errorMessage;
      } else if (config.validator && !config.validator(formData[field], formData)) {
        newErrors[field] = config.errorMessage;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) onSubmit(e);
  }, [validateForm, onSubmit]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-md animate-scale-in">
      <div className="relative flex flex-col w-full max-w-4xl overflow-hidden bg-white border-t-4 shadow-xl rounded-2xl border-amber-400">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <PawPrint size={24} className="text-amber-500" />
            Edit Pet
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-600 transition-all duration-300 rounded-full hover:text-amber-500 hover:bg-gray-100"
            disabled={loading}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Admin Approval Notice */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-amber-50">
          <Info size={16} className="flex-shrink-0 text-amber-600" />
          <p className="text-xs text-gray-700">
            Changes will be reviewed by an admin before publishing.
          </p>
        </div>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row md:max-h-[70vh]">
          {/* Image Section */}
          <div className="p-4 md:w-2/5 lg:w-1/3 md:sticky md:top-0 md:self-start">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-full overflow-hidden rounded-lg shadow-md aspect-square bg-gray-50">
                <ImageUpload
                  currentImage={formData.image}
                  onImageSelected={(url) => handleInputChange("image", url)}
                  loading={loading}
                  className="w-full h-full transition-all duration-300 border-2 border-dashed rounded-lg border-amber-400/70 hover:border-amber-500"
                  maxSize={5}
                  showRemove={true}
                  onRemove={() => handleInputChange("image", "")}
                />
              </div>
              <div className="text-center">
                <p className="flex items-center justify-center gap-1 text-xs text-gray-600">
                  <Camera size={14} className="text-amber-500" />
                  Upload a clear, high-quality image
                </p>
                <p className="text-xs text-gray-500">Max 5MB (JPG, PNG, GIF)</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 p-4 md:border-l border-gray-100 md:max-h-[calc(70vh-130px)] overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <FormField 
                label="Pet Name" 
                error={errors.name}
                icon={<PawPrint />}
              >
                <InputField
                  placeholder="e.g., Max"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  error={errors.name}
                  required
                />
              </FormField>

              {/* Species and Breed */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <FormField 
                  label="Species" 
                  error={errors.species}
                >
                  <SelectField
                    icon={<PawPrint />}
                    value={formData.species}
                    onChange={(e) => handleInputChange("species", e.target.value)}
                    options={SPECIES_OPTIONS}
                    error={errors.species}
                    required
                  />
                </FormField>
                
                <FormField 
                  label="Breed" 
                  error={errors.breed}
                >
                  <SelectField
                    icon={<Star />}
                    value={formData.breed}
                    onChange={(e) => handleInputChange("breed", e.target.value)}
                    options={availableBreeds}
                    error={errors.breed}
                    required
                    disabled={!formData.species}
                  />
                </FormField>
              </div>

              {/* Description */}
              <FormField 
                label="Description" 
                error={errors.description}
              >
                <textarea
                  placeholder="Tell us about your pet..."
                  className={`w-full p-3 text-sm text-gray-800 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[80px] transition-all duration-300 ${errors.description ? "border-red-400" : "hover:border-amber-300"}`}
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                />
              </FormField>

              {/* Details */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <FormField 
                  label="Age" 
                  error={errors.age}
                >
                  <SelectField
                    icon={<Calendar />}
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    options={availableAges.map(range => ({
                      value: range.value,
                      label: range.label // Display label with years
                    }))}
                    error={errors.age}
                    required
                  />
                </FormField>
                
                <FormField label="Gender">
                  <SelectField
                    icon={<PawPrint />}
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" }
                    ]}
                  />
                </FormField>
                
                <FormField label="Training">
                  <SelectField
                    icon={<Zap />}
                    value={formData.isTrained === true ? "true" : formData.isTrained === false ? "false" : ""}
                    onChange={(e) => handleInputChange("isTrained", e.target.value === "true")}
                    options={[
                      { value: "true", label: "Trained" },
                      { value: "false", label: "Not Trained" }
                    ]}
                  />
                </FormField>
                
                <FormField 
                  label="City" 
                  error={errors.city}
                >
                  <SelectField
                    icon={<MapPin />}
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    options={TUNISIAN_CITIES}
                    error={errors.city}
                    required
                  />
                </FormField>
              </div>

              {/* Fee */}
              <FormField label="Adoption Fee">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <SelectField
                    icon={<Coins />}
                    value={formData.feeOption || (formData.fee > 0 ? "With Fee" : "Free")}
                    onChange={(e) => {
                      handleInputChange("feeOption", e.target.value);
                      if (e.target.value === "Free") handleInputChange("fee", 0);
                    }}
                    options={[
                      { value: "Free", label: "Free" },
                      { value: "With Fee", label: "With Fee" }
                    ]}
                  />
                  
                  {(formData.feeOption === "With Fee" || (formData.fee > 0 && formData.feeOption !== "Free")) && (
                    <div className="relative">
                      <Coins size={16} className="absolute transform -translate-y-1/2 left-2 top-1/2 text-amber-500" />
                      <input
                        type="number"
                        placeholder="e.g., 50"
                        className={`w-full pl-8 pr-10 py-2 text-sm text-gray-800 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300 ${errors.fee ? "border-red-400" : "hover:border-amber-300"}`}
                        value={formData.fee === 0 ? "" : formData.fee || ""}
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
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-sm focus:ring-2 focus:ring-amber-300 focus:outline-none ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                </svg>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditForm;