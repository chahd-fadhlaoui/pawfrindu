import React, { useState, useEffect } from "react";
import { X, Heart, PawPrint, RotateCcw } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

const PetDetailsModal = ({ pet, onClose, onUnarchive, actionLoading, showOwner = true }) => {
  const [ownerName, setOwnerName] = useState("Loading...");
  const [fetchError, setFetchError] = useState(null);

  // Fetch owner details if needed and showOwner is true
  useEffect(() => {
    const fetchOwner = async () => {
      try {
        if (pet.owner && typeof pet.owner !== "string") {
          // If owner is an ObjectId (from PetPostsTab or similar)
          const response = await axiosInstance.get(`/api/user/getUser/${pet.owner}`);
          if (response.data.success && response.data.user) {
            setOwnerName(response.data.user.fullName || "Unknown Owner");
          } else {
            setOwnerName("Unknown Owner");
          }
        } else if (pet.owner && typeof pet.owner === "string") {
          // If owner is already a string (from AdoptionRequestsTab)
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
    else setOwnerName("N/A"); // No fetch needed if showOwner is false
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
    isArchived: pet.isArchived || false,
  };

  console.log("PetDetailsModal received pet:", pet);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-6 mx-4 overflow-hidden bg-white border-2 shadow-2xl rounded-2xl border-rose-200 animate-fadeIn">
        {/* Decorative Background with Paws */}
        <div className="absolute inset-0 pointer-events-none">
          <PawPrint className="absolute w-12 h-12 transform text-rose-100 top-4 left-4 opacity-20 rotate-12" />
          <PawPrint className="absolute w-10 h-10 text-[#ffc929] transform bottom-4 right-4 opacity-20 -rotate-24" />
          <div className="absolute inset-0 opacity-50 bg-gradient-to-br from-rose-50 to-pink-50"></div>
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between mb-6">
          <h3 className="flex items-center gap-2 text-2xl font-bold text-rose-700">
            <Heart className="w-6 h-6 text-[#ffc929] animate-pulse" />
            {safePet.name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 transition-all rounded-full hover:text-rose-700 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center space-y-6">
          <div className="relative w-36 h-36">
            <img
              src={safePet.image}
              alt={safePet.name}
              className="object-cover w-full h-full border-4 rounded-full shadow-lg border-[#ffc929]"
              onError={(e) => (e.target.src = "/api/placeholder/150/150")}
            />
            <Heart className="absolute w-8 h-8 opacity-75 text-rose-500 bottom-2 right-2 animate-pulse" />
          </div>
          <div className="w-full p-4 bg-white border shadow-inner rounded-xl border-rose-200">
            <div className="grid grid-cols-1 gap-3 text-gray-700 sm:grid-cols-2">
              {showOwner && (
                <p>
                  <span className="font-semibold text-rose-600">Owner:</span> {ownerName}
                </p>
              )}
              <p>
                <span className="font-semibold text-rose-600">Breed:</span> {safePet.breed}
              </p>
              <p>
                <span className="font-semibold text-rose-600">Age:</span> {safePet.age}
              </p>
              <p>
                <span className="font-semibold text-rose-600">City:</span> {safePet.city}
              </p>
              <p>
                <span className="font-semibold text-rose-600">Gender:</span> {safePet.gender}
              </p>
              <p>
                <span className="font-semibold text-rose-600">Species:</span> {safePet.species}
              </p>
              <p>
                <span className="font-semibold text-rose-600">Fee:</span>{" "}
                {safePet.fee === 0 ? "Free" : `${safePet.fee} Dt`}
              </p>
              <p>
                <span className="font-semibold text-rose-600">Trained:</span>{" "}
                {safePet.isTrained ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-semibold text-rose-600">Status:</span>{" "}
                {safePet.status}
                {safePet.isArchived ? " (Archived)" : ""}
              </p>
            </div>
            <div className="mt-4">
              <p className="font-semibold text-rose-600">Description:</p>
              <p className="text-sm italic text-gray-600">{safePet.description}</p>
            </div>
            {fetchError && (
              <p className="mt-2 text-sm text-red-600">{fetchError}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="relative flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 transition-all duration-200 rounded-lg text-rose-700 bg-rose-100 hover:bg-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            Close
          </button>
          {safePet.isArchived && onUnarchive && (
            <button
              onClick={() => onUnarchive(pet._id)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-[#ffc929] to-rose-500 hover:from-rose-500 hover:to-[#ffc929] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              {actionLoading ? (
                "Unarchiving..."
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Unarchive
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetDetailsModal;