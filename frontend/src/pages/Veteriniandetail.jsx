import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Heart, PawPrint, MapPin, Coins, Clock, Calendar } from 'lucide-react';

export default function Veteriniandetail() {
  const { petId } = useParams();
  const { pets, currencySymbol } = useContext(AppContext);
  const dayOfWeek = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

  const [petInfo, setPetInfo] = useState(null);
  const [Slots, setSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  const fetchPetInfo = async () => {
    const petInfo = pets.find((pet) => pet._id === petId);
    setPetInfo(petInfo);
  };

  const getAvailableSlots = async () => {
    setSlots([]);
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10
        );
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime,
        });

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setSlots((prev) => [...prev, timeSlots]);
    }
  };

  useEffect(() => {
    fetchPetInfo();
  }, [pets, petId]);

  useEffect(() => {
    if (petInfo) {
      getAvailableSlots();
    }
  }, [petInfo]);

  return (
    petInfo && (
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
            <div className="md:w-1/2 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-purple-800">
                  {petInfo.name}
                </h1>
                <span className="text-sm text-pink-600 bg-pink-50 px-3 py-1 
                rounded-full border border-pink-100 flex items-center gap-1">
                  {petInfo.age}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 items-center text-purple-600">
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

              <div className="flex justify-between items-center">
                <span className="text-green-600 flex items-center gap-2">
                  <Coins size={20} />
                  <span className="font-bold">
                    {petInfo.fee}{currencySymbol}
                  </span>
                </span>
                <span className="text-sm text-purple-600 bg-purple-50 px-3 py-1 
                rounded-full border border-purple-100 flex items-center gap-1">
                  {petInfo.isTrained ? 'Dressé ✓' : 'Non dressé'}
                </span>
              </div>
            </div>
          </div>

          {/* Section Réservation */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 mt-8 border-2 border-[#DBB2B8]/30">
            <h2 className="text-2xl font-bold text-[#8B5D6B] mb-4 flex items-center gap-2">
              <Calendar size={24} /> Créneaux de réservation
            </h2>

            {/* Sélection des jours */}
            <div className="flex gap-3 items-center overflow-x-auto pb-4">
              {Slots.length && Slots.map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => setSlotIndex(index)} 
                  className={`text-center p-4 min-w-[80px] rounded-full cursor-pointer transition-all duration-300 ${
                    slotIndex === index 
                      ? 'bg-[#8B5D6B] text-white' 
                      : 'bg-[#DBB2B8]/10 text-[#8B5D6B] hover:bg-[#DBB2B8]/20'
                  }`}
                >
                  <p>{item[0] && dayOfWeek[item[0].datetime.getDay()]}</p>
                  <p>{item[0] && item[0].datetime.getDate()}</p>
                </div>
              ))}
            </div>

            {/* Sélection des heures */}
            <div className="flex gap-3 items-center overflow-x-auto mt-4 pb-4">
              {Slots.length && Slots[slotIndex].map((item, index) => (
                <span 
                  key={index}
                  onClick={() => setSlotTime(item.time)}
                  className={`
                    px-4 py-2 rounded-full cursor-pointer transition-all duration-300 text-sm
                    ${item.time === slotTime 
                      ? 'bg-[#8B5D6B] text-white' 
                      : 'bg-[#DBB2B8]/10 text-[#8B5D6B] hover:bg-[#DBB2B8]/20'
                    }
                  `}
                >
                  <Clock size={16} className="inline-block mr-1" />
                  {item.time.toLowerCase()}
                </span>
              ))}
            </div>

            <button 
              className="
                w-full mt-6 py-3 rounded-full 
                bg-gradient-to-r from-[#DBB2B8] to-[#8B5D6B]
                text-white font-bold 
                hover:from-[#DBB2B8]/90 hover:to-[#8B5D6B]/90
                transition-all duration-300
                flex items-center justify-center gap-2
              "
            >
              <Heart size={20} />
              Réserver un rendez-vous
            </button>
          </div>
        </div>
      </div>
    )
  );
}