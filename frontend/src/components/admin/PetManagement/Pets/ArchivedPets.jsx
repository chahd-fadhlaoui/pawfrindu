import React, { useEffect, useState } from "react";
import { Loader2, PawPrint, X, Archive, Search } from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";
import { PaginationControls } from "../../common/PaginationControls";
import { FilterSelect } from "../common/FilterSelect";
import PetTable from "../common/PetTable";
import { ErrorAlert } from "../../common/ErrorAlert";
import ConfirmationModal from "../../../ConfirmationModal";
import { useApp } from "../../../../context/AppContext";
import EmptyState from "../common/EmptyState";

const ArchivedPets = ({ showHeader = true, onPetChange }) => {
  const { pets, loading, error, user: currentUser, updatePets } = useApp();
  const [filteredPets, setFilteredPets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPets, setSelectedPets] = useState([]);
  const [actionError, setActionError] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const petsPerPage = 5;

  const speciesOptions = [
    { value: "", label: "All Species" },
    { value: "dog", label: "Dog" },
    { value: "cat", label: "Cat" },
    { value: "bird", label: "Bird" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    let filtered = pets.filter((pet) => pet.isArchived);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (pet) =>
          (pet.name || "").toLowerCase().includes(query) ||
          (pet.breed || "").toLowerCase().includes(query) ||
          (pet.city || "").toLowerCase().includes(query) ||
          (pet.species || "").toLowerCase().includes(query)
      );
    }

    if (speciesFilter) {
      filtered = filtered.filter(
        (pet) => (pet.species || "").toLowerCase() === speciesFilter.toLowerCase()
      );
    }

    setFilteredPets(filtered);
    setCurrentPage(1);
    setSelectedPets([]);
  }, [pets, searchQuery, speciesFilter]);

  const totalPages = Math.ceil(filteredPets.length / petsPerPage);
  const currentPets = filteredPets.slice(
    (currentPage - 1) * petsPerPage,
    currentPage * petsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedPets([]);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSpeciesFilter("");
    setCurrentPage(1);
    setSelectedPets([]);
  };

  const togglePetSelection = (petId) => {
    setSelectedPets((prev) =>
      prev.includes(petId) ? prev.filter((id) => id !== petId) : [...prev, petId]
    );
  };

  const toggleSelectAll = () => {
    const selectablePets = currentPets
      .filter((pet) => pet.status === "adopted" || pet.status === "sold")
      .map((pet) => pet._id);
    setSelectedPets((prev) =>
      prev.length === selectablePets.length ? [] : selectablePets
    );
  };

  const handleToggleUnarchive = (petId) => {
    setSelectedPetId(petId);
    setConfirmAction("unarchive");
    setIsConfirmModalOpen(true);
  };

  const confirmToggleUnarchive = async () => {
    try {
      await axiosInstance.put(`/api/pet/unarchivePet/${selectedPetId}`);
      updatePets([{ _id: selectedPetId, isArchived: false }]);
      setFilteredPets((prev) => prev.filter((pet) => pet._id !== selectedPetId));
      setSelectedPets((prev) => prev.filter((id) => id !== selectedPetId));
      setIsConfirmModalOpen(false);
      onPetChange?.();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to unarchive pet");
      console.error("Toggle Unarchive Error:", err);
      setIsConfirmModalOpen(false);
    }
  };

  const handleBulkUnarchive = () => {
    if (selectedPets.length === 0) return;
    setConfirmAction("bulkUnarchive");
    setIsConfirmModalOpen(true);
  };

  const confirmBulkUnarchive = async () => {
    try {
      await Promise.all(
        selectedPets.map((petId) => axiosInstance.put(`/api/pet/unarchivePet/${petId}`))
      );
      updatePets(selectedPets.map((petId) => ({ _id: petId, isArchived: false })));
      setFilteredPets((prev) => prev.filter((pet) => !selectedPets.includes(pet._id)));
      setSelectedPets([]);
      setIsConfirmModalOpen(false);
      onPetChange?.();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to bulk unarchive pets");
      console.error("Bulk Unarchive Error:", err);
      setIsConfirmModalOpen(false);
    }
  };

  const handleDeletePet = (petId) => {
    setSelectedPetId(petId);
    setConfirmAction("delete");
    setIsConfirmModalOpen(true);
  };

  const confirmDeletePet = async () => {
    try {
      await axiosInstance.delete(`/api/pet/deleteAdminPet/${selectedPetId}`);
      updatePets([{ _id: selectedPetId, _deleted: true }]);
      setFilteredPets((prev) => prev.filter((pet) => pet._id !== selectedPetId));
      setSelectedPets((prev) => prev.filter((id) => id !== selectedPetId));
      setIsConfirmModalOpen(false);
      onPetChange?.();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete pet");
      console.error("Delete Pet Error:", err);
      setIsConfirmModalOpen(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedPets.length === 0) return;
    setConfirmAction("bulkDelete");
    setIsConfirmModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(
        selectedPets.map((petId) => axiosInstance.delete(`/api/pet/deleteAdminPet/${petId}`))
      );
      updatePets(selectedPets.map((petId) => ({ _id: petId, _deleted: true })));
      setFilteredPets((prev) => prev.filter((pet) => !selectedPets.includes(pet._id)));
      setSelectedPets([]);
      setIsConfirmModalOpen(false);
      onPetChange?.();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to bulk delete pets");
      console.error("Bulk Delete Error:", err);
      setIsConfirmModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <PawPrint className="w-8 h-8 text-pink-500 animate-pulse" />
          <p className="text-lg font-semibold text-gray-700">Loading archived pets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl">
        <ErrorAlert
          message={error}
          title="Error Loading Archived Pets"
          onDismiss={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="overflow-hidden bg-white shadow-lg rounded-xl animate-fadeIn">
          <div
            className="flex items-center px-4 py-5 border-l-4 sm:px-6"
            style={{ borderImage: "linear-gradient(to bottom, #f59e0b, #ec4899) 1" }}
          >
            <div className="flex items-center flex-1">
              <div className="p-2 bg-pink-100 rounded-lg">
                <PawPrint className="w-6 h-6 text-pink-500" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Archived Pets</h2>
                <p className="text-sm text-gray-500">Manage archived pet listings</p>
              </div>
            </div>
            <span className="px-3 py-1 text-sm font-medium text-white rounded-full bg-gradient-to-r from-yellow-500 to-pink-500">
              {filteredPets.length} Archived
            </span>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="p-4 bg-white shadow-md rounded-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search archived pets by name, breed, city, or species..."
              className="w-full py-3 pl-10 pr-4 text-sm transition-all duration-300 border border-gray-200 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              label="Species"
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              options={speciesOptions}
              className="bg-white border-gray-200 shadow-sm focus:ring-pink-500 focus:border-pink-500"
            />
            {selectedPets.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkUnarchive}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <Archive className="w-4 h-4" />
                  Unarchive ({selectedPets.length})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <X className="w-4 h-4" />
                  Delete ({selectedPets.length})
                </button>
              </div>
            )}
            {(searchQuery || speciesFilter) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 bg-white rounded-lg shadow-sm hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 hover:text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {actionError && (
        <div className="animate-fadeIn">
          <ErrorAlert message={actionError} onDismiss={() => setActionError("")} />
        </div>
      )}

      {/* Pets Table or Empty State */}
      {filteredPets.length === 0 ? (
        <EmptyState
          hasFilters={searchQuery || speciesFilter}
          onClearFilters={resetFilters}
          customMessage={
            searchQuery || speciesFilter
              ? "Try adjusting your search or filters"
              : "No archived pets found. Check other tabs."
          }
        />
      ) : (
        <>
          <div className="bg-white shadow-xl rounded-xl animate-fadeIn">
            <div className="p-4 sm:p-6">
              <PetTable
                pets={currentPets}
                selectedPets={selectedPets}
                currentUser={currentUser}
                onToggleSelection={togglePetSelection}
                onToggleSelectAll={toggleSelectAll}
                customActions={(pet) => (
                  <div className="flex items-center justify-end gap-2">
                    {(pet.owner?._id === currentUser?._id || currentUser?.role === "Admin") && (
                      <>
                        <button
                          onClick={() => handleToggleUnarchive(pet._id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white transition-all duration-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <Archive className="w-3 h-3" />
                          Unarchive
                        </button>
                        <button
                          onClick={() => handleDeletePet(pet._id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white transition-all duration-300 rounded-lg shadow-sm bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                          <X className="w-3 h-3" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
                title="Archived Pets"
                showHeader={false} // Header handled above
                bulkAction="archive" // Only "adopted" or "sold" pets are eligible
              />
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={petsPerPage}
              />
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={
          confirmAction === "unarchive"
            ? confirmToggleUnarchive
            : confirmAction === "delete"
            ? confirmDeletePet
            : confirmAction === "bulkUnarchive"
            ? confirmBulkUnarchive
            : confirmBulkDelete
        }
        action={
          confirmAction === "unarchive" || confirmAction === "bulkUnarchive"
            ? "unarchive"
            : "delete"
        }
        itemName={
          confirmAction === "bulkUnarchive" || confirmAction === "bulkDelete"
            ? `${selectedPets.length} pet${selectedPets.length > 1 ? "s" : ""}`
            : filteredPets.find((p) => p._id === selectedPetId)?.name || "this pet"
        }
      />
    </div>
  );
};

export default ArchivedPets;