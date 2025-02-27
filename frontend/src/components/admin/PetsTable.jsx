import {
  AlertCircle,
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Filter,
  Heart,
  Loader2,
  PawPrint,
  X,
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

  // Filter states
  const [sortByDate, setSortByDate] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("");
  const [feeFilter, setFeeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [trainedFilter, setTrainedFilter] = useState("");

  const uniqueCities = Array.from(new Set(pets.map((pet) => (pet.city || "").toLowerCase()))).sort();

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

  // Filter options with "All" included
  const sortOptions = [
    { value: "desc", label: "Newest First" },
    { value: "asc", label: "Oldest First" },
  ];
  const statusOptions = [
    { value: "", label: "Status" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "adopted", label: "Adopted" },
    { value: "sold", label: "Sold" },
  ];
  const feeOptions = [
    { value: "", label: "Fee" },
    { value: "free", label: "Free" },
    { value: "paid", label: "Paid" },
  ];
  const cityOptions = [
    { value: "", label: "City" },
    ...uniqueCities.map((city) => ({
      value: city,
      label: city.charAt(0).toUpperCase() + city.slice(1),
    })),
  ];
  const speciesOptions = [
    { value: "", label: "Species" },
    { value: "dog", label: "Dog" },
    { value: "cat", label: "Cat" },
    { value: "bird", label: "Bird" },
    { value: "other", label: "Other" },
  ];
  const ageOptions = [
    { value: "", label: "Age" },
    { value: "puppy", label: "Puppy" },
    { value: "kitten", label: "Kitten" },
    { value: "adult", label: "Adult" },
    { value: "senior", label: "Senior" },
  ];
  const genderOptions = [
    { value: "", label: "Gender" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];
  const trainedOptions = [
    { value: "", label: "Trained" },
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ];

  // Apply filters and search
  useEffect(() => {
    const applyFilters = () => {
      let filtered = pets.filter((pet) => !pet.isArchived);

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
          (!feeFilter || (feeFilter === "free" ? pet.fee === 0 : pet.fee > 0)) &&
          (!cityFilter || (pet.city || "").toLowerCase() === cityFilter.toLowerCase()) &&
          (!speciesFilter || (pet.species || "").toLowerCase() === speciesFilter.toLowerCase()) &&
          ageMatch &&
          (!genderFilter || (pet.gender || "").toLowerCase() === genderFilter.toLowerCase()) &&
          (!trainedFilter || String(pet.isTrained) === trainedFilter)
        );
      });

      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0);
        const dateB = new Date(b.createdAt || b.updatedAt || 0);
        return sortByDate === "asc" ? dateA - dateB : dateB - dateA;
      });

      setFilteredPets(filtered);
      setCurrentPage(1); // Reset to first page on filter change
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
      const response = await axiosInstance.put(`/api/pet/modifyStatus/${petId}`, { status: "accepted" });
      if (response.data.success) {
        triggerPetsRefresh();
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
      const response = await axiosInstance.delete(`/api/pet/deleteAdminPet/${petId}`);
      if (response.data.success) {
        triggerPetsRefresh();
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
      const response = await axiosInstance.delete(`/api/pet/deleteAdminPet/${petId}`);
      if (response.data.success) {
        triggerPetsRefresh();
        onPetChange();
      } else {
        throw new Error(response.data.message || "Failed to archive pet");
      }
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to archive pet");
    } finally {
      setActionLoading(false);
    }
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
        borderClass: "border-gray-200",
      };
    }
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
        <div className="w-full p-8 text-center bg-white border border-gray-200 shadow-lg rounded-2xl animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#ffc929] animate-spin" />
              <PawPrint className="w-8 h-8 text-[#ffc929] animate-pulse" />
            </div>
            <p className="text-lg font-semibold text-gray-700">Loading pets...</p>
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
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-300 ${
              !isFilterOpen ? "h-0 overflow-hidden" : "h-auto"
            }`}
          >
            <FilterSelect label="Sort by Date" value={sortByDate} onChange={(e) => setSortByDate(e.target.value)} options={sortOptions} />
            <FilterSelect label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={statusOptions} />
            <FilterSelect label="Fee" value={feeFilter} onChange={(e) => setFeeFilter(e.target.value)} options={feeOptions} />
            <FilterSelect label="City" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} options={cityOptions} />
            <FilterSelect label="Species" value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)} options={speciesOptions} />
            <FilterSelect label="Age" value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} options={ageOptions} />
            <FilterSelect label="Gender" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} options={genderOptions} />
            <FilterSelect label="Trained" value={trainedFilter} onChange={(e) => setTrainedFilter(e.target.value)} options={trainedOptions} />
          </div>
        </div>

        {/* Table Content */}
        {filteredPets.length === 0 ? (
          <div className="w-full p-8 text-center bg-white border border-gray-200 shadow-lg rounded-2xl animate-fade-in">
            <div className="flex flex-col items-center gap-4">
              <PawPrint size={48} className="text-[#ffc929]" />
              <p className="text-lg font-semibold text-gray-700">No active pets found</p>
              <p className="text-sm text-gray-600">Adjust your filters or add a new pet.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <PawPrint className="w-6 h-6 text-[#ffc929]" />
                <h2 className="text-xl font-bold text-gray-900">Pet Adoption Table</h2>
              </div>
              <span className="text-sm text-gray-500">{filteredPets.length} pets</span>
            </div>
            <div className="overflow-x-auto max-h-[60vh]">
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
                    const statusConfig = getStatusConfig(pet.status, pet.isArchived);
                    const isAccepted = pet.status === "accepted";
                    const canArchive = pet.status === "adopted" || pet.status === "sold";
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
                              {statusConfig.text}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {!canArchive && (
                              <button
                                onClick={() => openConfirmModal("accept", pet._id, pet.name)}
                                disabled={actionLoading || isAccepted || pet.isArchived}
                                className={`p-2 rounded-full transition-all duration-200 ${
                                  actionLoading || isAccepted || pet.isArchived
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-green-500 hover:bg-green-50 hover:text-green-700 hover:scale-105"
                                }`}
                                title="Accept Pet"
                                aria-label="Accept Pet"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                            )}
                            {!isAccepted && (
                              canArchive ? (
                                <button
                                  onClick={() => openConfirmModal("archive", pet._id, pet.name)}
                                  disabled={actionLoading || pet.isArchived}
                                  className={`p-2 rounded-full transition-all duration-200 ${
                                    actionLoading || pet.isArchived
                                      ? "text-gray-400 cursor-not-allowed"
                                      : "text-[#ffc929] hover:bg-[#ffc929]/10 hover:text-[#ffa726] hover:scale-105"
                                  }`}
                                  title="Archive Pet"
                                  aria-label="Archive Pet"
                                >
                                  <Archive className="w-5 h-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => openConfirmModal("delete", pet._id, pet.name)}
                                  disabled={actionLoading || pet.isArchived}
                                  className={`p-2 rounded-full transition-all duration-200 ${
                                    actionLoading || pet.isArchived
                                      ? "text-gray-400 cursor-not-allowed"
                                      : "text-red-500 hover:bg-red-50 hover:text-red-700 hover:scale-105"
                                  }`}
                                  title="Delete Pet"
                                  aria-label="Delete Pet"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              )
                            )}
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
        )}
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