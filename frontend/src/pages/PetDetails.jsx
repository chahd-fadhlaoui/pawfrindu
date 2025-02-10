import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Heart, PawPrint, MapPin, Coins } from 'lucide-react';

export default function PetDetails() {
  const { petId } = useParams();
  const { pets, currencySymbol } = useContext(AppContext);

  const [petInfo, setPetInfo] = useState(null);
  
  // Vérifie si les données sont disponibles avant de chercher le pet
  useEffect(() => {
    if (pets && pets.length > 0 && petId) {
      const pet = pets.find((p) => p._id === petId);
      setPetInfo(pet || null);
    }
  }, [pets, petId]);

  // Affichage d'un message de chargement si `petInfo` n'est pas encore prêt
  if (!petInfo) {
    return <p className="text-center text-gray-600">Chargement...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4 relative">
      {/* Décoration de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-24 h-24 text-pink-200 opacity-20">
          <PawPrint size={96} />
        </div>
        <div className="absolute top-1/4 -right-4 w-24 h-24 text-purple-200 opacity-20">
          <PawPrint size={96} />
        </div>
      </div>

      <div className="container mx-auto max-w-4xl relative">
        {/* Section Image et Détails */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-pink-100 flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-1/2 relative">
            <div className="h-96 md:h-full overflow-hidden">
              <img
                src={petInfo.image}
                alt={petInfo.name}
                className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = '/placeholder-animal.png';
                }}
              />
              <div className="absolute top-4 right-4">
                <Heart className="text-white drop-shadow-lg" size={32} />
              </div>
            </div>
          </div>

          {/* Détails */}
          <div className="md:w-1/2 p-6 space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-[#ffc929]">
                {petInfo.name}
              </h1>
              <span className="text-sm text-pink-600 bg-pink-50 px-3 py-1 
              rounded-full border border-pink-100 flex items-center gap-1">
                {petInfo.age}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 items-center text-pink-500">
              <span className="flex items-center gap-1">
                <PawPrint size={16} />
                {petInfo.race} • {petInfo.breed} • {petInfo.gender}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={16} />
                {petInfo.city}
              </span>
            </div>

            <div className="bg-[#DBB2B8]/10 rounded-xl p-6">
              <p className="flex items-center gap-2 text-[#8B5D6B] font-bold mb-3 text-lg">
                <PawPrint size={24} />
                À propos
              </p>
              <p className="text-[#8B5D6B] text-base leading-relaxed">
                {petInfo.description}
              </p>
            </div>

            {/* Fee and Trained Status */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <Coins size={20} />
                <span className="font-bold">
                  {petInfo.fee === "free" ? 'Free' : `${petInfo.fee}${currencySymbol}`}
                </span>
              </div>

              <div className="text-sm text-purple-600 bg-purple-50 px-3 py-1 
              rounded-full border border-purple-100 inline-flex items-center gap-1">
                {petInfo.isTrained ? 'Dressé ✓' : 'Non dressé'}
              </div>
            </div>

            {/* Button */}
            <div className="mt-auto pt-4">
              <button 
                className={`
                  w-full text-center py-3 rounded-full font-bold transition 
                  ${petInfo.fee === "free" 
                    ? "bg-[#ffc929] text-white hover:bg-pink-500" 
                    : "bg-[#ffc929] text-white hover:bg-pink-500"}
                `}
              >
                {petInfo.fee === "free" ? "Apply Now" : "Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}