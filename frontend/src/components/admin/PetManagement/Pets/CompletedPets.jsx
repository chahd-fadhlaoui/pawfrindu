import { Archive, Loader2, PawPrint, Search, Info } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "../../../../context/AppContext";
import axiosInstance from "../../../../utils/axiosInstance";
import ConfirmationModal from "../../../ConfirmationModal";
import { ErrorAlert } from "../../common/ErrorAlert";
import { PaginationControls } from "../../common/PaginationControls";
import { FilterSelect } from "../common/FilterSelect";
import PetTable from "../common/PetTable";
import EmptyState from "../common/EmptyState";

const CompletedPets = ({ showHeader = true }) => {
  const { user, pets, loading, error, triggerRefresh } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPets, setSelectedPets] = useState([]);
  const [actionError, setActionError] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [bulkAction] = useState("archive"); // Fixed to "archive" as per original
  const [hoveredAction, setHoveredAction] = useState(null);
  const petsPerPage = 10;

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "adopted", label: "Adopted" },
    { value: "sold", label: "Sold" },
  ];

  const filteredPets = useMemo(() => {
    let filtered = pets.filter(
      (pet) => !pet.isArchived && ["adopted", "sold"].includes(pet.status)
    );
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (pet) =>
          (pet.name || "").toLowerCase().includes(query) ||
          (pet.breed || "").toLowerCase().includes(query) ||
          (pet.city || "").toLowerCase().includes(query)
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((pet) => pet.status === statusFilter);
    }
    return filtered;
  }, [pets, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedPets([]);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredPets.length / petsPerPage);
  const currentPets = filteredPets.slice(
    (currentPage - 1) * petsPerPage,
    currentPage * petsPerPage
  );

  const canPerformAction = (pet, action) => {
    if (user?.role !== "Admin") return false;
    return action === "archive" && ["adopted", "sold"].includes(pet.status);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedPets([]);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCurrentPage(1);
    setSelectedPets([]);
  };

  const togglePetSelection = (petId) => {
    const pet = currentPets.find((p) => p._id === petId);
    if (!canPerformAction(pet, bulkAction)) return;
    setSelectedPets((prev) =>
      prev.includes(petId)
        ? prev.filter((id) => id !== petId)
        : [...prev, petId]
    );
  };

  const toggleSelectAll = () => {
    const selectablePets = currentPets
      .filter((pet) => canPerformAction(pet, bulkAction))
      .map((pet) => pet._id);
    setSelectedPets((prev) =>
      prev.length === selectablePets.length ? [] : selectablePets
    );
  };

  const handleAction = async (action, petId) => {
    try {
      setActionError("");
      if (action === "archive") {
        await axiosInstance.put(`/api/pet/archivePet/${petId}`);
      } else {
        throw new Error("Invalid action");
      }
      triggerRefresh();
      setSelectedPets((prev) => prev.filter((id) => id !== petId));
      setIsConfirmModalOpen(false);
    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to ${action} pet`);
      setIsConfirmModalOpen(false);
    }
  };

  const handleSingleAction = (action, petId) => {
    setSelectedPetId(petId);
    setConfirmAction(action);
    setIsConfirmModalOpen(true);
  };

  const handleBulkAction = () => {
    if (selectedPets.length === 0) return;
    setConfirmAction("bulk");
    setIsConfirmModalOpen(true);
  };

  const confirmBulkAction = async () => {
    try {
      const eligiblePets = selectedPets.filter((petId) =>
        canPerformAction(
          filteredPets.find((p) => p._id === petId),
          bulkAction
        )
      );
      if (eligiblePets.length === 0) {
        setActionError(`No pets eligible for ${bulkAction}.`);
        setIsConfirmModalOpen(false);
        return;
      }
      await Promise.all(
        eligiblePets.map((petId) =>
          axiosInstance.put(`/api/pet/archivePet/${petId}`)
        )
      );
      triggerRefresh();
      setSelectedPets([]);
      setIsConfirmModalOpen(false);
    } catch (err) {
      setActionError(
        err.response?.data?.message || `Failed to bulk ${bulkAction} pets`
      );
      setIsConfirmModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#ffc929] animate-spin" />
          <PawPrint className="w-8 h-8 text-[#ec4899] animate-pulse" />
          <p className="text-lg font-semibold text-gray-700">
            Loading completed pets...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl animate-fade-in">
        <ErrorAlert
          message={error}
          title="Error Loading Pets"
          onDismiss={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="overflow-hidden bg-white shadow-lg rounded-xl animate-fade-in">
          <div
            className="flex items-center px-4 py-5 border-l-4 sm:px-6 bg-gradient-to-r from-white to-gray-50"
            style={{
              borderImage: "linear-gradient(to bottom, #f59e0b, #ec4899) 1",
            }}
          >
            <div className="flex items-center flex-1">
              <div className="p-2 rounded-lg shadow-sm bg-pink-50">
                <PawPrint className="w-6 h-6 text-pink-500" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">
                  Completed Pets
                </h2>
                <p className="text-sm text-gray-500">
                  Manage adopted and sold pets
                </p>
              </div>
            </div>
            <span className="px-3 py-1 text-sm font-medium text-teal-800 bg-teal-100 rounded-full shadow-sm">
              {filteredPets.length} Completed
            </span>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="p-4 bg-white shadow-md rounded-xl animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search completed pets by name, breed, or city..."
              className="w-full py-3 pl-10 pr-4 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-[#ffc929] focus:border-[#ffc929] transition-all duration-300"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
              className="bg-white border-gray-200 shadow-sm focus:ring-[#ffc929] focus:border-[#ffc929] rounded-lg py-2 px-3 text-sm transition-all duration-300"
            />
            {user?.role === "Admin" && (
              <button
                onClick={handleBulkAction}
                disabled={selectedPets.length === 0}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md bg-gradient-to-r transition-all duration-300 ${
                  selectedPets.length === 0
                    ? "from-gray-300 to-gray-400 cursor-not-allowed"
                    : "from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 focus:ring-2 focus:ring-gray-400"
                }`}
              >
                <Archive className="w-4 h-4" />
                Archive ({selectedPets.length})
              </button>
            )}
            {(searchQuery || statusFilter) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg shadow-md hover:bg-gray-50 hover:shadow-lg focus:ring-2 focus:ring-[#ffc929] transition-all duration-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {actionError && (
        <ErrorAlert
          message={actionError}
          onDismiss={() => setActionError("")}
          className="animate-fade-in"
        />
      )}

      {/* Pets Table or Empty State */}
      {filteredPets.length === 0 ? (
        <EmptyState
          hasFilters={searchQuery || statusFilter}
          onClearFilters={resetFilters}
          primaryMessage="No pets found"
          customMessage={
            searchQuery || statusFilter
              ? "Try adjusting your search or filters"
              : "You have no active pets listed yet"
          }
        />
      ) : (
        <>
          <PetTable
            pets={currentPets}
            selectedPets={selectedPets}
            currentUser={user}
            onToggleSelection={togglePetSelection}
            onToggleSelectAll={toggleSelectAll}
            customActions={(pet) => {
              const canArchive =
                ["adopted", "sold"].includes(pet.status) &&
                user?.role === "Admin";

              return (
                <div className="flex items-center justify-end gap-2">
                  {canArchive && (
                    <div
                      className="relative"
                      onMouseEnter={() =>
                        setHoveredAction(`archive-${pet._id}`)
                      }
                      onMouseLeave={() => setHoveredAction(null)}
                    >
                      <button
                        onClick={() => handleSingleAction("archive", pet._id)}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white transition-all duration-300 rounded-lg shadow-sm bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 focus:ring-2 focus:ring-gray-400"
                      >
                        <Archive className="w-3 h-3" />
                        Archive
                      </button>
                      {hoveredAction === `archive-${pet._id}` && (
                        <div className="absolute right-0 z-10 px-3 py-2 mt-2 text-xs text-white bg-gray-800 rounded-md shadow-lg top-full animate-fade-in-up">
                          <div className="flex items-center gap-1">
                            <Info size={12} />
                            <span>Move to archived list</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }}
            title="Completed Pets"
            showHeader={false}
            bulkAction={bulkAction}
            className="overflow-hidden shadow-xl rounded-xl animate-fade-in"
          />
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 animate-fade-in">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={petsPerPage}
                className="rounded-lg shadow-md"
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
          confirmAction === "bulk"
            ? confirmBulkAction
            : () => handleAction(confirmAction, selectedPetId)
        }
        action={confirmAction === "bulk" ? bulkAction : confirmAction}
        itemName={
          confirmAction === "bulk"
            ? `${selectedPets.length} pet${selectedPets.length > 1 ? "s" : ""}`
            : filteredPets.find((p) => p._id === selectedPetId)?.name ||
              "this pet"
        }
        additionalMessage={
          confirmAction === "bulk" ? (
            <p className="text-sm text-gray-600">
              This will archive {selectedPets.length} completed pet
              {selectedPets.length > 1 ? "s" : ""}.
            </p>
          ) : confirmAction === "archive" ? (
            <p className="text-sm text-gray-600">
              This will move the pet to the archived list.
            </p>
          ) : null
        }
        className="shadow-xl rounded-xl"
      />
    </div>
  );
};

export default CompletedPets;
