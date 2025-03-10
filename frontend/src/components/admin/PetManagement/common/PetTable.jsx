import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  PawPrint,
  Check,
  X,
  Heart,
  Clock,
  Users,
  Loader2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import EmptyState from "../common/EmptyState";
import axiosInstance from "../../../../utils/axiosInstance";

const DEFAULT_PET_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8cGF0aCBkPSJNMTQwIDgwQzE0MCA2MCAxMjAgNDAgMTAwIDQwIDgwIDQwIDYwIDYwIDYwIDgwIiBmaWxsPSIjOUNBM0FGIi8+CiAgPHBhdGggZD0iTTE0MCAxMjBDMTQwIDE0MCAxMjAgMTYwIDEwMCAxNjAgODAgMTYwIDYwIDE0MCA2MCAxMjAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNODAgNTBDNzAgNDAgOTAgMzAgMTAwIDMwIDEzMCAzMCAxNDAgNTAgMTMwIDYwIiBmaWxsPSIjOUNBM0FGIi8+CiAgPHBhdGggZD0iTTEyMCAxODBDMTIwIDE5MCAxMTAgMjAwIDEwMCAyMDAgOTAgMjAwIDgwIDE5MCA4MCAxODAiIGZpbGw9IiM9Q0EzQUYiLz4KPC9zdmc+";

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
  const [expandedPet, setExpandedPet] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [candidates, setCandidates] = useState({});
  const [loading, setLoading] = useState({});
  const actionMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuOpen && actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setActionMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionMenuOpen]);

  const handleSort = (field) => {
    setSortDirection(sortField === field && sortDirection === "asc" ? "desc" : "asc");
    setSortField(field);
  };

  const displayedPets = [...pets].sort((a, b) => {
    const fieldA = a[sortField] || "";
    const fieldB = b[sortField] || "";
    if (fieldA === fieldB) return 0;
    const result = typeof fieldA === "string" ? fieldA.localeCompare(fieldB) : fieldA - fieldB;
    return sortDirection === "asc" ? result : -result;
  });

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
    setLoading((prev) => ({ ...prev, [petId]: true }));
    try {
      const response = await axiosInstance.get(`/api/pet/${petId}/candidates`);
      setCandidates((prev) => ({ ...prev, [petId]: response.data.data }));
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [petId]: false }));
    }
  };

  const toggleActionMenu = (petId, e) => {
    e.stopPropagation();
    setActionMenuOpen(actionMenuOpen === petId ? null : petId);
  };

  const getStatusStyle = (status, isArchived) => {
    if (isArchived) return "bg-gray-100 text-gray-600";
    const styles = {
      pending: "bg-blue-100 text-blue-700",
      accepted: "bg-green-100 text-green-700",
      adoptionPending: "bg-yellow-100 text-yellow-700",
      adopted: "bg-teal-100 text-teal-700",
      sold: "bg-purple-100 text-purple-700",
    };
    return styles[status] || "bg-gray-100 text-gray-600";
  };

  const getCandidateStatusStyle = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-600";
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="inline-block w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="inline-block w-4 h-4 ml-1" />
    );
  };

  const canPerformAction = (pet) => {
    if (currentUser?.role !== "Admin") return false;
    switch (bulkAction) {
      case "accept":
        return pet.status === "pending";
      case "delete":
        return pet.status === "accepted";
      case "archive":
        return pet.status === "adopted" || pet.status === "sold";
      default:
        return false;
    }
  };

  return (
    <div className="w-full">
      {/* Compact Header */}
      {showHeader && (
        <div className="flex items-center justify-between p-4 mb-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-medium">
              {title}{" "}
              <span className="text-sm text-gray-500">({displayedPets.length})</span>
            </h2>
          </div>
          {selectedPets.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r from-yellow-500 to-pink-500">
                {selectedPets.length}
              </span>
              <button
                onClick={onToggleSelectAll}
                className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 hover:text-pink-600"
              >
                Deselect All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {displayedPets.length === 0 ? (
        <EmptyState customMessage="No pets available at this time." />
      ) : (
        <div className="overflow-hidden bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {onToggleSelectAll && currentUser?.role === "Admin" && (
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500">
                      <input
                        type="checkbox"
                        checked={
                          selectedPets.length === displayedPets.filter((pet) => canPerformAction(pet)).length &&
                          displayedPets.some((pet) => canPerformAction(pet))
                        }
                        onChange={onToggleSelectAll}
                        className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </th>
                  )}
                  <th
                    className="px-4 py-3 text-xs font-medium text-left text-gray-500 cursor-pointer hover:text-pink-600"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      <span>Name</span>
                      {getSortIcon("name")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-left text-gray-500 cursor-pointer hover:text-pink-600"
                    onClick={() => handleSort("species")}
                  >
                    <div className="flex items-center">
                      <span>Species</span>
                      {getSortIcon("species")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-left text-gray-500 cursor-pointer hover:text-pink-600"
                    onClick={() => handleSort("breed")}
                  >
                    <div className="flex items-center">
                      <span>Breed</span>
                      {getSortIcon("breed")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium text-left text-gray-500 cursor-pointer hover:text-pink-600"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {getSortIcon("status")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-right text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedPets.map((pet) => (
                  <React.Fragment key={pet._id}>
                    <tr
                      className={`hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 transition-colors cursor-pointer ${
                        expandedPet === pet._id ? "bg-gradient-to-r from-yellow-100 to-pink-100" : ""
                      }`}
                      onClick={() => toggleExpandPet(pet._id)}
                    >
                      {onToggleSelectAll && currentUser?.role === "Admin" && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={selectedPets.includes(pet._id)}
                              onChange={() => onToggleSelection(pet._id)}
                              disabled={!canPerformAction(pet)}
                              className={`w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 ${
                                !canPerformAction(pet) ? "cursor-not-allowed opacity-50" : ""
                              }`}
                            />
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <img
                            src={pet.image || DEFAULT_PET_IMAGE}
                            alt={pet.name || "Pet"}
                            className="object-cover w-8 h-8 mr-3 rounded-full ring-1 ring-pink-200"
                          />
                          <span className="font-medium text-gray-900">{pet.name || "Unnamed"}</span>
                          {expandedPet === pet._id ? (
                            <ChevronDown className="w-4 h-4 ml-2 text-pink-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 ml-2 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{pet.species || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{pet.breed || "-"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(
                            pet.status,
                            pet.isArchived
                          )}`}
                        >
                          {pet.isArchived ? "Archived" : pet.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {customActions ? (
                          customActions(pet)
                        ) : (
                          <div className="relative inline-block text-left" ref={actionMenuRef}>
                            <button
                              onClick={(e) => toggleActionMenu(pet._id, e)}
                              className="p-1.5 text-gray-500 rounded-full hover:bg-pink-100 focus:outline-none"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {actionMenuOpen === pet._id && (
                              <div className="absolute right-0 z-10 w-48 mt-1 bg-white rounded-md shadow-lg ring-1 ring-pink-200">
                                <button
                                  onClick={() => {
                                    toggleExpandPet(pet._id);
                                    setActionMenuOpen(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 hover:text-pink-600"
                                >
                                  <PawPrint className="w-4 h-4 mr-2 text-pink-500" />
                                  View Details
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                    {expandedPet === pet._id && (
                      <tr className="bg-gray-50">
                        <td
                          colSpan={onToggleSelectAll && currentUser?.role === "Admin" ? 6 : 5}
                          className="px-4 py-4"
                        >
                          {/* Tabs Navigation */}
                          <div className="mb-4 border-b border-gray-200">
                            <div className="flex space-x-4">
                              <button
                                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                                  activeTab === "info"
                                    ? "border-pink-500 text-pink-600"
                                    : "border-transparent text-gray-500 hover:text-pink-600"
                                }`}
                                onClick={() => setActiveTab("info")}
                              >
                                <div className="flex items-center">
                                  <PawPrint className="w-4 h-4 mr-2 text-pink-500" />
                                  Pet Info
                                </div>
                              </button>
                              <button
                                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                                  activeTab === "owner"
                                    ? "border-pink-500 text-pink-600"
                                    : "border-transparent text-gray-500 hover:text-pink-600"
                                }`}
                                onClick={() => setActiveTab("owner")}
                              >
                                <div className="flex items-center">
                                  <Heart className="w-4 h-4 mr-2 text-pink-500" />
                                  Owner
                                </div>
                              </button>
                              <button
                                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                                  activeTab === "candidates"
                                    ? "border-pink-500 text-pink-600"
                                    : "border-transparent text-gray-500 hover:text-pink-600"
                                }`}
                                onClick={() => setActiveTab("candidates")}
                              >
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-2 text-pink-500" />
                                  Candidates
                                </div>
                              </button>
                              <button
                                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                                  activeTab === "activity"
                                    ? "border-pink-500 text-pink-600"
                                    : "border-transparent text-gray-500 hover:text-pink-600"
                                }`}
                                onClick={() => setActiveTab("activity")}
                              >
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-2 text-pink-500" />
                                  Activity
                                </div>
                              </button>
                            </div>
                          </div>

                          {/* Tab Content */}
                          <div className="p-4 bg-white rounded-md shadow-sm">
                            {activeTab === "info" && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="mb-2 text-sm font-medium text-gray-900">Basic Information</h3>
                                  <dl className="grid grid-cols-2 text-sm gap-x-4 gap-y-2">
                                    <dt className="text-gray-500">Name</dt>
                                    <dd className="text-gray-900">{pet.name || "N/A"}</dd>
                                    <dt className="text-gray-500">Species</dt>
                                    <dd className="text-gray-900">{pet.species || "N/A"}</dd>
                                    <dt className="text-gray-500">Breed</dt>
                                    <dd className="text-gray-900">{pet.breed || "-"}</dd>
                                    <dt className="text-gray-500">Age</dt>
                                    <dd className="text-gray-900">{pet.age || "N/A"}</dd>
                                  </dl>
                                </div>
                                <div>
                                  <h3 className="mb-2 text-sm font-medium text-gray-900">Additional Details</h3>
                                  <dl className="grid grid-cols-2 text-sm gap-x-4 gap-y-2">
                                    <dt className="text-gray-500">Gender</dt>
                                    <dd className="text-gray-900">{pet.gender || "N/A"}</dd>
                                    <dt className="text-gray-500">Fee</dt>
                                    <dd className="text-gray-900">{pet.fee === 0 ? "Free" : `${pet.fee} DT`}</dd>
                                    <dt className="text-gray-500">Trained</dt>
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
                                    <dt className="text-gray-500">Status</dt>
                                    <dd>
                                      <span
                                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyle(
                                          pet.status,
                                          pet.isArchived
                                        )}`}
                                      >
                                        {pet.isArchived ? "Archived" : pet.status}
                                      </span>
                                    </dd>
                                  </dl>
                                </div>
                              </div>
                            )}

                            {activeTab === "owner" && (
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <dl className="grid grid-cols-2 text-sm gap-x-4 gap-y-2">
                                  <dt className="text-gray-500">Full Name</dt>
                                  <dd className="text-gray-900">{pet.owner?.fullName || "Unknown"}</dd>
                                  <dt className="text-gray-500">Email</dt>
                                  <dd className="text-gray-900 truncate" title={pet.owner?.email || "N/A"}>
                                    {pet.owner?.email || "N/A"}
                                  </dd>
                                  <dt className="text-gray-500">Phone</dt>
                                  <dd className="text-gray-900">{pet.owner?.petOwnerDetails?.phone || "N/A"}</dd>
                                  <dt className="text-gray-500">City</dt>
                                  <dd className="text-gray-900">{pet.city || "N/A"}</dd>
                                </dl>
                              </div>
                            )}

                            {activeTab === "candidates" && (
                              <div>
                                {loading[pet._id] ? (
                                  <div className="flex justify-center py-4">
                                    <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                                  </div>
                                ) : candidates[pet._id]?.length > 0 ? (
                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {candidates[pet._id].map((candidate) => (
                                      <div key={candidate.id} className="p-3 border border-gray-100 rounded-md">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-medium">{candidate.name}</span>
                                          <span
                                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCandidateStatusStyle(
                                              candidate.status
                                            )}`}
                                          >
                                            {candidate.status}
                                          </span>
                                        </div>
                                        <dl className="grid grid-cols-3 text-xs gap-y-1">
                                          <dt className="text-gray-500">Email</dt>
                                          <dd className="col-span-2 text-gray-900 truncate" title={candidate.email}>
                                            {candidate.email}
                                          </dd>
                                          <dt className="text-gray-500">Phone</dt>
                                          <dd className="col-span-2 text-gray-900">
                                            {candidate.petOwnerDetails.phone || "N/A"}
                                          </dd>
                                          <dt className="text-gray-500">Reason</dt>
                                          <dd
                                            className="col-span-2 text-gray-900 truncate"
                                            title={candidate.petOwnerDetails.reasonForAdoption}
                                          >
                                            {candidate.petOwnerDetails.reasonForAdoption}
                                          </dd>
                                        </dl>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="py-2 text-sm text-gray-500">No candidates found for this pet.</p>
                                )}
                              </div>
                            )}

                            {activeTab === "activity" && (
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <dl className="grid grid-cols-2 text-sm gap-x-4 gap-y-2">
                                  <dt className="text-gray-500">Created</dt>
                                  <dd className="text-gray-900">
                                    {new Date(pet.createdAt).toLocaleString() || "N/A"}
                                  </dd>
                                  <dt className="text-gray-500">Updated</dt>
                                  <dd className="text-gray-900">
                                    {pet.updatedAt ? new Date(pet.updatedAt).toLocaleString() : "N/A"}
                                  </dd>
                                  <dt className="text-gray-500">Status</dt>
                                  <dd>
                                    <span
                                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyle(
                                        pet.status,
                                        pet.isArchived
                                      )}`}
                                    >
                                      {pet.isArchived ? "Archived" : pet.status}
                                    </span>
                                  </dd>
                                  <dt className="text-gray-500">Archived</dt>
                                  <dd>
                                    {pet.isArchived ? (
                                      <span className="text-xs text-pink-700">Yes</span>
                                    ) : (
                                      <span className="text-xs text-gray-700">No</span>
                                    )}
                                  </dd>
                                </dl>
                              </div>
                            )}
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