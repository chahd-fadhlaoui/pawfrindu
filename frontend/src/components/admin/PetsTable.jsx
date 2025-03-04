import {
  AlertCircle,
  Archive,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Clock1,
  Eye,
  Filter,
  Heart,
  Loader2,
  PawPrint,
  X,
  XCircle,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import axiosInstance from "../../utils/axiosInstance";
import ConfirmationModal from "../ConfirmationModal";
import SearchBar from "../SearchBar";

const PetsTable = ({ onPetChange }) => {
  const { pets, loading, error, triggerPetsRefresh } = useApp();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [filteredPets, setFilteredPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: "",
    petId: null,
    petName: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const petsPerPage = 5;

const PetDetailsModal = ({ pet, onClose, actionLoading }) => {
  const [candidates, setCandidates] = useState([]);
  const [fetchingCandidates, setFetchingCandidates] = useState(false);
  const [candidatesError, setCandidatesError] = useState(null);

  // Fetch candidates for all statuses
  useEffect(() => {
    const fetchCandidates = async () => {
      if (pet._id) {
        setFetchingCandidates(true);
        setCandidatesError(null); // Réinitialiser l'erreur avant chaque appel
        try {
          const response = await axiosInstance.get(`/api/pet/${pet._id}/candidates`);
          if (response.data.success) {
            setCandidates(response.data.data);
          } else {
            setCandidatesError("Failed to fetch candidates");
          }
        } catch (err) {
          if (err.response?.status === 403) {
            setCandidatesError("You are not authorized to view candidates for this pet.");
          } else {
            setCandidatesError(err.response?.data?.message || "Error fetching candidates");
          }
        } finally {
          setFetchingCandidates(false);
        }
      }
    };
    fetchCandidates();
  }, [pet._id]);

  const getCandidateStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500 mr-1" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500 mr-1" />;
      case "pending":
      default:
        return <Clock1 className="w-4 h-4 text-orange-500 mr-1" />;
    }
  };

  // Find approved candidate for "adopted" status
  const approvedCandidate = pet.status === "adopted" && candidates.length > 0
    ? candidates.find(candidate => candidate.status === "approved")
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
      <div className="relative w-full max-w-lg p-6 bg-white border border-gray-200 shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Heart className="w-6 h-6 text-[#ffc929] animate-pulse" />
            {pet.name || "Unnamed Pet"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pet Image and Basic Info */}
        <div className="flex flex-col items-center space-y-6">
          <img
            src={pet.image || "/api/placeholder/150/150"}
            alt={pet.name || "Unnamed Pet"}
            className="object-cover w-32 h-32 border border-gray-200 rounded-full shadow-sm"
          />
          <div className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Pet Details</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-gray-700">
              <p><span className="font-semibold text-gray-900">Owner:</span> {pet.owner?.fullName || "Unknown"}</p>
              <p><span className="font-semibold text-gray-900">Breed:</span> {pet.breed || "-"}</p>
              <p><span className="font-semibold text-gray-900">Age:</span> {pet.age || "N/A"}</p>
              <p><span className="font-semibold text-gray-900">City:</span> {pet.city || "N/A"}</p>
              <p><span className="font-semibold text-gray-900">Gender:</span> {pet.gender || "N/A"}</p>
              <p><span className="font-semibold text-gray-900">Species:</span> {pet.species || "N/A"}</p>
              <p><span className="font-semibold text-gray-900">Fee:</span> {pet.fee === 0 ? "Free" : `${pet.fee} DT`}</p>
              <p><span className="font-semibold text-gray-900">Trained:</span> {pet.isTrained ? "Yes" : "No"}</p>
              <p className="col-span-2">
                <span className="font-semibold text-gray-900">Status:</span> 
                <span className={`ml-2 ${pet.isArchived ? "text-gray-600" : "text-[#ffc929]"}`}>
                  {pet.isArchived ? "Archived" : pet.status}
                </span>
              </p>
            </div>
            <div className="mt-4">
              <p className="font-semibold text-gray-900">Description:</p>
              <p className="text-gray-600 text-sm">{pet.description || "No description available."}</p>
            </div>
          </div>

          {/* Candidates Section */}
          <div className="w-full p-4 border border-gray-200 bg-white rounded-xl shadow-sm">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              {pet.status === "adopted" ? "Ownership Details" : "Adoption Candidates"}
            </h4>
            {fetchingCandidates ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="w-6 h-6 text-[#ffc929] animate-spin" />
                <span className="ml-2 text-gray-600 text-sm">Loading candidates...</span>
              </div>
            ) : candidatesError ? (
              <p className="text-red-600 text-sm py-2">{candidatesError}</p>
            ) : candidates.length === 0 ? (
              <p className="text-gray-500 text-sm italic py-2">
                {pet.status === "adopted" 
                  ? "No approved candidate found." 
                  : "No candidates have applied yet."}
              </p>
            ) : pet.status === "adopted" ? (
              <div className="space-y-4 text-gray-700">
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">Previous Owner:</span>
                  <span>{pet.owner?.fullName || "Unknown"}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">New Owner:</span>
                  {approvedCandidate ? (
                    <span className="text-green-600 font-medium">{approvedCandidate.name || "Unknown"}</span>
                  ) : (
                    <span className="text-gray-500 italic">No approved candidate found</span>
                  )}
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {candidates.map((candidate) => (
                  <li
                    key={candidate.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      {getCandidateStatusIcon(candidate.status)}
                      <div>
                        <span className="text-gray-800 text-sm font-medium">
                          {candidate.name}
                        </span>
                        <span className="text-gray-500 text-xs block">
                          ({candidate.email})
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        candidate.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : candidate.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

  // Filter states
  const [sortByDate, setSortByDate] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("");
  const [feeFilter, setFeeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [trainedFilter, setTrainedFilter] = useState("");

  const uniqueCities = Array.from(
    new Set(pets.map((pet) => (pet.city || "").toLowerCase()))
  ).sort();

  // Filter Select Component
  const FilterSelect = ({ label, value, onChange, options }) => (
    <div className="relative w-full">
      <label className="block mb-1 text-xs font-medium text-gray-700">
        {label}
      </label>
      <select
        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929] transition-all duration-200 text-gray-800"
        value={value}
        onChange={onChange}
        aria-label={`Filter by ${label}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  // Filter options
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "adoptionPending", label: "Adoption Pending" },
    { value: "adopted", label: "Adopted" },
    { value: "sold", label: "Sold" },
    { value: "archived", label: "Archived" },
  ];
  const sortOptions = [
    { value: "desc", label: "Newest First" },
    { value: "asc", label: "Oldest First" },
  ];
  const feeOptions = [
    { value: "", label: "Any Fee" },
    { value: "free", label: "Free" },
    { value: "paid", label: "Paid" },
  ];
  const cityOptions = [
    { value: "", label: "All Cities" },
    ...uniqueCities.map((city) => ({
      value: city,
      label: city.charAt(0).toUpperCase() + city.slice(1),
    })),
  ];
  const speciesOptions = [
    { value: "", label: "All Species" },
    { value: "dog", label: "Dog" },
    { value: "cat", label: "Cat" },
    { value: "other", label: "Other" },
  ];
  const ageOptions = [
    { value: "", label: "All Ages" },
    { value: "puppy", label: "Puppy" },
    { value: "kitten", label: "Kitten" },
    { value: "young", label: "Young" },
    { value: "adult", label: "Adult" },
    { value: "senior", label: "Senior" },
  ];
  const genderOptions = [
    { value: "", label: "Any Gender" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];
  const trainedOptions = [
    { value: "", label: "Any Training" },
    { value: "true", label: "Trained" },
    { value: "false", label: "Not Trained" },
  ];

  // Apply filters and search
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...pets];

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

      filtered = filtered.filter((pet) => {
        const ageMatch =
          !ageFilter ||
          (pet.age || "").toLowerCase() === ageFilter.toLowerCase();

        const statusMatch =
          !statusFilter ||
          (statusFilter === "archived" && pet.isArchived) ||
          (statusFilter !== "archived" &&
            !pet.isArchived &&
            pet.status === statusFilter);

        return (
          statusMatch &&
          (!feeFilter ||
            (feeFilter === "free" ? pet.fee === 0 : pet.fee > 0)) &&
          (!cityFilter ||
            (pet.city || "").toLowerCase() === cityFilter.toLowerCase()) &&
          (!speciesFilter ||
            (pet.species || "").toLowerCase() ===
              speciesFilter.toLowerCase()) &&
          ageMatch &&
          (!genderFilter ||
            (pet.gender || "").toLowerCase() === genderFilter.toLowerCase()) &&
          (!trainedFilter || String(pet.isTrained) === trainedFilter)
        );
      });

      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0);
        const dateB = new Date(b.createdAt || b.updatedAt || 0);
        return sortByDate === "asc" ? dateA - dateB : dateB - dateA;
      });

      setFilteredPets(filtered);
      setCurrentPage(1);
    };

    applyFilters();
  }, [
    pets,
    sortByDate,
    statusFilter,
    feeFilter,
    cityFilter,
    speciesFilter,
    ageFilter,
    genderFilter,
    trainedFilter,
    searchQuery,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPets.length / petsPerPage);
  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = filteredPets.slice(indexOfFirstPet, indexOfLastPet);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleAccept = async (petId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const response = await axiosInstance.put(
        `/api/pet/modifyStatus/${petId}`,
        { status: "accepted" }
      );
      if (response.data.success) {
        // Mise à jour locale immédiate
        setFilteredPets((prevPets) =>
          prevPets.map((pet) =>
            pet._id === petId ? { ...pet, status: "accepted" } : pet
          )
        );
        triggerPetsRefresh(); // Synchroniser avec le contexte
        onPetChange();
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
        // Suppression locale immédiate
        setFilteredPets((prevPets) =>
          prevPets.filter((pet) => pet._id !== petId)
        );
        triggerPetsRefresh(); // Synchroniser avec le contexte
        onPetChange();
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
      const response = await axiosInstance.put(`/api/pet/archivePet/${petId}`);
      if (response.data.success) {
        // Mise à jour locale immédiate
        setFilteredPets((prevPets) =>
          prevPets.map((pet) =>
            pet._id === petId ? { ...pet, isArchived: true } : pet
          )
        );
        triggerPetsRefresh(); // Synchroniser avec le contexte
        onPetChange();
      } else {
        throw new Error(
          response.data.message || "Échec de l'archivage de l'animal"
        );
      }
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Échec de l'archivage de l'animal"
      );
    } finally {
      setActionLoading(false);
    }
  };
  const handleViewInfo = (pet) => {
    setSelectedPet(pet);
  };

  const openConfirmModal = (action, petId, petName) => {
    setConfirmModal({ isOpen: true, action, petId, petName });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, action: "", petId: null, petName: "" });
  };

  const confirmAction = () => {
    const { action, petId } = confirmModal;
    switch (action) {
      case "accept":
        handleAccept(petId);
        break;
      case "delete":
        handleReject(petId);
        break;
      case "archive":
        handleArchive(petId);
        break;
      default:
        break;
    }
    closeConfirmModal();
  };

  const resetFilters = () => {
    setSortByDate("desc");
    setStatusFilter("");
    setFeeFilter("");
    setCityFilter("");
    setSpeciesFilter("");
    setAgeFilter("");
    setGenderFilter("");
    setTrainedFilter("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const getStatusConfig = (status, isArchived) => {
    if (isArchived) {
      return {
        icon: Archive,
        text: "Archived",
        bgClass: "bg-gray-100",
        textClass: "text-gray-600",
        iconClass: "text-gray-500",
        borderClass: "border-gray-300",
      };
    }
    switch (status) {
      case "accepted":
        return {
          icon: Check,
          text: "Accepted",
          bgClass: "bg-[#ffc929]/10",
          textClass: "text-[#ffc929]",
          iconClass: "text-[#ffc929]",
          borderClass: "border-[#ffc929]/20",
        };
      case "adoptionPending":
        return {
          icon: Clock,
          text: "Adoption Pending",
          bgClass: "bg-orange-50",
          textClass: "text-orange-600",
          iconClass: "text-orange-500",
          borderClass: "border-orange-100",
        };
      case "adopted":
      case "sold":
        return {
          icon: Heart,
          text: status === "adopted" ? "Adopted" : "Sold",
          bgClass: "bg-green-50",
          textClass: "text-green-600",
          iconClass: "text-green-500",
          borderClass: "border-green-100",
        };
      default: // pending
        return {
          icon: Clock,
          text: "Pending",
          bgClass: "bg-blue-50",
          textClass: "text-blue-600",
          iconClass: "text-blue-500",
          borderClass: "border-blue-100",
        };
    }
  };

  const anyFilterApplied = () =>
    sortByDate !== "desc" ||
    statusFilter ||
    feeFilter ||
    cityFilter ||
    speciesFilter ||
    ageFilter ||
    genderFilter ||
    trainedFilter ||
    searchQuery;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-12 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-[#ffc929] animate-spin" />
            <p className="text-base font-medium text-gray-600">
              Loading Pets...
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center p-12 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex flex-col items-center gap-4 text-red-600">
            <AlertCircle className="w-10 h-10" />
            <p className="text-base font-medium">Error: {error}</p>
            <button
              onClick={triggerPetsRefresh}
              className="px-4 py-2 text-sm font-medium text-white bg-[#ffc929] rounded-md hover:bg-[#e6b625] focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 transition-all duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Top Bar: Search and Filter Toggle */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pets by name, breed, city, or species..."
            className="w-full sm:w-80 bg-white border-gray-200 focus:ring-[#ffc929] focus:border-[#ffc929] rounded-md shadow-sm transition-all duration-200"
          />
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#ffc929] bg-white border border-[#ffc929] rounded-md hover:bg-[#ffc929]/10 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 transition-all duration-200"
          >
            <Filter className="w-4 h-4" />
            {isFilterOpen ? "Hide Filters" : "Filters"}
            {anyFilterApplied() && (
              <span className="w-2 h-2 bg-[#ffc929] rounded-full" />
            )}
          </button>
        </div>

        {/* Filters Section */}
        {isFilterOpen && (
          <div className="p-4 transition-all duration-300 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              <FilterSelect
                label="Sort by Date"
                value={sortByDate}
                onChange={(e) => setSortByDate(e.target.value)}
                options={sortOptions}
              />
              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
              />
              <FilterSelect
                label="Fee"
                value={feeFilter}
                onChange={(e) => setFeeFilter(e.target.value)}
                options={feeOptions}
              />
              <FilterSelect
                label="City"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                options={cityOptions}
              />
              <FilterSelect
                label="Species"
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                options={speciesOptions}
              />
              <FilterSelect
                label="Age"
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                options={ageOptions}
              />
              <FilterSelect
                label="Gender"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                options={genderOptions}
              />
              <FilterSelect
                label="Trained"
                value={trainedFilter}
                onChange={(e) => setTrainedFilter(e.target.value)}
                options={trainedOptions}
              />
            </div>
            {anyFilterApplied() && (
              <button
                onClick={resetFilters}
                className="mt-4 text-sm font-medium text-[#ffc929] hover:underline focus:outline-none"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Table or Empty State */}
        {filteredPets.length === 0 ? (
          <div className="flex items-center justify-center p-12 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex flex-col items-center gap-4">
              <PawPrint className="w-10 h-10 text-gray-400" />
              <p className="text-base font-medium text-gray-600">
                No pets found
              </p>
              <p className="text-sm text-gray-500">
                Try adjusting your filters or adding a new pet.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-[#ffc929]" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Pet Listings
                </h2>
              </div>
              <span className="text-sm text-gray-500">
                {filteredPets.length}{" "}
                {filteredPets.length === 1 ? "pet" : "pets"}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 text-xs font-semibold text-gray-600 uppercase bg-gray-100 border-b border-gray-200">
                  <tr>
                    {[
                      "Photo",
                      "Name",
                      "Breed",
                      "Age",
                      "City",
                      "Gender",
                      "Species",
                      "Fee",
                      "Trained",
                      "Status",
                      "Actions",
                    ].map((header) => (
                      <th key={header} className="px-4 py-3">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentPets.map((pet) => {
                    const statusConfig = getStatusConfig(
                      pet.status,
                      pet.isArchived
                    );
                    const canAccept =
                      pet.status === "pending" && !pet.isArchived;
                    const canDelete =
                      pet.status === "accepted" && !pet.isArchived; // Only "accepted" allows "Delete"
                    const canArchive =
                      (pet.status === "adopted" || pet.status === "sold") &&
                      !pet.isArchived;
                    return (
                      <tr
                        key={pet._id}
                        className="transition-colors duration-150 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <img
                            src={pet.image || "/api/placeholder/48/48"}
                            alt={pet.name || "Pet"}
                            className="object-cover w-10 h-10 border border-gray-200 rounded-full"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {pet.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {pet.breed || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {pet.age || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {pet.city || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {pet.gender || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {pet.species || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-[#ffc929] font-medium">
                          {pet.fee === 0 ? "Free" : `${pet.fee} DT`}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                              pet.isTrained
                                ? "bg-[#ffc929]/10 text-[#ffc929]"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {pet.isTrained ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.bgClass} border ${statusConfig.borderClass}`}
                          >
                            <statusConfig.icon
                              className={`w-4 h-4 mr-1 ${statusConfig.iconClass}`}
                            />
                            {statusConfig.text}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {canAccept && (
                              <button
                                onClick={() =>
                                  openConfirmModal("accept", pet._id, pet.name)
                                }
                                disabled={actionLoading}
                                className={`p-1.5 rounded-md transition-all duration-200 ${
                                  actionLoading
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-green-600 hover:bg-green-100 hover:text-green-700"
                                }`}
                                title="Accept Pet"
                                aria-label="Accept Pet"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() =>
                                  openConfirmModal("delete", pet._id, pet.name)
                                }
                                disabled={actionLoading}
                                className={`p-1.5 rounded-md transition-all duration-200 ${
                                  actionLoading
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-red-600 hover:bg-red-100 hover:text-red-700"
                                }`}
                                title="Delete Pet"
                                aria-label="Delete Pet"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            {canArchive && (
                              <button
                                onClick={() =>
                                  openConfirmModal("archive", pet._id, pet.name)
                                }
                                disabled={actionLoading}
                                className={`p-1.5 rounded-md transition-all duration-200 ${
                                  actionLoading
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                                }`}
                                title="Archive Pet"
                                aria-label="Archive Pet"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleViewInfo(pet)}
                              className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200"
                              title="View Pet Info"
                              aria-label="View Pet Info"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-600">
                  Showing {indexOfFirstPet + 1}-
                  {Math.min(indexOfLastPet, filteredPets.length)} of{" "}
                  {filteredPets.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-[#ffc929] disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                    aria-label="First page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-[#ffc929] disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(
                      Math.max(0, currentPage - 3),
                      Math.min(totalPages, currentPage + 2)
                    )
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full transition-all duration-200 ${
                          currentPage === page
                            ? "bg-[#ffc929] text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        aria-label={`Page ${page}`}
                      >
                        {page}
                      </button>
                    ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-[#ffc929] disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-[#ffc929] disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                    aria-label="Last page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 rounded-xl">
      {actionError && (
        <div className="flex items-center p-4 border-l-4 border-red-500 rounded-md shadow-sm bg-red-50">
          <X className="w-5 h-5 mr-2 text-red-500" />
          <p className="text-sm text-red-700">{actionError}</p>
        </div>
      )}
      {renderContent()}
      {selectedPet && (
      <PetDetailsModal
        pet={selectedPet}
        onClose={() => setSelectedPet(null)}
        actionLoading={actionLoading}
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

export default PetsTable;
