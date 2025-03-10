import { Camera, ImagePlus, Loader2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const ImageUpload = ({ 
  currentImage, 
  onImageSelected, 
  loading, 
  className = '',
  maxSize = 5, // Max size in MB
  showRemove = false, // Option to remove image
  onRemove = () => {}, // Callback when image is removed
}) => {
  const [preview, setPreview] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (currentImage) {
      setPreview(currentImage);
    }
  }, [currentImage]);

  const clearError = () => setError('');

  const validateFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return false;
    }
 
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Image must be less than ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleImageUpload = async (file) => {
    if (!file || !validateFile(file)) return;
 
    setUploadLoading(true);
    clearError();

    try {
      // Create a preview immediately for better UX
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      const formData = new FormData();
      formData.append("image", file);

      const response = await axiosInstance.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          // You could add a progress bar here if needed
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted);
        },
      });
 
      if (response.data.url) {
        setPreview(response.data.url);
        onImageSelected(response.data.url);
        URL.revokeObjectURL(localPreview); // Clean up the local preview
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to upload image");
      setPreview(currentImage); // Revert to previous image on error
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview('');
    onRemove();
  };

  return (
    <div className="w-full h-full space-y-4">
      <div 
        className={`
          relative overflow-hidden rounded-xl border-2 transition-all duration-300
          w-full h-full
          ${className}
          ${isDragging ? 'border-[#ffc929] border-dashed bg-amber-50' : 'border-gray-200'}
          ${loading || uploadLoading ? 'opacity-75' : ''}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Main content area */}
        <div className="absolute inset-0 bg-gray-50">
          {preview ? (
            // Image preview
            <div className="relative w-full h-full group">
              <img
                src={preview}
                alt="Preview"
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
              {/* Enhanced overlay on hover */}
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-sm">
                <div className="px-4 py-2 transition-transform duration-300 transform bg-white rounded-lg shadow-md hover:scale-105">
                  <div className="flex items-center gap-2 text-[#e6b625]">
                    <ImagePlus size={16} />
                    <span className="font-medium">Change Image</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Upload placeholder with improved design
            <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center">
              <div className="p-4 mb-4 rounded-full bg-amber-50">
                <Camera size={36} className="text-[#ffc929]" />
              </div>
              <p className="mb-2 font-medium text-gray-700">Drop your image here</p>
              <p className="max-w-xs text-sm text-gray-500">
                Support for JPG, PNG and GIF files. Max size {maxSize}MB.
              </p>
            </div>
          )}
        </div>

        {/* Loading overlay */}
        {(loading || uploadLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg shadow-md">
              <Loader2 size={28} className="text-[#ffc929] animate-spin" />
              <p className="text-sm font-medium text-gray-600">
                {uploadLoading ? 'Uploading...' : 'Loading...'}
              </p>
            </div>
          </div>
        )}

        {/* Upload/Change button */}
        <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={loading || uploadLoading}
          />
          
          {/* Only show button if there's no preview */}
          {!preview && (
            <div className="px-5 py-2 mt-16 transition-all duration-300 transform rounded-lg shadow-sm hover:shadow-md bg-[#ffc929] hover:bg-[#e6b625]">
              <div className="flex items-center gap-2 font-medium text-white">
                <ImagePlus size={16} />
                <span>Select Image</span>
              </div>
            </div>
          )}
        </label>

        {/* Remove button */}
        {showRemove && preview && (
          <button
            onClick={handleRemove}
            className="absolute p-2 transition-colors duration-300 rounded-full shadow-sm top-3 right-3 bg-white/80 hover:bg-white"
            disabled={loading || uploadLoading}
          >
            <X size={16} className="text-gray-700" />
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="relative p-4 text-sm text-red-600 border border-red-100 rounded-lg shadow-sm bg-red-50">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-red-500 rounded-full min-w-1" />
            <p>{error}</p>
          </div>
          <button 
            onClick={clearError}
            className="absolute p-1 transition-colors duration-300 bg-white border border-red-100 rounded-full -top-2 -right-2 hover:bg-red-50"
          >
            <X size={14} className="text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;