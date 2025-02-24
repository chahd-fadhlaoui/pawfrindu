import { useEffect, useState } from "react";
import { Loader2, PawPrint, Heart, Archive, Eye, RotateCcw, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import axiosInstance from "../../utils/axiosInstance";

const ArchivedPetsTable = ({ pets }) => {
  const { fetchPets, loading, error } = useApp();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null); // Pour la modale

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleUnarchive = async (petId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const response = await axiosInstance.put(`/api/pet/unarchivePet/${petId}`);
      if (response.data.success) {
        await fetchPets();
        setSelectedPet(null); // Ferme la modale après succès
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
    setSelectedPet(pet); // Ouvre la modale avec les détails du pet
  };

  // Filtrer pour ne montrer que les pets archivés
  const archivedPets = pets.filter(pet => pet.isArchived);

  if (loading) {
    return (
      <div className="w-full p-12 flex flex-col items-center justify-center space-y-4 bg-white rounded-xl shadow-lg">
        <div className="relative">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
          <PawPrint className="w-4 h-4 text-rose-400 absolute bottom-0 right-0 animate-bounce" />
        </div>
        <p className="text-rose-600 font-medium">Loading archived pets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 bg-red-50 border-2 border-red-200 rounded-xl">
        <p className="text-red-600 text-center font-medium">Error loading archived pets: {error}</p>
      </div>
    );
  }

  if (!archivedPets.length) {
    return (
      <div className="w-full p-12 flex flex-col items-center justify-center space-y-4 bg-white rounded-xl shadow-lg">
        <div className="relative">
          <PawPrint className="w-12 h-12 text-rose-300" />
          <Heart className="w-6 h-6 text-rose-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <p className="text-rose-600 font-medium">No archived pets found</p>
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

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center space-x-3">
          <X className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{actionError}</p>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg border-2 border-rose-100 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-100">
          <div className="flex items-center space-x-2">
            <PawPrint className="w-6 h-6 text-rose-500" />
            <h2 className="text-lg font-semibold text-rose-700">Archived Pets Table</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-rose-50 to-pink-50">
              <tr>
                {[
                  "Photo",
                  "Nom",
                  "Breed",
                  "Âge",
                  "Ville",
                  "Genre",
                  "Catégorie",
                  "Tarif",
                  "Dressé",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <th key={header} className="px-4 py-4 text-left text-sm font-semibold text-rose-700">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100">
              {archivedPets.map((pet) => {
                const statusConfig = getStatusConfig(pet.status);
                return (
                  <tr key={pet._id} className="hover:bg-rose-50/30 transition-all duration-200">
                    <td className="px-4 py-4">
                      <div className="relative group">
                        <img
                          src={pet.image || "/api/placeholder/48/48"}
                          alt={pet.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-rose-200 group-hover:border-rose-400 transition-all duration-200"
                        />
                        <div className="absolute inset-0 bg-rose-400 bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition-all duration-200" />
                        <Heart className="w-4 h-4 text-rose-400 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-rose-700 hover:text-rose-900 transition-colors">
                        {pet.name}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{pet.breed}</td>
                    <td className="px-4 py-4 text-gray-700">{pet.age}</td>
                    <td className="px-4 py-4 text-gray-700">{pet.city}</td>
                    <td className="px-4 py-4 text-gray-700">{pet.gender}</td>
                    <td className="px-4 py-4 text-gray-700">{pet.species}</td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-rose-600">
                        {pet.fee === 0 ? "Free" : `${pet.fee}dt`}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          pet.isTrained
                            ? "bg-pink-100 text-pink-700 ring-1 ring-pink-400"
                            : "bg-rose-100 text-rose-700 ring-1 ring-rose-400"
                        }`}
                      >
                        {pet.isTrained ? "Oui" : "Non"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${statusConfig.bgClass} border ${statusConfig.borderClass}`}
                      >
                        <statusConfig.icon className={`w-4 h-4 ${statusConfig.iconClass}`} />
                        <span className={`text-sm font-medium ${statusConfig.textClass}`}>
                          {statusConfig.text} (Archived)
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleUnarchive(pet._id)}
                          disabled={actionLoading}
                          className="p-2 rounded-full text-blue-500 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                          title="Unarchive Pet"
                        >
                          <RotateCcw className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => handleViewInfo(pet)}
                          className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 group"
                          title="View Pet Info"
                        >
                          <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale améliorée avec thème pet */}
      {selectedPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border-2 border-rose-200 relative overflow-hidden">
            {/* Fond décoratif avec pattes */}
            <div className="absolute inset-0 pointer-events-none">
              <PawPrint className="w-12 h-12 text-rose-100 absolute top-2 left-2 opacity-30 transform rotate-12" />
              <PawPrint className="w-10 h-10 text-pink-100 absolute bottom-2 right-2 opacity-30 transform -rotate-24" />
            </div>

            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-rose-700 flex items-center gap-2">
                <Heart className="w-6 h-6 text-rose-500 animate-pulse" />
                {selectedPet.name}
              </h3>
              <button
                onClick={() => setSelectedPet(null)}
                className="p-1 rounded-full text-gray-500 hover:text-rose-700 hover:bg-rose-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu avec image et détails */}
            <div className="flex flex-col items-center space-y-4">
              <img
                src={selectedPet.image || "/api/placeholder/150/150"}
                alt={selectedPet.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-rose-300 shadow-md"
              />
              <div className="w-full bg-rose-50 p-4 rounded-xl border border-rose-200">
                <div className="grid grid-cols-2 gap-4 text-gray-700">
                  <p><span className="font-semibold text-rose-600">Breed:</span> {selectedPet.breed}</p>
                  <p><span className="font-semibold text-rose-600">Age:</span> {selectedPet.age}</p>
                  <p><span className="font-semibold text-rose-600">City:</span> {selectedPet.city}</p>
                  <p><span className="font-semibold text-rose-600">Gender:</span> {selectedPet.gender}</p>
                  <p><span className="font-semibold text-rose-600">Species:</span> {selectedPet.species}</p>
                  <p><span className="font-semibold text-rose-600">Fee:</span> {selectedPet.fee === 0 ? "Free" : `${selectedPet.fee}dt`}</p>
                  <p><span className="font-semibold text-rose-600">Trained:</span> {selectedPet.isTrained ? "Yes" : "No"}</p>
                  <p><span className="font-semibold text-rose-600">Status:</span> {selectedPet.status}</p>
                </div>
                <div className="mt-4">
                  <p className="font-semibold text-rose-600">Description:</p>
                  <p className="text-gray-600 italic">{selectedPet.description}</p>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setSelectedPet(null)}
                className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUnarchive(selectedPet._id)}
                disabled={actionLoading}
                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
              >
                {actionLoading ? "Unarchiving..." : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Unarchive
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivedPetsTable;