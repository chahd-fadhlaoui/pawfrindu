import {
  AlertCircle,
  ArrowLeft,
  Check,
  XCircle,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Phone,
  Filter,
  Clock,
  Home,
  Users,
  Briefcase,
  Calendar,
  Heart,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import ConfirmationModal from "../components/ConfirmationModal"; // Adjust the path as needed
import HelpSection from "../components/common/HelpSection";

// Pink SVG User Icon with subtle pink accent
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

// Candidate Status Component
const CandidateStatus = ({ status }) => {
  const styles = {
    approved: "bg-gradient-to-r from-green-100 to-green-200 text-green-800",
    rejected: "bg-gradient-to-r from-red-100 to-red-200 text-red-800",
    pending: "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800",
  };

  const icons = {
    approved: <Check className="w-4 h-4 mr-1" />,
    rejected: <XCircle className="w-4 h-4 mr-1" />,
    pending: <Clock className="w-4 h-4 mr-1" />,
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${styles[status] || styles.pending}`}
      aria-label={`Status: ${status}`}
    >
      {icons[status] || icons.pending}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Search Bar
const SearchBar = ({ value, onChange, onReset }) => (
  <div className="relative w-full max-w-md">
    <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-amber-500" />
    <input
      type="text"
      placeholder="Search candidates by name..."
      className="w-full pl-10 pr-10 py-2.5 bg-white border border-amber-200 rounded-full focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all duration-300 text-gray-700 shadow-sm"
      value={value}
      onChange={onChange}
      aria-label="Search candidates"
    />
    {value && (
      <button
        onClick={onReset}
        className="absolute transition-colors duration-200 transform -translate-y-1/2 right-3 top-1/2 text-amber-400 hover:text-pink-600"
        aria-label="Clear search"
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
);

// Filter Button
const FilterButton = ({ active, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
      active
        ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md"
        : "bg-white text-amber-700 border border-amber-200 hover:bg-amber-50 hover:border-amber-300"
    }`}
    aria-label={`Filter by ${label} (${count} candidates)`}
  >
    {label}
    {count !== undefined && (
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          active ? "bg-white text-pink-500" : "bg-amber-100 text-amber-600"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

// Candidate Details
const CandidateDetails = ({ candidate, petStatus }) => {
  return (
    <div className="p-5 text-sm border-t bg-gradient-to-br from-amber-50 to-white border-amber-200 animate-fade-in">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-semibold text-gray-800">
            <Briefcase className="w-5 h-5 text-amber-600" />
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
            <Home className="w-5 h-5 text-amber-600" />
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
          <div className="p-4 bg-white border rounded-lg shadow-inner border-amber-100">
            <p className="italic text-gray-700">"{candidate.petOwnerDetails?.reasonForAdoption || "Not provided"}"</p>
          </div>
          <p className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
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
              className="flex items-center gap-2 px-4 py-2 text-white transition-all duration-200 bg-green-600 rounded-full shadow-md hover:bg-green-700"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// Candidate Card
const CandidateCard = ({ candidate, petStatus, openConfirmModal, toggleDetails, isExpanded }) => {
  const appliedDate = candidate.appliedDate || "2025-03-01";
  const formattedDate = new Date(appliedDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mb-6 transition-all duration-200 bg-white border shadow-md rounded-xl border-amber-100 hover:shadow-lg">
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        onClick={() => toggleDetails(candidate.userId)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full shadow-sm bg-gradient-to-br from-pink-200 to-pink-300">
            <PinkUserIcon className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{candidate.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <CandidateStatus status={candidate.status || "pending"} />
              <span className="text-xs text-gray-500">Applied on {formattedDate}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {candidate.status === "pending" && petStatus !== "adopted" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openConfirmModal("select", candidate.userId, candidate.name);
              }}
              className="p-2 transition-all duration-200 rounded-full shadow-sm bg-amber-100 text-amber-600 hover:bg-pink-200 hover:text-pink-700"
              title="Select this candidate (rejects others)"
              aria-label="Select candidate"
            >
              <PinkUserIcon className="w-5 h-5" />
            </button>
          )}
          {candidate.status === "approved" && petStatus !== "adopted" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openConfirmModal("finalize", candidate.userId, candidate.name);
                }}
                className="p-2 text-green-600 transition-all duration-200 bg-green-100 rounded-full shadow-sm hover:bg-green-200 hover:text-green-700"
                title="Finalize adoption for this candidate"
                aria-label="Finalize adoption"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openConfirmModal("reject", candidate.userId, candidate.name);
                }}
                className="p-2 text-red-600 transition-all duration-200 bg-red-100 rounded-full shadow-sm hover:bg-red-200 hover:text-red-700"
                title="Reject this candidate"
                aria-label="Reject candidate"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </>
          )}
          {petStatus === "adopted" && candidate.status === "approved" && (
            <span className="flex items-center px-3 py-1 text-green-700 bg-green-100 rounded-full shadow-sm">
              <Check className="w-4 h-4 mr-1" />
              Adopted
            </span>
          )}
          <button
            className={`p-2 rounded-full transition-all duration-200 ${
              isExpanded ? "bg-amber-200 text-amber-700" : "text-amber-500 hover:bg-amber-100 hover:text-amber-600"
            }`}
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && <CandidateDetails candidate={candidate} petStatus={petStatus} />}
    </div>
  );
};

// Skeleton Loader
const SkeletonLoader = () => (
  <div className="space-y-6">
    {Array(3).fill(0).map((_, i) => (
      <div key={i} className="p-5 bg-white border shadow-md rounded-xl border-amber-100 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100"></div>
            <div className="space-y-2">
              <div className="w-40 h-4 rounded bg-amber-100"></div>
              <div className="w-24 h-3 rounded bg-amber-100"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-100"></div>
            <div className="w-10 h-10 rounded-full bg-amber-100"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State
const EmptyState = ({ message }) => (
  <div className="px-6 py-12 text-center bg-white border shadow-md rounded-xl border-amber-100">
    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full shadow-sm bg-amber-100">
      <AlertCircle className="w-8 h-8 text-pink-500" />
    </div>
    <h3 className="mb-2 text-lg font-semibold text-gray-800">No Candidates Yet</h3>
    <p className="max-w-md mx-auto text-gray-600">{message}</p>
  </div>
);

// Main Component
const CandidatesPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [petDetails, setPetDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: "",
    candidateId: null,
    candidateName: "",
    message: "", // Add message to state
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const petResponse = await axiosInstance.get(`/api/pet/pets/${petId}`);
        if (petResponse.data.success) {
          setPetDetails(petResponse.data.data);
        } else {
          setError(petResponse.data.message || "Failed to fetch pet details");
          return;
        }

        const candidatesResponse = await axiosInstance.get(`/api/pet/${petId}/candidates`);
        if (candidatesResponse.data.success) {
          const normalizedCandidates = candidatesResponse.data.data.map((candidate) => ({
            ...candidate,
            userId: candidate.user || candidate.userId || candidate.id,
          }));
          setCandidates(normalizedCandidates);
        } else {
          setError(candidatesResponse.data.message || "Failed to fetch candidates");
          setCandidates([]);
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [petId]);

  const handleInitialStatusChange = async (candidateId, newStatus) => {
    try {
      const response = await axiosInstance.put(`/api/pet/${petId}/candidate/${candidateId}/status`, {
        status: newStatus,
      });
      if (response.data.success) {
        setCandidates((prev) =>
          prev.map((candidate) =>
            candidate.userId === candidateId
              ? { ...candidate, status: newStatus }
              : newStatus === "approved" && candidate.status !== "rejected"
              ? { ...candidate, status: "rejected" }
              : candidate
          )
        );
        if (response.data.data?.status) {
          setPetDetails((prev) => ({ ...prev, status: response.data.data.status }));
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
            candidate.userId === candidateId
              ? { ...candidate, status: "approved" }
              : { ...candidate, status: "rejected" }
          )
        );
        if (response.data.data?.status) {
          setPetDetails((prev) => ({ ...prev, status: response.data.data.status }));
        }
      } else {
        setError(response.data.message || "Failed to finalize adoption");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to finalize adoption");
    }
  };

  const openConfirmModal = (action, candidateId, candidateName) => {
    let modalAction;
    let customMessage;
    switch (action) {
      case "select":
        modalAction = "select"; // Use specific action for styling
        customMessage = `Are you sure? This action will select ${candidateName} and reject all other candidates.`;
        break;
      case "finalize":
        modalAction = "finalize"; // Use specific action for styling
        customMessage = `Are you sure? This action will finalize the adoption for ${candidateName}.`;
        break;
      case "reject":
        modalAction = "reject"; // Matches existing action
        customMessage = `Are you sure? This action will reject ${candidateName}.`;
        break;
      default:
        modalAction = "edit";
        customMessage = "Are you sure you want to proceed with this action?";
    }
    console.log("Opening modal with action:", modalAction, "message:", customMessage);
    setConfirmModal({ isOpen: true, action: modalAction, candidateId, candidateName, message: customMessage });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, action: "", candidateId: null, candidateName: "", message: "" });
  };

  const confirmAction = async () => {
    const { action, candidateId } = confirmModal;
    console.log("Confirming action:", action, "for candidateId:", candidateId);
    if (action === "select") {
      await handleInitialStatusChange(candidateId, "approved"); // Selects this candidate, rejects others
    } else if (action === "finalize") {
      await handleFinalizeAdoption(candidateId); // Finalizes adoption
    } else if (action === "reject") {
      await handleInitialStatusChange(candidateId, "rejected"); // Rejects this candidate
    }
    closeConfirmModal();
  };

  const toggleDetails = (candidateId) => {
    setExpandedRows((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetSearch = () => setSearchTerm("");

  const candidateCounts = {
    all: candidates.length,
    pending: candidates.filter((c) => c.status === "pending").length,
    approved: candidates.filter((c) => c.status === "approved").length,
    rejected: candidates.filter((c) => c.status === "rejected").length,
  };

  return (
    <div className="min-h-screen py-10 bg-gradient-to-br from-amber-50 via-white to-amber-100">
      <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="p-6 mb-8 bg-white border shadow-md rounded-xl border-amber-100">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 transition-all duration-200 rounded-full shadow-sm bg-amber-100 text-amber-600 hover:bg-pink-200 hover:text-pink-700"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Adoption Candidates</h1>
                <p className="mt-2 text-sm text-gray-600">
                  {petDetails ? (
                    <>
                      For <span className="font-semibold text-amber-600">{petDetails.name}</span> •{" "}
                      <span
                        className={`font-medium ${
                          petDetails.status === "adopted" ? "text-green-600" : "text-amber-600"
                        }`}
                      >
                        {petDetails.status === "adopted" ? "Adopted" : "Open for Adoption"}
                      </span>
                    </>
                  ) : (
                    "Loading pet details..."
                  )}
                </p>
              </div>
            </div>
            <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onReset={resetSearch} />
          </div>
        </div>

        {/* Filters & Stats */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-amber-700">
              <Filter className="w-5 h-5" />
              <span className="font-semibold">Filters</span>
            </div>
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

          {filteredCandidates.length > 0 && (
            <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-gradient-to-r from-amber-50 to-amber-100">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-amber-600" />
                <span className="text-lg font-semibold text-amber-800">
                  {filteredCandidates.length} Candidate{filteredCandidates.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {petDetails?.status === "adopted" ? (
                  <span className="flex items-center px-4 py-1 text-green-700 bg-green-100 rounded-full shadow-sm">
                    <Check className="w-4 h-4 mr-2" />
                    Adoption Complete
                  </span>
                ) : filteredCandidates.some((c) => c.status === "approved") ? (
                  <span className="flex items-center px-4 py-1 rounded-full shadow-sm bg-amber-200 text-amber-800">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Awaiting Finalization
                  </span>
                ) : (
                  <span className="flex items-center px-4 py-1 text-blue-700 bg-blue-100 rounded-full shadow-sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Your Decision Needed
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Candidates List */}
        <div className="space-y-6">
          {isLoading ? (
            <SkeletonLoader />
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center text-red-600 bg-white border shadow-md rounded-xl border-amber-100">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-lg font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 mt-4 text-red-700 transition-all duration-200 bg-red-100 rounded-full shadow-sm hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <EmptyState
              message={
                searchTerm
                  ? `No matches for "${searchTerm}". Try a different term or reset the search.`
                  : statusFilter !== "all"
                  ? `No candidates with "${statusFilter}" status.`
                  : "No one has applied yet. Check back soon!"
              }
            />
          ) : (
            filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.userId}
                candidate={candidate}
                petStatus={petDetails?.status}
                openConfirmModal={openConfirmModal}
                toggleDetails={toggleDetails}
                isExpanded={expandedRows.includes(candidate.userId)}
              />
            ))
          )}
        </div>

        {/* Help Section */}
        <HelpSection show={candidates.length > 0}>
          <li>Click a candidate’s card to see their full application details.</li>
          <li>
            Use <span className="font-bold">Select</span> to choose a candidate (rejects others).
          </li>
          <li>
            After selecting, <span className="font-bold">Finalize</span> to complete the adoption.
          </li>
          <li>Contact details unlock after finalization—reach out directly!</li>
        </HelpSection>

        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={confirmAction}
          action={confirmModal.action}
          itemName={confirmModal.candidateName}
          message={confirmModal.message} // Pass the custom message
        />
      </div>
    </div>
  );
};

export default CandidatesPage;