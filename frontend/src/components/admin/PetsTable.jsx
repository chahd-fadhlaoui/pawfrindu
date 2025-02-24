import { useEffect, useState } from "react";
import {
  Check,
  X,
  Loader2,
  PawPrint,
  Heart,
  Clock,
  Ban,
  Archive,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import axiosInstance from "../../utils/axiosInstance";

const PetsTable = () => {
  const { pets, fetchPets, loading, error } = useApp();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchPets();
  }, [fetchPets, pets]); // Ajout de pets comme dépendance
  const handleAccept = async (petId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const response = await axiosInstance.put(
        `/api/pet/modifyStatus/${petId}`,
        {
          status: "accepted",
        }
      );
      if (response.data.success) {
        fetchPets();
      } else {
        throw new Error(response.data.message || "Failed to accept pet");
      }
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to accept pet");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (petId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const response = await axiosInstance.delete(
        `/api/pet/deleteAdminPet/${petId}`
      );
      if (response.data.success) {
        fetchPets();
      } else {
        throw new Error(response.data.message || "Failed to process pet");
      }
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to process pet");
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async (petId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const response = await axiosInstance.delete(
        `/api/pet/deleteAdminPet/${petId}`
      );
      if (response.data.success) {
        fetchPets();
      } else {
        throw new Error(response.data.message || "Failed to archive pet");
      }
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to archive pet");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-12 flex flex-col items-center justify-center space-y-4 bg-white rounded-xl shadow-lg">
        <div className="relative">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
          <PawPrint className="w-4 h-4 text-rose-400 absolute bottom-0 right-0 animate-bounce" />
        </div>
        <p className="text-rose-600 font-medium">Loading precious pets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 bg-red-50 border-2 border-red-200 rounded-xl">
        <p className="text-red-600 text-center font-medium">
          Error loading pets: {error}
        </p>
      </div>
    );
  }

  if (!pets?.length) {
    return (
      <div className="w-full p-12 flex flex-col items-center justify-center space-y-4 bg-white rounded-xl shadow-lg">
        <div className="relative">
          <PawPrint className="w-12 h-12 text-rose-300" />
          <Heart className="w-6 h-6 text-rose-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <p className="text-rose-600 font-medium">No pets found</p>
      </div>
    );
  }

  const getStatusConfig = (status, isArchived) => {
    if (isArchived) {
      return {
        icon: Archive,
        text: "Archived",
        bgClass: "bg-gradient-to-r from-gray-100 to-gray-200",
        textClass: "text-gray-700",
        iconClass: "text-gray-500",
        borderClass: "border-gray-300",
      };
    }
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
            <h2 className="text-lg font-semibold text-rose-700">
              Pet Adoption Table
            </h2>
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
                  <th
                    key={header}
                    className="px-4 py-4 text-left text-sm font-semibold text-rose-700"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100">
              {pets.map((pet) => {
                const statusConfig = getStatusConfig(
                  pet.status,
                  pet.isArchived
                );
                const isAccepted = pet.status === "accepted";
                const canArchive =
                  pet.status === "adopted" || pet.status === "sold";

                return (
                  <tr
                    key={pet._id}
                    className="hover:bg-rose-50/30 transition-all duration-200"
                  >
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
                        <span className="font-medium text-rose-600">
                          {pet.fee === 0 ? "Free" : `${pet.fee}dt`}
                        </span>{" "}
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
                        <statusConfig.icon
                          className={`w-4 h-4 ${statusConfig.iconClass}`}
                        />
                        <span
                          className={`text-sm font-medium ${statusConfig.textClass}`}
                        >
                          {statusConfig.text}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAccept(pet._id)}
                          disabled={
                            actionLoading || isAccepted || pet.isArchived
                          }
                          className="p-2 rounded-full text-green-500 hover:text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                          title="Accept Pet"
                        >
                          <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                        {!isAccepted &&
                          (canArchive ? (
                            <button
                              onClick={() => handleArchive(pet._id)}
                              disabled={actionLoading || pet.isArchived}
                              className="p-2 rounded-full text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                              title="Archive Pet"
                            >
                              <Archive className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReject(pet._id)}
                              disabled={actionLoading || pet.isArchived}
                              className="p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                              title="Delete Pet"
                            >
                              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PetsTable;
