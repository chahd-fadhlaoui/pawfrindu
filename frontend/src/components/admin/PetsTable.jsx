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

  const uniqueCities = Array.from(
    new Set(pets.map((pet) => (pet.city || "").toLowerCase()))
  ).sort();

  // Filter Select Component
  const FilterSelect = ({ label, value, onChange, options }) => (
    <div className="relative w-full">
      <label className="block mb-1 text-xs font-medium text-gray-700">{label}</label>
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
    { value: "archived", label: "Archived" }, // Added to match schema capability
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
      let filtered = [...pets]; // Include all pets initially

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
          !ageFilter || (pet.age || "").toLowerCase() === ageFilter.toLowerCase();

        // Handle status filter including archived
        const statusMatch =
          !statusFilter ||
          (statusFilter === "archived" && pet.isArchived) ||
          (statusFilter !== "archived" && !pet.isArchived && pet.status === statusFilter);

        return (
          statusMatch &&
          (!feeFilter ||
            (feeFilter === "free" ? pet.fee === 0 : pet.fee > 0)) &&
          (!cityFilter ||
            (pet.city || "").toLowerCase() === cityFilter.toLowerCase()) &&
          (!speciesFilter ||
            (pet.species || "").toLowerCase() === speciesFilter.toLowerCase()) &&
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
      const response = await axiosInstance.delete(
        `/api/pet/deleteAdminPet/${petId}`
      );
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
      const response = await axiosInstance.delete(
        `/api/pet/deleteAdminPet/${petId}`
      ); // Old version’s archive logic
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
            <p className="text-base font-medium text-gray-600">Loading Pets...</p>
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
                {filteredPets.length} {filteredPets.length === 1 ? "pet" : "pets"}
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
                    const isAccepted = pet.status === "accepted";
                    const canArchive = pet.status === "adopted" || pet.status === "sold";
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
                            {!canArchive && (
                              <button
                                onClick={() =>
                                  openConfirmModal("accept", pet._id, pet.name)
                                }
                                disabled={
                                  actionLoading || isAccepted || pet.isArchived
                                }
                                className={`p-1.5 rounded-md transition-all duration-200 ${
                                  actionLoading || isAccepted || pet.isArchived
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-green-600 hover:bg-green-100 hover:text-green-700"
                                }`}
                                title="Accept Pet"
                                aria-label="Accept Pet"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {!isAccepted && (
                              canArchive ? (
                                <button
                                  onClick={() =>
                                    openConfirmModal("archive", pet._id, pet.name)
                                  }
                                  disabled={actionLoading || pet.isArchived}
                                  className={`p-1.5 rounded-md transition-all duration-200 ${
                                    actionLoading || pet.isArchived
                                      ? "text-gray-400 cursor-not-allowed"
                                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                                  }`}
                                  title="Archive Pet"
                                  aria-label="Archive Pet"
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    openConfirmModal("delete", pet._id, pet.name)
                                  }
                                  disabled={actionLoading || pet.isArchived}
                                  className={`p-1.5 rounded-md transition-all duration-200 ${
                                    actionLoading || pet.isArchived
                                      ? "text-gray-400 cursor-not-allowed"
                                      : "text-red-600 hover:bg-red-100 hover:text-red-700"
                                  }`}
                                  title="Delete Pet"
                                  aria-label="Delete Pet"
                                >
                                  <X className="w-4 h-4" />
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