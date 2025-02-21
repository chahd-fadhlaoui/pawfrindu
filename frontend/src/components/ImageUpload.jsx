import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const ImageUpload = ({ currentImage, onImageSelected, loading, className = '' }) => {
  const [preview, setPreview] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentImage) {
      setPreview(currentImage);
    }
  }, [currentImage]);

  const clearError = () => setError('');

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
        setPreview(response.data.url);
        onImageSelected(response.data.url);
      }
    } catch (error) {
      clearError();
      setError(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`relative overflow-hidden bg-gray-100 rounded-lg group ${className}`}>
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="absolute inset-0 object-contain w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            No image selected
          </div>
        )}

        <label className="absolute inset-0 flex items-center justify-center transition-all duration-300 cursor-pointer bg-black/0 group-hover:bg-black/50">
          <div className="hidden group-hover:flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-[#ffc929] hover:bg-[#e6b625]">
            <Upload size={16} />
            <span>{uploadLoading ? "Uploading..." : preview ? "Change Photo" : "Upload Pet Photo"}</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={loading || uploadLoading}
            />
          </div>
        </label>
      </div>

      {error && (
        <div className="p-4 text-red-500 bg-red-100 rounded-lg">
          {error}
          <button 
            onClick={clearError}
            className="float-right text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;