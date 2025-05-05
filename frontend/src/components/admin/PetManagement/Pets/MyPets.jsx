import React, { useEffect, useState } from "react";
import {
  Loader2,
  PawPrint,
  X,
  Plus,
  Edit,
  UserPlus,
  Archive,
  Search,
  Info,
} from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";
import { PaginationControls } from "../../common/PaginationControls";
import { FilterSelect } from "../common/FilterSelect";
import PetTable from "../common/PetTable";
import { ErrorAlert } from "../../common/ErrorAlert";
import ConfirmationModal from "../../../ConfirmationModal";
import { useApp } from "../../../../context/AppContext";
import EmptyState from "../common/EmptyState";
import CreatePetModal from "./CreatePetModal";
import EditPetModal from "./EditPetModal";
import CandidatesModal from "./CandidatesModal";

const MyPets = ({onPetChange }) => {
  const { pets, loading, error, user: currentUser, triggerRefresh } = useApp();
  const [filteredPets, setFilteredPets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPets, setSelectedPets] = useState([]);
  const [actionError, setActionError] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCandidatesModalOpen, setIsCandidatesModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [editPetData, setEditPetData] = useState(null);
  const [candidatesPetId, setCandidatesPetId] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    archive: false,
    bulkArchive: false,
    approve: false,
    finalize: false,
  });
  const [hoveredAction, setHoveredAction] = useState(null);
  const petsPerPage = 10;

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "accepted", label: "Accepted" },
    { value: "adoptionPending", label: "Adoption Pending" },
    // "adopted" and "sold" removed
  ];

  // Filter pets to only those created by the current admin
  useEffect(() => {
    if (currentUser.role !== "Admin") return;
    let filtered = pets.filter(
      (pet) => pet.owner?._id === currentUser._id && !pet.isArchived &&
      pet.status !== "adopted" &&
      pet.status !== "sold"
    );

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

    if (statusFilter) {
      filtered = filtered.filter((pet) => pet.status === statusFilter);
    }

    setFilteredPets(filtered);
    setCurrentPage(1);
    setSelectedPets([]);
  }, [pets, searchQuery, statusFilter, currentUser]);

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
    setStatusFilter("");
    setCurrentPage(1);
    setSelectedPets([]);
  };

  const togglePetSelection = (petId) => {
    setSelectedPets((prev) =>
      prev.includes(petId)
        ? prev.filter((id) => id !== petId)
        : [...prev, petId]
    );
  };

  const toggleSelectAll = () => {
    const selectablePets = currentPets.map((pet) => pet._id);
    setSelectedPets((prev) =>
      prev.length === selectablePets.length ? [] : selectablePets
    );
  };

  const handleEditPet = (petId) => {
    const pet = filteredPets.find((p) => p._id === petId);
    setEditPetData(pet);
    setIsEditModalOpen(true);
  };

  const handleArchivePet = (petId) => {
    setSelectedPetId(petId);
    setConfirmAction("archive");
    setIsConfirmModalOpen(true);
  };

  const confirmArchivePet = async () => {
    setActionLoading((prev) => ({ ...prev, archive: true }));
    try {
      await axiosInstance.put(`/api/pet/archivePet/${selectedPetId}`, {
        isArchived: true,
      });
      await triggerRefresh("pets");
      setFilteredPets((prev) =>
        prev.filter((pet) => pet._id !== selectedPetId)
      );
      setSelectedPets((prev) => prev.filter((id) => id !== selectedPetId));
      setIsConfirmModalOpen(false);
      onPetChange?.();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to archive pet");
      console.error("Archive Pet Error:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, archive: false }));
    }
  };

  const handleBulkArchive = () => {
    if (selectedPets.length === 0) return;
    setConfirmAction("bulkArchive");
    setIsConfirmModalOpen(true);
  };

  const confirmBulkArchive = async () => {
    setActionLoading((prev) => ({ ...prev, bulkArchive: true }));
    try {
      await Promise.all(
        selectedPets.map((petId) =>
          axiosInstance.put(`/api/pet/archivePet/${petId}`, {
            isArchived: true,
          })
        )
      );
      await triggerRefresh("pets");
      setFilteredPets((prev) =>
        prev.filter((pet) => !selectedPets.includes(pet._id))
      );
      setSelectedPets([]);
      setIsConfirmModalOpen(false);
      onPetChange?.();
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to bulk archive pets"
      );
      console.error("Bulk Archive Error:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, bulkArchive: false }));
    }
  };

  const handleViewCandidates = (petId) => {
    setCandidatesPetId(petId);
    setIsCandidatesModalOpen(true);
  };

  if (currentUser.role !== "Admin") {
    return (
      <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl animate-fade-in">
        <ErrorAlert
          message="You must be an admin to access this page."
          title="Unauthorized"
          onDismiss={() => {}}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#ffc929] animate-spin" />
          <PawPrint className="w-8 h-8 text-[#ec4899] animate-pulse" />
          <p className="text-lg font-semibold text-gray-700">
            Loading my pets...
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
              placeholder="Search my pets by name, breed, city, or species..."
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
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <Plus className="w-4 h-4" />
              Create Pet
            </button>
            {selectedPets.length > 0 && (
              <button
                onClick={handleBulkArchive}
                disabled={actionLoading.bulkArchive}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
              >
                {actionLoading.bulkArchive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
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

      {actionError && (
        <div className="animate-fade-in">
          <ErrorAlert
            message={actionError}
            onDismiss={() => setActionError("")}
          />
        </div>
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
            currentUser={currentUser}
            onToggleSelection={togglePetSelection}
            onToggleSelectAll={toggleSelectAll}
            customActions={(pet) => (
              <div className="relative flex items-center justify-end gap-2">
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredAction(`edit-${pet._id}`)}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  <button
                    onClick={() => handleEditPet(pet._id)}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white transition-all duration-300 rounded-lg shadow-sm bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  {hoveredAction === `edit-${pet._id}` && (
                    <div className="absolute right-0 z-10 px-3 py-2 mt-2 text-xs text-white bg-gray-800 rounded-md shadow-lg top-full animate-fade-in-up">
                      <div className="flex items-center gap-1">
                        <Info size={12} />
                        <span>Edit this pet’s details</span>
                      </div>
                    </div>
                  )}
                </div>
                {pet.candidates?.length > 0 && (
                  <div
                    className="relative"
                    onMouseEnter={() =>
                      setHoveredAction(`candidates-${pet._id}`)
                    }
                    onMouseLeave={() => setHoveredAction(null)}
                  >
                    <button
                      onClick={() => handleViewCandidates(pet._id)}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white transition-all duration-300 rounded-lg shadow-sm bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <UserPlus className="w-3 h-3" />
                      Candidates
                    </button>
                    {hoveredAction === `candidates-${pet._id}` && (
                      <div className="absolute right-0 z-10 px-3 py-2 mt-2 text-xs text-white bg-gray-800 rounded-md shadow-lg top-full animate-fade-in-up">
                        <div className="flex items-center gap-1">
                          <Info size={12} />
                          <span>View adoption candidates</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredAction(`archive-${pet._id}`)}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  <button
                    onClick={() => handleArchivePet(pet._id)}
                    disabled={actionLoading.archive}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white transition-all duration-300 rounded-lg shadow-sm bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
                  >
                    {actionLoading.archive && selectedPetId === pet._id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Archive className="w-3 h-3" />
                    )}
                    Archive
                  </button>
                  {hoveredAction === `archive-${pet._id}` && (
                    <div className="absolute right-0 z-10 px-3 py-2 mt-2 text-xs text-white bg-gray-800 rounded-md shadow-lg top-full animate-fade-in-up">
                      <div className="flex items-center gap-1">
                        <Info size={12} />
                        <span>Archive this pet listing</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            title="My Pets"
            bulkAction="archive"
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

      <CreatePetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={async (petData) => {
          try {
            await axiosInstance.post("/api/pet/addpet", {
              ...petData,
              owner: currentUser._id,
            });
            await triggerRefresh("pets");
            setIsCreateModalOpen(false);
            onPetChange?.();
          } catch (err) {
            throw new Error(
              err.response?.data?.message || "Failed to create pet"
            );
          }
        }}
      />

      <EditPetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        petData={editPetData}
        onUpdate={async (petData) => {
          try {
            await axiosInstance.put(
              `/api/pet/updatedPet/${petData._id}`,
              petData
            );
            await triggerRefresh("pets");
            setIsEditModalOpen(false);
            onPetChange?.();
          } catch (err) {
            throw new Error(
              err.response?.data?.message || "Failed to update pet"
            );
          }
        }}
      />

      <CandidatesModal
        isOpen={isCandidatesModalOpen}
        onClose={() => setIsCandidatesModalOpen(false)}
        petId={candidatesPetId}
        onApprove={(petId, candidateId) => {
          setSelectedPetId(petId);
          setSelectedCandidateId(candidateId);
          setConfirmAction("approveCandidate");
          setIsConfirmModalOpen(true);
        }}
        onFinalize={(petId, candidateId) => {
          setSelectedPetId(petId);
          setSelectedCandidateId(candidateId);
          setConfirmAction("finalizeAdoption");
          setIsConfirmModalOpen(true);
        }}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={
          confirmAction === "archive"
            ? confirmArchivePet
            : confirmAction === "bulkArchive"
            ? confirmBulkArchive
            : confirmAction === "approveCandidate"
            ? async () => {
                setActionLoading((prev) => ({ ...prev, approve: true }));
                try {
                  await axiosInstance.put(
                    `/api/pet/${selectedPetId}/candidate/${selectedCandidateId}/status`,
                    { status: "approved" }
                  );
                  await triggerRefresh("pets");
                  setIsConfirmModalOpen(false);
                  setIsCandidatesModalOpen(false);
                  onPetChange?.();
                } catch (err) {
                  setActionError(
                    err.response?.data?.message || "Failed to approve candidate"
                  );
                  console.error("Approve Candidate Error:", err);
                } finally {
                  setActionLoading((prev) => ({ ...prev, approve: false }));
                }
              }
            : async () => {
                // finalizeAdoption
                setActionLoading((prev) => ({ ...prev, finalize: true }));
                try {
                  await axiosInstance.put(
                    `/api/pet/${selectedPetId}/candidate/${selectedCandidateId}/finalize`,
                    { action: "adopt" }
                  );
                  await triggerRefresh("pets");
                  setIsConfirmModalOpen(false);
                  setIsCandidatesModalOpen(false);
                  onPetChange?.();
                } catch (err) {
                  setActionError(
                    err.response?.data?.message || "Failed to finalize adoption"
                  );
                  console.error("Finalize Adoption Error:", err);
                } finally {
                  setActionLoading((prev) => ({ ...prev, finalize: false }));
                }
              }
        }
        action={
          confirmAction === "archive" || confirmAction === "bulkArchive"
            ? "archive"
            : confirmAction === "approveCandidate"
            ? "select"
            : "finalize"
        }
        itemName={
          confirmAction === "bulkArchive"
            ? `${selectedPets.length} pet${selectedPets.length > 1 ? "s" : ""}`
            : confirmAction === "approveCandidate" ||
              confirmAction === "finalizeAdoption"
            ? filteredPets
                .find((p) => p._id === selectedPetId)
                ?.candidates?.find((c) => c.id === selectedCandidateId)?.name ||
              "this candidate"
            : filteredPets.find((p) => p._id === selectedPetId)?.name ||
              "this pet"
        }
        additionalMessage={
          confirmAction === "bulkArchive" ? (
            <p className="text-sm text-gray-600">
              This will move the selected pets to the archived list.
            </p>
          ) : confirmAction === "archive" ? (
            <p className="text-sm text-gray-600">
              This will move this pet to the archived list.
            </p>
          ) : null
        }
        className="shadow-xl rounded-xl"
      />
    </div>
  );
};

export default MyPets;