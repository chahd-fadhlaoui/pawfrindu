import React, { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  UserCheck,
  UserX,
  Search,
  ArrowLeft,
  Filter,
  AlertCircle,
  X,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { mockCandidates } from "../assets/mockCandidates";

const CandidateStatus = ({ status }) => {
  const styles = {
    approved: "bg-[#ffc929]/20 text-[#ffc929]",
    rejected: "bg-neutral-100 text-neutral-700",
    pending: "bg-pink-100 text-pink-500",
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
      className="w-full pl-10 pr-10 py-3 bg-white border-2 border-[#ffc929]/20 rounded-lg 
        shadow-[0_4px_12px_rgba(0,0,0,0.1)]
        focus:shadow-[0_8px_16px_rgba(255,201,41,0.25)]
        hover:shadow-[0_6px_14px_rgba(255,201,41,0.2)]
        focus:ring-4 focus:ring-[#ffc929]/20 focus:border-[#ffc929]
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
          ? "bg-[#ffc929] text-neutral-900 shadow-[0_4px_12px_rgba(255,201,41,0.3)]"
          : "bg-[#ffc929]/15 text-[#000000] hover:bg-[#ffc929]/20 hover:text-[#ffc929]"
      }`}
  >
    {label}
  </button>
);

const CandidateCard = ({ candidate, onStatusChange }) => (
  <div
    className="group overflow-hidden bg-white rounded-xl 
    border-2 border-transparent
    shadow-[0_4px_12px_rgba(0,0,0,0.1)]
    hover:shadow-[0_20px_40px_rgba(255,201,41,0.2)]
    hover:border-[#ffc929]/30
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
          <button
            onClick={() => onStatusChange(candidate.id, "approved")}
            className="p-3 text-[#ffc929] rounded-full 
              shadow-[0_4px_12px_rgba(0,0,0,0.1)]
              hover:shadow-[0_8px_16px_rgba(255,201,41,0.3)]
              hover:bg-[#ffc929] hover:text-neutral-900
              transition-all duration-300
              transform hover:scale-110 hover:rotate-6"
            aria-label="Approve candidate"
          >
            <UserCheck className="w-5 h-5" />
          </button>
          <button
            onClick={() => onStatusChange(candidate.id, "rejected")}
            className="p-3 text-neutral-500 rounded-full 
              shadow-[0_4px_12px_rgba(0,0,0,0.1)]
              hover:shadow-[0_8px_16px_rgba(236,72,153,0.3)]
              hover:bg-pink-500 hover:text-white
              transition-all duration-300
              transform hover:scale-110 hover:-rotate-6"
            aria-label="Reject candidate"
          >
            <UserX className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <a
          href={`mailto:${candidate.email}`}
          className="flex items-center gap-2 transition-all duration-300 transform text-neutral-600 group-hover:text-pink-500 hover:translate-x-2"
        >
          <Mail className="w-4 h-4" />
          <span className="truncate">{candidate.email}</span>
        </a>
        <a
          href={`tel:${candidate.phone}`}
          className="flex items-center gap-2 transition-all duration-300 transform text-neutral-600 group-hover:text-pink-500 hover:translate-x-2"
        >
          <Phone className="w-4 h-4" />
          <span>{candidate.phone}</span>
        </a>
      </div>

      <div
        className="p-4 rounded-lg bg-gradient-to-br from-[#ffc929]/5 to-pink-50/30
        transform transition-all duration-300 
        group-hover:bg-white 
        group-hover:shadow-[0_8px_16px_rgba(255,201,41,0.1)]
        hover:scale-[1.02]"
      >
        <h4 className="mb-3 font-medium text-neutral-900 transition-colors duration-300 group-hover:text-[#ffc929]">
          Application Details
        </h4>
        <dl className="grid gap-y-2">
          {Object.entries(candidate.form).map(([key, value]) => (
            <div key={key} className="grid grid-cols-2 gap-2 group/item">
              <dt className="text-sm font-medium capitalize text-neutral-600 transition-colors duration-300 group-hover/item:text-[#ffc929]">
                {key}:
              </dt>
              <dd className="text-sm transition-colors duration-300 text-neutral-900 group-hover/item:text-neutral-700">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </div>
);

const CandidatesPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setCandidates(mockCandidates);
      setIsLoading(false);
    }, 500);
  }, [petId]);

  const handleStatusChange = (candidateId, newStatus) => {
    setCandidates(
      candidates.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, status: newStatus }
          : candidate
      )
    );
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
    <div className="min-h-screen bg-gradient-to-br from-white via-[#ffc929]/5 to-pink-50">
      <div className="container max-w-6xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center mb-6 space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white 
              shadow-[0_4px_12px_rgba(0,0,0,0.1)]
              hover:shadow-[0_8px_16px_rgba(255,201,41,0.3)]
              hover:bg-[#ffc929]
              transition-all duration-300
              transform hover:scale-110 hover:rotate-12"
          >
            <ArrowLeft className="w-6 h-6 text-[#ffc929] transition-colors duration-300 hover:text-neutral-900" />
          </button>
          <header className="transition-all duration-500 transform hover:translate-x-2">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 transition-colors duration-300 sm:text-4xl lg:text-5xl hover:text-[#ffc929]">
              Adoption Candidates
            </h1>
            <p className="mt-2 text-lg transition-colors duration-300 text-neutral-600 hover:text-pink-500">
              Review and manage potential adopters for your pet
            </p>
          </header>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="w-full max-w-2xl">
              <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onReset={resetSearch}
              />
            </div>
            <span className="inline-flex px-4 py-2 text-sm font-medium text-neutral-900 rounded-full 
              bg-[#ffc929] shadow-[0_4px_12px_rgba(255,201,41,0.15)]
              transition-all duration-300 transform hover:scale-105">
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
                  className="animate-pulse bg-gradient-to-br from-[#ffc929]/5 to-pink-50/30 rounded-xl h-64 
                  shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                />
              ))
          ) : filteredCandidates.length === 0 ? (
            <div
              className="col-span-full p-12 text-center bg-white rounded-xl 
              shadow-[0_8px_16px_rgba(0,0,0,0.1)]
              hover:shadow-[0_12px_24px_rgba(255,201,41,0.15)]
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
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidatesPage;