import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Trash2,
  Users,
  PawPrint,
  Heart,
  Filter,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Alert } from "../components/Alert";
import EditForm from "../components/EditForm";
import EmptyState from "../components/EmptyState";
import PetDetailsModal from "../components/PetDetailsModal";
import ConfirmationModal from "../components/ConfirmationModal";

// Constants
const PET_CATEGORIES = ["dog", "cat", "other"];
const STATUS_OPTIONS = ["pending", "accepted", "adopted", "sold"];
const GENDER_OPTIONS = ["male", "female"];
const TRAINED_OPTIONS = ["true", "false"];
const APPROVED_OPTIONS = ["true", "false"];

const STATUS_STYLES = {
  accepted: "bg-[#ffc929]/20 text-[#ffc929]",
  pending: "bg-pink-100 text-pink-500",
  adopted: "bg-green-100 text-green-500",
  sold: "bg-blue-100 text-blue-500",
};

const ITEMS_PER_PAGE = 9;

// StatusBadge Component
const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-500"
    } hover:opacity-80`}
  >
    {status}
  </span>
);

// PetCard Component
const PetCard = ({
  pet,
  navigate,
  onEdit,
  onDelete,
  onViewCandidates,
  disabled,
  currencySymbol,
}) => (
  <div
    onClick={() => !disabled && navigate(`/petsdetails/${pet._id}`)}
    className="relative bg-white border-2 border-[#ffc929]/20 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
  >
    <div className="relative w-full h-40 overflow-hidden bg-gradient-to-br from-white to-pink-50 rounded-t-xl">
      <img
        src={pet.image}
        alt={pet.name}
        className="object-cover w-full h-full transition-transform duration-400 group-hover:scale-105"
        onError={(e) => (e.target.src = "/placeholder-animal.png")}
        loading="lazy"
      />
    </div>
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 truncate transition-colors duration-300 group-hover:text-pink-500">
          {pet.name}
        </h3>
        <StatusBadge status={pet.status} />
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        <p>
          {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
          {pet.breed && ` • ${pet.breed}`}
        </p>
        <div className="flex justify-between">
          <span>{pet.city}</span>
          <span
            className={`${
              pet.fee === 0 ? "text-green-600" : "text-[#ffc929]"
            } font-medium`}
          >
            {pet.fee === 0 ? "Free" : `${pet.fee} ${currencySymbol}`}
          </span>
        </div>
      </div>
      <div
        className="flex justify-end gap-2 pt-2 border-t border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {(pet.status === "pending" || pet.status === "accepted") && (
          <button
            onClick={() => onEdit(pet._id, pet.name)}
            className="p-1.5 bg-white border border-[#ffc929]/20 rounded-full hover:bg-[#ffc929] hover:text-white hover:border-[#ffc929] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
            disabled={disabled}
            aria-label={`Edit ${pet.name}`}
          >
            <Edit size={16} />
          </button>
        )}
        <button
          onClick={() => onDelete(pet._id, pet.name)}
          className="p-1.5 bg-white border border-[#ffc929]/20 rounded-full hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
          disabled={disabled}
          aria-label={`Delete ${pet.name}`}
        >
          <Trash2 size={16} />
        </button>
        {pet.fee === 0 && pet.status !== "pending" && (
          <button
            onClick={() => onViewCandidates(pet._id)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-[#ffc929] rounded-full hover:bg-[#e6b625] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
            disabled={disabled}
            aria-label={`View candidates for ${pet.name}`}
          >
            <Users size={14} />
            <span className="hidden sm:inline">Candidates</span>
          </button>
        )}
      </div>
    </div>
  </div>
);

// Paw Background for Decoration
const PawBackground = () => {
  return Array(8)
    .fill(null)
    .map((_, index) => (
      <PawPrint
        key={index}
        size={48}
        className={`
          absolute opacity-5 animate-float
          ${index % 2 === 0 ? "text-[#ffc929]" : "text-pink-300"}
          ${index % 3 === 0 ? "top-1/4" : index % 3 === 1 ? "top-1/2" : "top-3/4"}
          ${index % 4 === 0 ? "left-1/4" : index % 4 === 1 ? "left-1/2" : "left-3/4"}
        `}
        style={{ animationDelay: `${index * 0.5}s`, transform: `rotate(${index * 45}deg)` }}
      />
    ));
};

// Filter Select Component
const FilterSelect = ({ label, value, onChange, options }) => (
  <div className="w-full sm:w-auto flex-1 min-w-[140px]">
    <select
      className="w-full px-4 py-2.5 text-sm text-gray-700 bg-white border border-[#ffc929]/20 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/30 focus:border-[#ffc929] hover:border-[#ffc929]/50 transition-all duration-300"
      value={value}
      onChange={onChange}
      aria-label={`Filter by ${label}`}
    >
      <option value="">{label}</option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

// Filter Badge Component
const FilterBadge = ({ label, value, onClear }) => (
  <div className="flex items-center px-3 py-1.5 text-sm text-gray-700 bg-pink-50 border border-[#ffc929]/20 rounded-full shadow-sm hover:bg-pink-100 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#ffc929]/30">
    <span className="font-medium">{label}:</span>
    <span className="ml-1 truncate max-w-[120px]">{value}</span>
    <button
      onClick={onClear}
      className="ml-2 text-gray-400 transition-colors duration-300 rounded-full hover:text-pink-500 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
      aria-label={`Remove ${label} filter`}
    >
      <X size={14} />
    </button>
  </div>
);

// Main Component
const PetOwnerPosts = () => {
  const navigate = useNavigate();
  const { user, getMyPets, updatePet, deletePet, error, setError, clearError, currencySymbol } =
    useApp();

  const [selectedPet, setSelectedPet] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPets, setUserPets] = useState(null);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: "",
    petId: null,
    petName: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterTrained, setFilterTrained] = useState("");
  const [filterApproved, setFilterApproved] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUserPets = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMyPets();
      if (result.success) {
        const activePets = result.data.filter((pet) => !pet.isArchived);
        setUserPets(activePets);
        clearError();
      } else {
        setError(result.error || "Failed to fetch pets");
        setUserPets([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch pets");
      setUserPets([]);
    } finally {
      setLoading(false);
    }
  }, [getMyPets, setError, clearError]);

  useEffect(() => {
    let mounted = true;
    if (user?._id && mounted) {
      fetchUserPets();
      const interval = setInterval(fetchUserPets, 30000);
      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }
  }, [user?._id, fetchUserPets]);

  const handleEdit = useCallback(
    (petId, petName) => {
      const pet = userPets.find((p) => p._id === petId);
      if (pet) {
        setEditMode(true);
        setSelectedPet(pet);
        setEditFormData({
          name: pet.name,
          breed: pet.breed,
          age: pet.age,
          city: pet.city,
          gender: pet.gender,
          species: pet.species,
          fee: pet.fee,
          isTrained: pet.isTrained === true || pet.isTrained === "true",
          description: pet.description,
          image: pet.image,
        });
      }
    },
    [userPets]
  );

  const handleDelete = useCallback(
    async (petId) => {
      setLoading(true);
      try {
        const result = await deletePet(petId);
        if (result.success) {
          await fetchUserPets();
          setApprovalMessage("Pet deleted successfully.");
        } else {
          throw new Error(result.error || "Failed to delete pet");
        }
      } catch (err) {
        setError(err.message || "Failed to delete pet");
      } finally {
        setLoading(false);
      }
    },
    [deletePet, fetchUserPets, setError]
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedData = { ...editFormData };
      const result = await updatePet(selectedPet._id, updatedData);
      if (result.success) {
        await fetchUserPets();
        if (result.message?.includes("pending admin approval")) {
          setApprovalMessage(result.message);
        } else {
          setApprovalMessage("Pet updated successfully.");
        }
        handleCloseModal();
      } else {
        throw new Error(result.error || "Failed to update pet");
      }
    } catch (err) {
      setError(err.message || "Failed to update pet");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = useCallback(() => {
    setSelectedPet(null);
    setEditMode(false);
    setEditFormData(null);
    clearError();
  }, [clearError]);

  const handleInputChange = useCallback((field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const openConfirmModal = (action, petId, petName) => {
    setConfirmModal({ isOpen: true, action, petId, petName });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, action: "", petId: null, petName: "" });
  };

  const confirmAction = () => {
    const { action, petId, petName } = confirmModal;
    switch (action) {
      case "delete":
        handleDelete(petId);
        break;
      case "edit":
        handleEdit(petId, petName);
        break;
      default:
        break;
    }
    closeConfirmModal();
  };

  const clearFilter = (filterType) => {
    switch (filterType) {
      case "status":
        setFilterStatus("");
        break;
      case "species":
        setFilterSpecies("");
        break;
      case "gender":
        setFilterGender("");
        break;
      case "trained":
        setFilterTrained("");
        break;
      case "approved":
        setFilterApproved("");
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilterStatus("");
    setFilterSpecies("");
    setFilterGender("");
    setFilterTrained("");
    setFilterApproved("");
    setCurrentPage(1);
  };

  const filteredPets = userPets
    ? userPets.filter((pet) => {
        const statusMatch = !filterStatus || pet.status === filterStatus;
        const speciesMatch = !filterSpecies || pet.species === filterSpecies;
        const genderMatch = !filterGender || pet.gender === filterGender;
        const trainedMatch = !filterTrained || String(pet.isTrained) === filterTrained;
        const approvedMatch = !filterApproved || String(pet.isApproved) === filterApproved;
        return statusMatch && speciesMatch && genderMatch && trainedMatch && approvedMatch;
      })
    : [];

  const totalPages = Math.ceil(filteredPets.length / ITEMS_PER_PAGE);
  const paginatedPets = filteredPets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  return (
    <section className="relative min-h-screen px-4 py-12 sm:py-20 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-pink-50">
      {/* Decorative Paw Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <PawBackground />
      </div>

      <div className="relative mx-auto space-y-12 max-w-7xl">
        {/* Header */}
        <div className="pt-16 space-y-6 text-center animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
            <Heart className="w-4 h-4 mr-2 text-[#ffc929]" />Your Listings
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="block">Manage Your</span>
            <span className="block text-pink-500">Pet Posts</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
            Easily edit, delete, or review candidates for your adoption posts.
          </p>
        </div>

        {/* Filters and Controls */}
        <div
          className="p-6 space-y-6 bg-white border-2 border-[#ffc929]/20 shadow-lg rounded-3xl animate-fadeIn"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
              aria-label={isFilterOpen ? "Hide filters" : "Show filters"}
            >
              <Filter size={16} /> {isFilterOpen ? "Hide Filters" : "Filter Posts"}
            </button>
            <button
              onClick={() => navigate("/addPet")}
              className="flex items-center gap-2 px-6 py-2.5 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
              disabled={loading}
            >
              <Plus size={16} /> Add New Post
            </button>
          </div>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 transition-all duration-300 ${
              !isFilterOpen && "hidden"
            }`}
          >
            <FilterSelect
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={STATUS_OPTIONS}
            />
            <FilterSelect
              label="Species"
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              options={PET_CATEGORIES}
            />
            <FilterSelect
              label="Gender"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              options={GENDER_OPTIONS}
            />
            <FilterSelect
              label="Training"
              value={filterTrained}
              onChange={(e) => setFilterTrained(e.target.value)}
              options={TRAINED_OPTIONS}
            />
            <FilterSelect
              label="Approval"
              value={filterApproved}
              onChange={(e) => setFilterApproved(e.target.value)}
              options={APPROVED_OPTIONS}
            />
          </div>
          {(filterStatus || filterSpecies || filterGender || filterTrained || filterApproved) && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600">Applied Filters:</span>
              {filterStatus && (
                <FilterBadge
                  label="Status"
                  value={filterStatus}
                  onClear={() => clearFilter("status")}
                />
              )}
              {filterSpecies && (
                <FilterBadge
                  label="Species"
                  value={filterSpecies}
                  onClear={() => clearFilter("species")}
                />
              )}
              {filterGender && (
                <FilterBadge
                  label="Gender"
                  value={filterGender}
                  onClear={() => clearFilter("gender")}
                />
              )}
              {filterTrained && (
                <FilterBadge
                  label="Training"
                  value={filterTrained === "true" ? "Trained" : "Not Trained"}
                  onClear={() => clearFilter("trained")}
                />
              )}
              {filterApproved && (
                <FilterBadge
                  label="Approval"
                  value={filterApproved === "true" ? "Approved" : "Not Approved"}
                  onClear={() => clearFilter("approved")}
                />
              )}
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 ml-2 text-sm font-medium text-pink-500 transition-all duration-300 rounded-full bg-pink-50 hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                aria-label="Clear all filters"
              >
                Clear All
              </button>
            </div>
          )}
          {filteredPets.length > 0 && (
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-600 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
                <PawPrint size={14} className="text-[#ffc929]" /> {filteredPets.length} Pets
              </span>
            </div>
          )}
        </div>

        {/* Alerts */}
        {error && <Alert message={error} onClose={clearError} />}
        {approvalMessage && (
          <Alert message={approvalMessage} type="info" onClose={() => setApprovalMessage("")} />
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <PawPrint size={48} className="text-[#ffc929]" />
              <p className="text-lg font-medium text-gray-600">Loading your pets...</p>
            </div>
          </div>
        ) : userPets === null ? null : userPets.length === 0 ? (
          <EmptyState
            message="You haven't created any pet adoption posts yet. Start by adding your first pet!"
            buttonText="Add Your First Pet"
            buttonAction={() => navigate("/addPet")}
            disabled={loading}
          />
        ) : filteredPets.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <PawPrint size={48} className="mb-4 text-[#ffc929]" />
            <h3 className="text-xl font-semibold text-gray-700">No Results Found</h3>
            <p className="max-w-md mt-2 text-gray-600">
              Your filters didn’t match any posts. Try adjusting your criteria or adding a new pet!
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2 mt-6 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden bg-white border-2 border-[#ffc929]/20 shadow-xl rounded-3xl md:block overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gradient-to-r from-[#ffc929]/10 to-pink-50 text-gray-700 sticky top-0">
                    <tr>
                      {["Pet", "Name", "Description", "Breed", "Age", "Fee", "Status", "Actions"].map(
                        (header) => (
                          <th key={header} className="px-6 py-3 font-semibold">
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPets.map((pet) => (
                      <tr
                        key={pet._id}
                        className="transition-all duration-200 border-b border-[#ffc929]/10 cursor-pointer hover:bg-pink-50/50"
                        onClick={() => !loading && setSelectedPet(pet)}
                      >
                        <td className="px-6 py-3">
                          <div className="relative w-10 h-10 overflow-hidden rounded-full shadow-sm">
                            <img
                              src={pet.image}
                              alt={pet.name}
                              className="object-cover w-full h-full"
                              loading="lazy"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-3 font-medium text-gray-800">{pet.name}</td>
                        <td className="max-w-xs px-6 py-3 text-gray-600 truncate">
                          {pet.description}
                        </td>
                        <td className="px-6 py-3 text-gray-600">{pet.breed || "-"}</td>
                        <td className="px-6 py-3 text-gray-600">{pet.age}</td>
                        <td className="px-6 py-3 text-gray-600">
                          {pet.fee === 0 ? "Free" : `${pet.fee} ${currencySymbol}`}
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge status={pet.status} />
                        </td>
                        <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            {(pet.status === "pending" || pet.status === "accepted") && (
                              <button
                                onClick={() => openConfirmModal("edit", pet._id, pet.name)}
                                className="p-1.5 bg-white border border-[#ffc929]/20 rounded-full hover:bg-[#ffc929] hover:text-white hover:border-[#ffc929] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                                disabled={loading}
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => openConfirmModal("delete", pet._id, pet.name)}
                              className="p-1.5 bg-white border border-[#ffc929]/20 rounded-full hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                              disabled={loading}
                            >
                              <Trash2 size={16} />
                            </button>
                            {pet.fee === 0 && pet.status !== "pending" && (
                              <button
                                onClick={() => navigate(`/candidates/${pet._id}`)}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-[#ffc929] rounded-full hover:bg-[#e6b625] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
                                disabled={loading}
                              >
                                <Users size={14} />
                                <span className="hidden sm:inline">Candidates</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-6 md:hidden sm:grid-cols-2">
              {paginatedPets.map((pet) => (
                <PetCard
                  key={pet._id}
                  pet={pet}
                  navigate={navigate}
                  onEdit={openConfirmModal}
                  onDelete={openConfirmModal}
                  onViewCandidates={(id) => navigate(`/candidates/${id}`)}
                  disabled={loading}
                  currencySymbol={currencySymbol}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className={`p-2 rounded-full ${
                    currentPage === 1 || loading
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-[#ffc929] hover:bg-[#ffc929]/10"
                  } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30`}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const isCurrent = currentPage === page;
                    const isNear =
                      Math.abs(currentPage - page) <= 1 || page === 1 || page === totalPages;
                    if (!isNear)
                      return page === currentPage - 2 || page === currentPage + 2 ? (
                        <span key={page} className="text-gray-400">
                          ...
                        </span>
                      ) : null;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-full text-sm font-medium ${
                          isCurrent
                            ? "bg-[#ffc929] text-white shadow-md"
                            : "text-gray-600 hover:bg-[#ffc929]/10"
                        } transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30`}
                        aria-label={`Go to page ${page}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className={`p-2 rounded-full ${
                    currentPage === totalPages || loading
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-[#ffc929] hover:bg-[#ffc929]/10"
                  } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30`}
                  aria-label="Next page"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {selectedPet && !editMode && <PetDetailsModal pet={selectedPet} onClose={handleCloseModal} />}
        {selectedPet && editMode && (
          <EditForm
            formData={editFormData}
            onChange={handleInputChange}
            onSubmit={handleUpdate}
            onCancel={handleCloseModal}
            loading={loading}
          />
        )}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={confirmAction}
          action={confirmModal.action}
          itemName={confirmModal.petName}
        />
      </div>
    </section>
  );
};

export default PetOwnerPosts;