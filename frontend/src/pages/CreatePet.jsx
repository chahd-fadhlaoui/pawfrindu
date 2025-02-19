import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import axiosInstance from "../utils/axiosInstance";

const CreatePet = () => {
  const navigate = useNavigate();
  const { user, error, loading, clearError, setError,fetchPets  } = useApp();
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
     console.log("📷 Fichier sélectionné:", file); // Vérifier si un fichier est bien sélectionné

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
       console.log("📤 Envoi du FormData:", formData.get("image")); // Vérifier si le fichier est bien ajouté à FormData
       console.log("📤 Envoi du FormData (Nom, Taille, Type):", file.name, file.size, file.type);

       const response = await axiosInstance.post("/api/upload", formData, {
         headers: {
           "Content-Type": "multipart/form-data",
         },
       });
       console.log("🔄 Réponse du serveur:", response.data);

 
       if (response.data.url) {
        
         setFormData((prev) => ({
           ...prev,
           image: response.data.url,
         }));
         setImagePreview(response.data.url);
       }
     } catch (error) {
       clearError();
       // 🚀 Afficher toute l'erreur
    console.error("🚨 Erreur complète d'upload:", error);
    console.error("📤 Réponse du serveur:", error.response);
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
        navigate("/pets");
      }
    } catch (error) {
      clearError();
      setError(error.message || "Error creating pet profile");
    }
  };

  const renderImageUpload = () => (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-4">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Pet preview"
              className="object-cover w-full h-full rounded-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full overflow-hidden bg-gray-100 rounded-full">
              <div className="flex items-center justify-center w-full h-full text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}
          {uploadLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="w-8 h-8 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
            </div>
          )}
        </div>
        <label className="px-4 py-2 text-sm font-medium text-white transition-colors bg-[#ffc929] rounded-lg hover:bg-[#e6b625] cursor-pointer">
          Upload Pet Photo
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadLoading}
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#ffc929]/5 to-pink-50">
      <div className="container flex items-center justify-center min-h-screen p-4 mx-auto">
        <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">
            Add Your Pet
          </h2>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-500 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderImageUpload()}
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Pet Name"
                  className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Race"
                    className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                    value={formData.race}
                    onChange={(e) => handleInputChange("race", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Breed"
                    className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                    value={formData.breed}
                    onChange={(e) => handleInputChange("breed", e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    placeholder="Age (months)"
                    min="0"
                    className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <select
                    className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <select
                    className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
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
                </div>
              </div>
              
              <div>
                <input
                  type="number"
                  placeholder="Fee (if for adoption)"
                  className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                  value={formData.fee}
                  onChange={(e) => handleInputChange("fee", e.target.value)}
                  min="0"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isTrained"
                  className="w-4 h-4 border rounded focus:ring-2 focus:ring-[#ffc929]"
                  checked={formData.isTrained}
                  onChange={(e) => handleInputChange("isTrained", e.target.checked)}
                />
                <label htmlFor="isTrained" className="text-sm text-gray-700">
                  This pet is trained
                </label>
              </div>
              
              <div>
                <textarea
                  placeholder="Description (health, behavior, preferences, etc.)"
                  className="w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-sm font-medium text-white transition-colors bg-[#ffc929] rounded-lg hover:bg-[#e6b625] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffc929] disabled:bg-gray-300"
            >
              {loading ? "Creating Pet Profile..." : "Create Pet Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePet;