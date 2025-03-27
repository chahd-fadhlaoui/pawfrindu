import { Bone, Cake, CatIcon, DogIcon, MapPin, PawPrint, User2, XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const PetDetailsModal = ({ pet, onClose, onUnarchive, actionLoading, showOwner = true }) => {
  const [ownerName, setOwnerName] = useState("Loading...");
  const [fetchError, setFetchError] = useState(null);

  // Fetch owner details if needed and showOwner is true
  useEffect(() => {
    const fetchOwner = async () => {
      try {
        if (pet.owner && typeof pet.owner !== "string") {
          const response = await axiosInstance.get(`/api/user/getUser/${pet.owner}`);
          if (response.data.success && response.data.user) {
            setOwnerName(response.data.user.fullName || "Unknown Owner");
          } else {
            setOwnerName("Unknown Owner");
          }
        } else if (pet.owner && typeof pet.owner === "string") {
          setOwnerName(pet.owner);
        } else {
          setOwnerName("N/A");
        }
      } catch (err) {
        setFetchError("Failed to fetch owner details");
        setOwnerName("Error fetching owner");
      }
    };

    if (showOwner) fetchOwner();
    else setOwnerName("N/A");
  }, [pet.owner, showOwner]);

  // Safe pet data with defaults
  const safePet = {
    name: pet.name || "Unknown",
    breed: pet.breed || "Not specified",
    age: pet.age || "Not specified",
    city: pet.city || "Not specified",
    gender: pet.gender || "Not specified",
    species: pet.species || "Not specified",
    fee: pet.fee !== undefined ? pet.fee : 0,
    isTrained: pet.isTrained !== undefined ? pet.isTrained : false,
    status: pet.status || "Unknown",
    description: pet.description || "No description provided",
    image: pet.image || "/api/placeholder/150/150",
  };

  // Species icon mapping
  const SpeciesIcon = {
    Dog: <DogIcon className="inline-block w-5 h-5 mr-1 text-[#ffc929]" />,
    Cat: <CatIcon className="inline-block w-5 h-5 mr-1 text-[#ffc929]" />,
    default: <Bone className="inline-block w-5 h-5 mr-1 text-[#ffc929]" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-xl mx-4 overflow-hidden bg-white rounded-2xl shadow-2xl border-t-4 border-[#ffc929] animate-slideUp">
        {/* Modal Content */}
        <div className="relative z-10 p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <PawPrint className="w-6 h-6 text-[#ffc929]" />
              <h2 className="text-2xl font-bold text-gray-800">
                {safePet.name}
                <span className="ml-2 text-sm text-gray-500">
                  {SpeciesIcon[safePet.species] || SpeciesIcon.default}
                  {safePet.species}
                </span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 rounded-full hover:bg-[#ffc929]/10 hover:text-[#ffc929] transition-all"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Pet Image */}
            <div className="flex flex-col items-center justify-center md:col-span-1">
              <div className="relative w-40 h-40">
                <img
                  src={safePet.image}
                  alt={safePet.name}
                  className="object-cover w-full h-full rounded-xl border-2 border-[#ffc929]/50 shadow-md transition-transform hover:scale-105"
                  onError={(e) => (e.target.src = "/api/placeholder/150/150")}
                />
              </div>
            </div>

            {/* Pet Details */}
            <div className="md:col-span-2 bg-rose-50/30 p-4 rounded-xl border border-[#ffc929]/20">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {showOwner && (
                  <div className="flex items-center space-x-2">
                    <User2 className="w-5 h-5 text-[#ffc929]" />
                    <div>
                      <p className="font-semibold text-gray-700">Owner</p>
                      <p className="text-gray-600">{ownerName}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Cake className="w-5 h-5 text-[#ffc929]" />
                  <div>
                    <p className="font-semibold text-gray-700">Age</p>
                    <p className="text-gray-600">{safePet.age}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-[#ffc929]" />
                  <div>
                    <p className="font-semibold text-gray-700">City</p>
                    <p className="text-gray-600">{safePet.city}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Bone className="w-5 h-5 text-[#ffc929]" />
                  <div>
                    <p className="font-semibold text-gray-700">Breed</p>
                    <p className="text-gray-600">{safePet.breed}</p>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="p-3 mt-4 bg-white rounded-lg shadow-inner">
                <p className="text-sm font-semibold text-[#ffc929] mb-1">Description</p>
                <p className="text-sm italic text-gray-600">{safePet.description}</p>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-semibold text-[#ffc929]">{safePet.gender}</p>
                </div>
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500">Fee</p>
                  <p className="font-semibold text-[#ffc929]">
                    {safePet.fee === 0 ? "Free" : `${safePet.fee} Dt`}
                  </p>
                </div>
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500">Trained</p>
                  <p className="font-semibold text-[#ffc929]">
                    {safePet.isTrained ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end mt-5 space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-[#ffc929]/30 rounded-lg hover:bg-[#ffc929]/10 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetailsModal;