import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Heart, PawPrint, MapPin, Coins, Zap, Calendar, Star, ArrowLeft } from 'lucide-react';
import PetApplicationForm from "../components/PetApplicationForm";

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

export default function PetDetails() {
  const navigate = useNavigate();
  const { petId } = useParams();
  const { pets, currencySymbol } = useContext(AppContext);
  const [petInfo, setPetInfo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (pets && pets.length > 0 && petId) {
      const pet = pets.find((p) => p._id === petId);
      setPetInfo(pet || null);
    }
  }, [pets, petId]);

  const handleApplyNowClick = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const PawBackground = () => {
    return Array(8).fill(null).map((_, index) => (
      <PawIcon
        key={index}
        className={`
          absolute w-8 h-8 opacity-5
          animate-float
          ${index % 2 === 0 ? 'text-[#ffc929]' : 'text-pink-300'}
          ${index % 3 === 0 ? "top-1/4" : index % 3 === 1 ? "top-1/2" : "top-3/4"}
          ${index % 4 === 0 ? "left-1/4" : index % 4 === 1 ? "left-1/2" : "left-3/4"}
        `}
        style={{
          animationDelay: `${index * 0.5}s`,
          transform: `rotate(${index * 45}deg)`,
        }}
      />
    ));
  };

  if (!petInfo) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-white to-pink-50">
        <div className="absolute inset-0 overflow-hidden">
          <PawBackground />
        </div>
        <div className="relative text-center">
          <PawPrint size={48} className="mx-auto text-[#ffc929] animate-bounce" />
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
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#ffc929] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob-reverse" />

      <div className="container relative max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-[#ffc929]/20 flex flex-col md:flex-row transform hover:scale-[1.01] transition-all duration-300">
          <div className="relative md:w-1/2 group">
            <button
              onClick={() => navigate(-1)}
              className="fixed top-4 left-4 z-50 group flex items-center gap-2 bg-white/80 backdrop-blur-sm 
              px-4 py-2 rounded-full shadow-lg border-2 border-[#ffc929]/20 
              hover:border-[#ffc929] transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 text-[#ffc929] transition-transform duration-300 transform group-hover:-translate-x-1" />
              <span className="text-gray-700 group-hover:text-[#ffc929] transition-colors duration-300">Back</span>
            </button>
            <div className="h-96 md:h-full overflow-hidden bg-gradient-to-br from-[#ffc929]/5 to-pink-50/5">
              <img
                src={petInfo.image}
                alt={petInfo.name}
                className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = '/placeholder-animal.png';
                }}
              />
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className="absolute p-2 transition-all duration-300 transform rounded-full top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-110 group/heart"
              >
                <Heart 
                  className={`transition-colors duration-300 ${isLiked ? 'fill-[#ffc929] text-[#ffc929]' : 'text-gray-400'} 
                  group-hover/heart:text-[#ffc929]`} 
                  size={24} 
                />
              </button>
            </div>
          </div>

          <div className="flex flex-col p-6 space-y-6 md:w-1/2 md:p-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 hover:text-[#ffc929] transition-colors duration-300">
                  {petInfo.name}
                </h1>
                <span className="text-sm text-gray-600 bg-[#ffc929]/10 px-4 py-2 
                rounded-full border border-[#ffc929]/20 flex items-center gap-2 transition-all duration-300 hover:bg-[#ffc929]/20">
                  <Calendar size={14} />
                  {petInfo.age} years
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-gray-600">
                <span className="flex items-center gap-2 bg-[#ffc929]/10 px-3 py-1.5 rounded-full
                  border border-[#ffc929]/20 transition-all duration-300 hover:bg-[#ffc929]/20">
                  <PawPrint size={14} />
                  {petInfo.race}
                </span>
                <span className="flex items-center gap-2 bg-[#ffc929]/10 px-3 py-1.5 rounded-full
                  border border-[#ffc929]/20 transition-all duration-300 hover:bg-[#ffc929]/20">
                  <Star size={14} />
                  {petInfo.breed}
                </span>
                <span className="flex items-center gap-2 bg-[#ffc929]/10 px-3 py-1.5 rounded-full
                  border border-[#ffc929]/20 transition-all duration-300 hover:bg-[#ffc929]/20">
                  <MapPin size={14} />
                  {petInfo.city}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#ffc929]/5 to-pink-50 rounded-2xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
              <p className="flex items-center gap-2 mb-3 text-lg font-bold text-gray-900">
                <PawPrint size={24} className="text-[#ffc929]" />
                About
              </p>
              <p className="text-base leading-relaxed text-gray-600">
                {petInfo.description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-100 rounded-full bg-green-50">
                <Coins size={18} />
                <span className="font-medium">
                  {petInfo.fee === 0 ? 'Free' : `${petInfo.fee}${currencySymbol}`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[#ffc929] bg-[#ffc929]/10 px-4 py-2 
                rounded-full border border-[#ffc929]/20">
                <Zap size={18} />
                <span className="font-medium">
                  {petInfo.isTrained ? 'Trained' : 'Not Trained'}
                </span>
              </div>
            </div>

            <div className="pt-4 mt-auto">
              <button
                className={`
                  w-full text-center py-4 rounded-xl font-bold text-white
                  transition-all duration-300 transform hover:scale-105
                  ${petInfo.fee === 0
                    ? "bg-gradient-to-r from-[#ffc929] to-[#ffa726] hover:from-[#ffa726] hover:to-[#ffc929]"
                    : "bg-gradient-to-r from-[#ffc929] to-[#ffa726] hover:from-[#ffa726] hover:to-[#ffc929]"}
                  shadow-lg shadow-[#ffc929]/20 hover:shadow-xl hover:shadow-[#ffc929]/30
                `}
                onClick={petInfo.fee === 0 ? handleApplyNowClick : null}
              >
                {petInfo.fee === 0 ? "Apply Now" : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Passer petId explicitement */}
      {showForm && (
        <PetApplicationForm 
          petId={petInfo._id} 
          petName={petInfo.name} 
          petImage={petInfo.image} 
          onClose={handleCloseForm} 
        />
      )}
    </div>
  );
}