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
  MapPin,
  Briefcase,
  Award,
  Languages,
  Clock as ClockIcon,
  Link,
  Home,
  Truck,
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
}) => {
  const [sortField, setSortField] = useState("fullName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Log users data to inspect API response
  useEffect(() => {
    console.log("UserTable users data:", users);
  }, [users]);

  const handleSort = (field) => {
    setSortField(field);
    setSortDirection((prev) =>
      sortField === field && prev === "asc" ? "desc" : "asc"
    );
  };

  const displayedUsers = [...users].sort((a, b) => {
    let fieldA = a[sortField] || "";
    let fieldB = b[sortField] || "";
    if (fieldA === fieldB) return 0;
    const result =
      typeof fieldA === "string"
        ? fieldA.localeCompare(fieldB)
        : fieldA - fieldB;
    return sortDirection === "asc" ? result : -result;
  });

  const toggleDropdown = (userId, e) => {
    e.stopPropagation();
    setDropdownOpen(dropdownOpen === userId ? null : userId);
  };

  const toggleExpandUser = (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      setActiveTab("info");
    }
  };

  const getRoleBadgeStyle = (role, adminType) => {
    if (role === "Admin" && adminType === "Super Admin") {
      return "bg-gradient-to-r from-yellow-500 to-pink-500 text-white border border-pink-600 shadow-md";
    }
    const styles = {
      Admin:
        "bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 border border-pink-400",
      "Admin Adoption":
        "bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 border border-pink-400",
      "Admin Vet":
        "bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 border border-pink-400",
      "Admin Trainer":
        "bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 border border-pink-400",
      "Admin Lost & Found":
        "bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 border border-pink-400",
      PetOwner:
        "bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800 border border-amber-400",
      Vet: "bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800 border border-blue-400",
      Trainer:
        "bg-gradient-to-r from-teal-200 to-teal-300 text-teal-800 border border-teal-400",
    };
    return (
      styles[role] ||
      styles[adminType] ||
      "bg-gray-100 text-gray-600 border border-gray-200"
    );
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

  // Helper function to format opening hours
  const formatOpeningHours = (openingHours) => {
    if (!openingHours) return "N/A";
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    // Group days with identical schedules
    const scheduleGroups = {};
    days.forEach((day) => {
      const session = openingHours[day];
      if (session === "Closed") return;
      const start = openingHours[`${day}Start`] || "";
      const end = openingHours[`${day}End`] || "";
      const start2 = openingHours[`${day}Start2`] || "";
      const end2 = openingHours[`${day}End2`] || "";
      let hours = "";
      if (session === "Single Session" && start && end) {
        hours = `${start} - ${end}`;
      } else if (
        session === "Double Session" &&
        start &&
        end &&
        start2 &&
        end2
      ) {
        hours = `${start} - ${end}, ${start2} - ${end2}`;
      }
      if (hours) {
        if (!scheduleGroups[hours]) scheduleGroups[hours] = [];
        scheduleGroups[hours].push(day.charAt(0).toUpperCase() + day.slice(1));
      }
    });

    // Format grouped schedules
    const formatted = Object.entries(scheduleGroups)
      .map(([hours, days]) => {
        if (hours.includes(":")) {
          // Basic check for valid time format
          return `${days.join(", ")}: ${hours}`;
        }
        return null;
      })
      .filter(Boolean)
      .join("; ");

    return formatted || "N/A";
  };

  return (
    <div className="w-full">
      {selectedUsers.length > 0 && (
        <div className="p-4 mb-6 transition-all duration-300 bg-white shadow-lg rounded-xl">
          <div className="flex items-center justify-between sm:gap-4">
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-2.5 py-1 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full shadow-sm">
                {selectedUsers.length}
              </span>
              <span className="text-sm font-medium text-gray-800">
                user{selectedUsers.length > 1 ? "s" : ""} selected
              </span>
            </div>
            <button
              onClick={() => onToggleSelectAll()}
              className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gradient-to-r hover:from-pink-50 hover:to-yellow-50 hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {displayedUsers.length === 0 ? (
        <EmptyState customMessage="No users available at this time." />
      ) : (
        <div className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {onToggleSelectAll && (
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase sm:px-6">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.length > 0 &&
                          selectedUsers.length ===
                            displayedUsers.filter(
                              (u) =>
                                u._id !== currentUser?._id &&
                                !(
                                  u.role === "Admin" &&
                                  u.adminType === "Super Admin"
                                )
                            ).length &&
                          users.length > 0
                        }
                        onChange={onToggleSelectAll}
                        className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                        aria-label="Select all users"
                      />
                    </th>
                  )}
                  <th
                    className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase transition-colors cursor-pointer sm:px-6 hover:text-yellow-600"
                    onClick={() => handleSort("fullName")}
                  >
                    <div className="flex items-center">
                      <span>User</span>
                      {getSortIcon("fullName")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase transition-colors cursor-pointer sm:px-6 hover:text-yellow-600"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      <span>Contact</span>
                      {getSortIcon("email")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase transition-colors cursor-pointer sm:px-6 hover:text-yellow-600"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center">
                      <span>Role</span>
                      {getSortIcon("role")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right text-gray-600 uppercase sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedUsers.map((user) => (
                  <React.Fragment key={user._id}>
                    <tr
                      className={`transition-all duration-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-yellow-50 cursor-pointer ${
                        expandedUser === user._id
                          ? "bg-gradient-to-r from-pink-100 to-yellow-100"
                          : ""
                      }`}
                      onClick={() => toggleExpandUser(user._id)}
                    >
                      {onToggleSelection && (
                        <td
                          className="px-4 py-4 sm:px-6 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => onToggleSelection(user._id)}
                            disabled={
                              user._id === currentUser?._id ||
                              (user.role === "Admin" &&
                                user.adminType === "Super Admin")
                            }
                            className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500 disabled:opacity-50"
                            aria-label={`Select ${user.fullName || "user"}`}
                          />
                        </td>
                      )}
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative flex-shrink-0 w-12 h-12 transition-transform hover:scale-105">
                            <img
                              src={user.image || DEFAULT_PROFILE_IMAGE}
                              alt={user.fullName || "User"}
                              className="object-cover w-12 h-12 rounded-full shadow-sm ring-2 ring-yellow-200"
                              onError={(e) =>
                                (e.target.src = DEFAULT_PROFILE_IMAGE)
                              }
                            />
                            {user.isActive && (
                              <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-400 rounded-full ring-2 ring-white" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {user.fullName || "Unnamed User"}
                              {user._id === currentUser?._id && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full shadow-sm">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1 text-yellow-400" />
                            <span
                              className="truncate max-w-48"
                              title={user.email || "No email"}
                            >
                              {user.email || "No email"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1 text-yellow-400" />
                            {user.petOwnerDetails?.phone ||
                              user.trainerDetails?.phone ||
                              user.veterinarianDetails?.phone ||
                              "No phone"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full shadow-sm ${getRoleBadgeStyle(
                              user.role,
                              user.adminType
                            )}`}
                          >
                            {user.role === "Admin" && user.adminType
                              ? getAdminTypeDisplay(user.adminType)
                              : user.role || "Unknown"}
                          </span>
                          {user.role === "Admin" &&
                            user.adminType !== "Super Admin" && (
                              <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full shadow-sm">
                                <Shield className="inline w-3 h-3 mr-1" />
                                Admin
                              </span>
                            )}
                        </div>
                      </td>
                      <td
                        className="px-4 py-4 text-right sm:px-6 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {customActions ? (
                          customActions(user)
                        ) : (
                          <div
                            className="relative inline-block text-left"
                            ref={dropdownRef}
                          >
                            <button
                              onClick={(e) => toggleDropdown(user._id, e)}
                              className="p-1.5 text-gray-500 rounded-full hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300"
                              aria-label={`Actions for ${
                                user.fullName || "user"
                              }`}
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {dropdownOpen === user._id && (
                              <div className="absolute right-0 z-10 w-48 mt-2 transition-all duration-200 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-yellow-200 focus:outline-none">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      toggleExpandUser(user._id);
                                      setDropdownOpen(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors duration-200 hover:bg-gradient-to-r hover:from-pink-50 hover:to-yellow-50 hover:text-yellow-600"
                                  >
                                    <User className="w-4 h-4 mr-2 text-yellow-500" />
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => {
                                      onToggleActive?.(user._id);
                                      setDropdownOpen(null);
                                    }}
                                    disabled={
                                      user._id === currentUser?._id ||
                                      (user.role === "Admin" &&
                                        user.adminType === "Super Admin")
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors duration-200 hover:bg-gradient-to-r hover:from-pink-50 hover:to-yellow-50 hover:text-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <td
                          colSpan={onToggleSelection ? 5 : 4}
                          className="px-4 py-6 sm:px-6"
                        >
                          <div className="bg-white shadow-md rounded-xl ring-1 ring-gray-100">
                            {/* Tab Navigation */}
                            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
                              <nav
                                className="flex p-2 space-x-1"
                                aria-label="Tabs"
                              >
                                <button
                                  className={`py-2 px-4 text-sm font-semibold rounded-t-md transition-all duration-200 ${
                                    activeTab === "info"
                                      ? "bg-white text-yellow-600 shadow-sm ring-1 ring-yellow-200"
                                      : "text-gray-600 hover:text-yellow-600 hover:bg-gray-200"
                                  }`}
                                  onClick={() => setActiveTab("info")}
                                >
                                  <div className="flex items-center">
                                    <User
                                      className={`w-5 h-5 mr-2 transition-transform duration-200 ${
                                        activeTab === "info"
                                          ? "text-yellow-500"
                                          : "text-gray-400"
                                      }`}
                                    />
                                    User Info
                                  </div>
                                </button>
                                <button
                                  className={`py-2 px-4 text-sm font-semibold rounded-t-md transition-all duration-200 ${
                                    activeTab === "role"
                                      ? "bg-white text-yellow-600 shadow-sm ring-1 ring-yellow-200"
                                      : "text-gray-600 hover:text-yellow-600 hover:bg-gray-200"
                                  }`}
                                  onClick={() => setActiveTab("role")}
                                >
                                  <div className="flex items-center">
                                    <Shield
                                      className={`w-5 h-5 mr-2 transition-transform duration-200 ${
                                        activeTab === "role"
                                          ? "text-yellow-500"
                                          : "text-gray-400"
                                      }`}
                                    />
                                    Role Details
                                  </div>
                                </button>
                                <button
                                  className={`py-2 px-4 text-sm font-semibold rounded-t-md transition-all duration-200 ${
                                    activeTab === "activity"
                                      ? "bg-white text-yellow-600 shadow-sm ring-1 ring-yellow-200"
                                      : "text-gray-600 hover:text-yellow-600 hover:bg-gray-200"
                                  }`}
                                  onClick={() => setActiveTab("activity")}
                                >
                                  <div className="flex items-center">
                                    <Clock
                                      className={`w-5 h-5 mr-2 transition-transform duration-200 ${
                                        activeTab === "activity"
                                          ? "text-yellow-500"
                                          : "text-gray-400"
                                      }`}
                                    />
                                    Activity
                                  </div>
                                </button>
                              </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6 transition-opacity duration-200">
                              {activeTab === "info" && (
                                <dl className="grid grid-cols-2 gap-6 text-sm">
                                  <div>
                                    <dt className="font-semibold text-gray-600">
                                      Full Name
                                    </dt>
                                    <dd className="mt-1 text-gray-900">
                                      {user.fullName || "N/A"}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="font-semibold text-gray-600">
                                      Email
                                    </dt>
                                    <dd
                                      className="mt-1 text-gray-900 truncate"
                                      title={user.email || "N/A"}
                                    >
                                      {user.email || "N/A"}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="font-semibold text-gray-600">
                                      Phone
                                    </dt>
                                    <dd className="mt-1 text-gray-900">
                                      {user.petOwnerDetails?.phone ||
                                        user.trainerDetails?.phone ||
                                        user.veterinarianDetails?.phone ||
                                        "N/A"}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="font-semibold text-gray-600">
                                      Status
                                    </dt>
                                    <dd className="mt-1 text-gray-900">
                                      {user.isActive ? (
                                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full shadow-sm">
                                          <Check className="w-4 h-4 mr-1" />
                                          Active
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full shadow-sm">
                                          <X className="w-4 h-4 mr-1" />
                                          Inactive
                                        </span>
                                      )}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="font-semibold text-gray-600">
                                      Gender
                                    </dt>
                                    <dd className="mt-1 text-gray-900">
                                      {user.gender || "N/A"}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="font-semibold text-gray-600">
                                      About
                                    </dt>
                                    <dd className="mt-1 text-gray-900">
                                      {user.about || "N/A"}
                                    </dd>
                                  </div>
                                </dl>
                              )}

                              {activeTab === "role" && (
                                <div className="space-y-6">
                                  <div className="flex items-center space-x-2">
                                    <Shield className="w-5 h-5 text-yellow-500" />
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      Role Details
                                    </h3>
                                  </div>
                                  <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                        <User className="w-4 h-4 text-yellow-400" />
                                        <span>Role</span>
                                      </dt>
                                      <dd className="mt-1">
                                        <span
                                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full shadow-sm ${getRoleBadgeStyle(
                                            user.role,
                                            user.adminType
                                          )}`}
                                        >
                                          {user.role === "Admin" && user.adminType
                                            ? getAdminTypeDisplay(user.adminType)
                                            : user.role || "N/A"}
                                        </span>
                                      </dd>
                                    </div>

                                    {/* Trainer Details */}
                                    {user.role === "Trainer" && (
  <>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <User className="w-4 h-4 text-yellow-400" />
        <span>Gender</span>
      </dt>
      <dd className="mt-1 text-gray-900">
        {user.gender || "N/A"}
      </dd>
    </div>
    {user.trainerDetails?.trainingFacilityType === "Fixed Facility" && (
      <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
        <dt className="flex items-center space-x-2 font-semibold text-gray-600">
          <Home className="w-4 h-4 text-yellow-400" />
          <span title="Location of the training facility">Facility Location</span>
        </dt>
        <dd className="mt-1 text-gray-900">
          {user.trainerDetails?.governorate && user.trainerDetails?.delegation
            ? `${user.trainerDetails.delegation}, ${user.trainerDetails.governorate}`
            : user.trainerDetails?.governorate || "N/A"}
        </dd>
      </div>
    )}
    {user.trainerDetails?.trainingFacilityType === "Mobile" && (
      <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
        <dt className="flex items-center space-x-2 font-semibold text-gray-600">
          <Truck className="w-4 h-4 text-yellow-400" />
          <span title="Regions where Mobile trainers provide services">Service Regions</span>
        </dt>
        <dd className="mt-1 text-gray-900">
          {user.trainerDetails?.serviceAreas?.length > 0
            ? user.trainerDetails.serviceAreas
                .map((area) =>
                  area.governorate
                    ? `${area.governorate}${
                        area.delegations?.length > 0
                          ? ` (${area.delegations.join(", ")})`
                          : ""
                      }`
                    : null
                )
                .filter(Boolean)
                .join(", ") || <span className="italic text-yellow-600">None specified</span>
            : <span className="italic text-yellow-600">None specified</span>}
        </dd>
      </div>
    )}
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <Phone className="w-4 h-4 text-yellow-400" />
        <span>Primary Phone</span>
      </dt>
      <dd className="mt-1 text-gray-900">
        {user.trainerDetails?.phone || "N/A"}
      </dd>
    </div>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <Phone className="w-4 h-4 text-yellow-400" />
        <span>Secondary Phone</span>
      </dt>
      <dd className="mt-1 text-gray-900">
        {user.trainerDetails?.secondaryPhone || "N/A"}
      </dd>
    </div>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <Languages className="w-4 h-4 text-yellow-400" />
        <span>Languages Spoken</span>
      </dt>
      <dd className="mt-1 text-gray-900">
        {user.trainerDetails?.languagesSpoken?.length > 0
          ? user.trainerDetails.languagesSpoken.join(", ")
          : "N/A"}
      </dd>
    </div>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <User className="w-4 h-4 text-yellow-400" />
        <span>About</span>
      </dt>
      <dd className="mt-1 text-gray-900">
        {user.about || "N/A"}
      </dd>
    </div>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <Briefcase className="w-4 h-4 text-yellow-400" />
        <span>Training Facility Type</span>
      </dt>
      <dd className="mt-1 text-gray-900">
        {user.trainerDetails?.trainingFacilityType || "N/A"}
      </dd>
    </div>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <Award className="w-4 h-4 text-yellow-400" />
        <span>Certification</span>
      </dt>
      <dd className="mt-1 text-gray-900">
        {user.trainerDetails?.certificationImage ? (
          <a
            href={user.trainerDetails.certificationImage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View Certification
          </a>
        ) : (
          "N/A"
        )}
      </dd>
    </div>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <ClockIcon className="w-4 h-4 text-yellow-400" />
        <span>Opening Hours</span>
      </dt>
      <dd className="mt-1 text-gray-900">
        {formatOpeningHours(user.trainerDetails?.openingHours) !== "N/A" ? (
          formatOpeningHours(user.trainerDetails?.openingHours)
        ) : (
          <span className="italic text-yellow-600">
            Schedule unavailable
          </span>
        )}
      </dd>
    </div>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <Briefcase className="w-4 h-4 text-yellow-400" />
        <span>Services</span>
      </dt>
      <dd className="mt-1 text-gray-900">
        {user.trainerDetails?.services?.length > 0
          ? user.trainerDetails.services
              .map((s) => `${s.serviceName} (TND ${s.fee || "N/A"})`)
              .filter((service) => /^[a-zA-Z\s]+$/.test(service.split(" (")[0]))
              .join(", ") || (
              <span className="italic text-yellow-600">
                Invalid data detected
              </span>
            )
          : "None"}
      </dd>
    </div>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <Briefcase className="w-4 h-4 text-yellow-400" />
        <span>Business Card</span>
      </dt>
      <dd className="mt-1">
        {user.trainerDetails?.businessCardImage ? (
          <a
            href={user.trainerDetails.businessCardImage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View Business Card
          </a>
        ) : (
          "N/A"
        )}
      </dd>
    </div>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <MapPin className="w-4 h-4 text-yellow-400" />
        <span>Training Photos</span>
      </dt>
      <dd className="flex flex-wrap gap-2 mt-1">
        {user.trainerDetails?.trainingPhotos?.length > 0
          ? user.trainerDetails.trainingPhotos
              .slice(0, 3)
              .map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <img
                    src={url}
                    alt={`Training Photo ${index + 1}`}
                    className="object-cover w-16 h-16 transition-transform rounded-md shadow-sm hover:scale-105"
                    onError={(e) =>
                      (e.target.src = DEFAULT_PROFILE_IMAGE)
                    }
                  />
                </a>
              ))
          : "N/A"}
        {user.trainerDetails?.trainingPhotos?.length > 3 && (
          <span className="text-xs text-blue-600 cursor-pointer hover:underline">
            +{user.trainerDetails.trainingPhotos.length - 3} more
          </span>
        )}
      </dd>
    </div>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <MapPin className="w-4 h-4 text-yellow-400" />
        <span>Geolocation</span>
      </dt>
      <dd className="mt-1 text-gray-900">
        {user.trainerDetails?.geolocation?.latitude &&
        user.trainerDetails?.geolocation?.longitude
          ? `${user.trainerDetails.geolocation.latitude.toFixed(4)}, ${user.trainerDetails.geolocation.longitude.toFixed(4)}`
          : "N/A"}
      </dd>
    </div>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <Award className="w-4 h-4 text-yellow-400" />
        <span>Rating</span>
      </dt>
      <dd className="mt-1 text-gray-900">
        {user.trainerDetails?.rating
          ? `${user.trainerDetails.rating.toFixed(1)} / 5`
          : "No ratings"}
      </dd>
    </div>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <User className="w-4 h-4 text-yellow-400" />
        <span>Reviews</span>
      </dt>
      <dd className="mt-1 text-gray-900">
        {user.trainerDetails?.reviews?.length > 0
          ? `${user.trainerDetails.reviews.length} review(s)`
          : "No reviews"}
      </dd>
    </div>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <Briefcase className="w-4 h-4 text-yellow-400" />
        <span>Breeds Trained</span>
      </dt>
      <dd className="mt-1 text-gray-900">
        {user.trainerDetails?.breedsTrained?.length > 0
          ? user.trainerDetails.breedsTrained
              .map((breed) => `${breed.breedName} (${breed.species})`)
              .join(", ")
          : "N/A"}
      </dd>
    </div>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <ClockIcon className="w-4 h-4 text-yellow-400" />
        <span>Average Session Duration</span>
      </dt>
      <dd className="mt-1 text-gray-900">
        {user.trainerDetails?.averageSessionDuration
          ? `${user.trainerDetails.averageSessionDuration} minutes`
          : "N/A"}
      </dd>
    </div>
    <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
      <dt className="flex items-center space-x-2 font-semibold text-gray-600">
        <Link className="w-4 h-4 text-yellow-400" />
        <span>Social Links</span>
      </dt>
      <dd className="mt-1 text-gray-900">
        {user.trainerDetails?.socialLinks &&
        (user.trainerDetails.socialLinks.facebook ||
          user.trainerDetails.socialLinks.instagram ||
          user.trainerDetails.socialLinks.website) ? (
          <div className="flex flex-col gap-1">
            {user.trainerDetails.socialLinks.facebook && (
              <a
                href={user.trainerDetails.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Facebook
              </a>
            )}
            {user.trainerDetails.socialLinks.instagram && (
              <a
                href={user.trainerDetails.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Instagram
              </a>
            )}
            {user.trainerDetails.socialLinks.website && (
              <a
                href={user.trainerDetails.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Website
              </a>
            )}
          </div>
        ) : (
          "N/A"
        )}
      </dd>
    </div>
  </>
)}
                                    {/* Veterinarian Details */}
                                    {user.role === "Vet" && (
                                      <>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <User className="w-4 h-4 text-yellow-400" />
                                            <span>Gender</span>
                                          </dt>
                                          <dd className="mt-1 text-gray-900">
                                            {user.gender || "N/A"}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <User className="w-4 h-4 text-yellow-400" />
                                            <span>About</span>
                                          </dt>
                                          <dd className="mt-1 text-gray-900">
                                            {user.about || "N/A"}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <Briefcase className="w-4 h-4 text-yellow-400" />
                                            <span>Title</span>
                                          </dt>
                                          <dd className="mt-1 text-gray-900">
                                            {user.veterinarianDetails?.title || "N/A"}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <MapPin className="w-4 h-4 text-yellow-400" />
                                            <span>Location</span>
                                          </dt>
                                          <dd className="mt-1 text-gray-900">
                                            {user.veterinarianDetails?.governorate &&
                                            user.veterinarianDetails?.delegation
                                              ? `${user.veterinarianDetails.delegation}, ${user.veterinarianDetails.governorate}`
                                              : user.veterinarianDetails?.governorate || "N/A"}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <Phone className="w-4 h-4 text-yellow-400" />
                                            <span>Primary Phone</span>
                                          </dt>
                                          <dd className="mt-1 text-gray-900">
                                            {user.veterinarianDetails?.phone || "N/A"}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <Phone className="w-4 h-4 text-yellow-400" />
                                            <span>Secondary Phone</span>
                                          </dt>
                                          <dd className="mt-1 text-gray-900">
                                            {user.veterinarianDetails?.secondaryPhone || "N/A"}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <Award className="w-4 h-4 text-yellow-400" />
                                            <span>Specializations</span>
                                          </dt>
                                          <dd className="mt-1 text-gray-900">
                                            {user.veterinarianDetails?.specializations?.length > 0
                                              ? user.veterinarianDetails.specializations
                                                  .map((s) => s.specializationName)
                                                  .filter((name) => /^[a-zA-Z\s]+$/.test(name))
                                                  .join(", ") || (
                                                  <span className="italic text-yellow-600">
                                                    Invalid data detected
                                                  </span>
                                                )
                                              : "None"}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <Award className="w-4 h-4 text-yellow-400" />
                                            <span>Diplomas and Training</span>
                                          </dt>
                                          <dd className="mt-1 text-gray-900">
                                            {user.veterinarianDetails?.diplomasAndTraining &&
                                            !user.veterinarianDetails.diplomasAndTraining.startsWith("http") ? (
                                              user.veterinarianDetails.diplomasAndTraining
                                            ) : user.veterinarianDetails?.diplomasAndTraining ? (
                                              <a
                                                href={user.veterinarianDetails.diplomasAndTraining}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                              >
                                                View Diploma
                                              </a>
                                            ) : (
                                              "N/A"
                                            )}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <Briefcase className="w-4 h-4 text-yellow-400" />
                                            <span>Services</span>
                                          </dt>
                                          <dd className="mt-1 text-gray-900">
                                            {user.veterinarianDetails?.services?.length > 0
                                              ? user.veterinarianDetails.services
                                                  .map((s) => `${s.serviceName} (TND ${s.fee || "N/A"})`)
                                                  .filter((service) => /^[a-zA-Z\s]+$/.test(service.split(" (")[0]))
                                                  .join(", ") || (
                                                  <span className="italic text-yellow-600">
                                                    Invalid data detected
                                                  </span>
                                                )
                                              : "None"}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <Languages className="w-4 h-4 text-yellow-400" />
                                            <span>Languages Spoken</span>
                                          </dt>
                                          <dd className="mt-1 text-gray-900">
                                            {user.veterinarianDetails?.languagesSpoken?.length > 0
                                              ? user.veterinarianDetails.languagesSpoken.join(", ")
                                              : "N/A"}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <ClockIcon className="w-4 h-4 text-yellow-400" />
                                            <span>Average Consultation Duration</span>
                                          </dt>
                                          <dd className="mt-1 text-gray-900">
                                            {user.veterinarianDetails?.averageConsultationDuration
                                              ? `${user.veterinarianDetails.averageConsultationDuration} minutes`
                                              : "N/A"}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <ClockIcon className="w-4 h-4 text-yellow-400" />
                                            <span>Opening Hours</span>
                                          </dt>
                                          <dd className="mt-1 text-gray-900">
                                            {formatOpeningHours(user.veterinarianDetails?.openingHours) !== "N/A" ? (
                                              formatOpeningHours(user.veterinarianDetails?.openingHours)
                                            ) : (
                                              <span className="italic text-yellow-600">
                                                Schedule unavailable
                                              </span>
                                            )}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <MapPin className="w-4 h-4 text-yellow-400" />
                                            <span>Clinic Photos</span>
                                          </dt>
                                          <dd className="flex flex-wrap gap-2 mt-1">
                                            {user.veterinarianDetails?.clinicPhotos?.length > 0
                                              ? user.veterinarianDetails.clinicPhotos
                                                  .slice(0, 3)
                                                  .map((url, index) => (
                                                    <a
                                                      key={index}
                                                      href={url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="inline-block"
                                                    >
                                                      <img
                                                        src={url}
                                                        alt={`Clinic Photo ${index + 1}`}
                                                        className="object-cover w-16 h-16 transition-transform rounded-md shadow-sm hover:scale-105"
                                                        onError={(e) =>
                                                          (e.target.src = DEFAULT_PROFILE_IMAGE)
                                                        }
                                                      />
                                                    </a>
                                                  ))
                                              : "N/A"}
                                            {user.veterinarianDetails?.clinicPhotos?.length > 3 && (
                                              <span className="text-xs text-blue-600 cursor-pointer hover:underline">
                                                +{user.veterinarianDetails.clinicPhotos.length - 3} more
                                              </span>
                                            )}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <Briefcase className="w-4 h-4 text-yellow-400" />
                                            <span>Business Card</span>
                                          </dt>
                                          <dd className="mt-1">
                                            {user.veterinarianDetails?.businessCardImage ? (
                                              <a
                                                href={user.veterinarianDetails.businessCardImage}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                              >
                                                View Business Card
                                              </a>
                                            ) : (
                                              "N/A"
                                            )}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <Briefcase className="w-4 h-4 text-yellow-400" />
                                            <span>Professional Card</span>
                                          </dt>
                                          <dd className="mt-1">
                                            {user.veterinarianDetails?.professionalCardImage ? (
                                              <a
                                                href={user.veterinarianDetails.professionalCardImage}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                              >
                                                View Professional Card
                                              </a>
                                            ) : (
                                              "N/A"
                                            )}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <MapPin className="w-4 h-4 text-yellow-400" />
                                            <span>Geolocation</span>
                                          </dt>
                                          <dd className="mt-1 text-gray-900">
                                            {user.veterinarianDetails?.geolocation?.latitude &&
                                            user.veterinarianDetails?.geolocation?.longitude
                                              ? `${user.veterinarianDetails.geolocation.latitude.toFixed(4)}, ${user.veterinarianDetails.geolocation.longitude.toFixed(4)}`
                                              : "N/A"}
                                          </dd>
                                        </div>
                                      </>
                                    )}

                                    {/* Other Roles (Admin, PetOwner) */}
                                    {user.role === "Admin" && (
                                      <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                        <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                          <Shield className="w-4 h-4 text-yellow-400" />
                                          <span>Admin Type</span>
                                        </dt>
                                        <dd className="mt-1 text-gray-900">
                                          {getAdminTypeDisplay(user.adminType) || "N/A"}
                                        </dd>
                                      </div>
                                    )}
                                    {user.role === "PetOwner" && (
                                      <>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <MapPin className="w-4 h-4 text-yellow-400" />
                                            <span>Address</span>
                                          </dt>
                                          <dd className="mt-1 text-gray-900">
                                            {user.petOwnerDetails?.address || "N/A"}
                                          </dd>
                                        </div>
                                        <div className="p-4 transition-shadow rounded-lg shadow-sm bg-gray-50 hover:shadow-md">
                                          <dt className="flex items-center space-x-2 font-semibold text-gray-600">
                                            <Phone className="w-4 h-4 text-yellow-400" />
                                            <span>Phone</span>
                                          </dt>
                                          <dd className="mt-1 text-gray-900">
                                            {user.petOwnerDetails?.phone || "N/A"}
                                          </dd>
                                        </div>
                                      </>
                                    )}
                                  </dl>
                                </div>
                              )}

                              {activeTab === "activity" && (
                                <dl className="grid grid-cols-2 gap-6 text-sm">
                                  <div>
                                    <dt className="font-semibold text-gray-600">
                                      Created
                                    </dt>
                                    <dd className="mt-1 text-gray-900">
                                      {new Date(user.createdAt).toLocaleString() || "N/A"}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="font-semibold text-gray-600">
                                      Last Login
                                    </dt>
                                    <dd className="mt-1 text-gray-900">
                                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
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

export default UserTable;
