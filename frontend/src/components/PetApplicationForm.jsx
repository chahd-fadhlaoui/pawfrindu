import React, { useState } from "react";
import { X, PawPrint } from 'lucide-react';

export default function PetApplicationForm({ onClose }) {
  const [experience, setExperience] = useState("");
  const [housing, setHousing] = useState("");
  const [occupation, setOccupation] = useState("");
  const [familySize, setFamilySize] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ experience, housing, occupation, familySize });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto my-16 p-6 relative max-h-[95vh] overflow-y-scroll overflow-x-hidden custom-scrollbar">
{/* Decorative Background */}
        <div className="absolute -top-4 -right-4 w-24 h-24 text-pink-200 opacity-20 pointer-events-none">
          <PawPrint size={96} />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <PawPrint className="text-[#ffc929]" size={28} />
          <h2 className="text-2xl font-bold text-[#ffc929]">
            Application Form
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Experience Field */}
          <div className="space-y-2">
            <label 
              className="block text-[#8B5D6B] font-medium" 
              htmlFor="experience"
            >
              Experience:
            </label>
            <textarea
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full p-3 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30 resize-none"
              placeholder="Tell us about your experience with pets..."
              rows="3"
              required
            />
          </div>

          {/* Housing Field */}
          <div className="space-y-2">
            <label 
              className="block text-[#8B5D6B] font-medium" 
              htmlFor="housing"
            >
              Housing:
            </label>
            <select
              id="housing"
              value={housing}
              onChange={(e) => setHousing(e.target.value)}
              className="w-full p-3 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30"
              required
            >
              <option value="">Select housing type</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Occupation Field */}
          <div className="space-y-2">
            <label 
              className="block text-[#8B5D6B] font-medium" 
              htmlFor="occupation"
            >
              Occupation:
            </label>
            <input
              type="text"
              id="occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full p-3 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30"
              placeholder="Your current occupation"
              required
            />
          </div>

          {/* Family Size Field */}
          <div className="space-y-2">
            <label 
              className="block text-[#8B5D6B] font-medium" 
              htmlFor="familySize"
            >
              Family Size:
            </label>
            <input
              type="number"
              id="familySize"
              value={familySize}
              onChange={(e) => setFamilySize(e.target.value)}
              className="w-full p-3 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50/30"
              placeholder="Number of family members"
              min="1"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button 
              type="submit" 
              className="w-full bg-[#ffc929] text-white py-3 rounded-full font-bold hover:bg-pink-500 transition-colors"
            >
              Submit Application
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="w-full bg-gray-100 text-gray-600 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}