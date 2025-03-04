import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  PawPrint,
  Eye,
  Filter,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import EmptyState from "../../components/EmptyState";
import { Tooltip } from "../Tooltip";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const ITEMS_PER_PAGE = 9;

const STATUS_OPTIONS = ["pending", "approved", "rejected"];
const SPECIES_OPTIONS = ["dog", "cat", "other"];
const GENDER_OPTIONS = ["male", "female"];

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-all duration-300 ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-500"
    } hover:opacity-80 shadow-sm`}
  >
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const FilterSelect = ({ label, value, onChange, options }) => (
  <div className="w-full sm:w-auto flex-1 min-w-[140px]">
    <select
      className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-[#ffc929]/20 rounded-lg shadow-sm focus:ring-2 focus:ring-[#ffc929]/30 focus:border-[#ffc929] transition-all duration-300"
      value={value}
      onChange={onChange}
      aria-label={`Filter by ${label}`}
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </option>
      ))}
    </select>
  </div>
);

const FilterBadge = ({ label, value, onClear }) => (
  <div className="flex items-center px-3 py-1 text-sm text-gray-700 bg-pink-50 border border-[#ffc929]/20 rounded-full shadow-sm hover:bg-pink-100 transition-all duration-300">
    <span className="font-medium">{label}:</span>
    <span className="ml-1 truncate max-w-[120px]">
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
    <button
      onClick={onClear}
      className="ml-2 text-gray-400 transition-colors duration-300 hover:text-pink-500"
      aria-label={`Remove ${label} filter`}
    >
      <X size={14} />
    </button>
  </div>
);

const ApplicationCard = ({ application, onViewPet, disabled }) => (
  <div
    className={`relative bg-white border-2 border-[#ffc929]/20 rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${
      disabled ? "opacity-50" : "hover:shadow-lg hover:scale-[1.02]"
    }`}
  >
    <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-full border-2 border-[#ffc929]/30 shadow-inner">
          <img
            src={application.pet.image}
            alt={application.pet.name}
            className="object-cover w-full h-full transition-transform duration-400 hover:scale-105"
            onError={(e) => (e.target.src = "/placeholder-animal.png")}
          />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-800 hover:text-[#ffc929] transition-colors duration-300">
            {application.pet.name}
          </h3>
          <p className="text-sm text-gray-600">
            {application.pet.species.charAt(0).toUpperCase() + application.pet.species.slice(1)} •{" "}
            {application.pet.city}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <StatusBadge status={application.status} />
        <Tooltip text="View Pet Details">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onViewPet(application.pet);
            }}
            className="p-1.5 bg-white border border-[#ffc929]/20 rounded-full hover:bg-[#ffc929] hover:text-white hover:border-[#ffc929] transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            disabled={disabled}
          >
            <Eye size={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  </div>
);

const AdoptionRequestsTab = ({ setSelectedPet }) => {
  const navigate = useNavigate();
  const { user, getMyAdoptionRequests, setError, clearError } = useApp();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("");
  const [filterGender, setFilterGender] = useState("");

  const fetchAdoptionRequests = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMyAdoptionRequests();
      if (result.success) {
        setApplications(result.data);
        clearError();
      } else {
        setError(result.error || "Failed to fetch adoption requests");
        setApplications([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch adoption requests");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [getMyAdoptionRequests, setError, clearError]);

  useEffect(() => {
    let mounted = true;
    if (user?._id && mounted) {
      fetchAdoptionRequests();
      const interval = setInterval(fetchAdoptionRequests, 30000);
      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }
  }, [user?._id, fetchAdoptionRequests]);

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
      default:
        break;
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilterStatus("");
    setFilterSpecies("");
    setFilterGender("");
    setCurrentPage(1);
  };

  const filteredApplications = applications.filter((application) => {
    const statusMatch = !filterStatus || application.status === filterStatus;
    const speciesMatch = !filterSpecies || application.pet.species === filterSpecies;
    const genderMatch = !filterGender || application.pet.gender === filterGender;
    return statusMatch && speciesMatch && genderMatch;
  });

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="p-6 bg-white border-2 border-[#ffc929]/20 shadow-lg rounded-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
          >
            <Filter size={16} />
            {isFilterOpen ? "Hide Filters" : "Filter Requests"}
          </button>
          {filteredApplications.length > 0 && (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-600 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
                  <PawPrint size={14} className="text-[#ffc929]" /> {filteredApplications.length} Requests
                </span>
              </div>
            )}
          <button
            onClick={() => navigate("/pets")}
            className="flex items-center gap-2 px-6 py-2 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
            disabled={loading}
          >
            <PawPrint size={16} />
            Browse Pets
          </button>
        </div>
        <div
          className={`grid grid-cols-1 gap-4 mt-2 sm:grid-cols-2 md:grid-cols-3 transition-all duration-300 ease-in-out ${
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
            options={SPECIES_OPTIONS}
          />
          <FilterSelect
            label="Gender"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            options={GENDER_OPTIONS}
          />
        </div>
        {(filterStatus || filterSpecies || filterGender || filteredApplications.length > 0) && (
          <div className="mt-2 space-y-2">
            {(filterStatus || filterSpecies || filterGender) && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-600">Applied Filters:</span>
                {filterStatus && (
                  <FilterBadge label="Status" value={filterStatus} onClear={() => clearFilter("status")} />
                )}
                {filterSpecies && (
                  <FilterBadge label="Species" value={filterSpecies} onClear={() => clearFilter("species")} />
                )}
                {filterGender && (
                  <FilterBadge label="Gender" value={filterGender} onClear={() => clearFilter("gender")} />
                )}
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1 ml-2 text-sm font-medium text-pink-500 bg-pink-50 hover:bg-pink-100 transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
                >
                  Clear All
                </button>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <Loader2 className="w-12 h-12 text-[#ffc929] animate-spin" />
            <PawPrint className="w-10 h-10 text-pink-300 animate-bounce" style={{ animationDelay: "0.2s" }} />
            <p className="text-lg font-medium text-gray-600">Loading your applications...</p>
          </div>
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          message="You haven't applied for any pet adoptions yet. Start by browsing available pets!"
          buttonText="Browse Pets"
          buttonAction={() => navigate("/pets")}
          disabled={loading}
        />
      ) : filteredApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <PawPrint size={48} className="mb-4 text-[#ffc929] animate-bounce" />
          <h3 className="text-xl font-semibold text-gray-700">No Results Found</h3>
          <p className="max-w-md mt-2 text-gray-600">
            Your filters didn’t match any requests. Try adjusting your criteria or browsing more pets!
          </p>
          <button
            onClick={clearAllFilters}
            className="px-6 py-2 mt-6 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4 animate-fadeIn">
            {paginatedApplications.map((application) => (
              <ApplicationCard
                key={`${application.pet._id}-${application.user}`}
                application={application}
                onViewPet={setSelectedPet}
                disabled={loading}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className={`p-2 rounded-full ${
                  currentPage === 1 || loading
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-[#ffc929] hover:bg-[#ffc929]/10"
                } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50`}
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-full text-sm font-medium ${
                      currentPage === page
                        ? "bg-[#ffc929] text-white shadow-md"
                        : "text-gray-600 hover:bg-[#ffc929]/10"
                    } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50`}
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
                } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50`}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdoptionRequestsTab;