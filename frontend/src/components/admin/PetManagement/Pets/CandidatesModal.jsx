import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  Check,
  X,
  User,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  XCircle,
  Clock,
  Briefcase,
  Home,
  Heart,
  Calendar,
  Phone,
  Info,
} from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";
import ConfirmationModal from "../../../ConfirmationModal";

// Pink SVG User Icon (Updated with Admin Colors)
const PinkUserIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" fill="#fce7f3" />
  </svg>
);

// Status Badge Component (Styled like Admin)
const StatusBadge = ({ status }) => {
  const styles = {
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    pending: "bg-amber-100 text-amber-800",
  };
  const icons = {
    approved: <Check className="w-3 h-3 mr-1" />,
    rejected: <XCircle className="w-3 h-3 mr-1" />,
    pending: <Clock className="w-3 h-3 mr-1" />,
  };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-sm ${styles[status] || styles.pending}`}>
      {icons[status] || icons.pending}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Search Bar (Styled like Admin)
const SearchBar = ({ value, onChange, onReset }) => (
  <div className="relative flex-1 max-w-md">
    <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
    <input
      type="text"
      placeholder="Search candidates by name..."
      className="w-full py-3 pl-10 pr-10 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-[#ffc929] focus:border-[#ffc929] transition-all duration-300"
      value={value}
      onChange={onChange}
    />
    {value && (
      <button
        onClick={onReset}
        className="absolute text-gray-400 transition-colors duration-200 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
);

// Filter Button (Styled like Admin)
const FilterButton = ({ active, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
      active
        ? "bg-gradient-to-r from-pink-500 to-pink-700 text-white shadow-md"
        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-md"
    }`}
  >
    {label}
    {count !== undefined && (
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          active ? "bg-white text-pink-600" : "bg-gray-100 text-gray-600"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

// Candidate Details (Styled like Admin)
const CandidateDetails = ({ candidate, petStatus }) => (
  <div className="p-5 text-sm bg-white border-t border-gray-200 animate-fade-in">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 font-semibold text-gray-800">
          <Briefcase className="w-5 h-5 text-amber-500" />
          Work Life
        </h4>
        <div className="space-y-2 ml-7">
          <p className="flex items-center gap-2">
            <span className="text-gray-600">Occupation:</span>
            <span className="font-medium text-gray-800">{candidate.petOwnerDetails?.occupation || "N/A"}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-gray-600">Schedule:</span>
            <span className="font-medium text-gray-800">{candidate.petOwnerDetails?.workSchedule || "N/A"}</span>
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 font-semibold text-gray-800">
          <Home className="w-5 h-5 text-amber-500" />
          Home Life
        </h4>
        <div className="space-y-2 ml-7">
          <p className="flex items-center gap-2">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium text-gray-800">{candidate.petOwnerDetails?.housing?.type || "N/A"}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-gray-600">Ownership:</span>
            <span className="font-medium text-gray-800">{candidate.petOwnerDetails?.housing?.ownership || "N/A"}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-gray-600">Family Size:</span>
            <span className="font-medium text-gray-800">{candidate.petOwnerDetails?.housing?.familySize || "N/A"}</span>
          </p>
          {candidate.petOwnerDetails?.housing?.ownership !== "own" && (
            <p className="flex items-center gap-2">
              <span className="text-gray-600">Landlord Approval:</span>
              <span className={`font-medium ${candidate.petOwnerDetails?.housing?.landlordApproval ? "text-green-600" : "text-red-600"}`}>
                {candidate.petOwnerDetails?.housing?.landlordApproval ? "Yes" : "No"}
              </span>
            </p>
          )}
        </div>
      </div>
      <div className="space-y-4 md:col-span-2">
        <h4 className="flex items-center gap-2 font-semibold text-gray-800">
          <Heart className="w-5 h-5 text-pink-600" />
          Why They Want to Adopt
        </h4>
        <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
          <p className="italic text-gray-700">"{candidate.petOwnerDetails?.reasonForAdoption || "Not provided"}"</p>
        </div>
        <p className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" />
          <span className="text-gray-600">Ready:</span>
          <span className="font-medium text-gray-800">{candidate.petOwnerDetails?.readiness || "N/A"}</span>
        </p>
      </div>
      {petStatus === "adopted" && candidate.status === "approved" && (
        <div className="flex items-center justify-between p-4 border border-green-200 rounded-lg shadow-sm md:col-span-2 bg-green-50">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-600" />
            <p className="font-medium text-green-800">{candidate.petOwnerDetails?.phone || "N/A"}</p>
          </div>
          <a
            href={`tel:${candidate.petOwnerDetails?.phone}`}
            className="flex items-center gap-2 px-4 py-2 text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:ring-2 focus:ring-green-400"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
        </div>
      )}
    </div>
  </div>
);

// Candidate Card (Styled like Admin)
const CandidateCard = ({ candidate, petStatus, openConfirmModal, toggleExpand, isExpanded, hoveredAction, setHoveredAction }) => {
  const appliedDate = candidate.createdAt || "2025-03-01";
  const formattedDate = new Date(appliedDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mb-4 bg-white border border-gray-200 shadow-md rounded-xl animate-fade-in">
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        onClick={() => toggleExpand(candidate.id)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full shadow-sm bg-gradient-to-r from-yellow-100 to-pink-100">
            <PinkUserIcon className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{candidate.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={candidate.status || "pending"} />
              <span className="text-xs text-gray-500">Applied on {formattedDate}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {candidate.status === "pending" && petStatus !== "adopted" && (
            <div
              className="relative"
              onMouseEnter={() => setHoveredAction(`select-${candidate.id}`)}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openConfirmModal("select", candidate.id, candidate.name);
                }}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white transition-all duration-300 rounded-lg shadow-sm bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:ring-2 focus:ring-green-400"
              >
                <User className="w-3 h-3" />
                Select
              </button>
              {hoveredAction === `select-${candidate.id}` && (
                <div className="absolute right-0 z-10 px-3 py-2 mt-2 text-xs text-white bg-gray-800 rounded-md shadow-lg top-full animate-fade-in-up">
                  <div className="flex items-center gap-1">
                    <Info size={12} />
                    <span>Select this candidate (rejects others)</span>
                  </div>
                </div>
              )}
            </div>
          )}
          {candidate.status === "approved" && petStatus !== "adopted" && (
            <>
              <div
                className="relative"
                onMouseEnter={() => setHoveredAction(`finalize-${candidate.id}`)}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openConfirmModal("finalize", candidate.id, candidate.name);
                  }}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white transition-all duration-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-400"
                >
                  <Check className="w-3 h-3" />
                  Finalize
                </button>
                {hoveredAction === `finalize-${candidate.id}` && (
                  <div className="absolute right-0 z-10 px-3 py-2 mt-2 text-xs text-white bg-gray-800 rounded-md shadow-lg top-full animate-fade-in-up">
                    <div className="flex items-center gap-1">
                      <Info size={12} />
                      <span>Finalize adoption for this candidate</span>
                    </div>
                  </div>
                )}
              </div>
              <div
                className="relative"
                onMouseEnter={() => setHoveredAction(`reject-${candidate.id}`)}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openConfirmModal("reject", candidate.id, candidate.name);
                  }}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white transition-all duration-300 rounded-lg shadow-sm bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:ring-2 focus:ring-red-400"
                >
                  <XCircle className="w-3 h-3" />
                  Reject
                </button>
                {hoveredAction === `reject-${candidate.id}` && (
                  <div className="absolute right-0 z-10 px-3 py-2 mt-2 text-xs text-white bg-gray-800 rounded-md shadow-lg top-full animate-fade-in-up">
                    <div className="flex items-center gap-1">
                      <Info size={12} />
                      <span>Reject this candidate</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {petStatus === "adopted" && candidate.status === "approved" && (
            <span className="flex items-center px-3 py-1 text-green-700 bg-green-100 rounded-lg shadow-sm">
              <Check className="w-4 h-4 mr-1" />
              Adopted
            </span>
          )}
          <button
            className={`p-2 rounded-lg transition-all duration-300 ${
              isExpanded ? "bg-gray-100 text-gray-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-600"
            }`}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {isExpanded && <CandidateDetails candidate={candidate} petStatus={petStatus} />}
    </div>
  );
};

// Updated CandidatesModal
const CandidatesModal = ({ isOpen, onClose, petId, onApprove, onFinalize }) => {
  const [candidates, setCandidates] = useState([]);
  const [petStatus, setPetStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedCandidates, setExpandedCandidates] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: "",
    candidateId: null,
    candidateName: "",
    message: "",
  });
  const [hoveredAction, setHoveredAction] = useState(null);

  useEffect(() => {
    if (isOpen && petId) {
      fetchCandidates();
    }
  }, [isOpen, petId]);

  const fetchCandidates = async () => {
    setLoading(true);
    setError("");
    try {
      const petResponse = await axiosInstance.get(`/api/pet/pets/${petId}`);
      if (petResponse.data.success) {
        setPetStatus(petResponse.data.data.status);
      }
      const response = await axiosInstance.get(`/api/pet/${petId}/candidates`);
      if (response.data.success) {
        setCandidates(response.data.data);
      } else {
        setError(response.data.message || "No candidates available");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load candidates");
      console.error("Fetch Candidates Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (candidateId) => {
    setExpandedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      const response = await axiosInstance.put(`/api/pet/${petId}/candidate/${candidateId}/status`, {
        status: newStatus,
      });
      if (response.data.success) {
        setCandidates((prev) =>
          prev.map((candidate) =>
            candidate.id === candidateId
              ? { ...candidate, status: newStatus }
              : newStatus === "approved" && candidate.status !== "rejected"
              ? { ...candidate, status: "rejected" }
              : candidate
          )
        );
        if (response.data.data?.status) {
          setPetStatus(response.data.data.status);
        }
      } else {
        setError(response.data.message || "Failed to update status");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleFinalizeAdoption = async (candidateId) => {
    try {
      const response = await axiosInstance.put(`/api/pet/${petId}/candidate/${candidateId}/finalize`, {
        action: "adopt",
      });
      if (response.data.success) {
        setCandidates((prev) =>
          prev.map((candidate) =>
            candidate.id === candidateId
              ? { ...candidate, status: "approved" }
              : { ...candidate, status: "rejected" }
          )
        );
        if (response.data.data?.status) {
          setPetStatus(response.data.data.status);
        }
        onFinalize(petId, candidateId);
      } else {
        setError(response.data.message || "Failed to finalize adoption");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to finalize adoption");
    }
  };

  const openConfirmModal = (action, candidateId, candidateName) => {
    let modalAction, customMessage;
    switch (action) {
      case "select":
        modalAction = "select";
        customMessage = `Are you sure? This action will select ${candidateName} and reject all other candidates.`;
        onApprove(petId, candidateId);
        break;
      case "finalize":
        modalAction = "finalize";
        customMessage = `Are you sure? This action will finalize the adoption for ${candidateName}.`;
        break;
      case "reject":
        modalAction = "reject";
        customMessage = `Are you sure? This action will reject ${candidateName}.`;
        break;
      default:
        modalAction = "edit";
        customMessage = "Are you sure you want to proceed with this action?";
    }
    setConfirmModal({ isOpen: true, action: modalAction, candidateId, candidateName, message: customMessage });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, action: "", candidateId: null, candidateName: "", message: "" });
  };

  const confirmAction = async () => {
    const { action, candidateId } = confirmModal;
    if (action === "select") {
      await handleStatusChange(candidateId, "approved");
    } else if (action === "finalize") {
      await handleFinalizeAdoption(candidateId);
    } else if (action === "reject") {
      await handleStatusChange(candidateId, "rejected");
    }
    closeConfirmModal();
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const candidateCounts = {
    all: candidates.length,
    pending: candidates.filter((c) => c.status === "pending").length,
    approved: candidates.filter((c) => c.status === "approved").length,
    rejected: candidates.filter((c) => c.status === "rejected").length,
  };

  if (!isOpen || !petId) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      <div className="w-full max-w-4xl overflow-hidden bg-white shadow-xl rounded-xl animate-fade-in">
        {/* Header */}
        <div className="overflow-hidden bg-white border-l-4 rounded-t-xl" style={{ borderImage: "linear-gradient(to bottom, #f59e0b, #ec4899) 1" }}>
          <div className="flex items-center justify-between px-4 py-5 bg-gradient-to-r from-white to-gray-50 sm:px-6">
            <div className="flex items-center flex-1">
              <div className="p-2 rounded-lg shadow-sm bg-pink-50">
                <User className="w-6 h-6 text-pink-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold tracking-tight text-gray-900">Adoption Candidates</h3>
                <p className="text-sm text-gray-500">Manage candidates for this pet</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 text-gray-600 transition-colors duration-300 rounded-lg hover:bg-gray-100 hover:text-gray-800 focus:ring-2 focus:ring-[#ffc929]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 bg-white border-b border-gray-200 shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onReset={() => setSearchTerm("")}
            />
            <div className="flex flex-wrap items-center gap-3">
              <FilterButton
                active={statusFilter === "all"}
                label="All"
                count={candidateCounts.all}
                onClick={() => setStatusFilter("all")}
              />
              <FilterButton
                active={statusFilter === "pending"}
                label="Pending"
                count={candidateCounts.pending}
                onClick={() => setStatusFilter("pending")}
              />
              <FilterButton
                active={statusFilter === "approved"}
                label="Approved"
                count={candidateCounts.approved}
                onClick={() => setStatusFilter("approved")}
              />
              <FilterButton
                active={statusFilter === "rejected"}
                label="Rejected"
                count={candidateCounts.rejected}
                onClick={() => setStatusFilter("rejected")}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-600 border border-red-200 rounded-lg shadow-sm bg-red-50 animate-fade-in">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-[#ffc929] animate-spin" />
              <p className="mt-2 text-sm text-gray-600">Loading candidates...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="py-10 text-center bg-white rounded-lg shadow-md">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full shadow-md bg-gradient-to-r from-yellow-100 to-pink-100">
                  <AlertCircle className="w-8 h-8 text-[#ffc929]" />
                </div>
                <p className="text-lg font-semibold text-gray-700">No candidates found</p>
                <p className="text-sm text-gray-500">
                  {searchTerm
                    ? `No matches for "${searchTerm}". Try a different term or reset the search.`
                    : statusFilter !== "all"
                    ? `No candidates with "${statusFilter}" status.`
                    : "No candidates have applied yet."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  petStatus={petStatus}
                  openConfirmModal={openConfirmModal}
                  toggleExpand={toggleExpand}
                  isExpanded={expandedCandidates.includes(candidate.id)}
                  hoveredAction={hoveredAction}
                  setHoveredAction={setHoveredAction}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 bg-white border-t border-gray-200 shadow-md rounded-b-xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg shadow-md hover:bg-gray-50 hover:shadow-lg focus:ring-2 focus:ring-[#ffc929] transition-all duration-300 disabled:opacity-50"
          >
            Close
          </button>
        </div>
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
  );

  return createPortal(modalContent, document.body);
};

export default CandidatesModal;