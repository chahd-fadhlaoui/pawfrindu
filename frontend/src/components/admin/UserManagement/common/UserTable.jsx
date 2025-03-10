import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Check,
  X,
  User,
  Shield,
  UserCheck,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import EmptyState from "../common/EmptyState";

const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFNUU3RUIiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KICA8cGF0aCBkPSJNMTYwIDE4MEgzOUM0MSAxNDAgODAgMTIwIDEwMCAxMjBDMTIwIDEyMCAxNTggMTQwIDE2MCAxODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==";

const UserTable = ({
  users,
  selectedUsers = [],
  currentUser,
  onToggleActive,
  onToggleSelection,
  onToggleSelectAll,
  customActions,
  title = "Active Users",
  showHeader = true,
}) => {
  const [sortField, setSortField] = useState("fullName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
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

  let displayedUsers = [...users].sort((a, b) => {
    let fieldA = a[sortField] || "";
    let fieldB = b[sortField] || "";
    if (fieldA === fieldB) return 0;
    const result = typeof fieldA === "string" ? fieldA.localeCompare(fieldB) : fieldA - fieldB;
    return sortDirection === "asc" ? result : -result;
  });

  const toggleDropdown = (userId, e) => {
    e.stopPropagation();
    setDropdownOpen(dropdownOpen === userId ? null : userId);
  };

  const toggleExpandUser = (userId) => setExpandedUser(expandedUser === userId ? null : userId);

  const getRoleBadgeStyle = (role, adminType) => {
    if (role === "Admin" && adminType === "Super Admin") {
      return "bg-gradient-to-r from-yellow-500 to-pink-500 text-white border border-pink-600 shadow-md";
    }
    const styles = {
      Admin: "bg-pink-100 text-pink-700 border border-pink-200",
      "Admin Adoption": "bg-pink-100 text-pink-700 border border-pink-200",
      "Admin Vet": "bg-pink-100 text-pink-700 border border-pink-200",
      "Admin Trainer": "bg-pink-100 text-pink-700 border border-pink-200",
      "Admin Lost & Found": "bg-pink-100 text-pink-700 border border-pink-200",
      PetOwner: "bg-amber-100 text-amber-700 border border-amber-200",
      Vet: "bg-blue-100 text-blue-700 border border-blue-200",
      Trainer: "bg-teal-100 text-teal-700 border border-teal-200",
    };
    return styles[role] || styles[adminType] || "bg-gray-100 text-gray-600 border border-gray-200";
  };

  const getAdminTypeDisplay = (adminType) => {
    const displays = {
      "Super Admin": "Super Admin",
      "Admin Adoption": "Adoption Admin",
      "Admin Vet": "Vet Admin",
      "Admin Trainer": "Trainer Admin",
      "Admin Lost & Found": "Lost & Found Admin",
    };
    return displays[adminType] || adminType;
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="inline-block w-4 h-4 ml-1 text-gray-600" />
    ) : (
      <ChevronDown className="inline-block w-4 h-4 ml-1 text-gray-600" />
    );
  };

  return (
    <div className="w-full">
      {showHeader && (
        <div className="p-4 mb-6 transition-all duration-300 bg-white shadow-md rounded-xl sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-pink-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600">
                  {displayedUsers.length} {displayedUsers.length === 1 ? "user" : "users"}
                </p>
              </div>
            </div>
            <span className="px-2 py-1 text-sm font-medium text-white rounded-full bg-gradient-to-r from-yellow-500 to-pink-500">
              {displayedUsers.length}
            </span>
          </div>
        </div>
      )}

      {selectedUsers.length > 0 && (
        <div className="p-4 mb-6 transition-all duration-300 bg-white shadow-md rounded-xl">
          <div className="flex items-center justify-between sm:gap-4">
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-2.5 py-1 text-sm font-semibold text-white bg-gradient-to-r from-yellow-500 to-pink-500 rounded-full shadow-sm">
                {selectedUsers.length}
              </span>
              <span className="text-sm font-medium text-gray-800">
                user{selectedUsers.length > 1 ? "s" : ""} selected
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

      {displayedUsers.length === 0 ? (
        <EmptyState customMessage="No users available at this time." />
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
                          selectedUsers.length > 0 &&
                          selectedUsers.length ===
                            displayedUsers.filter((u) => u._id !== currentUser?._id).length &&
                          users.length > 0
                        }
                        onChange={onToggleSelectAll}
                        className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                        aria-label="Select all users"
                      />
                    </th>
                  )}
                  <th
                    className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase transition-colors cursor-pointer sm:px-6 hover:text-pink-600"
                    onClick={() => handleSort("fullName")}
                  >
                    <div className="flex items-center">
                      <span>User</span>
                      {getSortIcon("fullName")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase transition-colors cursor-pointer sm:px-6 hover:text-pink-600"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      <span>Contact</span>
                      {getSortIcon("email")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase transition-colors cursor-pointer sm:px-6 hover:text-pink-600"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center">
                      <span>Role</span>
                      {getSortIcon("role")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedUsers.map((user) => (
                  <React.Fragment key={user._id}>
                    <tr
                      className={`hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 transition-colors duration-200 cursor-pointer ${
                        expandedUser === user._id ? "bg-gradient-to-r from-yellow-100 to-pink-100" : ""
                      }`}
                      onClick={() => toggleExpandUser(user._id)}
                    >
                      {onToggleSelection && (
                        <td className="px-4 py-4 sm:px-6 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => onToggleSelection(user._id)}
                            disabled={
                              user._id === currentUser?._id ||
                              (user.role === "Admin" && user.adminType === "Super Admin")
                            }
                            className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 disabled:opacity-50"
                            aria-label={`Select ${user.fullName || "user"}`}
                          />
                        </td>
                      )}
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative flex-shrink-0 w-10 h-10">
                            <img
                              src={user.image || DEFAULT_PROFILE_IMAGE}
                              alt={user.fullName || "User"}
                              className="object-cover w-10 h-10 rounded-full ring-1 ring-pink-200"
                              onError={(e) => (e.target.src = DEFAULT_PROFILE_IMAGE)}
                            />
                            {user.isActive && (
                              <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-400 rounded-full ring-2 ring-white" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName || "Unnamed User"}
                              {user._id === currentUser?._id && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs font-medium text-white bg-gradient-to-r from-yellow-500 to-pink-500 rounded">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="truncate max-w-48" title={user.email || "No email"}>
                              {user.email || "No email"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1 text-gray-400" />
                            {user.petOwnerDetails?.phone || "No phone"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeStyle(
                              user.role,
                              user.adminType
                            )}`}
                          >
                            {user.role === "Admin" && user.adminType
                              ? getAdminTypeDisplay(user.adminType)
                              : user.role || "Unknown"}
                          </span>
                          {user.role === "Admin" && user.adminType !== "Super Admin" && (
                            <span className="px-2 py-1 text-xs font-medium text-pink-700 bg-pink-100 rounded-full">
                              <Shield className="inline w-3 h-3 mr-1" />
                              Admin
                            </span>
                          )}
                          {user.role === "Vet" && user.isVerified && (
                            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                              <Check className="inline w-3 h-3 mr-1" />
                              Verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right sm:px-6 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {customActions ? (
                          customActions(user)
                        ) : (
                          <div className="relative inline-block text-left" ref={dropdownRef}>
                            <button
                              onClick={(e) => toggleDropdown(user._id, e)}
                              className="p-1.5 text-gray-500 rounded-full hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300"
                              aria-label={`Actions for ${user.fullName || "user"}`}
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {dropdownOpen === user._id && (
                              <div className="absolute right-0 z-10 w-48 mt-2 transition-all duration-200 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-pink-200 focus:outline-none">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      onToggleActive?.(user._id);
                                      setDropdownOpen(null);
                                    }}
                                    disabled={
                                      user._id === currentUser?._id ||
                                      (user.role === "Admin" && user.adminType === "Super Admin")
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors duration-200 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 hover:text-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <X className="w-4 h-4 mr-2 text-red-500" />
                                    Deactivate
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                    {expandedUser === user._id && (
                      <tr className="transition-all duration-300 bg-gray-50">
                        <td colSpan={onToggleSelection ? 5 : 4} className="px-4 py-4 sm:px-6">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* User Information */}
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                              <h3 className="flex items-center mb-3 text-sm font-semibold text-gray-900">
                                <User className="w-4 h-4 mr-2 text-pink-500" />
                                User Information
                              </h3>
                              <dl className="space-y-2 text-sm">
                                <div>
                                  <dt className="font-medium text-gray-500">Full Name</dt>
                                  <dd className="text-gray-900">{user.fullName || "N/A"}</dd>
                                </div>
                                <div>
                                  <dt className="font-medium text-gray-500">Email</dt>
                                  <dd className="text-gray-900 truncate max-w-48" title={user.email || "N/A"}>
                                    {user.email || "N/A"}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium text-gray-500">Phone</dt>
                                  <dd className="text-gray-900">{user.petOwnerDetails?.phone || "N/A"}</dd>
                                </div>
                                <div>
                                  <dt className="font-medium text-gray-500">Status</dt>
                                  <dd className="text-gray-900">
                                    {user.isActive ? (
                                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                        <Check className="w-3 h-3 mr-1" />
                                        Active
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                                        <X className="w-3 h-3 mr-1" />
                                        Inactive
                                      </span>
                                    )}
                                  </dd>
                                </div>
                              </dl>
                            </div>

                            {/* Role-Specific Details */}
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                              <h3 className="flex items-center mb-3 text-sm font-semibold text-gray-900">
                                <Shield className="w-4 h-4 mr-2 text-pink-500" />
                                {user.role === "PetOwner"
                                  ? "Pet Owner Details"
                                  : user.role === "Vet"
                                  ? "Veterinarian Details"
                                  : user.role === "Trainer"
                                  ? "Trainer Details"
                                  : "Role Details"}
                              </h3>
                              <dl className="space-y-2 text-sm">
                                {user.role === "PetOwner" ? (
                                  <>
                                    <div>
                                      <dt className="font-medium text-gray-500">Current Pets</dt>
                                      <dd className="text-gray-900">
                                        {user.petOwnerDetails?.currentPets?.length > 0
                                          ? user.petOwnerDetails.currentPets.join(", ")
                                          : "None"}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Address</dt>
                                      <dd className="text-gray-900">{user.petOwnerDetails?.address || "N/A"}</dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Occupation</dt>
                                      <dd className="text-gray-900">{user.petOwnerDetails?.occupation || "N/A"}</dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Work Schedule</dt>
                                      <dd className="text-gray-900 capitalize">
                                        {user.petOwnerDetails?.workSchedule?.replace("_", " ") || "N/A"}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Housing</dt>
                                      <dd className="text-gray-900">
                                        {user.petOwnerDetails?.housing
                                          ? `${user.petOwnerDetails.housing.type} (${user.petOwnerDetails.housing.ownership}${
                                              user.petOwnerDetails.housing.ownership === "rent" &&
                                              user.petOwnerDetails.housing.landlordApproval
                                                ? ", Landlord Approved"
                                                : ""
                                            })`
                                          : "N/A"}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Family Size</dt>
                                      <dd className="text-gray-900">
                                        {user.petOwnerDetails?.housing?.familySize || "N/A"}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Pet Experience</dt>
                                      <dd className="text-gray-900">
                                        {user.petOwnerDetails?.petExperience?.hasPreviousPets
                                          ? `${user.petOwnerDetails.petExperience.yearsOfExperience} years - ${
                                              user.petOwnerDetails.petExperience.experience_description || "No description"
                                            }`
                                          : "None"}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Reason for Adoption</dt>
                                      <dd className="text-gray-900">
                                        {user.petOwnerDetails?.reasonForAdoption || "N/A"}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Adoption Readiness</dt>
                                      <dd className="text-gray-900 capitalize">
                                        {user.petOwnerDetails?.readiness?.replace("_", " ") || "N/A"}
                                      </dd>
                                    </div>
                                  </>
                                ) : user.role === "Vet" ? (
                                  <>
                                    <div>
                                      <dt className="font-medium text-gray-500">Location</dt>
                                      <dd className="text-gray-900">{user.veterinarianDetails?.location || "N/A"}</dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Degree</dt>
                                      <dd className="text-gray-900">{user.veterinarianDetails?.degree || "N/A"}</dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Specialization</dt>
                                      <dd className="text-gray-900">
                                        {user.veterinarianDetails?.specialization || "N/A"}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Experience</dt>
                                      <dd className="text-gray-900">
                                        {user.veterinarianDetails?.experienceYears
                                          ? `${user.veterinarianDetails.experienceYears} years`
                                          : "N/A"}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Availability</dt>
                                      <dd className="text-gray-900">
                                        {user.veterinarianDetails?.availableHours || "N/A"}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Verified</dt>
                                      <dd className="text-gray-900">
                                        {user.isVerified ? (
                                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                            <Check className="w-3 h-3 mr-1" />
                                            Yes
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                                            <X className="w-3 h-3 mr-1" />
                                            No
                                          </span>
                                        )}
                                      </dd>
                                    </div>
                                  </>
                                ) : user.role === "Trainer" ? (
                                  <>
                                    <div>
                                      <dt className="font-medium text-gray-500">Location</dt>
                                      <dd className="text-gray-900">{user.trainerDetails?.location || "N/A"}</dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Certification</dt>
                                      <dd className="text-gray-900">{user.trainerDetails?.certification || "N/A"}</dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Specialization</dt>
                                      <dd className="text-gray-900">{user.trainerDetails?.specialization || "N/A"}</dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Experience</dt>
                                      <dd className="text-gray-900">
                                        {user.trainerDetails?.experienceYears
                                          ? `${user.trainerDetails.experienceYears} years`
                                          : "N/A"}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium text-gray-500">Availability</dt>
                                      <dd className="text-gray-900">{user.trainerDetails?.availableHours || "N/A"}</dd>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div>
                                      <dt className="font-medium text-gray-500">Role</dt>
                                      <dd className="text-gray-900">{user.role || "N/A"}</dd>
                                    </div>
                                    {user.role === "Admin" && (
                                      <div>
                                        <dt className="font-medium text-gray-500">Admin Type</dt>
                                        <dd className="text-gray-900">{user.adminType || "Standard"}</dd>
                                      </div>
                                    )}
                                  </>
                                )}
                              </dl>
                            </div>

                            {/* Account Activity */}
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                              <h3 className="flex items-center mb-3 text-sm font-semibold text-gray-900">
                                <Clock className="w-4 h-4 mr-2 text-pink-500" />
                                Account Activity
                              </h3>
                              <dl className="space-y-2 text-sm">
                                <div>
                                  <dt className="font-medium text-gray-500">Created</dt>
                                  <dd className="text-gray-900">
                                    {new Date(user.createdAt).toLocaleString() || "N/A"}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium text-gray-500">Last Login</dt>
                                  <dd className="text-gray-900">
                                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium text-gray-500">Archived</dt>
                                  <dd className="text-gray-900">
                                    {user.isArchieve ? (
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

export default UserTable;