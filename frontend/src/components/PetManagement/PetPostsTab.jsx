import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Trash2,
  Users,
  Filter,
  X,
  PawPrint,
  Loader2,
  Eye,
  Mail,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import EditForm from "../../components/EditForm";
import EmptyState from "../../components/EmptyState";
import ConfirmationModal from "../../components/ConfirmationModal";
import { Tooltip } from "../Tooltip";

// Constants
const PET_CATEGORIES = ["dog", "cat", "other"];
const STATUS_OPTIONS = ["pending", "accepted", "adopted", "sold"];
const GENDER_OPTIONS = ["male", "female"];
const TRAINED_OPTIONS = ["true", "false"];
const APPROVED_OPTIONS = ["true", "false"];
const ITEMS_PER_PAGE = 9;

const STATUS_STYLES = {
  accepted: "bg-green-50 text-green-600 border-green-100",
  pending: "bg-yellow-50 text-yellow-600 border-yellow-100",
  adopted: "bg-blue-50 text-blue-500 border-blue-100",
  sold: "bg-purple-50 text-purple-500 border-purple-100",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border shadow-sm transition-all duration-300 ${
      STATUS_STYLES[status] || "bg-gray-50 text-gray-500 border-gray-100"
    } hover:opacity-80`}
  >
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const FilterSelect = ({ label, value, onChange, options }) => (
  <div className="w-full sm:w-auto flex-1 min-w-[140px]">
    <select
      className="w-full px-4 py-2.5 text-sm text-gray-700 bg-white border border-[#ffc929]/20 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/30 focus:border-[#ffc929] hover:border-[#ffc929]/50 transition-all duration-300"
      value={value}
      onChange={onChange}
      aria-label={`Filter by ${label}`}
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const FilterBadge = ({ label, value, onClear }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 rounded-full border border-[#ffc929]/20 shadow-sm">
    {label}: {value}
    <button
      onClick={onClear}
      className="ml-1 text-[#ffc929] hover:text-pink-500 transition-colors duration-300"
      aria-label={`Remove ${label} filter`}
    >
      <X size={14} />
    </button>
  </span>
);

const PetCard = ({ pet, onEdit, onDelete, onViewCandidates, disabled, currencySymbol, setSelectedPetLocal, isHovered }) => {
  const isEditable = pet.status === "pending" || (pet.status === "accepted" && pet.candidates.length === 0);

  return (
    <div
      className={`relative bg-white border-2 border-[#ffc929]/20 rounded-3xl shadow-md overflow-hidden transition-all duration-500 ${
        isHovered ? "shadow-xl scale-[1.02] bg-pink-50/30" : "hover:shadow-xl hover:scale-[1.02]"
      } disabled:opacity-50`}
    >
      <div className="relative w-full h-56 overflow-hidden bg-gradient-to-br from-white to-pink-50 rounded-t-3xl">
        <img
          src={pet.image}
          alt={pet.name}
          className="object-cover w-full h-full transition-transform duration-400 hover:scale-110"
          onError={(e) => (e.target.src = "/placeholder-animal.png")}
          loading="lazy"
        />
        <StatusBadge status={pet.status} className="absolute top-3 right-3" />
      </div>
      <div className="p-6 space-y-4">
        {/* Check Email Message for Sold Pets */}
        {pet.status === "sold" && (
          <div className="relative flex items-center gap-3 p-4 text-sm font-semibold text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-2xl border border-[#ffc929]/30 shadow-md animate-fadeIn hover:shadow-lg transition-all duration-300">
            <Mail size={20} className="transition-transform duration-300 group-hover:scale-110" />
            <span>Check your email for buyer's contact details</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800 truncate transition-colors duration-300 hover:text-pink-500">{pet.name}</h3>
          <Tooltip text="View Details">
            <button
              onClick={() => !disabled && setSelectedPetLocal(pet)}
              className="p-2 bg-white border border-[#ffc929]/20 rounded-full hover:bg-[#ffc929] hover:text-white hover:border-[#ffc929] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
              disabled={disabled}
            >
              <Eye size={18} />
            </button>
          </Tooltip>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <p>{pet.species.charAt(0).toUpperCase() + pet.species.slice(1)} • {pet.breed || "N/A"}</p>
          <div className="flex justify-between text-base font-medium text-gray-700">
            <span className="px-3 py-1 border border-[#ffc929]/20 rounded-full shadow-sm bg-[#ffc929]/5">{pet.city}</span>
            <span
              className={`px-3 py-1 rounded-full border shadow-sm ${
                pet.fee === 0 ? "bg-green-50 border-green-100 text-green-600" : "bg-[#ffc929]/10 border-[#ffc929]/20 text-[#ffc929]"
              }`}
            >
              {pet.fee === 0 ? "Free" : `${pet.fee} ${currencySymbol}`}
            </span>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t border-[#ffc929]/10" onClick={(e) => e.stopPropagation()}>
          {isEditable && (
            <Tooltip text="Edit Pet">
              <button
                onClick={() => onEdit("edit", pet._id, pet.name)}
                className="p-2 bg-white border border-[#ffc929]/20 rounded-full hover:bg-[#ffc929] hover:text-white hover:border-[#ffc929] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                disabled={disabled}
              >
                <Edit size={18} />
              </button>
            </Tooltip>
          )}
          <Tooltip text="Delete Pet">
            <button
              onClick={() => onDelete("delete", pet._id, pet.name)}
              className="p-2 bg-white border border-[#ffc929]/20 rounded-full hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
              disabled={disabled}
            >
              <Trash2 size={18} />
            </button>
          </Tooltip>
          {pet.fee === 0 && pet.status !== "pending" && (
            <Tooltip text="View Candidates">
              <button
                onClick={() => onViewCandidates(pet._id)}
                className="flex items-center gap-2 px-4 py-1.5 text-sm text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-full hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                disabled={disabled}
              >
                <Users size={16} />
                <span>Candidates</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

const PetPostsTab = ({ setSelectedPet, setApprovalMessage }) => {
  const navigate = useNavigate();
  const { user, userPets, updatePet, deletePet, currencySymbol, setError, clearError, loading, setLoading } = useApp();
  const [selectedPetLocal, setSelectedPetLocal] = useState(null);
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
  const [hoveredPetId, setHoveredPetId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  const handleEdit = useCallback(
    (petId, petName) => {
      const pet = userPets.find((p) => p._id === petId);
      if (pet && (pet.status === "pending" || (pet.status === "accepted" && pet.candidates.length === 0))) {
        setEditMode(true);
        setSelectedPetLocal(pet);
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
          setApprovalMessage(result.message || "Pet removed successfully.");
        } else {
          throw new Error(result.error || "Failed to remove pet");
        }
      } catch (err) {
        setError(err.message || "Failed to remove pet");
      } finally {
        setLoading(false);
      }
    },
    [deletePet, setError, setApprovalMessage, setLoading]
  );

  const handleUpdate = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        if (!selectedPetLocal) throw new Error("No pet selected for update");
        const updatedData = {
          ...editFormData,
          isTrained: editFormData.isTrained === true || editFormData.isTrained === "true",
          fee: Number(editFormData.fee),
        };
        const result = await updatePet(selectedPetLocal._id, updatedData);
        if (result.success) {
          setApprovalMessage(
            result.message?.includes("pending admin approval")
              ? result.message
              : "Pet updated successfully."
          );
          setEditMode(false);
          setEditFormData(null);
          setSelectedPetLocal(null);
          setSelectedPet(null);
          clearError();
        } else {
          throw new Error(result.error || "Failed to update pet");
        }
      } catch (err) {
        setError(err.message || "Failed to update pet");
      } finally {
        setLoading(false);
      }
    },
    [selectedPetLocal, editFormData, updatePet, setApprovalMessage, setError, clearError, setSelectedPet, setLoading]
  );

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
    .filter((pet) => !pet.isArchived)
    .filter((pet) => {
      const statusMatch = !filterStatus || pet.status === filterStatus;
      const speciesMatch = !filterSpecies || pet.species === filterSpecies;
      const genderMatch = !filterGender || pet.gender === filterGender;
      const trainedMatch = !filterTrained || String(pet.isTrained) === filterTrained;
      const approvedMatch = !filterApproved || String(pet.isApproved) === filterApproved;
      return statusMatch && speciesMatch && genderMatch && trainedMatch && approvedMatch;
    });

  const totalPages = Math.ceil(filteredPets.length / ITEMS_PER_PAGE);
  const paginatedPets = filteredPets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handleSetSelectedPetLocal = (pet) => {
    setSelectedPetLocal(pet);
    setSelectedPet(pet);
  };

  return (
    <div className="space-y-8">
      {/* Filters and Controls */}
      <div className="bg-white backdrop-blur-sm bg-opacity-90 border-2 border-[#ffc929]/20 shadow-xl rounded-3xl p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
          >
            <Filter size={16} />
            {isFilterOpen ? "Hide Filters" : "Filter Posts"}
          </button>
          {filteredPets.length > 0 && (
            <span className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 border border-[#ffc929]/20 rounded-full shadow-inner">
              <PawPrint size={16} className="text-[#ffc929]" /> {filteredPets.length} Pets
            </span>
          )}
          <button
            onClick={() => navigate("/addPet")}
            className="flex items-center gap-2 px-6 py-2.5 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
            disabled={loading}
          >
            <Plus size={16} />
            Add New Post
          </button>
        </div>
        <div
          className={`grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 transition-all duration-300 ease-in-out ${
            isFilterOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
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
          <div className="flex flex-wrap gap-2 mt-6">
            <span className="text-sm font-medium text-gray-600">Applied Filters:</span>
            {filterStatus && <FilterBadge label="Status" value={filterStatus} onClear={() => clearFilter("status")} />}
            {filterSpecies && (
              <FilterBadge label="Species" value={filterSpecies} onClear={() => clearFilter("species")} />
            )}
            {filterGender && <FilterBadge label="Gender" value={filterGender} onClear={() => clearFilter("gender")} />}
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
              className="px-4 py-1.5 ml-2 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 hover:bg-[#ffc929]/20 transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center animate-pulse">
            <PawPrint size={48} className="mx-auto text-[#ffc929]" />
            <p className="mt-4 text-lg font-medium text-gray-600">Loading your pets...</p>
          </div>
        </div>
      ) : userPets.length === 0 ? (
        <EmptyState
          message="You haven't created any pet adoption posts yet. Start by adding your first pet!"
          buttonText="Add Your First Pet"
          buttonAction={() => navigate("/addPet")}
          disabled={loading}
        />
      ) : filteredPets.length === 0 ? (
        <div className="py-12 text-center">
          <PawPrint size={48} className="mx-auto mb-4 text-[#ffc929] animate-bounce" />
          <h3 className="text-xl font-semibold text-gray-800">No Results Found</h3>
          <p className="mt-2 text-gray-600">Adjust your filters or add a new pet to get started.</p>
          <button
            onClick={clearAllFilters}
            className="mt-6 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table Layout */}
          <div className="hidden md:block bg-white border-2 border-[#ffc929]/20 shadow-xl rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gradient-to-r from-[#ffc929]/10 to-pink-50 text-gray-700 sticky top-0">
                  <tr>
                    {["Pet", "Name", "Description", "Breed", "Age", "Fee", "Status", "Actions"].map((header) => (
                      <th key={header} className="px-6 py-4 font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedPets.map((pet) => {
                    const isEditable = pet.status === "pending" || (pet.status === "accepted" && pet.candidates.length === 0);

                    return (
                      <tr
                        key={pet._id}
                        className={`transition-all duration-200 border-b border-[#ffc929]/10 ${
                          hoveredPetId === pet._id ? "bg-pink-50/30" : "hover:bg-pink-50/20"
                        }`}
                        onMouseEnter={() => setHoveredPetId(pet._id)}
                        onMouseLeave={() => setHoveredPetId(null)}
                      >
                        <td className="px-6 py-4">
                          <div className="relative w-12 h-12 overflow-hidden rounded-full shadow-md group">
                            <img
                              src={pet.image}
                              alt={pet.name}
                              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                              loading="lazy"
                              onError={(e) => (e.target.src = "/placeholder-animal.png")}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800 transition-colors duration-300 hover:text-pink-500">
                          {pet.name}
                        </td>
                        <td className="max-w-xs px-6 py-4 text-gray-600 truncate">{pet.description}</td>
                        <td className="px-6 py-4 text-gray-600">{pet.breed || "-"}</td>
                        <td className="px-6 py-4 text-gray-600">{pet.age}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {pet.fee === 0 ? "Free" : `${pet.fee} ${currencySymbol}`}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <StatusBadge status={pet.status} />
                            {pet.status === "sold" && (
                              <div className="relative flex items-center gap-2 p-2 text-xs font-semibold text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-lg border border-[#ffc929]/30 shadow-sm animate-fadeIn hover:shadow-md transition-all duration-300">
                                <Mail size={16} className="transition-transform duration-300 group-hover:scale-110" />
                                <span>Check email for buyer details</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-3">
                            <Tooltip text="View Details">
                              <button
                                onClick={() => !loading && handleSetSelectedPetLocal(pet)}
                                className="p-2 bg-white border border-[#ffc929]/20 rounded-full hover:bg-[#ffc929] hover:text-white hover:border-[#ffc929] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                                disabled={loading}
                              >
                                <Eye size={18} />
                              </button>
                            </Tooltip>
                            {isEditable && (
                              <Tooltip text="Edit Pet">
                                <button
                                  onClick={() => openConfirmModal("edit", pet._id, pet.name)}
                                  className="p-2 bg-white border border-[#ffc929]/20 rounded-full hover:bg-[#ffc929] hover:text-white hover:border-[#ffc929] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                                  disabled={loading}
                                >
                                  <Edit size={18} />
                                </button>
                              </Tooltip>
                            )}
                            <Tooltip text="Delete Pet">
                              <button
                                onClick={() => openConfirmModal("delete", pet._id, pet.name)}
                                className="p-2 bg-white border border-[#ffc929]/20 rounded-full hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                                disabled={loading}
                              >
                                <Trash2 size={18} />
                              </button>
                            </Tooltip>
                            {pet.fee === 0 && pet.status !== "pending" && (
                              <Tooltip text="View Candidates">
                                <button
                                  onClick={() => navigate(`/candidates/${pet._id}`)}
                                  className="flex items-center gap-2 px-4 py-1.5 text-sm text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-full hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                                  disabled={loading}
                                >
                                  <Users size={16} />
                                  <span>Candidates</span>
                                </button>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="grid gap-6 md:hidden sm:grid-cols-2 lg:grid-cols-3 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            {paginatedPets.map((pet) => (
              <PetCard
                key={pet._id}
                pet={pet}
                onEdit={openConfirmModal}
                onDelete={openConfirmModal}
                onViewCandidates={(id) => navigate(`/candidates/${id}`)}
                disabled={loading}
                currencySymbol={currencySymbol}
                setSelectedPetLocal={handleSetSelectedPetLocal}
                isHovered={hoveredPetId === pet._id}
                onMouseEnter={() => setHoveredPetId(pet._id)}
                onMouseLeave={() => setHoveredPetId(null)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12 animate-fadeIn" style={{ animationDelay: "0.4s" }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className={`p-2 rounded-full ${
                  currentPage === 1 || loading ? "text-gray-300 cursor-not-allowed" : "text-[#ffc929] hover:bg-[#ffc929]/10"
                } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30`}
                aria-label="Previous page"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-full text-sm font-medium ${
                      currentPage === page ? "bg-[#ffc929] text-white shadow-md" : "text-gray-600 hover:bg-[#ffc929]/10"
                    } transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30`}
                    aria-label={`Go to page ${page}`}
                  >
                    {page}
                  </button>
                ))}
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
      {editMode && selectedPetLocal && (
        <EditForm
          formData={editFormData}
          onChange={handleInputChange}
          onSubmit={handleUpdate}
          onCancel={() => {
            setEditMode(false);
            setSelectedPetLocal(null);
            setSelectedPet(null);
          }}
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
  );
};

export default PetPostsTab;