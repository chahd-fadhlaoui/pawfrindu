import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Archive,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Eye,
  Filter,
  Heart,
  Loader2,
  PawPrint,
  RotateCcw,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import axiosInstance from "../../utils/axiosInstance";
import ConfirmationModal from "../ConfirmationModal";
import SearchBar from "../SearchBar";

const ArchivedPetsTable = () => {
  const { pets, loading, error, triggerPetsRefresh } = useApp();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
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
  const [filteredPets, setFilteredPets] = useState([]);
  const petsPerPage = 5;

  // Filter states
  const [sortByDate, setSortByDate] = useState("desc"); // Added sorting
  const [statusFilter, setStatusFilter] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [trainedFilter, setTrainedFilter] = useState("");

  // Filter Select Component
  const FilterSelect = ({ label, value, onChange, options }) => (
    <div className="relative w-full sm:w-48">
      <select
        className={`w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#ffc929] focus:border-[#ffc929] transition-all duration-200 ${
          value ? "text-[#ffc929] font-semibold border-[#ffc929]" : "text-gray-600"
        }`}
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
  const sortOptions = [
    { value: "desc", label: "Newest First" },
    { value: "asc", label: "Oldest First" },
  ];
  const statusOptions = [
    { value: "", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "adopted", label: "Adopted" },
    { value: "sold", label: "Sold" },
  ];
  const speciesOptions = [
    { value: "", label: "All" },
    { value: "dog", label: "Dog" },
    { value: "cat", label: "Cat" },
    { value: "bird", label: "Bird" },
    { value: "other", label: "Other" },
  ];
  const ageOptions = [
    { value: "", label: "All" },
    { value: "puppy", label: "Puppy" },
    { value: "kitten", label: "Kitten" },
    { value: "adult", label: "Adult" },
    { value: "senior", label: "Senior" },
  ];
  const genderOptions = [
    { value: "", label: "All" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];
  const trainedOptions = [
    { value: "", label: "All" },
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ];

  // Apply filters and search
  useEffect(() => {
    const applyFilters = () => {
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

      filtered = filtered.filter((pet) => {
        const ageMatch =
          !ageFilter ||
          (ageFilter === "puppy"
            ? pet.species === "dog" && (typeof pet.age === "number" ? pet.age < 1 : pet.age?.toLowerCase() === "puppy")
            : ageFilter === "kitten"
            ? pet.species === "cat" && (typeof pet.age === "number" ? pet.age < 1 : pet.age?.toLowerCase() === "kitten")
            : ageFilter === "adult"
            ? typeof pet.age === "number"
              ? pet.age >= 1 && pet.age <= 7
              : pet.age?.toLowerCase() === "adult"
            : ageFilter === "senior"
            ? typeof pet.age === "number"
              ? pet.age > 7
              : pet.age?.toLowerCase() === "senior"
            : true);

        return (
          (!statusFilter || pet.status === statusFilter) &&
          (!speciesFilter || (pet.species || "").toLowerCase() === speciesFilter.toLowerCase()) &&
          ageMatch &&
          (!genderFilter || (pet.gender || "").toLowerCase() === genderFilter.toLowerCase()) &&
          (!trainedFilter || String(pet.isTrained) === trainedFilter)
        );
      });

      filtered.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0); // Use updatedAt or createdAt
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return sortByDate === "asc" ? dateA - dateB : dateB - dateA;
      });

      setFilteredPets(filtered);
    };

    applyFilters();
  }, [pets, sortByDate, statusFilter, speciesFilter, ageFilter, genderFilter, trainedFilter, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPets.length / petsPerPage);
  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = filteredPets.slice(indexOfFirstPet, indexOfLastPet);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleUnarchive = async (petId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const response = await axiosInstance.put(`/api/pet/unarchivePet/${petId}`);
      if (response.data.success) {
        triggerPetsRefresh();
        setSelectedPet(null);
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
    if (action === "unarchive") {
      handleUnarchive(petId);
    }
    closeConfirmModal();
  };

  const resetFilters = () => {
    setSortByDate("desc");
    setStatusFilter("");
    setSpeciesFilter("");
    setAgeFilter("");
    setGenderFilter("");
    setTrainedFilter("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const anyFilterApplied = () =>
    sortByDate !== "desc" ||
    statusFilter ||
    speciesFilter ||
    ageFilter ||
    genderFilter ||
    trainedFilter ||
    searchQuery;

  const getStatusConfig = (status) => {
    switch (status) {
      case "accepted":
        return {
          icon: Heart,
          text: "Accepted",
          bgClass: "bg-[#ffc929]/20",
          textClass: "text-[#ffc929]",
          iconClass: "text-[#ffc929]",
          borderClass: "border-[#ffc929]/30",
        };
      case "adopted":
      case "sold":
        return {
          icon: Heart,
          text: status.charAt(0).toUpperCase() + status.slice(1),
          bgClass: "bg-green-100",
          textClass: "text-green-600",
          iconClass: "text-green-500",
          borderClass: "border-green-200",
        };
      default: // pending
        return {
          icon: Clock,
          text: "Pending",
          bgClass: "bg-pink-100",
          textClass: "text-pink-600",
          iconClass: "text-pink-500",
          borderClass: "border-pink-200",
        };
    }
  };

  const PetDetailsModal = ({ pet, onClose, onUnarchive, actionLoading }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
        <div className="relative w-full max-w-lg p-6 bg-white border border-gray-200 shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Heart className="w-6 h-6 text-[#ffc929] animate-pulse" /> {pet.name || "Unnamed Pet"}
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <img
              src={pet.image || "/api/placeholder/150/150"}
              alt={pet.name || "Unnamed Pet"}
              className="object-cover w-32 h-32 border border-gray-200 rounded-full shadow-sm"
            />
            <div className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <p><span className="font-semibold text-gray-900">Owner:</span> {pet.owner?.fullName || "Unknown"}</p>
                <p><span className="font-semibold text-gray-900">Breed:</span> {pet.breed || "-"}</p>
                <p><span className="font-semibold text-gray-900">Age:</span> {pet.age || "N/A"}</p>
                <p><span className="font-semibold text-gray-900">City:</span> {pet.city || "N/A"}</p>
                <p><span className="font-semibold text-gray-900">Gender:</span> {pet.gender || "N/A"}</p>
                <p><span className="font-semibold text-gray-900">Species:</span> {pet.species || "N/A"}</p>
                <p><span className="font-semibold text-gray-900">Fee:</span> {pet.fee === 0 ? "Free" : `${pet.fee}dt`}</p>
                <p><span className="font-semibold text-gray-900">Trained:</span> {pet.isTrained ? "Yes" : "No"}</p>
                <p><span className="font-semibold text-gray-900">Status:</span> {pet.status} (Archived)</p>
              </div>
              <div className="mt-4">
                <p className="font-semibold text-gray-900">Description:</p>
                <p className="text-gray-600">{pet.description || "No description available."}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
            >
              Cancel
            </button>
            <button
              onClick={() => openConfirmModal("unarchive", pet._id, pet.name)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 text-white bg-[#ffc929] rounded-lg hover:bg-[#ffa726] hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
            >
              {actionLoading ? "Unarchiving..." : (
                <>
                  <RotateCcw className="w-4 h-4" /> Unarchive
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="w-full p-8 text-center bg-white border border-gray-200 shadow-lg rounded-2xl animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#ffc929] animate-spin" />
              <PawPrint className="w-8 h-8 text-[#ffc929] animate-pulse" />
            </div>
            <p className="text-lg font-semibold text-gray-700">Loading archived pets...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full p-8 text-center bg-white border border-gray-200 shadow-lg rounded-2xl animate-fade-in">
          <div className="flex flex-col items-center gap-4 text-red-600">
            <AlertCircle size={48} />
            <p className="text-lg font-semibold">Error: {error}</p>
            <button
              onClick={triggerPetsRefresh}
              className="px-4 py-2 text-sm font-semibold text-[#ffc929] bg-[#ffc929]/10 rounded-lg hover:bg-[#ffc929]/20 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (filteredPets.length === 0) {
      return (
        <div className="w-full p-8 text-center bg-white border border-gray-200 shadow-lg rounded-2xl animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <PawPrint size={48} className="text-[#ffc929]" />
            <p className="text-lg font-semibold text-gray-700">No archived pets found</p>
            <p className="text-sm text-gray-600">Adjust your filters or unarchive a pet.</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, breed, city, or species..."
          className="w-full sm:w-72 bg-white border-gray-300 focus:ring-[#ffc929] focus:border-[#ffc929] rounded-lg shadow-sm transition-all duration-200"
        />

        {/* Filter Bar */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#ffc929] bg-[#ffc929]/10 rounded-lg hover:bg-[#ffc929]/20 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
            >
              <Filter size={16} />
              {isFilterOpen ? "Hide Filters" : "Show Filters"}
            </button>
            {anyFilterApplied() && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-semibold text-[#ffc929] bg-[#ffc929]/10 rounded-lg hover:bg-[#ffc929]/20 hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
              >
                Clear Filters
              </button>
            )}
          </div>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-300 ${
              !isFilterOpen ? "h-0 overflow-hidden" : "h-auto"
            }`}
          >
            <FilterSelect label="Sort by Date" value={sortByDate} onChange={(e) => setSortByDate(e.target.value)} options={sortOptions} />
            <FilterSelect label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={statusOptions} />
            <FilterSelect label="Species" value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)} options={speciesOptions} />
            <FilterSelect label="Age" value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} options={ageOptions} />
            <FilterSelect label="Gender" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} options={genderOptions} />
            <FilterSelect label="Trained" value={trainedFilter} onChange={(e) => setTrainedFilter(e.target.value)} options={trainedOptions} />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <PawPrint className="w-6 h-6 text-[#ffc929]" />
              <h2 className="text-xl font-bold text-gray-900">Archived Pets Table</h2>
            </div>
            <span className="text-sm text-gray-500">{filteredPets.length} pets</span>
          </div>
          <div className="overflow-x-auto max-h-[60vh] custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 z-10 text-xs text-gray-700 uppercase bg-gray-100 shadow-sm">
                <tr>
                  {["Photo", "Name", "Breed", "Age", "City", "Gender", "Species", "Fee", "Trained", "Status", "Actions"].map(
                    (header) => (
                      <th key={header} className="px-6 py-4 font-semibold whitespace-nowrap">
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentPets.map((pet) => {
                  const statusConfig = getStatusConfig(pet.status);
                  return (
                    <tr
                      key={pet._id}
                      className="transition-all duration-200 cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="relative w-12 h-12 overflow-hidden transition-transform duration-200 border border-gray-200 rounded-full shadow-sm hover:scale-105">
                          <img
                            src={pet.image || "/api/placeholder/48/48"}
                            alt={pet.name || "Unnamed Pet"}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {pet.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{pet.breed || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{pet.age || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-600">{pet.city || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-600">{pet.gender || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-600">{pet.species || "N/A"}</td>
                      <td className="px-6 py-4 text-[#ffc929] font-medium">
                        {pet.fee === 0 ? "Free" : `${pet.fee}dt`}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full shadow-sm ${
                            pet.isTrained
                              ? "bg-[#ffc929]/20 text-[#ffc929] hover:bg-[#ffc929]/30"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          } transition-colors duration-200`}
                        >
                          {pet.isTrained ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full shadow-sm ${statusConfig.bgClass} border ${statusConfig.borderClass}`}
                        >
                          <statusConfig.icon className={`w-4 h-4 ${statusConfig.iconClass}`} />
                          <span className={`text-xs font-semibold ${statusConfig.textClass}`}>
                            {statusConfig.text} (Archived)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openConfirmModal("unarchive", pet._id, pet.name)}
                            disabled={actionLoading}
                            className={`p-2 rounded-full transition-all duration-200 ${
                              actionLoading
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-blue-500 hover:bg-blue-50 hover:text-blue-700 hover:scale-105"
                            }`}
                            title="Unarchive Pet"
                            aria-label="Unarchive Pet"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleViewInfo(pet)}
                            className="p-2 text-gray-500 transition-all duration-200 rounded-full hover:bg-gray-50 hover:text-gray-700 hover:scale-105"
                            title="View Pet Info"
                            aria-label="View Pet Info"
                          >
                            <Eye className="w-5 h-5" />
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
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstPet + 1}-
                {Math.min(indexOfLastPet, filteredPets.length)} of {filteredPets.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#ffc929] hover:bg-[#ffc929]/10 hover:text-[#ffa726]"
                  }`}
                  aria-label="First page"
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#ffc929] hover:bg-[#ffc929]/10 hover:text-[#ffa726]"
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                        currentPage === page
                          ? "bg-[#ffc929] text-white shadow-md"
                          : "text-gray-600 hover:bg-[#ffc929]/10 hover:scale-105"
                      }`}
                      aria-label={`Page ${page}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#ffc929] hover:bg-[#ffc929]/10 hover:text-[#ffa726]"
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#ffc929] hover:bg-[#ffc929]/10 hover:text-[#ffa726]"
                  }`}
                  aria-label="Last page"
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="p-6 space-y-6 shadow-lg bg-gray-50 rounded-2xl">
      {actionError && (
        <div className="flex items-center p-4 space-x-3 border-l-4 border-red-500 rounded-lg shadow-sm bg-red-50 animate-fade-in">
          <X className="flex-shrink-0 w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">{actionError}</p>
        </div>
      )}
      {renderContent()}
      {selectedPet && (
        <PetDetailsModal
          pet={selectedPet}
          onClose={() => setSelectedPet(null)}
          onUnarchive={handleUnarchive}
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

export default ArchivedPetsTable;