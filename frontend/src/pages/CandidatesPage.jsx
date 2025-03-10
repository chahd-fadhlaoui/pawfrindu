import {
  AlertCircle,
  ArrowLeft,
  Check,
  XCircle,
  UserCheck,
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

// Composant pour le statut du candidat
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

// Barre de recherche
const SearchBar = ({ value, onChange, onReset }) => (
  <div className="relative w-full max-w-md">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
    <input
      type="text"
      placeholder="Search candidates by name..."
      className="w-full pl-10 pr-10 py-2.5 bg-white border border-amber-200 rounded-full focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all duration-300 text-gray-700 shadow-sm"
      value={value}
      onChange={onChange}
      aria-label="Search candidates"
    />
    {value && (
      <button
        onClick={onReset}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-600 transition-colors duration-200"
        aria-label="Clear search"
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
);

// Bouton de filtre
const FilterButton = ({ active, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
      active
        ? "bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md"
        : "bg-white text-amber-700 border border-amber-200 hover:bg-amber-50 hover:border-amber-300"
    }`}
    aria-label={`Filter by ${label} (${count} candidates)`}
  >
    {label}
    {count !== undefined && (
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          active ? "bg-white text-amber-500" : "bg-amber-100 text-amber-600"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

// Modal de confirmation
const ConfirmationModal = ({ isOpen, onClose, onConfirm, action, itemName }) => {
  if (!isOpen) return null;

  const getActionDetails = () => {
    switch (action) {
      case "select":
        return {
          title: "Select Candidate",
          message: `Confirm selecting "${itemName}"? This will reject other candidates.`,
          icon: <UserCheck className="w-12 h-12 text-amber-500" />,
          confirmColor: "bg-amber-500 hover:bg-amber-600",
          confirmText: "Select",
        };
      case "finalize":
        return {
          title: "Finalize Adoption",
          message: `Make "${itemName}" the official adopter? This cannot be undone.`,
          icon: <Check className="w-12 h-12 text-green-500" />,
          confirmColor: "bg-green-500 hover:bg-green-600",
          confirmText: "Finalize",
        };
      case "reject":
        return {
          title: "Reject Candidate",
          message: `Reject "${itemName}"? They'll be notified of your decision.`,
          icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
          confirmColor: "bg-red-500 hover:bg-red-600",
          confirmText: "Reject",
        };
      default:
        return {
          title: "Confirm Action",
          message: "Are you sure?",
          icon: <AlertCircle className="w-12 h-12 text-amber-500" />,
          confirmColor: "bg-amber-500 hover:bg-amber-600",
          confirmText: "Confirm",
        };
    }
  };

  const { title, message, icon, confirmColor, confirmText } = getActionDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-amber-100 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-amber-500 hover:text-amber-700 transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center space-y-4">
          {icon}
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-white rounded-lg shadow-md transition-all duration-200 font-medium ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Détails du candidat
const CandidateDetails = ({ candidate, petStatus }) => {
  return (
    <div className="p-5 bg-gradient-to-br from-amber-50 to-white text-sm border-t border-amber-200 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
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
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
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

        <div className="md:col-span-2 space-y-4">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Heart className="w-5 h-5 text-amber-600" />
            Why They Want to Adopt
          </h4>
          <div className="bg-white p-4 rounded-lg shadow-inner border border-amber-100">
            <p className="text-gray-700 italic">"{candidate.petOwnerDetails?.reasonForAdoption || "Not provided"}"</p>
          </div>
          <p className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <span className="text-gray-600">Ready:</span>
            <span className="font-medium text-gray-800">{candidate.petOwnerDetails?.readiness || "N/A"}</span>
          </p>
        </div>

        {petStatus === "adopted" && candidate.status === "approved" && (
          <div className="md:col-span-2 bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">{candidate.petOwnerDetails?.phone || "N/A"}</p>
            </div>
            <a
              href={`tel:${candidate.petOwnerDetails?.phone}`}
              className="bg-green-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-green-700 transition-all duration-200 shadow-md"
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

// Carte individuelle pour chaque candidat
const CandidateCard = ({ candidate, petStatus, openConfirmModal, toggleDetails, isExpanded }) => {
  // Si une date réelle est disponible via l'API, utilise candidate.appliedDate
  const appliedDate = candidate.appliedDate || "2025-03-01"; // Exemple statique, à remplacer par donnée réelle
  const formattedDate = new Date(appliedDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-xl shadow-md border border-amber-100 mb-6 hover:shadow-lg transition-all duration-200">
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        onClick={() => toggleDetails(candidate.userId)}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center shadow-sm">
            <UserCheck className="w-6 h-6 text-amber-600" />
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
              className="p-2 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200 hover:text-amber-700 transition-all duration-200 shadow-sm"
              title="Select this candidate"
              aria-label="Select candidate"
            >
              <UserCheck className="w-5 h-5" />
            </button>
          )}
          {candidate.status === "approved" && petStatus !== "adopted" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openConfirmModal("finalize", candidate.userId, candidate.name);
                }}
                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 hover:text-green-700 transition-all duration-200 shadow-sm"
                title="Finalize adoption"
                aria-label="Finalize adoption"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openConfirmModal("reject", candidate.userId, candidate.name);
                }}
                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 hover:text-red-700 transition-all duration-200 shadow-sm"
                title="Reject candidate"
                aria-label="Reject candidate"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </>
          )}
          {petStatus === "adopted" && candidate.status === "approved" && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center shadow-sm">
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
      <div key={i} className="bg-white rounded-xl shadow-md border border-amber-100 p-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100"></div>
            <div className="space-y-2">
              <div className="h-4 bg-amber-100 rounded w-40"></div>
              <div className="h-3 bg-amber-100 rounded w-24"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-amber-100 rounded-full"></div>
            <div className="w-10 h-10 bg-amber-100 rounded-full"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// État vide
const EmptyState = ({ message }) => (
  <div className="py-12 px-6 text-center bg-white rounded-xl shadow-md border border-amber-100">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center shadow-sm">
      <AlertCircle className="w-8 h-8 text-amber-500" />
    </div>
    <h3 className="text-gray-800 font-semibold text-lg mb-2">No Candidates Yet</h3>
    <p className="text-gray-600 max-w-md mx-auto">{message}</p>
  </div>
);

// Composant principal
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
            // Si l'API fournit une date, décommentez ceci :
            // appliedDate: candidate.appliedDate,
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
    setConfirmModal({ isOpen: true, action, candidateId, candidateName });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, action: "", candidateId: null, candidateName: "" });
  };

  const confirmAction = async () => {
    const { action, candidateId } = confirmModal;
    if (action === "select") {
      await handleInitialStatusChange(candidateId, "approved");
    } else if (action === "finalize") {
      await handleFinalizeAdoption(candidateId);
    } else if (action === "reject") {
      await handleInitialStatusChange(candidateId, "rejected");
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-pink-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6 mb-8">
          <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200 hover:text-amber-700 transition-all duration-200 shadow-sm"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Adoption Candidates</h1>
                <p className="text-sm text-gray-600 mt-2">
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
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-amber-600" />
                <span className="text-amber-800 font-semibold text-lg">
                  {filteredCandidates.length} Candidate{filteredCandidates.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {petDetails?.status === "adopted" ? (
                  <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full flex items-center shadow-sm">
                    <Check className="w-4 h-4 mr-2" />
                    Adoption Complete
                  </span>
                ) : filteredCandidates.some((c) => c.status === "approved") ? (
                  <span className="bg-amber-200 text-amber-800 px-4 py-1 rounded-full flex items-center shadow-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Awaiting Finalization
                  </span>
                ) : (
                  <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full flex items-center shadow-sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Your Decision Needed
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Candidates List (Cartes séparées) */}
        <div className="space-y-6">
          {isLoading ? (
            <SkeletonLoader />
          ) : error ? (
            <div className="p-6 text-center text-red-600 flex flex-col items-center justify-center gap-3 bg-white rounded-xl shadow-md border border-amber-100">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="font-medium text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-5 py-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-all duration-200 shadow-sm"
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
        {candidates.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 shadow-sm border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              How to Use This Page
            </h4>
            <ul className="list-disc ml-6 space-y-2 text-blue-700 text-sm">
              <li>Click a candidate’s card to see their full application details.</li>
              <li>Use <span className="font-medium">Select</span> to shortlist a candidate (rejects others).</li>
              <li>After selecting, <span className="font-medium">Finalize</span> to complete the adoption.</li>
              <li>Contact details unlock after finalization—reach out directly!</li>
            </ul>
          </div>
        )}

        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={confirmAction}
          action={confirmModal.action}
          itemName={confirmModal.candidateName}
        />
      </div>
    </div>
  );
};

export default CandidatesPage;