import {
  Archive,
  Check,
  Loader2,
  PawPrint,
  Search,
  X,
  Info,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "../../../../context/AppContext";
import axiosInstance from "../../../../utils/axiosInstance";
import ConfirmationModal from "../../../ConfirmationModal";
import { ErrorAlert } from "../../common/ErrorAlert";
import { PaginationControls } from "../../common/PaginationControls";
import { FilterSelect } from "../common/FilterSelect";
import PetTable from "../common/PetTable";
import EmptyState from "../common/EmptyState";

const ActivePets = () => {
  const { user, pets, loading, error, triggerRefresh } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPets, setSelectedPets] = useState([]);
  const [actionError, setActionError] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [bulkAction, setBulkAction] = useState("archive");
  const [localPets, setLocalPets] = useState(pets);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [hoveredAction, setHoveredAction] = useState(null);
  const petsPerPage = 10;

  useEffect(() => {
    setLocalPets(pets);
    setSelectedPets([]);
  }, [pets]);

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "adoptionPending", label: "Adoption Pending" },
  ];

  const filteredPets = useMemo(() => {
    let filtered = localPets.filter(
      (pet) => !pet.isArchived && !["adopted", "sold"].includes(pet.status)
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
  }, [localPets, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedPets([]);
  }, [searchQuery, statusFilter, bulkAction]);

  const totalPages = Math.ceil(filteredPets.length / petsPerPage);
  const currentPets = filteredPets.slice(
    (currentPage - 1) * petsPerPage,
    currentPage * petsPerPage
  );

 const canPerformAction = (pet, action) => {
  if (!["Admin", "SuperAdmin"].includes(user?.role)) return false;
  switch (action) {
    case "accept":
      return pet.status === "pending";
    case "reject":
      return pet.status === "pending";
    case "archive":
      return pet.status === "accepted" || pet.status === "adoptionPending";
    default:
      return false;
  }
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
    setBulkAction("archive");
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

  const handleSingleAction = (action, petId) => {
    setSelectedPetId(petId);
    setConfirmAction(action);
    setIsConfirmModalOpen(true);
  };

  const handleAction = async (action, petId) => {
    setIsActionLoading(true);
    try {
      setActionError("");
      const pet = filteredPets.find((p) => p._id === petId);
      setLocalPets((prev) => {
        if (action === "reject") return prev.filter((p) => p._id !== petId);
        return prev.map((p) =>
          p._id === petId
            ? {
                ...p,
                status: action === "accept" ? "accepted" : p.status,
                isArchived: action === "archive" ? true : p.isArchived,
              }
            : p
        );
      });

      switch (action) {
        case "accept":
          await axiosInstance.put(`/api/pet/modifyStatus/${petId}`, {
            status: "accepted",
            isApproved: true,
          });
          break;
        case "reject":
          await axiosInstance.delete(`/api/pet/deleteAdminPet/${petId}`);
          await axiosInstance.post("/api/pet/send-rejection-email", {
            petId,
            ownerEmail: pet.owner.email,
            petName: pet.name,
          });
          break;
        case "archive":
          await axiosInstance.put(`/api/pet/archivePet/${petId}`);
          break;
        default:
          throw new Error("Invalid action");
      }
      triggerRefresh();
      setIsConfirmModalOpen(false);
    } catch (err) {
      setLocalPets(pets);
      setActionError(err.response?.data?.message || `Failed to ${action} pet`);
      setIsConfirmModalOpen(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBulkAction = () => {
    if (selectedPets.length === 0) return;
    setConfirmAction("bulk");
    setIsConfirmModalOpen(true);
  };

  const confirmBulkAction = async () => {
    setIsActionLoading(true);
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

      setLocalPets((prev) => {
        if (bulkAction === "reject")
          return prev.filter((p) => !eligiblePets.includes(p._id));
        return prev.map((p) =>
          eligiblePets.includes(p._id)
            ? {
                ...p,
                status: bulkAction === "accept" ? "accepted" : p.status,
                isArchived: bulkAction === "archive" ? true : p.isArchived,
              }
            : p
        );
      });
      setSelectedPets([]);

      await Promise.all(
        eligiblePets.map((petId) => {
          const pet = filteredPets.find((p) => p._id === petId);
          switch (bulkAction) {
            case "accept":
              return axiosInstance.put(`/api/pet/modifyStatus/${petId}`, {
                status: "accepted",
                isApproved: true,
              });
            case "reject":
              return Promise.all([
                axiosInstance.delete(`/api/pet/deleteAdminPet/${petId}`),
                axiosInstance.post("/api/pet/send-rejection-email", {
                  petId,
                  ownerEmail: pet.owner.email,
                  petName: pet.name,
                }),
              ]);
            case "archive":
              return axiosInstance.put(`/api/pet/archivePet/${petId}`);
            default:
              throw new Error("Invalid bulk action");
          }
        })
      );
      triggerRefresh();
      setIsConfirmModalOpen(false);
    } catch (err) {
      setLocalPets(pets);
      setActionError(
        err.response?.data?.message || `Failed to bulk ${bulkAction} pets`
      );
      setIsConfirmModalOpen(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#ffc929] animate-spin" />
          <PawPrint className="w-8 h-8 text-[#ec4899] animate-pulse" />
          <p className="text-lg font-semibold text-gray-700">
            Loading active pets...
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
      <div className="p-4 bg-white shadow-md rounded-xl animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active pets by name, breed, or city..."
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
            {user?.role === "Admin"  || user?.role === "SuperAdmin" && (
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:ring-[#ffc929] focus:border-[#ffc929] transition-all duration-300"
              >
                <option value="accept">Bulk Accept</option>
                <option value="reject">Bulk Reject</option>
                <option value="archive">Bulk Archive</option>
              </select>
            )}
            {selectedPets.length > 0 && user?.role === "Admin" || user?.role === "SuperAdmin" && (
              <button
                onClick={handleBulkAction}
                disabled={isActionLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 focus:ring-2 focus:ring-gray-400"
              >
                {isActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {bulkAction === "accept" && <Check className="w-4 h-4" />}
                    {bulkAction === "reject" && <X className="w-4 h-4" />}
                    {bulkAction === "archive" && (
                      <Archive className="w-4 h-4" />
                    )}
                  </>
                )}
                Apply ({selectedPets.length})
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

      {actionError && (
        <ErrorAlert
          message={actionError}
          onDismiss={() => setActionError("")}
          className="animate-fade-in"
        />
      )}

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
    const canAccept = canPerformAction(pet, "accept");
    const canReject = canPerformAction(pet, "reject");
    const canArchive = canPerformAction(pet, "archive");

    return (
      <div className="relative flex items-center justify-end gap-2">
        {canAccept && (
          <div
            className="relative"
            onMouseEnter={() => setHoveredAction(`accept-${pet._id}`)}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <button
              onClick={() => handleSingleAction("accept", pet._id)}
              disabled={isActionLoading}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white transition-all duration-300 rounded-lg shadow-sm bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:ring-2 focus:ring-green-400"
            >
              {isActionLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              Accept
            </button>
            {hoveredAction === `accept-${pet._id}` && (
              <div className="absolute right-0 z-10 px-3 py-2 mt-2 text-xs text-white bg-gray-800 rounded-md shadow-lg top-full animate-fade-in-up">
                <div className="flex items-center gap-1">
                  <Info size={12} />
                  <span>Approve this pet listing</span>
                </div>
              </div>
            )}
          </div>
        )}
        {canReject && (
          <div
            className="relative"
            onMouseEnter={() => setHoveredAction(`reject-${pet._id}`)}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <button
              onClick={() => handleSingleAction("reject", pet._id)}
              disabled={isActionLoading}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white transition-all duration-300 rounded-lg shadow-sm bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:ring-2 focus:ring-red-400"
            >
              <X className="w-3 h-3" />
              Reject
            </button>
            {hoveredAction === `reject-${pet._id}` && (
              <div className="absolute right-0 z-10 px-3 py-2 mt-2 text-xs text-white bg-gray-800 rounded-md shadow-lg top-full animate-fade-in-up">
                <div className="flex items-center gap-1">
                  <Info size={12} />
                  <span>Delete and notify owner</span>
                </div>
              </div>
            )}
          </div>
        )}
        {canArchive && (
          <div
            className="relative"
            onMouseEnter={() => setHoveredAction(`archive-${pet._id}`)}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <button
              onClick={() => handleSingleAction("archive", pet._id)}
              disabled={isActionLoading}
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
  title="Active Pets"
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
              Only pets eligible for "{bulkAction}" will be processed (e.g.,
              "pending" for Accept/Reject, "accepted" or "adoptionPending" for
              Archive).
            </p>
          ) : confirmAction === "reject" ? (
            <p className="text-sm text-gray-600">
              This will delete the pet and notify the owner via email.
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

export default ActivePets;
