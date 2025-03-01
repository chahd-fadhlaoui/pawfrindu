import {
  AlertCircle,
  ArrowLeft,
  Mail,
  Phone,
  Search,
  UserCheck,
  UserX,
  X,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const CandidateStatus = ({ status }) => {
  const styles = {
    approved: "bg-amber-200/20 text-[#ffc929]",
    rejected: "bg-neutral-100 text-neutral-700",
    pending: "bg-rose-100 text-rose-500",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium shadow-[0_4px_12px_rgba(0,0,0,0.1)] transform transition-all duration-300 hover:scale-105 ${
        styles[status] || styles.pending
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const SearchBar = ({ value, onChange, onReset }) => (
  <div className="relative w-full">
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <Search className="w-5 h-5 text-[#ffc929] transition-colors duration-300" />
    </div>
    <input
      type="text"
      placeholder="Search candidates..."
      className="w-full pl-10 pr-10 py-3 bg-white border-2 border-amber-100 rounded-lg 
        shadow-[0_4px_12px_rgba(0,0,0,0.1)]
        focus:shadow-[0_8px_16px_rgba(251,191,36,0.25)]
        hover:shadow-[0_6px_14px_rgba(251,191,36,0.2)]
        focus:ring-4 focus:ring-amber-200/20 focus:border-amber-200
        focus:outline-none
        transition-all duration-300 ease-in-out
        transform hover:-translate-y-1 hover:scale-[1.01]"
      value={value}
      onChange={onChange}
    />
    {value && (
      <button
        onClick={onReset}
        className="absolute inset-y-0 right-0 flex items-center pr-3 transition-colors duration-300 text-neutral-400 hover:text-neutral-600"
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
);

const FilterButton = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105
      ${
        active
          ? "bg-[#ffc929] text-white shadow-[0_4px_12px_rgba(251,191,36,0.3)]"
          : "bg-amber-100 text-gray-700 hover:bg-amber-200 hover:text-[#ffc929]"
      }`}
  >
    {label}
  </button>
);

const CandidateCard = ({
  candidate,
  onInitialStatusChange,
  onFinalizeAdoption,
  petStatus,
}) => (
  <div
    className="group overflow-hidden bg-white rounded-xl 
    border-2 border-transparent
    shadow-[0_4px_12px_rgba(0,0,0,0.1)]
    hover:shadow-[0_20px_40px_rgba(251,191,36,0.2)]
    hover:border-amber-200/30
    transition-all duration-500 ease-in-out
    transform hover:-translate-y-2 hover:rotate-1"
  >
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-neutral-900 transition-colors duration-300 group-hover:text-[#ffc929]">
            {candidate.name}
          </h3>
          <CandidateStatus status={candidate.status || "pending"} />
        </div>
        <div className="flex gap-2 transition-transform duration-300 transform group-hover:scale-110">
          {candidate.status === "pending" && (
            <>
              <button
                onClick={() => onInitialStatusChange(candidate.id, "approved")}
                className="p-3 text-[#ffc929] rounded-full 
                  shadow-[0_4px_12px_rgba(0,0,0,0.1)]
                  hover:shadow-[0_8px_16px_rgba(251,191,36,0.3)]
                  hover:bg-[#ffc929] hover:text-white
                  transition-all duration-300
                  transform hover:scale-110 hover:rotate-6"
                aria-label="Approve candidate"
              >
                <UserCheck className="w-5 h-5" />
              </button>
              <button
                onClick={() => onInitialStatusChange(candidate.id, "rejected")}
                className="p-3 text-neutral-500 rounded-full 
                  shadow-[0_4px_12px_rgba(0,0,0,0.1)]
                  hover:shadow-[0_8px_16px_rgba(236,72,153,0.3)]
                  hover:bg-rose-500 hover:text-white
                  transition-all duration-300
                  transform hover:scale-110 hover:-rotate-6"
                aria-label="Reject candidate"
              >
                <UserX className="w-5 h-5" />
              </button>
            </>
          )}
          {candidate.status === "approved" && (
            <>
              {petStatus === "adoptionPending" && (
                <>
                  <button
                    onClick={() => onFinalizeAdoption(candidate.id, "adopt")}
                    className="p-3 text-green-600 rounded-full 
                      shadow-[0_4px_12px_rgba(0,0,0,0.1)]
                      hover:shadow-[0_8px_16px_rgba(34,197,94,0.3)]
                      hover:bg-green-600 hover:text-white
                      transition-all duration-300
                      transform hover:scale-110 hover:rotate-6"
                    aria-label="Finalize adoption"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onFinalizeAdoption(candidate.id, "reject")}
                    className="p-3 text-rose-500 rounded-full 
                      shadow-[0_4px_12px_rgba(0,0,0,0.1)]
                      hover:shadow-[0_8px_16px_rgba(236,72,153,0.3)]
                      hover:bg-rose-500 hover:text-white
                      transition-all duration-300
                      transform hover:scale-110 hover:-rotate-6"
                    aria-label="Reject adoption"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={() => onInitialStatusChange(candidate.id, "pending")}
                className="p-3 text-gray-600 rounded-full 
                  shadow-[0_4px_12px_rgba(0,0,0,0.1)]
                  hover:shadow-[0_8px_16px_rgba(128,128,128,0.3)]
                  hover:bg-gray-600 hover:text-white
                  transition-all duration-300
                  transform hover:scale-110 hover:rotate-6"
                aria-label="Undo approval"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </>
          )}
          {candidate.status === "rejected" && (
            <button
              onClick={() => onInitialStatusChange(candidate.id, "pending")}
              className="p-3 text-gray-600 rounded-full 
                shadow-[0_4px_12px_rgba(0,0,0,0.1)]
                hover:shadow-[0_8px_16px_rgba(128,128,128,0.3)]
                hover:bg-gray-600 hover:text-white
                transition-all duration-300
                transform hover:scale-110 hover:rotate-6"
              aria-label="Undo rejection"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <a
          href={`mailto:${candidate.email}`}
          className="flex items-center gap-2 transition-all duration-300 transform text-neutral-600 group-hover:text-rose-500 hover:translate-x-2"
        >
          <Mail className="w-4 h-4" />
          <span className="truncate">{candidate.email}</span>
        </a>
        {candidate.status === "approved" &&
          candidate.petOwnerDetails?.phone && (
            <a
              href={`tel:${candidate.petOwnerDetails.phone}`}
              className="flex items-center gap-2 transition-all duration-300 transform text-neutral-600 group-hover:text-rose-500 hover:translate-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>{candidate.petOwnerDetails.phone}</span>
            </a>
          )}
      </div>

      <div
        className="p-4 rounded-lg bg-gradient-to-br from-amber-50/50 to-rose-50/30
        transform transition-all duration-300 
        group-hover:bg-white 
        group-hover:shadow-[0_8px_16px_rgba(251,191,36,0.1)]
        hover:scale-[1.02]"
      >
        <h4 className="mb-3 font-medium text-neutral-900 transition-colors duration-300 group-hover:text-[#ffc929]">
          Application Details
        </h4>
        <dl className="grid gap-y-2">
          <div className="grid grid-cols-2 gap-2 group/item">
            <dt className="text-sm font-medium text-neutral-600 transition-colors duration-300 group-hover/item:text-[#ffc929]">
              Occupation:
            </dt>
            <dd className="text-sm transition-colors duration-300 text-neutral-900 group-hover/item:text-neutral-700">
              {candidate.petOwnerDetails?.occupation || "N/A"}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-2 group/item">
            <dt className="text-sm font-medium text-neutral-600 transition-colors duration-300 group-hover/item:text-[#ffc929]">
              Work Schedule:
            </dt>
            <dd className="text-sm transition-colors duration-300 text-neutral-900 group-hover/item:text-neutral-700">
              {candidate.petOwnerDetails?.workSchedule || "N/A"}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-2 group/item">
            <dt className="text-sm font-medium text-neutral-600 transition-colors duration-300 group-hover/item:text-[#ffc929]">
              Housing Type:
            </dt>
            <dd className="text-sm transition-colors duration-300 text-neutral-900 group-hover/item:text-neutral-700">
              {candidate.petOwnerDetails?.housing?.type || "N/A"}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-2 group/item">
            <dt className="text-sm font-medium text-neutral-600 transition-colors duration-300 group-hover/item:text-[#ffc929]">
              Ownership:
            </dt>
            <dd className="text-sm transition-colors duration-300 text-neutral-900 group-hover/item:text-neutral-700">
              {candidate.petOwnerDetails?.housing?.ownership || "N/A"}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-2 group/item">
            <dt className="text-sm font-medium text-neutral-600 transition-colors duration-300 group-hover/item:text-[#ffc929]">
              Family Size:
            </dt>
            <dd className="text-sm transition-colors duration-300 text-neutral-900 group-hover/item:text-neutral-700">
              {candidate.petOwnerDetails?.housing?.familySize || "N/A"}
            </dd>
          </div>
          {candidate.petOwnerDetails?.housing?.ownership !== "own" && (
            <div className="grid grid-cols-2 gap-2 group/item">
              <dt className="text-sm font-medium text-neutral-600 transition-colors duration-300 group-hover/item:text-[#ffc929]">
                Landlord Approval:
              </dt>
              <dd className="text-sm transition-colors duration-300 text-neutral-900 group-hover/item:text-neutral-700">
                {candidate.petOwnerDetails?.housing?.landlordApproval
                  ? "Yes"
                  : "No"}
              </dd>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 group/item">
            <dt className="text-sm font-medium text-neutral-600 transition-colors duration-300 group-hover/item:text-[#ffc929]">
              Reason for Adoption:
            </dt>
            <dd className="text-sm transition-colors duration-300 text-neutral-900 group-hover/item:text-neutral-700">
              {candidate.petOwnerDetails?.reasonForAdoption || "N/A"}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-2 group/item">
            <dt className="text-sm font-medium text-neutral-600 transition-colors duration-300 group-hover/item:text-[#ffc929]">
              Readiness:
            </dt>
            <dd className="text-sm transition-colors duration-300 text-neutral-900 group-hover/item:text-neutral-700">
              {candidate.petOwnerDetails?.readiness || "N/A"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
);

const CandidatesPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [petStatus, setPetStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPetCandidates = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching candidates for pet:", petId);
        const candidatesResponse = await axiosInstance.get(
          `/api/pet/${petId}/candidates`
        );
        console.log("Candidates response:", candidatesResponse.data);
        if (candidatesResponse.data.success) {
          setCandidates(candidatesResponse.data.data);
        } else {
          setError(
            candidatesResponse.data.message || "Failed to fetch candidates"
          );
          setCandidates([]);
          return;
        }

        console.log("Fetching pet details for:", petId);
        const petResponse = await axiosInstance.get(`/api/pet/pets/${petId}`);
        console.log("Pet response:", petResponse.data);
        setPetStatus(petResponse.data.data.status);
      } catch (err) {
        console.error(
          "Fetch error:",
          err.message,
          err.response?.status,
          err.response?.data
        );
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
            candidate.id === candidateId
              ? { ...candidate, status: newStatus }
              : candidate
          )
        );
        setPetStatus(response.data.data.status);
      } else {
        setError(response.data.message || "Failed to update candidate status");
      }
    } catch (err) {
      console.error("Update error:", err.response?.status, err.response?.data);
      setError(
        err.response?.data?.message || "Failed to update candidate status"
      );
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
            candidate.id === candidateId
              ? {
                  ...candidate,
                  status: action === "adopt" ? "approved" : "rejected",
                }
              : candidate
          )
        );
        setPetStatus(response.data.data.status);
      } else {
        setError(response.data.message || "Failed to finalize adoption");
      }
    } catch (err) {
      console.error(
        "Finalize error:",
        err.response?.status,
        err.response?.data
      );
      setError(err.response?.data?.message || "Failed to finalize adoption");
    }
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-amber-50/50 to-rose-50">
      <div className="container max-w-6xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center mb-6 space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white 
              shadow-[0_4px_12px_rgba(0,0,0,0.1)]
              hover:shadow-[0_8px_16px_rgba(251,191,36,0.3)]
              hover:bg-[#ffc929]
              transition-all duration-300
              transform hover:scale-110 hover:rotate-12"
          >
            <ArrowLeft className="w-6 h-6 text-[#ffc929] transition-colors duration-300 hover:text-white" />
          </button>
          <header className="transition-all duration-500 transform hover:translate-x-2">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 transition-colors duration-300 sm:text-4xl lg:text-5xl hover:text-[#ffc929]">
              Adoption Candidates
            </h1>
            <p className="mt-2 text-lg transition-colors duration-300 text-neutral-600 hover:text-rose-500">
              Review and manage potential adopters for your pet
            </p>
          </header>
        </div>

        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-50 rounded-lg shadow-md">
            {error}
          </div>
        )}

        <div className="mb-8 space-y-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="w-full max-w-2xl">
              <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onReset={resetSearch}
              />
            </div>
            <span
              className="inline-flex px-4 py-2 text-sm font-medium text-white rounded-full 
              bg-[#ffc929] shadow-[0_4px_12px_rgba(251,191,36,0.15)]
              transition-all duration-300 transform hover:scale-105"
            >
              {filteredCandidates.length} candidates found
            </span>
          </div>

          <div className="flex gap-2 pb-2 overflow-x-auto">
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

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse bg-gradient-to-br from-amber-50/50 to-rose-50/30 rounded-xl h-64 
                  shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                />
              ))
          ) : filteredCandidates.length === 0 ? (
            <div
              className="col-span-full p-12 text-center bg-white rounded-xl 
              shadow-[0_8px_16px_rgba(0,0,0,0.1)]
              hover:shadow-[0_12px_24px_rgba(251,191,36,0.15)]
              transform transition-all duration-300"
            >
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[#ffc929]" />
              <p className="text-lg font-medium text-neutral-900">
                No candidates match your criteria
              </p>
              <p className="mt-2 text-neutral-600">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onInitialStatusChange={handleInitialStatusChange}
                onFinalizeAdoption={handleFinalizeAdoption}
                petStatus={petStatus}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidatesPage;
