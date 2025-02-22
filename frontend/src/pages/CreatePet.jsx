import {
  ArrowLeft,
  Calendar,
  MapPin,
  PawPrint,
  Star,
  Zap
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../components/ImageUpload";
import { useApp } from "../context/AppContext";
import axiosInstance from '../utils/axiosInstance';

const PawIcon = ({ className, style }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    style={style}
    fill="currentColor"
  >
    <path d="M12,17.5c2.33,2.33,5.67,2.33,8,0s2.33-5.67,0-8s-5.67-2.33-8,0S9.67,15.17,12,17.5z M7.5,14.5 c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S9.46,12.54,7.5,14.5z M18.5,3.5c-1.96-1.96-4.04-1.96-6,0s-1.96,4.04,0,6 s4.04,1.96,6,0S20.46,5.46,18.5,3.5z M3.5,9.5c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S5.46,7.54,3.5,9.5z" />
  </svg>
);

const CreatePet = () => {
  const navigate = useNavigate();
  const { user, error, loading, clearError, setError, fetchPets } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    race: "",
    breed: "",
    age: "",
    city: "",
    gender: "male",
    category: "dog",
    fee: "0",
    isTrained: false,
    image: "",
    description: "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  // Background paw prints
  const PawBackground = () => {
    return Array(8)
      .fill(null)
      .map((_, index) => (
        <PawIcon
          key={index}
          className={`
          absolute w-8 h-8 opacity-5
          animate-float
          ${index % 2 === 0 ? "text-[#ffc929]" : "text-pink-300"}
          ${
            index % 3 === 0
              ? "top-1/4"
              : index % 3 === 1
              ? "top-1/2"
              : "top-3/4"
          }
          ${
            index % 4 === 0
              ? "left-1/4"
              : index % 4 === 1
              ? "left-1/2"
              : "left-3/4"
          }
        `}
          style={{
            animationDelay: `${index * 0.5}s`,
            transform: `rotate(${index * 45}deg)`,
          }}
        />
      ));
  };

  const handleImageSelected = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Pet name is required");
      return false;
    }
    if (!formData.race.trim()) {
      setError("Race is required");
      return false;
    }
    if (!formData.breed.trim()) {
      setError("Breed is required");
      return false;
    }
    if (!formData.city.trim()) {
      setError("City is required");
      return false;
    }
    if (!formData.age || isNaN(formData.age) || formData.age < 0) {
      setError("Please enter a valid age");
      return false;
    }
    if (!formData.image) {
      setError("Please upload a pet image");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Please provide a description");
      return false;
    }
    return true;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    try {
      if (!user) {
        throw new Error("You must be logged in to create a pet profile");
      }

      const petData = {
        ...formData,
        age: Number(formData.age),
        fee: Number(formData.fee),
        isTrained: Boolean(formData.isTrained),
      };

      const result = await axiosInstance.post("/api/pet/addpet", petData);

      if (result.data) {
        await fetchPets();
        navigate("/list");
      }
    } catch (error) {
      clearError();
      setError(error.response?.data?.message || "Error creating pet profile");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-white to-pink-50">
        <div className="absolute inset-0 overflow-hidden">
          <PawBackground />
        </div>
        <div className="relative text-center">
          <PawPrint
            size={48}
            className="mx-auto text-[#ffc929] animate-bounce"
          />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 py-6 overflow-hidden bg-gradient-to-b from-white to-pink-50 sm:py-12">
      <div className="absolute inset-0 overflow-hidden">
        <PawBackground />
      </div>

      {/* Blob Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#ffc929] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob-reverse" />

      <div className="container relative max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-[#ffc929]/20 flex flex-col md:flex-row transform hover:scale-[1.01] transition-all duration-300">
          {/* Return Button */}
          <button
            onClick={() => navigate(-1)}
            className="fixed top-4 left-4 z-50 group flex items-center gap-2 bg-white/80 backdrop-blur-sm 
          px-4 py-2 rounded-full shadow-lg border-2 border-[#ffc929]/20 
          hover:border-[#ffc929] transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 text-[#ffc929] transition-transform duration-300 transform group-hover:-translate-x-1" />
            <span className="text-gray-700 group-hover:text-[#ffc929] transition-colors duration-300">
              Back
            </span>
          </button>
          <div className="relative md:w-1/2">
            <ImageUpload
              currentImage={formData.image}
              onImageSelected={handleImageSelected}
              className="h-96 md:h-full"
              maxSize={5}
              showRemove={true}
              onRemove={() => handleImageSelected("")}
            />
          </div>

          <div className="flex flex-col p-6 space-y-6 md:w-1/2 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    placeholder="Pet Name"
                    className="text-3xl font-bold text-gray-900 placeholder-gray-400 bg-transparent border-none focus:outline-none focus:ring-0"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-gray-600">
                  <div className="flex items-center gap-2 bg-[#ffc929]/10 px-3 py-1.5 rounded-full border border-[#ffc929]/20">
                    <PawPrint size={14} />
                    <input
                      type="text"
                      placeholder="Race"
                      className="w-24 placeholder-gray-400 bg-transparent border-none focus:outline-none focus:ring-0"
                      value={formData.race}
                      onChange={(e) =>
                        handleInputChange("race", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-[#ffc929]/10 px-3 py-1.5 rounded-full border border-[#ffc929]/20">
                    <Star size={14} />
                    <input
                      type="text"
                      placeholder="Breed"
                      className="w-24 placeholder-gray-400 bg-transparent border-none focus:outline-none focus:ring-0"
                      value={formData.breed}
                      onChange={(e) =>
                        handleInputChange("breed", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-[#ffc929]/10 px-3 py-1.5 rounded-full border border-[#ffc929]/20">
                    <MapPin size={14} />
                    <input
                      type="text"
                      placeholder="City"
                      className="w-24 placeholder-gray-400 bg-transparent border-none focus:outline-none focus:ring-0"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#ffc929]/5 to-pink-50 rounded-2xl p-6">
                <p className="flex items-center gap-2 mb-3 text-lg font-bold text-gray-900">
                  <PawPrint size={24} className="text-[#ffc929]" />
                  About
                </p>
                <textarea
                  placeholder="Tell us about your pet..."
                  className="w-full h-32 p-3 text-base leading-relaxed text-gray-600 bg-white/50 rounded-xl border-2 border-[#ffc929]/20 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  required
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-[#ffc929]/10 border-[#ffc929]/20">
                  <Calendar size={18} />
                  <input
                    type="number"
                    placeholder="Age"
                    className="w-16 placeholder-gray-400 bg-transparent border-none focus:outline-none focus:ring-0"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-[#ffc929]/10 border-[#ffc929]/20">
                  <Zap size={18} />
                  <select
                    className="bg-transparent border-none focus:outline-none focus:ring-0"
                    value={formData.isTrained}
                    onChange={(e) =>
                      handleInputChange("isTrained", e.target.value === "true")
                    }
                  >
                    <option value="true">Trained</option>
                    <option value="false">Not Trained</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-[#ffc929]/10 border-[#ffc929]/20">
                  <select
                    className="bg-transparent border-none focus:outline-none focus:ring-0"
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-[#ffc929]/10 border-[#ffc929]/20">
                  <select
                    className="bg-transparent border-none focus:outline-none focus:ring-0"
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitLoading}
                className={`w-full text-center py-4 rounded-xl font-bold text-white
                  transition-all duration-300 transform hover:scale-105
                  bg-gradient-to-r from-[#ffc929] to-[#ffa726] hover:from-[#ffa726] hover:to-[#ffc929]
                  shadow-lg shadow-[#ffc929]/20 hover:shadow-xl hover:shadow-[#ffc929]/30
                  ${submitLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {submitLoading ? "Creating..." : "Create Pet Profile"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePet;
