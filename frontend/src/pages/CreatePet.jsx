import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import axiosInstance from "../utils/axiosInstance";
import { PawPrint, Upload, Camera, Heart, MapPin, Info, DollarSign, Check } from "lucide-react";

const CreatePet = () => {
  const navigate = useNavigate();
  const { user, error, loading, clearError, setError, fetchPets } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    race: "",
    breed: "",
    age: "",
    city: "",
    gender: "",
    category: "",
    fee: "",
    isTrained: false,
    image: "",
    description: ""
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "PetOwner") {
      navigate("/");
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
 
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'race', 'breed', 'age', 'city', 'gender', 'category'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
      }
    }
    
    if (!formData.image) {
      throw new Error("Please upload a pet image");
    }
  };

  const createPet = async (petData) => {
    try {
      const response = await axiosInstance.post("/api/pet/addpet", petData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || "Error creating pet");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      if (!user) {
        throw new Error("You must be logged in to create a pet profile");
      }

      validateForm();
      
      const result = await createPet(formData);
      
      if (result.success) {
        await fetchPets();
        navigate("/list");
      }
    } catch (error) {
      clearError();
      setError(error.message || "Error creating pet profile");
    }
  };

  const renderImageUpload = () => (
    <div className="flex flex-col items-center mb-8">
      <div className="relative w-40 h-40 mb-6">
        {imagePreview ? (
          <div className="relative w-full h-full overflow-hidden border-4 border-pink-200 rounded-full shadow-lg">
            <img
              src={imagePreview}
              alt="Pet preview"
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
            />
            <div className="absolute inset-0 border-8 border-white rounded-full border-opacity-30"></div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full overflow-hidden border-4 border-pink-200 border-dashed rounded-full bg-gradient-to-r from-pink-50 to-purple-50">
            <Camera className="w-16 h-16 text-pink-300" />
          </div>
        )}
        {uploadLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black rounded-full bg-opacity-40">
            <div className="w-10 h-10 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
          </div>
        )}
        
        {/* Decorative paw prints */}
        <div className="absolute text-pink-200 transform rotate-45 -top-4 -left-4">
          <PawPrint size={20} />
        </div>
        <div className="absolute text-pink-200 transform -rotate-45 -bottom-4 -right-4">
          <PawPrint size={20} />
        </div>
      </div>
      
      <label className="flex items-center px-5 py-3 space-x-2 text-sm font-medium text-white transition-all duration-300 transform rounded-full cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-lg hover:from-pink-600 hover:to-purple-600 hover:-translate-y-1">
        <Upload size={16} />
        <span>Upload Pet Photo</span>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploadLoading}
        />
      </label>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <PawPrint size={48} className="absolute text-pink-200 transform top-20 left-10 opacity-20 rotate-12" />
        <PawPrint size={36} className="absolute text-purple-200 transform top-40 right-20 opacity-20 -rotate-12" />
        <PawPrint size={64} className="absolute text-pink-200 transform rotate-45 bottom-20 left-40 opacity-10" />
        <PawPrint size={52} className="absolute text-purple-200 transform -rotate-45 bottom-40 right-10 opacity-10" />
      </div>
      
      <div className="container relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <PawPrint size={36} className="mr-3 text-pink-500" />
            <Heart size={24} className="text-pink-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Add Your Furry Friend</h1>
          <p className="mt-2 text-gray-600">Share the details about your special companion</p>
        </div>
        
        <div className="p-8 border-2 border-pink-100 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl">
          {error && (
            <div className="flex items-start p-4 mb-6 text-sm text-red-600 border border-red-100 rounded-xl bg-red-50">
              <Info size={18} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderImageUpload()}
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Pet Name */}
              <div className="md:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Pet Name"
                    className="w-full px-5 py-4 pl-12 text-gray-700 placeholder-gray-400 transition-all border-2 border-pink-100 bg-pink-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                  <Heart size={18} className="absolute text-pink-400 transform -translate-y-1/2 left-4 top-1/2" />
                </div>
              </div>
              
              {/* Race and Breed */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Race"
                  className="w-full px-5 py-4 pl-12 text-gray-700 placeholder-gray-400 transition-all border-2 border-purple-100 bg-purple-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
                  value={formData.race}
                  onChange={(e) => handleInputChange("race", e.target.value)}
                  required
                />
                <PawPrint size={18} className="absolute text-purple-400 transform -translate-y-1/2 left-4 top-1/2" />
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Breed"
                  className="w-full px-5 py-4 pl-12 text-gray-700 placeholder-gray-400 transition-all border-2 border-purple-100 bg-purple-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
                  value={formData.breed}
                  onChange={(e) => handleInputChange("breed", e.target.value)}
                  required
                />
                <PawPrint size={18} className="absolute text-purple-400 transform -translate-y-1/2 left-4 top-1/2" />
              </div>
              
              {/* Age and City */}
              <div className="relative">
                <input
                  type="number"
                  placeholder="Age (months)"
                  min="0"
                  className="w-full px-5 py-4 pl-12 text-gray-700 placeholder-gray-400 transition-all border-2 border-pink-100 bg-pink-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  required
                />
                <span className="absolute font-medium text-pink-400 transform -translate-y-1/2 left-4 top-1/2">
                  #
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="City"
                  className="w-full px-5 py-4 pl-12 text-gray-700 placeholder-gray-400 transition-all border-2 border-pink-100 bg-pink-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                />
                <MapPin size={18} className="absolute text-pink-400 transform -translate-y-1/2 left-4 top-1/2" />
              </div>
              
              {/* Gender and Category */}
              <div className="relative">
                <select
                  className="w-full px-5 py-4 pl-12 text-gray-700 transition-all border-2 border-purple-100 appearance-none bg-purple-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <div className="absolute transform -translate-y-1/2 pointer-events-none right-4 top-1/2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
                <span className="absolute font-medium text-purple-400 transform -translate-y-1/2 left-4 top-1/2">
                  ♂︎
                </span>
              </div>
              
              <div className="relative">
                <select
                  className="w-full px-5 py-4 pl-12 text-gray-700 transition-all border-2 border-purple-100 appearance-none bg-purple-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="fish">Fish</option>
                  <option value="reptile">Reptile</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute transform -translate-y-1/2 pointer-events-none right-4 top-1/2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
                <PawPrint size={18} className="absolute text-purple-400 transform -translate-y-1/2 left-4 top-1/2" />
              </div>
              
              {/* Fee */}
              <div className="relative md:col-span-2">
                <input
                  type="number"
                  placeholder="Fee (if for adoption)"
                  className="w-full px-5 py-4 pl-12 text-gray-700 placeholder-gray-400 transition-all border-2 border-pink-100 bg-pink-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                  value={formData.fee}
                  onChange={(e) => handleInputChange("fee", e.target.value)}
                  min="0"
                />
                 {/* Ajouter le symbole DT */}
    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-pink-400 font-medium mr-[550px]">
      DT
    </span>
                
              </div>
              
              {/* Trained Checkbox */}
              <div className="md:col-span-2">
                <label className="flex items-center p-4 space-x-3 transition-colors border-2 border-purple-100 cursor-pointer bg-purple-50 rounded-xl hover:bg-purple-100">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="isTrained"
                      className="absolute w-6 h-6 opacity-0"
                      checked={formData.isTrained}
                      onChange={(e) => handleInputChange("isTrained", e.target.checked)}
                    />
                    <div className={`border-2 rounded-md w-6 h-6 flex flex-shrink-0 justify-center items-center mr-2 transition-colors ${formData.isTrained ? 'bg-purple-500 border-purple-500' : 'border-purple-300 bg-white'}`}>
                      {formData.isTrained && <Check size={16} className="text-white" />}
                    </div>
                  </div>
                  <span className="text-gray-700">This pet is trained and well-behaved</span>
                </label>
              </div>
              
              {/* Description */}
              <div className="relative md:col-span-2">
                <textarea
                  placeholder="Description (health, behavior, preferences, etc.)"
                  className="w-full px-5 py-4 text-gray-700 bg-purple-50 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all min-h-[120px] placeholder-gray-400"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full px-6 py-4 mt-6 text-base font-medium text-white transition-all duration-300 transform bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl hover:shadow-lg hover:from-pink-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:from-gray-300 disabled:to-gray-400 hover:-translate-y-1"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 mr-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  Creating Pet Profile...
                </>
              ) : (
                <>
                  <PawPrint size={20} className="mr-2" />
                  Create Pet Profile
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Footer decoration */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-1 text-pink-400">
            <PawPrint size={12} />
            <PawPrint size={12} />
            <PawPrint size={12} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePet;