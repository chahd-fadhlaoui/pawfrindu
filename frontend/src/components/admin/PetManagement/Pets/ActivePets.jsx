import {
  Archive,
  Check,
  Edit,
  Loader2,
  PawPrint,
  Search,
  Trash2
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "../../../../context/AppContext";
import axiosInstance from "../../../../utils/axiosInstance";
import ConfirmationModal from "../../../ConfirmationModal";
import { ErrorAlert } from "../../common/ErrorAlert";
import { PaginationControls } from "../../common/PaginationControls";
import { FilterSelect } from "../common/FilterSelect";
import PetTable from "../common/PetTable";

const ActivePets = ({ showHeader = true }) => {
  const { user, pets, loading, error, triggerRefresh } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPets, setSelectedPets] = useState([]);
  const [actionError, setActionError] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [bulkAction, setBulkAction] = useState("archive"); // Default to archive
  const petsPerPage = 10;

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "adoptionPending", label: "Adoption Pending" },
    { value: "adopted", label: "Adopted" },
    { value: "sold", label: "Sold" },
  ];

  const filteredPets = useMemo(() => {
    let filtered = pets.filter((pet) => !pet.isArchived);
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
  }, [searchQuery, statusFilter, bulkAction]);

  const totalPages = Math.ceil(filteredPets.length / petsPerPage);
  const currentPets = filteredPets.slice(
    (currentPage - 1) * petsPerPage,
    currentPage * petsPerPage
  );

  const canPerformAction = (pet, action) => {
    if (user?.role !== "Admin") return false;
    switch (action) {
      case "accept": return pet.status === "pending";
      case "delete": return pet.status === "accepted";
      case "archive": return pet.status === "adopted" || pet.status === "sold";
      default: return false;
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
      prev.includes(petId) ? prev.filter((id) => id !== petId) : [...prev, petId]
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
      switch (action) {
        case "accept":
          await axiosInstance.put(`/api/pet/modifyStatus/${petId}`, {
            status: "accepted",
            isApproved: true,
          });
          break;
        case "archive":
          await axiosInstance.put(`/api/pet/archivePet/${petId}`);
          break;
        case "delete":
          await axiosInstance.delete(`/api/pet/deleteAdminPet/${petId}`);
          break;
        default:
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
        canPerformAction(filteredPets.find((p) => p._id === petId), bulkAction)
      );
      if (eligiblePets.length === 0) {
        setActionError(`No pets eligible for ${bulkAction}.`);
        setIsConfirmModalOpen(false);
        return;
      }
      await Promise.all(
        eligiblePets.map((petId) => {
          switch (bulkAction) {
            case "accept":
              return axiosInstance.put(`/api/pet/modifyStatus/${petId}`, {
                status: "accepted",
                isApproved: true,
              });
            case "delete":
              return axiosInstance.delete(`/api/pet/deleteAdminPet/${petId}`);
            case "archive":
              return axiosInstance.put(`/api/pet/archivePet/${petId}`);
            default:
              throw new Error("Invalid bulk action");
          }
        })
      );
      triggerRefresh();
      setSelectedPets([]);
      setIsConfirmModalOpen(false);
    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to bulk ${bulkAction} pets`);
      setIsConfirmModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#ffc929] animate-spin" />
          <PawPrint className="w-8 h-8 text-[#ffc929] animate-pulse" />
          <p className="text-lg font-semibold text-gray-700">Loading active pets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl">
        <ErrorAlert message={error} title="Error Loading Pets" onDismiss={() => {}} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="overflow-hidden bg-white shadow-lg rounded-xl animate-fadeIn">
          <div
            className="flex items-center px-4 py-5 border-l-4 sm:px-6"
            style={{ borderImage: "linear-gradient(to bottom, #f59e0b, #ec4899) 1" }}
          >
            <div className="flex items-center flex-1">
              <div className="p-2 rounded-lg bg-[#FCE7F3]">
                <PawPrint className="w-6 h-6 text-pink-500" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Active Pets</h2>
                <p className="text-sm text-gray-500">Manage active pet listings</p>
              </div>
            </div>
            <span className="px-3 py-1 text-sm font-medium text-pink-800 bg-pink-100 rounded-full">
              {filteredPets.length} Active
            </span>
          </div>
        </div>
      )}

      <div className="p-4 bg-white shadow-md rounded-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active pets by name, breed, or city..."
              className="w-full py-3 pl-10 pr-4 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-[#ffc929] focus:border-[#ffc929]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
              className="bg-white border-gray-200 shadow-sm focus:ring-[#ffc929] focus:border-[#ffc929]"
            />
            {user?.role === "Admin" && (
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:ring-[#ffc929]"
              >
                <option value="accept">Bulk Accept</option>
                <option value="delete">Bulk Delete</option>
                <option value="archive">Bulk Archive</option>
              </select>
            )}
            {selectedPets.length > 0 && user?.role === "Admin" && (
              <button
                onClick={handleBulkAction}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 focus:ring-2 focus:ring-gray-400"
              >
                {bulkAction === "accept" && <Check className="w-4 h-4" />}
                {bulkAction === "delete" && <Trash2 className="w-4 h-4" />}
                {bulkAction === "archive" && <Archive className="w-4 h-4" />}
                Apply ({selectedPets.length})
              </button>
            )}
            {(searchQuery || statusFilter) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-yellow-400"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {actionError && (
        <ErrorAlert message={actionError} onDismiss={() => setActionError("")} />
      )}

      {filteredPets.length === 0 ? (
        <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl">
          <div className="flex-col items-center gap-4 Flex">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-yellow-100 to-pink-100">
              <PawPrint size={32} className="text-[#ffc929]" />
            </div>
            <p className="text-lg font-semibold text-gray-700">No active pets found</p>
            <p className="text-sm text-gray-500">
              {searchQuery || statusFilter
                ? "Try adjusting your search or filters"
                : "No active pets available"}
            </p>
            {(searchQuery || statusFilter) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-yellow-400"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <PetTable
            pets={currentPets}
            selectedPets={selectedPets}
            currentUser={user}
            onToggleSelection={togglePetSelection}
            onToggleSelectAll={toggleSelectAll}
            customActions={(pet) => {
              const canAccept = pet.status === "pending" && user?.role === "Admin";
              const canArchive =
                (pet.status === "adopted" || pet.status === "sold") && user?.role === "Admin";
              const canDelete = pet.status === "accepted" && user?.role === "Admin";
              const canEdit =
                pet.owner?._id === user?._id &&
                (pet.status === "pending" || pet.status === "accepted");

              return (
                <div className="flex items-center justify-end gap-2">
                  {canAccept && (
                    <button
                      onClick={() => handleSingleAction("accept", pet._id)}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white rounded-lg shadow-sm bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:ring-2 focus:ring-green-400"
                    >
                      <Check className="w-3 h-3" />
                      Accept
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleSingleAction("delete", pet._id)}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white rounded-lg shadow-sm bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:ring-2 focus:ring-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  )}
                  {canArchive && (
                    <button
                      onClick={() => handleSingleAction("archive", pet._id)}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white rounded-lg shadow-sm bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 focus:ring-2 focus:ring-gray-400"
                    >
                      <Archive className="w-3 h-3" />
                      Archive
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => handleSingleAction("edit", pet._id)}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white rounded-lg shadow-sm bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 focus:ring-2 focus:ring-yellow-400"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                  )}
                </div>
              );
            }}
            title="Active Pets"
            showHeader={false}
            bulkAction={bulkAction}
          />
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

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmAction === "bulk" ? confirmBulkAction : () => handleAction(confirmAction, selectedPetId)}
        action={confirmAction === "bulk" ? bulkAction : confirmAction}
        itemName={
          confirmAction === "bulk"
            ? `${selectedPets.length} pet${selectedPets.length > 1 ? "s" : ""}`
            : filteredPets.find((p) => p._id === selectedPetId)?.name || "this pet"
        }
        additionalMessage={
          confirmAction === "bulk" && (
            <p className="text-sm text-gray-600">
              Only pets eligible for "{bulkAction}" will be processed (e.g., "pending" for Accept, "accepted" for Delete, "adopted" or "sold" for Archive).
            </p>
          )
        }
      />
    </div>
  );
};

export default ActivePets;