import React, { useEffect, useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import axiosInstance from "../../utils/axiosInstance";
import { AlertTriangle, Loader2, PawPrint, X, Camera } from "lucide-react";
import { species, breeds, ageOptions, sizeOptions, colorOptions } from "../../assets/Pet";
import { governorates, delegationsByGovernorate } from "../../assets/locations";

const FoundPetUpdateForm = ({ reportId, onSuccess, onCancel }) => {
  const { user } = useApp();
  const [formData, setFormData] = useState({
    species: "",
    breed: "",
    size: "",
    age: "",
    gender: "",
    isPregnant: null,
    color: [],
    location: { governorate: "", delegation: "", coordinates: { type: "Point", coordinates: [0, 0] } },
    date: "",
    photos: [],
    description: "",
    email: "",
    phoneNumber: "",
  });
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [photosToRemove, setPhotosToRemove] = useState([]); // Added to track removed existing photos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const photoPreviewsRef = useRef([]);

  useEffect(() => {
    return () => {
      photoPreviewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axiosInstance.get(`/api/lost-and-found/${reportId}`);
        const report = response.data.data;
        if (!report) throw new Error("Report data not found");
        const reportDate = report.date ? new Date(report.date) : null;
        const newFormData = {
          species: report.species || "",
          breed: report.breed || "",
          size: report.size || "",
          age: report.age || "",
          gender: report.gender || "",
          isPregnant: report.isPregnant ?? null,
          color: Array.isArray(report.color) ? report.color : [],
          location: {
            governorate: report.location && report.location.governorate ? report.location.governorate.toLowerCase() : "",
            delegation: report.location && report.location.delegation ? report.location.delegation.toLowerCase() : "",
            coordinates: report.location && report.location.coordinates ? report.location.coordinates : { type: "Point", coordinates: [0, 0] },
          },
          date: reportDate && !isNaN(reportDate.getTime()) ? reportDate.toISOString().split("T")[0] : "",
          photos: [],
          description: report.description || "",
          email: report.email || user?.email || "",
          phoneNumber: report.phoneNumber || user?.petOwnerDetails?.phone || user?.phoneNumber || "",
        };
        setFormData(newFormData);
        setExistingPhotos(Array.isArray(report.photos) ? report.photos : []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load report.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("location.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value,
          ...(field === "governorate" ? { delegation: "" } : {}), // Reset delegation when governorate changes
        },
      }));
    } else if (type === "radio" && name === "isPregnant") {
      setFormData((prev) => ({
        ...prev,
        isPregnant: value === "true" ? true : value === "false" ? false : null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
        ...(name === "species" && prev.breed && !breeds[value]?.includes(prev.breed) ? { breed: "" } : {}),
      }));
    }
  };

  const handleColorAdd = (color) => {
    if (!formData.color.includes(color)) {
      setFormData((prev) => ({ ...prev, color: [...prev.color, color] }));
    }
  };

  const handleColorRemove = (color) => {
    setFormData((prev) => ({ ...prev, color: prev.color.filter((c) => c !== color) }));
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setIsUploading(true);

    const uploadPromises = Array.from(files).map(async (file) => {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
        setError(`File ${file.name} is not an image or exceeds 5MB.`);
        return null;
      }

      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      try {
        const response = await axiosInstance.post("/api/upload", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const previewUrl = URL.createObjectURL(file);
        photoPreviewsRef.current.push(previewUrl);
        return { url: response.data.url, preview: previewUrl };
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        setError(`Failed to upload ${file.name}.`);
        return null;
      }
    });

    const results = (await Promise.all(uploadPromises)).filter((result) => result);
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...results.map((r) => r.url)],
    }));
    setPhotoPreviews((prev) => [...prev, ...results.map((r) => r.preview)]);
    setIsUploading(false);
  };

  const handleRemoveNewPhoto = (index) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    photoPreviewsRef.current = photoPreviewsRef.current.filter((_, i) => i !== index);
  };

  const handleRemoveExistingPhoto = (index) => {
    const photoUrl = existingPhotos[index];
    setPhotosToRemove((prev) => [...prev, photoUrl]);
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log(`Initiating update for Found report ${reportId}`);
  setSubmitting(true);
  setError(null);
  setSuccessMessage(null);

  // Verify report type before submitting
  try {
    const response = await axiosInstance.get(`/api/lost-and-found/${reportId}`);
    const report = response.data.data;
    if (report.type.toLowerCase() !== "found") {
      console.error(`Cannot update report ${reportId}: expected Found, got ${report.type}`);
      setError("This form is for updating Found reports only.");
      setSubmitting(false);
      return;
    }
    console.log(`Verified Found report ${reportId} before update:`, { type: report.type });
  } catch (err) {
    console.error(`Error verifying report ${reportId} type:`, err);
    setError("Failed to verify report type.");
    setSubmitting(false);
    return;
  }

  const dataToSubmit = {
    species: formData.species,
    breed: formData.breed,
    size: formData.size,
    age: formData.age,
    gender: formData.gender,
    isPregnant: formData.isPregnant,
    color: formData.color,
    date: formData.date,
    description: formData.description,
    email: formData.email,
    phoneNumber: formData.phoneNumber,
    "location[governorate]": formData.location.governorate,
    "location[delegation]": formData.location.delegation,
    "location[coordinates]": JSON.stringify(formData.location.coordinates),
    photos: formData.photos,
    photosToRemove,
  };

  const updateUrl = `/api/lost-and-found/${reportId}/update-found`;
  console.log(`Sending PUT request to ${updateUrl} with payload:`, JSON.stringify(dataToSubmit, null, 2));

  try {
    const response = await axiosInstance.put(updateUrl, dataToSubmit);
    console.log(`Update response for report ${reportId}:`, response.data);
    if (response.data.success) {
      setSuccessMessage(response.data.message);
      onSuccess();
    } else {
      setError("Update failed. Please try again.");
    }
  } catch (err) {
    console.error(`Update error for report ${reportId}:`, err.response?.data || err.message);
    setError(err.response?.data?.message || "Failed to update report.");
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-8 h-8 text-pink-500 mx-auto" />
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 text-white bg-pink-500 rounded-xl hover:bg-pink-600"
        >
          Close
        </button>
      </div>
    );
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animationClass = prefersReducedMotion ? "" : "transition-all duration-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {successMessage && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl">
          <span>{successMessage}</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Species <span className="text-red-500">*</span>
          </label>
          <select
            name="species"
            value={formData.species}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-200 rounded-xl focus:ring-pink-300 focus:border-pink-400"
            required
          >
            <option value="">Select Species</option>
            {species.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Breed</label>
          <select
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-200 rounded-xl focus:ring-pink-300 focus:border-pink-400"
          >
            <option value="">Select Breed</option>
            {(breeds[formData.species] || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Size</label>
          <select
            name="size"
            value={formData.size}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-200 rounded-xl focus:ring-pink-300 focus:border-pink-400"
          >
            <option value="">Not Specified</option>
            {sizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <select
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-200 rounded-xl focus:ring-pink-300 focus:border-pink-400"
          >
            <option value="">Select Age</option>
            {ageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-200 rounded-xl focus:ring-pink-300 focus:border-pink-400"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        {formData.gender === "Female" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Is Pregnant?</label>
            <div className="mt-1 flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isPregnant"
                  value="true"
                  checked={formData.isPregnant === true}
                  onChange={handleChange}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isPregnant"
                  value="false"
                  checked={formData.isPregnant === false}
                  onChange={handleChange}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Color(s) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            {formData.color.map((color) => (
              <span
                key={color}
                className="inline-flex items-center px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-sm"
              >
                {colorOptions.find((opt) => opt.value === color)?.label || color}
                <X size={14} className="ml-1 cursor-pointer" onClick={() => handleColorRemove(color)} />
              </span>
            ))}
          </div>
          <select
            name="color"
            value=""
            onChange={(e) => e.target.value && handleColorAdd(e.target.value)}
            className="mt-2 w-full p-2 border border-gray-200 rounded-xl focus:ring-pink-300 focus:border-pink-400"
          >
            <option value="">Add Color</option>
            {colorOptions
              .filter((opt) => !formData.color.includes(opt.value))
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Governorate <span className="text-red-500">*</span>
          </label>
          <select
            name="location.governorate"
            value={formData.location.governorate}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-200 rounded-xl focus:ring-pink-300 focus:border-pink-400"
            required
          >
            <option value="">Select Governorate</option>
            {governorates.map((option) => (
              <option key={option.toLowerCase()} value={option.toLowerCase()}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Delegation <span className="text-red-500">*</span>
          </label>
          <select
            name="location.delegation"
            value={formData.location.delegation}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-200 rounded-xl focus:ring-pink-300 focus:border-pink-400"
            required
            disabled={!formData.location.governorate}
          >
            <option value="">Select Delegation</option>
            {(
              delegationsByGovernorate[
                formData.location.governorate.charAt(0).toUpperCase() + formData.location.governorate.slice(1)
              ] || []
            ).map((option) => (
              <option key={option.toLowerCase()} value={option.toLowerCase()}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date Found <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-200 rounded-xl focus:ring-pink-300 focus:border-pink-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Photos <span className="text-red-500">*</span>
          </label>
          <div
            className={`flex flex-col items-center p-6 border-2 border-dashed border-[#ffc929]/30 rounded-xl hover:border-[#ffc929]/60 ${animationClass}`}
          >
            <Camera size={32} className="text-[#ffc929] mb-2" />
            <p className="mb-2 text-sm text-gray-600">Drag & drop images or click to upload</p>
            <label
              htmlFor="photos-upload"
              className={`px-4 py-3.5 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] cursor-pointer ${animationClass}`}
              aria-label="Upload photos"
            >
              {isUploading ? <Loader2 size={18} className="inline animate-spin" /> : "Upload Photos"}
              <input
                id="photos-upload"
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          {(existingPhotos.length > 0 || photoPreviews.length > 0) && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Photos:</p>
              <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3">
                {existingPhotos.map((url, index) => (
                  <div key={`existing-${index}`} className="relative h-24 overflow-hidden rounded-xl group">
                    <img
                      src={url}
                      alt={`Existing photo ${index + 1}`}
                      className={`object-cover w-full h-full border-2 border-[#ffc929]/30 group-hover:border-[#ffc929] ${animationClass}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingPhoto(index)}
                      className={`absolute p-1 text-white bg-red-500 rounded-full top-1 right-1 hover:bg-red-600 ${animationClass}`}
                      aria-label={`Remove existing photo ${index + 1}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {photoPreviews.map((url, index) => (
                  <div key={`new-${index}`} className="relative h-24 overflow-hidden rounded-xl group">
                    <img
                      src={url}
                      alt={`New photo ${index + 1}`}
                      className={`object-cover w-full h-full border-2 border-[#ffc929]/30 group-hover:border-[#ffc929] ${animationClass}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewPhoto(index)}
                      className={`absolute p-1 text-white bg-red-500 rounded-full top-1 right-1 hover:bg-red-600 ${animationClass}`}
                      aria-label={`Remove new photo ${index + 1}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {formData.photos.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">{formData.photos.length} new photo(s) uploaded</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          className="mt-1 w-full p-2 border border-gray-200 rounded-xl focus:ring-pink-300 focus:border-pink-400"
          rows={4}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-200 rounded-xl focus:ring-pink-300 focus:border-pink-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-200 rounded-xl focus:ring-pink-300 focus:border-pink-400"
            required
          />
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-pink-600 bg-pink-50 p-3 rounded-xl">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className={`px-4 py-2 text-white bg-gray-800 rounded-xl hover:bg-gray-900 flex items-center gap-2 ${
            submitting ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <PawPrint size={18} />
              Update Report
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default FoundPetUpdateForm;