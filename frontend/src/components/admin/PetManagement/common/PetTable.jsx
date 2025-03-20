import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Check,
  X,
  PawPrint,
  Heart,
  Users,
  Clock,
  Loader2,
} from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";
import EmptyState from "../common/EmptyState";

const DEFAULT_PET_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8cGF0aCBkPSJNMTQwIDgwQzE0MCA2MCAxMjAgNDAgMTAwIDQwIDgwIDQwIDYwIDYwIDYwIDgwIiBmaWxsPSIjOUNBM0FGIi8+CiAgPHBhdGggZD0iTTE0MCAxMjBDMTQwIDE0MCAxMjAgMTYwIDEwMCAxNjAgODAgMTYwIDYwIDE0MCA2MCAxMjAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNODAgNTBDNzAgNDAgOTAgMzAgMTAwIDMwIDEzMCAzMCAxNDAgNTAgMTMwIDYwIiBmaWxsPSIjOUNBM0FGIi8+CiAgPHBhdGggZD0iTTEyMCAxODBDMTIwIDE5MCAxMTAgMjAwIDEwMCAyMDAgOTAgMjAwIDgwIDE5MCA4MCAxODAiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+";

const PetTable = ({
  pets,
  selectedPets = [],
  currentUser,
  onToggleSelection,
  onToggleSelectAll,
  customActions,
  title = "All Pets",
  showHeader = true,
  bulkAction = "archive",
}) => {
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [expandedPet, setExpandedPet] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [candidates, setCandidates] = useState({});
  const [loadingCandidates, setLoadingCandidates] = useState({});
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleSort = (field) => {
    setSortField(field);
    setSortDirection((prev) => (sortField === field && prev === "asc" ? "desc" : "asc"));
  };

  const displayedPets = [...pets].sort((a, b) => {
    let fieldA = a[sortField] || "";
    let fieldB = b[sortField] || "";
    if (fieldA === fieldB) return 0;
    const result = typeof fieldA === "string" ? fieldA.localeCompare(fieldB) : fieldA - fieldB;
    return sortDirection === "asc" ? result : -result;
  });

  const toggleDropdown = (petId, e) => {
    e.stopPropagation();
    setDropdownOpen(dropdownOpen === petId ? null : petId);
  };

  const toggleExpandPet = async (petId) => {
    if (expandedPet === petId) {
      setExpandedPet(null);
    } else {
      setExpandedPet(petId);
      setActiveTab("info");
      if (!candidates[petId] && currentUser?.role === "Admin") {
        fetchCandidates(petId);
      }
    }
  };

  const fetchCandidates = async (petId) => {
    setLoadingCandidates((prev) => ({ ...prev, [petId]: true }));
    try {
      const response = await axiosInstance.get(`/api/pet/${petId}/candidates`);
      setCandidates((prev) => ({ ...prev, [petId]: response.data.data }));
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setCandidates((prev) => ({ ...prev, [petId]: [] }));
    } finally {
      setLoadingCandidates((prev) => ({ ...prev, [petId]: false }));
    }
  };

  const getStatusBadgeStyle = (status, isArchived) => {
    if (isArchived) {
      return "bg-gradient-to-r from-gray-400 to-gray-500 text-white border border-gray-600 shadow-md";
    }
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      accepted: "bg-green-100 text-green-700 border border-green-200",
      adoptionPending: "bg-amber-100 text-amber-700 border border-amber-200",
      adopted: "bg-teal-100 text-teal-700 border border-teal-200",
      sold: "bg-purple-100 text-purple-700 border border-purple-200",
    };
    return styles[status] || "bg-gray-100 text-gray-600 border border-gray-200";
  };

  const getCandidateStatusStyle = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      approved: "bg-green-100 text-green-700 border border-green-200",
      rejected: "bg-red-100 text-red-700 border border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-600 border border-gray-200";
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="inline-block w-4 h-4 ml-1 text-gray-600" />
    ) : (
      <ChevronDown className="inline-block w-4 h-4 ml-1 text-gray-600" />
    );
  };

  const canPerformAction = (pet) => {
    if (currentUser?.role !== "Admin") return false;
    switch (bulkAction) {
      case "accept":
        return pet.status === "pending";
      case "reject":
        return pet.status === "pending";
      case "archive":
        return pet.status === "accepted" || pet.status === "adoptionPending";
      default:
        return false;
    }
  };

  return (
    <div className="w-full">
      {showHeader && (
        <div className="p-4 mb-6 transition-all duration-300 bg-white shadow-md rounded-xl sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-pink-100 rounded-lg">
                <PawPrint className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600">
                  {displayedPets.length} {displayedPets.length === 1 ? "pet" : "pets"}
                </p>
              </div>
            </div>
            <span className="px-2 py-1 text-sm font-medium text-white rounded-full bg-gradient-to-r from-yellow-500 to-pink-500">
              {displayedPets.length}
            </span>
          </div>
        </div>
      )}

      {selectedPets.length > 0 && (
        <div className="p-4 mb-6 transition-all duration-300 bg-white shadow-md rounded-xl">
          <div className="flex items-center justify-between sm:gap-4">
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-2.5 py-1 text-sm font-semibold text-white bg-gradient-to-r from-yellow-500 to-pink-500 rounded-full shadow-sm">
                {selectedPets.length}
              </span>
              <span className="text-sm font-medium text-gray-800">
                pet{selectedPets.length > 1 ? "s" : ""} selected
              </span>
            </div>
            <button
              onClick={() => onToggleSelectAll()}
              className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 hover:text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {displayedPets.length === 0 ? (
        <EmptyState customMessage="No pets available at this time." />
      ) : (
        <div className="overflow-hidden bg-white shadow-md rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {onToggleSelectAll && (
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                      <input
                        type="checkbox"
                        checked={
                          selectedPets.length > 0 &&
                          selectedPets.length ===
                            displayedPets.filter((p) => canPerformAction(p)).length &&
                          displayedPets.some((p) => canPerformAction(p))
                        }
                        onChange={onToggleSelectAll}
                        className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                        aria-label="Select all pets"
                      />
                    </th>
                  )}
                  <th
                    className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase transition-colors cursor-pointer sm:px-6 hover:text-pink-600"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      <span>Pet</span>
                      {getSortIcon("name")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase transition-colors cursor-pointer sm:px-6 hover:text-pink-600"
                    onClick={() => handleSort("species")}
                  >
                    <div className="flex items-center">
                      <span>Species</span>
                      {getSortIcon("species")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase transition-colors cursor-pointer sm:px-6 hover:text-pink-600"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {getSortIcon("status")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedPets.map((pet) => (
                  <React.Fragment key={pet._id}>
                    <tr
                      className={`hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 transition-colors duration-200 cursor-pointer ${
                        expandedPet === pet._id ? "bg-gradient-to-r from-yellow-100 to-pink-100" : ""
                      }`}
                      onClick={() => toggleExpandPet(pet._id)}
                    >
                      {onToggleSelection && (
                        <td className="px-4 py-4 sm:px-6 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedPets.includes(pet._id)}
                            onChange={() => onToggleSelection(pet._id)}
                            disabled={!canPerformAction(pet)}
                            className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 disabled:opacity-50"
                            aria-label={`Select ${pet.name || "pet"}`}
                          />
                        </td>
                      )}
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative flex-shrink-0 w-10 h-10">
                            <img
                              src={pet.image || DEFAULT_PET_IMAGE}
                              alt={pet.name || "Pet"}
                              className="object-cover w-10 h-10 rounded-full ring-1 ring-pink-200"
                              onError={(e) => (e.target.src = DEFAULT_PET_IMAGE)}
                            />
                            {!pet.isArchived && (
                              <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-400 rounded-full ring-2 ring-white" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {pet.name || "Unnamed Pet"}
                              {pet.owner?._id === currentUser?._id && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs font-medium text-white bg-gradient-to-r from-yellow-500 to-pink-500 rounded">
                                  Your Pet
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <PawPrint className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="truncate max-w-48" title={pet.species || "N/A"}>
                              {pet.species || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 mr-1 text-gray-400" />
                            {pet.breed || "No breed"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(
                              pet.status,
                              pet.isArchived
                            )}`}
                          >
                            {pet.isArchived ? "Archived" : pet.status || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right sm:px-6 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {customActions ? (
                          customActions(pet)
                        ) : (
                          <div className="relative inline-block text-left" ref={dropdownRef}>
                            <button
                              onClick={(e) => toggleDropdown(pet._id, e)}
                              className="p-1.5 text-gray-500 rounded-full hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300"
                              aria-label={`Actions for ${pet.name || "pet"}`}
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {dropdownOpen === pet._id && (
                              <div className="absolute right-0 z-10 w-48 mt-2 transition-all duration-200 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-pink-200 focus:outline-none">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      toggleExpandPet(pet._id);
                                      setDropdownOpen(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors duration-200 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 hover:text-pink-600"
                                  >
                                    <PawPrint className="w-4 h-4 mr-2 text-pink-500" />
                                    View Details
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                    {expandedPet === pet._id && (
                      <tr className="transition-all duration-300 bg-gray-50">
                        <td colSpan={onToggleSelection ? 5 : 4} className="px-4 py-4 sm:px-6">
                          <div className="bg-white rounded-lg shadow-sm">
                            {/* Tab Navigation */}
                            <div className="border-b border-gray-200">
                              <nav className="flex space-x-4" aria-label="Tabs">
                                <button
                                  className={`py-2 px-4 text-sm font-medium border-b-2 ${
                                    activeTab === "info"
                                      ? "border-pink-500 text-pink-600"
                                      : "border-transparent text-gray-500 hover:text-pink-600 hover:border-gray-300"
                                  }`}
                                  onClick={() => setActiveTab("info")}
                                >
                                  <div className="flex items-center">
                                    <PawPrint className="w-4 h-4 mr-2 text-pink-500" />
                                    Pet Info
                                  </div>
                                </button>
                                <button
                                  className={`py-2 px-4 text-sm font-medium border-b-2 ${
                                    activeTab === "owner"
                                      ? "border-pink-500 text-pink-600"
                                      : "border-transparent text-gray-500 hover:text-pink-600 hover:border-gray-300"
                                  }`}
                                  onClick={() => setActiveTab("owner")}
                                >
                                  <div className="flex items-center">
                                    <Heart className="w-4 h-4 mr-2 text-pink-500" />
                                    Owner
                                  </div>
                                </button>
                                <button
                                  className={`py-2 px-4 text-sm font-medium border-b-2 ${
                                    activeTab === "candidates"
                                      ? "border-pink-500 text-pink-600"
                                      : "border-transparent text-gray-500 hover:text-pink-600 hover:border-gray-300"
                                  }`}
                                  onClick={() => setActiveTab("candidates")}
                                >
                                  <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2 text-pink-500" />
                                    Candidates
                                  </div>
                                </button>
                                <button
                                  className={`py-2 px-4 text-sm font-medium border-b-2 ${
                                    activeTab === "activity"
                                      ? "border-pink-500 text-pink-600"
                                      : "border-transparent text-gray-500 hover:text-pink-600 hover:border-gray-300"
                                  }`}
                                  onClick={() => setActiveTab("activity")}
                                >
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-pink-500" />
                                    Activity
                                  </div>
                                </button>
                              </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="p-4">
                              {activeTab === "info" && (
                                <dl className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <dt className="font-medium text-gray-500">Name</dt>
                                    <dd className="text-gray-900">{pet.name || "N/A"}</dd>
                                  </div>
                                  <div>
                                    <dt className="font-medium text-gray-500">Species</dt>
                                    <dd className="text-gray-900">{pet.species || "N/A"}</dd>
                                  </div>
                                  <div>
                                    <dt className="font-medium text-gray-500">Breed</dt>
                                    <dd className="text-gray-900">{pet.breed || "N/A"}</dd>
                                  </div>
                                  <div>
                                    <dt className="font-medium text-gray-500">Age</dt>
                                    <dd className="text-gray-900">{pet.age || "N/A"}</dd>
                                  </div>
                                  <div>
                                    <dt className="font-medium text-gray-500">Gender</dt>
                                    <dd className="text-gray-900">{pet.gender || "N/A"}</dd>
                                  </div>
                                  <div>
                                    <dt className="font-medium text-gray-500">Fee</dt>
                                    <dd className="text-gray-900">{pet.fee === 0 ? "Free" : `${pet.fee} DT`}</dd>
                                  </div>
                                  <div>
                                    <dt className="font-medium text-gray-500">Trained</dt>
                                    <dd className="text-gray-900">
                                      {pet.isTrained ? (
                                        <span className="inline-flex items-center text-xs text-green-700">
                                          <Check className="w-3 h-3 mr-1" />
                                          Yes
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center text-xs text-red-700">
                                          <X className="w-3 h-3 mr-1" />
                                          No
                                        </span>
                                      )}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="font-medium text-gray-500">Status</dt>
                                    <dd className="text-gray-900">
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${getStatusBadgeStyle(
                                          pet.status,
                                          pet.isArchived
                                        )}`}
                                      >
                                        {pet.isArchived ? "Archived" : pet.status || "N/A"}
                                      </span>
                                    </dd>
                                  </div>
                                </dl>
                              )}

                              {activeTab === "owner" && (
                                <dl className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <dt className="font-medium text-gray-500">Full Name</dt>
                                    <dd className="text-gray-900">{pet.owner?.fullName || "N/A"}</dd>
                                  </div>
                                  <div>
                                    <dt className="font-medium text-gray-500">Email</dt>
                                    <dd className="text-gray-900 truncate" title={pet.owner?.email || "N/A"}>
                                      {pet.owner?.email || "N/A"}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="font-medium text-gray-500">Phone</dt>
                                    <dd className="text-gray-900">{pet.owner?.petOwnerDetails?.phone || "N/A"}</dd>
                                  </div>
                                  <div>
                                    <dt className="font-medium text-gray-500">City</dt>
                                    <dd className="text-gray-900">{pet.city || "N/A"}</dd>
                                  </div>
                                </dl>
                              )}

                              {activeTab === "candidates" && (
                                <div className="overflow-y-auto max-h-64">
                                  {loadingCandidates[pet._id] ? (
                                    <div className="flex justify-center py-4">
                                      <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                                    </div>
                                  ) : candidates[pet._id]?.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="sticky top-0 bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-xs font-medium text-left text-gray-500">
                                            Name
                                          </th>
                                          <th className="px-4 py-2 text-xs font-medium text-left text-gray-500">
                                            Email
                                          </th>
                                          <th className="px-4 py-2 text-xs font-medium text-left text-gray-500">
                                            Phone
                                          </th>
                                          <th className="px-4 py-2 text-xs font-medium text-left text-gray-500">
                                            Reason
                                          </th>
                                          <th className="px-4 py-2 text-xs font-medium text-left text-gray-500">
                                            Status
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {candidates[pet._id].map((candidate) => (
                                          <tr
                                            key={candidate.id}
                                            className="transition-colors hover:bg-gray-100"
                                          >
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                              {candidate.name}
                                            </td>
                                            <td className="max-w-xs px-4 py-2 text-sm text-gray-900 truncate" title={candidate.email}>
                                              {candidate.email}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                              {candidate.petOwnerDetails?.phone || "N/A"}
                                            </td>
                                            <td className="max-w-md px-4 py-2 text-sm text-gray-900 truncate" title={candidate.petOwnerDetails?.reasonForAdoption}>
                                              {candidate.petOwnerDetails?.reasonForAdoption || "N/A"}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                              <span
                                                className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${getCandidateStatusStyle(
                                                  candidate.status
                                                )}`}
                                              >
                                                {candidate.status}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <p className="py-4 text-sm text-gray-500">No candidates available for this pet.</p>
                                  )}
                                </div>
                              )}

                              {activeTab === "activity" && (
                                <dl className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <dt className="font-medium text-gray-500">Created</dt>
                                    <dd className="text-gray-900">
                                      {new Date(pet.createdAt).toLocaleString() || "N/A"}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="font-medium text-gray-500">Updated</dt>
                                    <dd className="text-gray-900">
                                      {pet.updatedAt ? new Date(pet.updatedAt).toLocaleString() : "N/A"}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="font-medium text-gray-500">Archived</dt>
                                    <dd className="text-gray-900">
                                      {pet.isArchived ? (
                                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-pink-700 bg-pink-100 rounded-full">
                                          Yes
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                                          No
                                        </span>
                                      )}
                                    </dd>
                                  </div>
                                </dl>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetTable;