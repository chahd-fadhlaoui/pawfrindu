import {
  AlertCircle,
  ArrowLeft,
  Check,
  XCircle,
  UserCheck,
  Home,
  Briefcase,
  Users,
  MessageSquare,
  Calendar,
  Search,
  X,
  Phone,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const CandidateStatus = ({ status }) => {
  const styles = {
    approved: "bg-[#ffc929]/20 text-[#ffc929] border-[#ffc929]",
    rejected: "bg-neutral-100 text-neutral-700 border-neutral-300",
    pending: "bg-rose-100 text-rose-600 border-rose-300",
  };

  const icons = {
    approved: <Check className="w-4 h-4 mr-2" />,
    rejected: <XCircle className="w-4 h-4 mr-2" />,
    pending: <UserCheck className="w-4 h-4 mr-2" />,
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border shadow-sm ${
        styles[status] || styles.pending
      }`}
    >
      {icons[status] || icons.pending}
      {status.charAt(0).toUpperCase() + status.slice(1)}
      {status === "approved" && (
        <span className="ml-2 text-xs text-gray-600">(Next: Confirm adoption)</span>
      )}
    </span>
  );
};

const SearchBar = ({ value, onChange, onReset }) => (
  <div className="relative w-full max-w-md">
    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
      <Search className="w-5 h-5 text-[#ffc929]" />
    </div>
    <input
      type="text"
      placeholder="Search candidates..."
      className="w-full pl-12 pr-10 py-3 bg-white border-2 border-amber-100 rounded-full shadow-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-200 focus:outline-none transition-all duration-300"
      value={value}
      onChange={onChange}
    />
    {value && (
      <button
        onClick={onReset}
        className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400 hover:text-neutral-600 transition-colors duration-300"
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
);

const FilterButton = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
      active
        ? "bg-[#ffc929] text-white shadow-md"
        : "bg-amber-100 text-gray-700 hover:bg-amber-200 hover:text-[#ffc929]"
    }`}
  >
    {label}
  </button>
);

const ConfirmationModal = ({ isOpen, onClose, onConfirm, action, itemName }) => {
  if (!isOpen) return null;

  const getActionMessage = () => {
    switch (action) {
      case "select":
        return `Do you want to pick "${itemName}" to adopt your pet? This will decline other candidates and prepare the adoption.`;
      case "finalize":
        return `Do you want "${itemName}" to officially adopt your pet? This decision cannot be changed.`;
      case "reject":
        return `Do you want to decline "${itemName}"? If no one else is chosen, applications will stay open.`;
      default:
        return "Are you sure you want to proceed?";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg border-2 border-[#ffc929]/20">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-[#ffc929] transition-colors duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="text-center space-y-6">
          <AlertCircle className="w-12 h-12 mx-auto text-[#ffc929]" />
          <h3 className="text-xl font-semibold text-gray-900">Confirmation</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            {getActionMessage()}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-gradient-to-r from-[#ffc929] to-[#ffa726] text-white rounded-full hover:from-[#ffa726] hover:to-[#ffc929] transition-all duration-300"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CandidateCard = ({
  candidate,
  petStatus,
  openConfirmModal,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-800">{candidate.name}</h3>
          <CandidateStatus status={candidate.status || "pending"} />
        </div>
        <div className="flex flex-col gap-4">
          {candidate.status === "pending" && petStatus !== "adopted" && (
            <button
              onClick={() => openConfirmModal("select", candidate.userId, candidate.name)}
              className="flex items-center justify-center px-6 py-3 bg-[#ffc929] text-white rounded-full shadow-md hover:bg-[#ffa726] transition-all duration-300 active:scale-95"
            >
              <UserCheck className="w-5 h-5 mr-2" />
              Choose
            </button>
          )}
          {candidate.status === "approved" && petStatus !== "adopted" && (
            <>
              <button
                onClick={() => openConfirmModal("finalize", candidate.userId, candidate.name)}
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 transition-all duration-300 active:scale-95"
              >
                <Check className="w-5 h-5 mr-2" />
                Confirm Adoption
              </button>
              <button
                onClick={() => openConfirmModal("reject", candidate.userId, candidate.name)}
                className="flex items-center justify-center px-6 py-3 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 transition-all duration-300 active:scale-95"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Decline
              </button>
            </>
          )}
         {petStatus === "adopted" && candidate.status === "approved" && (
            <div className="flex flex-col gap-2">
              <span className="flex items-center text-green-600 font-semibold">
                <Check className="w-5 h-5 mr-2" />
                Adoption Finalized
              </span>
              <span className="flex items-center text-gray-700">
                <Phone className="w-5 h-5 ml-2 mr-2 text-[#ffc929]" />
                {candidate.petOwnerDetails?.phone}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 p-4 bg-amber-50 rounded-lg">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Application Details</h4>
        <dl className="grid gap-y-3 text-gray-700">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#ffc929]" />
            <dt className="font-medium">Occupation:</dt>
            <dd>{candidate.petOwnerDetails?.occupation || "Not specified"}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#ffc929]" />
            <dt className="font-medium">Work Schedule:</dt>
            <dd>{candidate.petOwnerDetails?.workSchedule || "Not specified"}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-[#ffc929]" />
            <dt className="font-medium">Housing Type:</dt>
            <dd>{candidate.petOwnerDetails?.housing?.type || "Not specified"}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-[#ffc929]" />
            <dt className="font-medium">Ownership:</dt>
            <dd>{candidate.petOwnerDetails?.housing?.ownership || "Not specified"}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#ffc929]" />
            <dt className="font-medium">Family Size:</dt>
            <dd>{candidate.petOwnerDetails?.housing?.familySize || "Not specified"}</dd>
          </div>
          {candidate.petOwnerDetails?.housing?.ownership !== "own" && (
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#ffc929]" />
              <dt className="font-medium">Landlord Approval:</dt>
              <dd>{candidate.petOwnerDetails?.housing?.landlordApproval ? "Yes" : "No"}</dd>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#ffc929]" />
            <dt className="font-medium">Reason for Adoption:</dt>
            <dd>{candidate.petOwnerDetails?.reasonForAdoption || "Not specified"}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#ffc929]" />
            <dt className="font-medium">Readiness:</dt>
            <dd>{candidate.petOwnerDetails?.readiness || "Not specified"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

const CandidatesPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [petStatus, setPetStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: "",
    candidateId: null,
    candidateName: "",
  });

  useEffect(() => {
    const fetchPetCandidates = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching candidates for pet:", petId);
        const candidatesResponse = await axiosInstance.get(`/api/pet/${petId}/candidates`);
        console.log("Candidates response:", candidatesResponse.data);
        if (candidatesResponse.data.success) {
          const normalizedCandidates = candidatesResponse.data.data.map(candidate => ({
            ...candidate,
            userId: candidate.user || candidate.userId || candidate.id
          }));
          setCandidates(normalizedCandidates);
        } else {
          setError(candidatesResponse.data.message || "Failed to fetch candidates");
          setCandidates([]);
          return;
        }

        console.log("Fetching pet details for:", petId);
        const petResponse = await axiosInstance.get(`/api/pet/pets/${petId}`);
        console.log("Pet response:", petResponse.data);
        setPetStatus(petResponse.data.data.status || "accepted");
      } catch (err) {
        console.error("Fetch error:", err.message, err.response?.status, err.response?.data);
        setError(err.message || "An error occurred while fetching data");
        setCandidates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPetCandidates();
  }, [petId]);

  const handleInitialStatusChange = async (candidateId, newStatus) => {
    try {
      console.log("Updating candidate status:", { candidateId, newStatus });
      const response = await axiosInstance.put(
        `/api/pet/${petId}/candidate/${candidateId}/status`,
        { status: newStatus }
      );
      console.log("Update response:", response.data);
      if (response.data.success) {
        setCandidates((prevCandidates) =>
          prevCandidates.map((candidate) =>
            candidate.userId === candidateId
              ? { ...candidate, status: newStatus }
              : newStatus === "approved" && candidate.status !== "rejected"
              ? { ...candidate, status: "rejected" }
              : candidate
          )
        );
        setPetStatus(response.data.data.status);
        console.log("Pet status updated to:", response.data.data.status);
      } else {
        setError(response.data.message || "Failed to update candidate status");
      }
    } catch (err) {
      console.error("Update error:", err.response?.status, err.response?.data);
      setError(err.response?.data?.message || "Failed to update candidate status");
    }
  };

  const handleFinalizeAdoption = async (candidateId, action) => {
    try {
      console.log("Finalizing adoption:", { candidateId, action });
      const response = await axiosInstance.put(
        `/api/pet/${petId}/candidate/${candidateId}/finalize`,
        { action }
      );
      console.log("Finalize response:", response.data);
      if (response.data.success) {
        setCandidates((prevCandidates) =>
          prevCandidates.map((candidate) =>
            candidate.userId === candidateId
              ? { ...candidate, status: "approved" }
              : { ...candidate, status: "rejected" }
          )
        );
        setPetStatus(response.data.data.status);
        console.log("Pet status updated to:", response.data.data.status);
      } else {
        setError(response.data.message || "Failed to finalize adoption");
      }
    } catch (err) {
      console.error("Finalize error:", err.response?.status, err.response?.data);
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
      await handleFinalizeAdoption(candidateId, "adopt");
    } else if (action === "reject") {
      await handleInitialStatusChange(candidateId, "rejected");
    }
    closeConfirmModal();
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = candidate.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetSearch = () => setSearchTerm("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-amber-50/50 to-rose-50 py-12">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8 space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-[#ffc929] transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6 text-[#ffc929] hover:text-white" />
          </button>
          <header>
            <h1 className="text-3xl font-bold text-gray-800">Adoption Candidates</h1>
            <p className="mt-2 text-lg text-gray-600">Manage applications for your pet</p>
          </header>
        </div>

        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg shadow-md">
            {error}
          </div>
        )}

        <div className="mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onReset={resetSearch}
            />
            <span className="text-sm font-medium text-white bg-[#ffc929] px-4 py-2 rounded-full shadow-md">
              {filteredCandidates.length} candidates found
            </span>
          </div>

          <div className="flex gap-3 flex-wrap">
            <FilterButton
              active={statusFilter === "all"}
              label="All"
              onClick={() => setStatusFilter("all")}
            />
            <FilterButton
              active={statusFilter === "pending"}
              label="Pending"
              onClick={() => setStatusFilter("pending")}
            />
            <FilterButton
              active={statusFilter === "approved"}
              label="Approved"
              onClick={() => setStatusFilter("approved")}
            />
            <FilterButton
              active={statusFilter === "rejected"}
              label="Rejected"
              onClick={() => setStatusFilter("rejected")}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse bg-amber-50 rounded-xl h-64 shadow-md"
                />
              ))
          ) : filteredCandidates.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-white rounded-xl shadow-md">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[#ffc929]" />
              <p className="text-lg font-medium text-gray-800">
                No candidates match your criteria
              </p>
              <p className="mt-2 text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.userId}
                candidate={candidate}
                petStatus={petStatus}
                openConfirmModal={openConfirmModal}
              />
            ))
          )}
        </div>

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