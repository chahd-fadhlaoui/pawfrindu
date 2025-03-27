import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  PawPrint,
  RefreshCw,
  Search,
  X,
  XCircle,
  Heart
} from "lucide-react";

import HelpSection from "../components/common/HelpSection";
import ConfirmationModal from "../components/ConfirmationModal";
import { CandidateDetails } from "../components/PetManagement/CandidateDetails";
import { Tooltip } from "../components/Tooltip";
import { useApp } from "../context/AppContext";
import axiosInstance from "../utils/axiosInstance";

// Utility function to format enum values
const formatEnum = (value) => {
  if (!value) return 'N/A';
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const PawIcon = ({ className, style }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M12,17.5c2.33,2.33,5.67,2.33,8,0s2.33-5.67,0-8s-5.67-2.33-8,0S9.67,15.17,12,17.5z M7.5,14.5 c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S9.46,12.54,7.5,14.5z M18.5,3.5c-1.96-1.96-4.04-1.96-6,0s-1.96,4.04,0,6 s4.04,1.96,6,0S20.46,5.46,18.5,3.5z M3.5,9.5c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S5.46,7.54,3.5,9.5z" />
  </svg>
);

const StatusBadge = ({ status }) => {
  const STATUS_STYLES = {
    approved: "bg-[#ffc929]/10 text-[#ffc929] border-[#ffc929]/20",
    rejected: "bg-pink-50 text-pink-600 border-pink-100",
    pending: "bg-blue-50 text-blue-600 border-blue-100",
    adopted: "bg-green-50 text-green-600 border-green-100"
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${STATUS_STYLES[status] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const FilterBadge = ({ label, value, onClear }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 rounded-full">
    {label}: {value}
    <button onClick={onClear} className="ml-1 focus:outline-none">
      <X size={14} />
    </button>
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
      {options.map((option, index) => (
        <option key={index} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const SearchBar = ({ value, onChange, onReset }) => (
  <div className="relative w-full max-w-md">
    <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder="Search by name or occupation..."
      className="w-full py-2 pl-10 pr-10 transition-all duration-300 bg-white border border-[#ffc929]/20 rounded-full shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] text-gray-700"
    />
    {value && (
      <button
        onClick={onReset}
        className="absolute text-gray-400 transition-all duration-300 -translate-y-1/2 right-3 top-1/2 hover:text-[#ffc929]"
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
);

const PawBackground = () => (
  Array(8).fill(null).map((_, index) => (
    <PawIcon
      key={index}
      className={`absolute w-8 h-8 opacity-5 animate-float ${index % 2 === 0 ? "text-[#ffc929]" : "text-pink-300"} ${index % 3 === 0 ? "top-1/4" : index % 3 === 1 ? "top-1/2" : "top-3/4"} ${index % 4 === 0 ? "left-1/4" : index % 4 === 1 ? "left-1/2" : "left-3/4"}`}
      style={{ animationDelay: `${index * 0.5}s`, transform: `rotate(${index * 45}deg)` }}
    />
  ))
);

const CandidatesPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user, setError, clearError, error } = useApp();

  const [candidates, setCandidates] = useState([]);
  const [petDetails, setPetDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: "",
    candidateId: null,
    candidateName: "",
    message: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [candidatesPerPage] = useState(5); // Reduced to fit list style better
  const [isAnimating, setIsAnimating] = useState(false);

  const statusOptions = ["pending", "approved", "rejected"];
  const sortOptions = ["Name", "Readiness", "Status", "Family Size"];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [petResponse, candidatesResponse] = await Promise.all([
        axiosInstance.get(`/api/pet/pets/${petId}`),
        axiosInstance.get(`/api/pet/${petId}/candidates`),
      ]);
      if (!petResponse.data.success || !candidatesResponse.data.success) throw new Error("Failed to fetch data");
      setPetDetails(petResponse.data.data);
      setCandidates(candidatesResponse.data.data.map(c => ({
        ...c,
        userId: c.user || c.userId || c.id,
        fullName: c.name || "Unknown User",
        petOwnerDetails: c.petOwnerDetails || {}
      })));
      clearError();
    } catch (err) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  }, [petId, setError, clearError]);

  useEffect(() => {
    if (user === null) return;
    if (!user?._id) navigate("/login");
    else fetchData();
  }, [user, petId, navigate, fetchData]);

  const handleStatusChange = async (candidateId, newStatus, actionType = "select") => {
    setActionLoading(candidateId);
    try {
      const endpoint = actionType === "finalize"
        ? `/api/pet/${petId}/candidate/${candidateId}/finalize`
        : `/api/pet/${petId}/candidate/${candidateId}/status`;
      const response = await axiosInstance.put(endpoint, {
        status: newStatus,
        action: actionType === "finalize" ? "adopt" : undefined
      });
      if (response.data.success) {
        setCandidates(prev =>
          prev.map(candidate =>
            candidate.userId === candidateId
              ? { ...candidate, status: newStatus }
              : newStatus === "approved" && candidate.status !== "rejected" && actionType !== "reject"
              ? { ...candidate, status: "rejected" }
              : candidate
          )
        );
        if (response.data.data?.status) {
          setPetDetails(prev => ({ ...prev, status: response.data.data.status }));
        }
        clearError();
      }
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const openConfirmModal = (action, candidateId, candidateName) => {
    const messages = {
      select: `Ready to give ${candidateName} a chance? This will pass on other pending candidates.`,
      finalize: `Ready to make it official with ${candidateName}?`,
      reject: `Sure you want to say no to ${candidateName}?`,
    };
    setConfirmModal({
      isOpen: true,
      action,
      candidateId,
      candidateName: candidateName || "this candidate",
      message: messages[action]
    });
  };

  const closeConfirmModal = () => setConfirmModal({ isOpen: false, action: "", candidateId: null, candidateName: "", message: "" });

  const confirmAction = () => {
    const { action, candidateId } = confirmModal;
    handleStatusChange(candidateId, action === "reject" ? "rejected" : "approved", action);
    closeConfirmModal();
  };

  const toggleDetails = candidateId =>
    setExpandedRows(prev =>
      prev.includes(candidateId) ? prev.filter(id => id !== candidateId) : [...prev, candidateId]
    );

  const sortCandidates = (candidatesToSort) => {
    if (!sortBy) return candidatesToSort;
    return [...candidatesToSort].sort((a, b) => {
      switch (sortBy) {
        case "Name": return a.fullName.localeCompare(b.fullName);
        case "Readiness": {
          const readinessOrder = { immediate: 1, within_a_month: 2, later: 3 };
          return (readinessOrder[a.petOwnerDetails?.readiness] || 3) - (readinessOrder[b.petOwnerDetails?.readiness] || 3);
        }
        case "Status": return a.status.localeCompare(b.status);
        case "Family Size": return (a.petOwnerDetails?.housing?.familySize || 0) - (b.petOwnerDetails?.housing?.familySize || 0);
        default: return 0;
      }
    });
  };

  const filteredCandidates = sortCandidates(
    candidates.filter(candidate => {
      const fullName = candidate.fullName || "";
      const occupation = candidate.petOwnerDetails?.occupation || "";
      return (
        (fullName.toLowerCase().includes(searchTerm.toLowerCase()) || occupation.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!statusFilter || candidate.status === statusFilter)
      );
    })
  );

  const indexOfLastCandidate = currentPage * candidatesPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate);
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);

  const paginate = (pageNumber) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(pageNumber);
      setIsAnimating(false);
    }, 300);
  };

  const clearFilter = (filterType) => {
    switch (filterType) {
      case "status": setStatusFilter(""); break;
      case "sort": setSortBy(""); break;
      case "search": setSearchTerm(""); break;
      default: break;
    }
  };

  const clearAllFilters = () => {
    setStatusFilter("");
    setSortBy("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-pink-50">
        <div className="text-center animate-pulse">
          <PawPrint size={48} className="mx-auto text-[#ffc929]" />
          <p className="mt-4 text-lg font-medium text-gray-600">Fetching Candidates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-pink-50">
        <div className="text-center">
          <PawPrint size={48} className="mx-auto mb-4 text-red-500" />
          <p className="font-medium text-red-600">Error: {error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-full hover:from-[#ffa726] hover:to-[#ffc929]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen px-4 py-12 overflow-hidden bg-gradient-to-br from-white to-pink-50 sm:py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"><PawBackground /></div>
      <div className="relative mx-auto space-y-12 max-w-7xl">
        {/* Header */}
        <div className="pt-16 space-y-6 text-center animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 top-16 group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ffc929] to-[#ffa726] text-white font-medium rounded-full shadow-md hover:shadow-lg hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300"
          >
            <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Back to {petDetails?.name || "Pet"}
          </button>
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
            <PawPrint className="w-4 h-4 mr-2 text-[#ffc929]" /> Adoption Candidates
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="block">Find a Home for</span>
            <span className="block text-pink-500">{petDetails?.name || "Your Pet"}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
            Review applicants and choose the perfect match.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white backdrop-blur-sm bg-opacity-90 border-2 border-[#ffc929]/20 shadow-xl rounded-3xl p-8">
          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 text-pink-600 shadow-md rounded-xl bg-pink-50">
              <AlertCircle size={20} />
              <span>{error}</span>
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-2 px-4 py-1 ml-auto text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-full hover:from-[#ffa726] hover:to-[#ffc929]"
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
          )}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
            >
              <Filter size={16} />
              {isFilterOpen ? "Hide" : "Filter"}
            </button>
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onReset={() => setSearchTerm("")}
              className="flex-grow max-w-md shadow-xl sm:flex-grow-0 sm:mx-auto"
            />
            {filteredCandidates.length > 0 && (
              <span className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 border border-[#ffc929]/20 rounded-full shadow-inner">
                <PawPrint size={16} className="text-[#ffc929]" /> {filteredCandidates.length} Candidates
              </span>
            )}
          </div>
          <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 transition-all duration-300 ease-in-out ${isFilterOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
            <FilterSelect label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={statusOptions} />
            <FilterSelect label="Sort By" value={sortBy} onChange={(e) => setSortBy(e.target.value)} options={sortOptions} />
          </div>
          {(statusFilter || sortBy || searchTerm) && (
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="text-sm font-medium text-gray-600">Applied Filters:</span>
              {statusFilter && <FilterBadge label="Status" value={statusFilter} onClear={() => clearFilter("status")} />}
              {sortBy && <FilterBadge label="Sort" value={sortBy} onClear={() => clearFilter("sort")} />}
              {searchTerm && <FilterBadge label="Search" value={searchTerm} onClear={() => clearFilter("search")} />}
              <button
                onClick={clearAllFilters}
                className="px-4 py-1.5 ml-2 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 hover:bg-[#ffc929]/20 transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Candidates List */}
          <div className="mt-6 space-y-6 transition-opacity duration-300" style={{ animationDelay: "0.6s" }}>
            {currentCandidates.length === 0 ? (
              <div className="py-12 text-center bg-white/80 border border-[#ffc929]/10 rounded-3xl shadow-md">
                <PawPrint size={48} className="mx-auto mb-4 text-[#ffc929] animate-pulse" />
                <h3 className="text-xl font-semibold text-gray-800">No Candidates Found</h3>
                <p className="mt-2 text-gray-600">
                  {searchTerm || statusFilter ? "No candidates match your filters." : "No applicants yet—check back soon!"}
                </p>
                {(searchTerm || statusFilter) && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-full hover:from-[#ffa726] hover:to-[#ffc929]"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {currentCandidates.map(candidate => (
                  <article
                    key={candidate.userId}
                    className="p-6 bg-white/80 border-2 border-[#ffc929]/20 rounded-3xl shadow-md transition-all duration-300 hover:shadow-lg hover:border-[#ffc929]/50"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center w-full gap-4 sm:w-auto">
                        <img
                          src={candidate.image || "/images/default-profile.png"}
                          alt={`${candidate.fullName || "Candidate"}'s profile`}
                          className="object-cover w-16 h-16 border border-[#ffc929]/20 rounded-full shadow-sm"
                          onError={e => (e.target.src = "/images/default-profile.png")}
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800 transition-colors duration-300 hover:text-pink-500">
                            {candidate.fullName || "Unknown User"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                            <StatusBadge status={candidate.status} />
                            <span className="px-3 py-1 border border-[#ffc929]/20 rounded-full bg-[#ffc929]/5">
                              {formatEnum(candidate.petOwnerDetails?.occupation) || "N/A"}
                            </span>
                            <span className="px-3 py-1 border border-[#ffc929]/20 rounded-full bg-[#ffc929]/5">
                              {formatEnum(candidate.petOwnerDetails?.readiness) || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        {candidate.status === "pending" && petDetails?.status !== "adopted" && (
                          <Tooltip text="Approve this candidate">
                            <button
                              onClick={() => openConfirmModal("select", candidate.userId, candidate.fullName)}
                              className="p-2 text-[#ffc929] bg-[#ffc929]/10 rounded-full hover:bg-[#ffc929]/20 transition-all duration-300 disabled:opacity-50"
                              disabled={actionLoading === candidate.userId}
                            >
                              {actionLoading === candidate.userId ? (
                                <RefreshCw size={20} className="animate-spin" />
                              ) : (
                                <Check size={20} />
                              )}
                            </button>
                          </Tooltip>
                        )}
                        {candidate.status === "approved" && petDetails?.status !== "adopted" && (
                          <>
                            <Tooltip text="Finalize adoption">
                              <button
                                onClick={() => openConfirmModal("finalize", candidate.userId, candidate.fullName)}
                                className="p-2 text-[#ffc929] bg-[#ffc929]/10 rounded-full hover:bg-[#ffc929]/20 transition-all duration-300 disabled:opacity-50"
                                disabled={actionLoading === candidate.userId}
                              >
                                {actionLoading === candidate.userId ? (
                                  <RefreshCw size={20} className="animate-spin" />
                                ) : (
                                  <Heart size={20} />
                                )}
                              </button>
                            </Tooltip>
                            <Tooltip text="Reject this candidate">
                              <button
                                onClick={() => openConfirmModal("reject", candidate.userId, candidate.fullName)}
                                className="p-2 text-pink-600 transition-all duration-300 rounded-full bg-pink-50 hover:bg-pink-100 disabled:opacity-50"
                                disabled={actionLoading === candidate.userId}
                              >
                                {actionLoading === candidate.userId ? (
                                  <RefreshCw size={20} className="animate-spin" />
                                ) : (
                                  <XCircle size={20} />
                                )}
                              </button>
                            </Tooltip>
                          </>
                        )}
                        <button
                          onClick={() => toggleDetails(candidate.userId)}
                          className="p-2 text-gray-600 rounded-full hover:bg-[#ffc929]/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                        >
                          {expandedRows.includes(candidate.userId) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>
                    {expandedRows.includes(candidate.userId) && (
                      <div className="mt-4 border-t border-[#ffc929]/20 pt-4 animate-fade-in">
                        <CandidateDetails candidate={candidate} petStatus={petDetails?.status} />
                      </div>
                    )}
                  </article>
                ))}
              </>
            )}
          </div>

          {/* Pagination */}
          {filteredCandidates.length > candidatesPerPage && (
            <div className="flex items-center justify-center gap-4 mt-12 animate-fadeIn" style={{ animationDelay: "0.8s" }}>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-full ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-[#ffc929] hover:bg-[#ffc929]/10"} transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30`}
                aria-label="Previous page"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  const isCurrent = currentPage === page;
                  const isNear = Math.abs(currentPage - page) <= 1 || page === 1 || page === totalPages;
                  if (!isNear) return page === currentPage - 2 || page === currentPage + 2 ? <span key={page} className="text-gray-400">...</span> : null;
                  return (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`w-10 h-10 rounded-full text-sm font-medium ${isCurrent ? "bg-[#ffc929] text-white shadow-md" : "text-gray-600 hover:bg-[#ffc929]/10"} transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30`}
                      aria-label={`Go to page ${page}`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-[#ffc929] hover:bg-[#ffc929]/10"} transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30`}
                aria-label="Next page"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          {/* Help Section */}
          <HelpSection title={`Helping ${petDetails?.name || "Your Pet"} Find a Home`} className="mt-6 text-sm text-gray-600">
            <li>Approve an applicant to move them forward—others get passed.</li>
            <li>Finalize an approved applicant to seal the deal.</li>
            <li>Get contact info after finalizing to connect directly.</li>
            <li>Use filters and sorting to find the best match.</li>
          </HelpSection>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={confirmAction}
          action={confirmModal.action}
          itemName={confirmModal.candidateName}
          message={confirmModal.message}
        />
      </div>
    </section>
  );
};

export default CandidatesPage;