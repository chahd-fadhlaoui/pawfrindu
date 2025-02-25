// components/admin/ArchivedPetsTable.jsx
import { useEffect, useState } from "react";
import { Loader2, PawPrint, Heart, Eye, RotateCcw, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import axiosInstance from "../../utils/axiosInstance";
import ConfirmationModal from "../ConfirmationModal"; // Import the new modal

const ArchivedPetsTable = () => {
  const { fetchPets, loading, error, pets } = useApp();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: '', petId: null, petName: '' }); // Confirmation state

  useEffect(() => {
    fetchPets(true);
  }, [fetchPets]);

  const handleUnarchive = async (petId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const response = await axiosInstance.put(`/api/pet/unarchivePet/${petId}`);
      if (response.data.success) {
        await fetchPets(true);
        setSelectedPet(null);
      } else {
        throw new Error(response.data.message || "Failed to unarchive pet");
      }
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to unarchive pet");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewInfo = (pet) => {
    setSelectedPet(pet);
  };

  const archivedPets = pets.filter(pet => pet.isArchived);

  // Confirmation handlers
  const openConfirmModal = (action, petId, petName) => {
    setConfirmModal({ isOpen: true, action, petId, petName });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, action: '', petId: null, petName: '' });
  };

  const confirmAction = () => {
    const { action, petId } = confirmModal;
    if (action === "unarchive") {
      handleUnarchive(petId);
    }
    closeConfirmModal();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-12 space-y-4 bg-white shadow-lg rounded-xl">
        <div className="relative">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
          <PawPrint className="absolute bottom-0 right-0 w-4 h-4 text-rose-400 animate-bounce" />
        </div>
        <p className="font-medium text-rose-600">Loading archived pets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 border-2 border-red-200 bg-red-50 rounded-xl">
        <p className="font-medium text-center text-red-600">Error loading archived pets: {error}</p>
      </div>
    );
  }

  if (!archivedPets.length) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-12 space-y-4 bg-white shadow-lg rounded-xl">
        <div className="relative">
          <PawPrint className="w-12 h-12 text-rose-300" />
          <Heart className="absolute w-6 h-6 text-rose-400 -top-2 -right-2 animate-pulse" />
        </div>
        <p className="font-medium text-rose-600">No archived pets found</p>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case "accepted":
        return {
          icon: Heart,
          text: "Accepted",
          bgClass: "bg-gradient-to-r from-rose-100 to-pink-100",
          textClass: "text-rose-700",
          iconClass: "text-rose-500",
          borderClass: "border-rose-200",
        };
      case "adopted":
      case "sold":
        return {
          icon: Heart,
          text: status.charAt(0).toUpperCase() + status.slice(1),
          bgClass: "bg-gradient-to-r from-green-100 to-teal-100",
          textClass: "text-green-700",
          iconClass: "text-green-500",
          borderClass: "border-green-200",
        };
      default: // pending
        return {
          icon: Clock,
          text: "En Attente",
          bgClass: "bg-gradient-to-r from-amber-50 to-yellow-50",
          textClass: "text-amber-700",
          iconClass: "text-amber-500",
          borderClass: "border-amber-200",
        };
    }
  };

  const PetDetailsModal = ({ pet, onClose, onUnarchive, actionLoading }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative w-full max-w-lg p-6 overflow-hidden bg-white border-2 shadow-2xl rounded-2xl border-rose-200">
          <div className="absolute inset-0 pointer-events-none"><PawPrint className="absolute w-12 h-12 transform text-rose-100 top-2 left-2 opacity-30 rotate-12" /><PawPrint className="absolute w-10 h-10 text-pink-100 transform bottom-2 right-2 opacity-30 -rotate-24" /></div>
          <div className="flex items-center justify-between mb-6"><h3 className="flex items-center gap-2 text-xl font-bold text-rose-700"><Heart className="w-6 h-6 text-rose-500 animate-pulse" />{pet.name}</h3><button onClick={onClose} className="p-1 text-gray-500 transition-all rounded-full hover:text-rose-700 hover:bg-rose-100"><X className="w-5 h-5" /></button></div>
          <div className="flex flex-col items-center space-y-4"><img src={pet.image || "/api/placeholder/150/150"} alt={pet.name} className="object-cover w-32 h-32 border-4 rounded-full shadow-md border-rose-300" /><div className="w-full p-4 border bg-rose-50 rounded-xl border-rose-200"><div className="grid grid-cols-2 gap-4 text-gray-700"><p><span className="font-semibold text-rose-600">Owner:</span> {pet.owner?.fullName || "Unknown"}</p><p><span className="font-semibold text-rose-600">Breed:</span> {pet.breed}</p><p><span className="font-semibold text-rose-600">Age:</span> {pet.age}</p><p><span className="font-semibold text-rose-600">City:</span> {pet.city}</p><p><span className="font-semibold text-rose-600">Gender:</span> {pet.gender}</p><p><span className="font-semibold text-rose-600">Species:</span> {pet.species}</p><p><span className="font-semibold text-rose-600">Fee:</span> {pet.fee === 0 ? "Free" : `${pet.fee}dt`}</p><p><span className="font-semibold text-rose-600">Trained:</span> {pet.isTrained ? "Yes" : "No"}</p><p><span className="font-semibold text-rose-600">Status:</span> {pet.status} (Archived)</p></div><div className="mt-4"><p className="font-semibold text-rose-600">Description:</p><p className="italic text-gray-600">{pet.description}</p></div></div></div>
          <div className="flex justify-end gap-4 mt-6"><button onClick={onClose} className="px-4 py-2 transition-all duration-200 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200">Cancel</button><button onClick={() => openConfirmModal("unarchive", pet._id, pet.name)} disabled={actionLoading} className="flex items-center gap-2 px-4 py-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50">{actionLoading ? "Unarchiving..." : (<><RotateCcw className="w-4 h-4" />Unarchive</>)}</button></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {actionError && (<div className="flex items-center p-4 space-x-3 border-l-4 border-red-500 rounded-lg bg-red-50"><X className="flex-shrink-0 w-5 h-5 text-red-500" /><p className="text-red-700">{actionError}</p></div>)}
      <div className="overflow-hidden bg-white border-2 shadow-lg rounded-xl border-rose-100"><div className="p-4 border-b-2 bg-gradient-to-r from-rose-50 to-pink-50 border-rose-100"><div className="flex items-center space-x-2"><PawPrint className="w-6 h-6 text-rose-500" /><h2 className="text-lg font-semibold text-rose-700">Archived Pets Table</h2></div></div>
        <div className="overflow-x-auto"><table className="w-full"><thead className="bg-gradient-to-r from-rose-50 to-pink-50"><tr>{["Photo", "Nom", "Breed", "Âge", "Ville", "Genre", "Catégorie", "Tarif", "Dressé", "Status", "Actions"].map((header) => (<th key={header} className="px-4 py-4 text-sm font-semibold text-left text-rose-700">{header}</th>))}</tr></thead>
          <tbody className="divide-y divide-rose-100">{archivedPets.map((pet) => {const statusConfig = getStatusConfig(pet.status);return (<tr key={pet._id} className="transition-all duration-200 hover:bg-rose-50/30"><td className="px-4 py-4"><div className="relative group"><img src={pet.image || "/api/placeholder/48/48"} alt={pet.name} className="object-cover transition-all duration-200 border-2 rounded-full w-14 h-14 border-rose-200 group-hover:border-rose-400" /><div className="absolute inset-0 transition-all duration-200 bg-opacity-0 rounded-full bg-rose-400 group-hover:bg-opacity-10" /><Heart className="absolute w-4 h-4 transition-all duration-200 opacity-0 text-rose-400 -top-1 -right-1 group-hover:opacity-100" /></div></td><td className="px-4 py-4"><p className="font-medium transition-colors text-rose-700 hover:text-rose-900">{pet.name}</p></td><td className="px-4 py-4 text-gray-700">{pet.breed}</td><td className="px-4 py-4 text-gray-700">{pet.age}</td><td className="px-4 py-4 text-gray-700">{pet.city}</td><td className="px-4 py-4 text-gray-700">{pet.gender}</td><td className="px-4 py-4 text-gray-700">{pet.species}</td><td className="px-4 py-4"><span className="font-medium text-rose-600">{pet.fee === 0 ? "Free" : `${pet.fee}dt`}</span></td><td className="px-4 py-4"><span className={`px-3 py-1.5 rounded-full text-sm font-medium ${pet.isTrained ? "bg-pink-100 text-pink-700 ring-1 ring-pink-400" : "bg-rose-100 text-rose-700 ring-1 ring-rose-400"}`}>{pet.isTrained ? "Oui" : "Non"}</span></td><td className="px-4 py-4"><div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${statusConfig.bgClass} border ${statusConfig.borderClass}`}><statusConfig.icon className={`w-4 h-4 ${statusConfig.iconClass}`} /><span className={`text-sm font-medium ${statusConfig.textClass}`}>{statusConfig.text} (Archived)</span></div></td><td className="px-4 py-4"><div className="flex items-center justify-center gap-2"><button onClick={() => openConfirmModal("unarchive", pet._id, pet.name)} disabled={actionLoading} className="p-2 text-blue-500 transition-all duration-200 rounded-full hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed group" title="Unarchive Pet"><RotateCcw className="w-5 h-5 transition-transform group-hover:scale-110" /></button><button onClick={() => handleViewInfo(pet)} className="p-2 text-gray-500 transition-all duration-200 rounded-full hover:text-gray-700 hover:bg-gray-50 group" title="View Pet Info"><Eye className="w-5 h-5 transition-transform group-hover:scale-110" /></button></div></td></tr>);})}</tbody>
        </table></div>
      </div>
      {selectedPet && (<PetDetailsModal pet={selectedPet} onClose={() => setSelectedPet(null)} onUnarchive={handleUnarchive} actionLoading={actionLoading} />)}
      <ConfirmationModal isOpen={confirmModal.isOpen} onClose={closeConfirmModal} onConfirm={confirmAction} action={confirmModal.action} itemName={confirmModal.petName} />
    </div>
  );
};

export default ArchivedPetsTable;