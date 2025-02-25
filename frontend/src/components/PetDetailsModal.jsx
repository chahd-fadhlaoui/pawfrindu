// components/PetDetailsModal.jsx
import React, { useState, useEffect } from "react";
import { X, Heart, PawPrint, RotateCcw } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

const PetDetailsModal = ({ pet, onClose, onUnarchive, actionLoading }) => {
  const [ownerName, setOwnerName] = useState("Loading...");
  const [fetchError, setFetchError] = useState(null);

  // Fetch owner details
  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const response = await axiosInstance.get(`/api/user/getUser/${pet.owner}`);
        if (response.data.success && response.data.user) {
          setOwnerName(response.data.user.fullName || "Unknown Owner");
        } else {
          setOwnerName("Unknown Owner");
        }
      } catch (err) {
        setFetchError("Failed to fetch owner details");
        setOwnerName("Error fetching owner");
      }
    };

    if (pet.owner) fetchOwner();
  }, [pet.owner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg p-6 overflow-hidden bg-white border-2 shadow-2xl rounded-2xl border-rose-200">
        {/* Decorative Background with Paws */}
        <div className="absolute inset-0 pointer-events-none">
          <PawPrint className="absolute w-12 h-12 transform text-rose-100 top-2 left-2 opacity-30 rotate-12" />
          <PawPrint className="absolute w-10 h-10 text-pink-100 transform bottom-2 right-2 opacity-30 -rotate-24" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="flex items-center gap-2 text-xl font-bold text-rose-700">
            <Heart className="w-6 h-6 text-rose-500 animate-pulse" />
            {pet.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 transition-all rounded-full hover:text-rose-700 hover:bg-rose-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content with Image and Details */}
        <div className="flex flex-col items-center space-y-4">
          <img
            src={pet.image || "/api/placeholder/150/150"}
            alt={pet.name}
            className="object-cover w-32 h-32 border-4 rounded-full shadow-md border-rose-300"
          />
          <div className="w-full p-4 border bg-rose-50 rounded-xl border-rose-200">
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <p><span className="font-semibold text-rose-600">Owner:</span> {ownerName}</p>
              <p><span className="font-semibold text-rose-600">Breed:</span> {pet.breed}</p>
              <p><span className="font-semibold text-rose-600">Age:</span> {pet.age}</p>
              <p><span className="font-semibold text-rose-600">City:</span> {pet.city}</p>
              <p><span className="font-semibold text-rose-600">Gender:</span> {pet.gender}</p>
              <p><span className="font-semibold text-rose-600">Species:</span> {pet.species}</p>
              <p><span className="font-semibold text-rose-600">Fee:</span> {pet.fee === 0 ? "Free" : `${pet.fee}dt`}</p>
              <p><span className="font-semibold text-rose-600">Trained:</span> {pet.isTrained ? "Yes" : "No"}</p>
              <p><span className="font-semibold text-rose-600">Status:</span> {pet.status}{pet.isArchived ? " (Archived)" : ""}</p>
            </div>
            <div className="mt-4">
              <p className="font-semibold text-rose-600">Description:</p>
              <p className="italic text-gray-600">{pet.description}</p>
            </div>
            {fetchError && <p className="mt-2 text-red-600">{fetchError}</p>}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 transition-all duration-200 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200"
          >
            Cancel
          </button>
          {pet.isArchived && onUnarchive && (
            <button
              onClick={() => onUnarchive(pet._id)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50"
            >
              {actionLoading ? "Unarchiving..." : (
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