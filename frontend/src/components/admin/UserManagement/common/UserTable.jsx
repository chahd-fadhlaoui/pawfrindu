import {
  Briefcase,
  Calendar,
  Camera,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  Globe,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  User,
  X
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import EmptyState from "../common/EmptyState";
import MapViewer from "../../../map/MapViewer";

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
  const [expandedRows, setExpandedRows] = useState(new Set());
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

  const toggleRowExpansion = (userId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(userId)) {
      newExpandedRows.delete(userId);
    } else {
      newExpandedRows.add(userId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleRowClick = (user) => {
    toggleRowExpansion(user._id);
  };

  const getRoleBadgeStyle = (role) => {
    const styles = {
      SuperAdmin:
        "bg-gradient-to-r from-yellow-500 to-pink-500 text-white border border-pink-600 shadow-md",
      Admin:
        "bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 border border-pink-400",
      PetOwner:
        "bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800 border border-amber-400",
      Vet: "bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800 border border-blue-400",
      Trainer:
        "bg-gradient-to-r from-teal-200 to-teal-300 text-teal-800 border border-teal-400",
    };
    return styles[role] || "bg-gray-100 text-gray-600 border border-gray-200";
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="inline-block w-4 h-4 ml-1 text-gray-600" />
    ) : (
      <ChevronDown className="inline-block w-4 h-4 ml-1 text-gray-600" />
    );
  };

  const getStatusBadgeStyle = (isActive, isArchieve) => {
    if (isArchieve) {
      return "bg-gray-600/20 text-gray-600 border border-gray-600/30 shadow-sm";
    }
    return isActive
      ? "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30"
      : "bg-[#ffc929]/20 text-[#ffc929] border border-[#ffc929]/30";
  };

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

    const formatted = Object.entries(scheduleGroups)
      .map(([hours, days]) => {
        if (hours.includes(":")) {
          return `${days.join(", ")}: ${hours}`;
        }
        return null;
      })
      .filter(Boolean)
      .join("; ");

    return formatted || "N/A";
  };

  const formatDate = (date) => {
    return date && !isNaN(new Date(date).getTime())
      ? new Date(date).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "N/A";
  };

  const ExpandedRowContent = ({ user }) => {
    const handleImageLoad = (e) => {
      console.log(`Image loaded for user ${user._id}:`, {
        src: e.target.src,
        width: e.target.naturalWidth,
        height: e.target.naturalHeight,
      });
    };

    let position = null;
    let coordinates = null;

    if (user.role === "Trainer" && user.trainerDetails?.geolocation) {
      coordinates = [
        user.trainerDetails.geolocation.longitude,
        user.trainerDetails.geolocation.latitude,
      ];
    } else if (user.role === "Vet" && user.veterinarianDetails?.geolocation) {
      coordinates = [
        user.veterinarianDetails.geolocation.longitude,
        user.veterinarianDetails.geolocation.latitude,
      ];
    }

    if (coordinates && coordinates.length === 2) {
      const [longitude, latitude] = coordinates;
      if (
        typeof latitude === "number" &&
        !isNaN(latitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        typeof longitude === "number" &&
        !isNaN(longitude) &&
        longitude >= -180 &&
        longitude <= 180
      ) {
        position = { lat: latitude, lng: longitude };
      }
    }

    console.log(`User ${user._id} MapViewer props:`, {
      position,
      coordinates,
    });

    return (
      <tr
        key={`${user._id}-expanded`}
        className="border-l-4 border-[#ffc929] bg-gradient-to-r from-[#ffc929]/10 to-[#ec4899]/10 animate-fade-in"
      >
        <td
          colSpan={onToggleSelection ? 5 : 4}
          className="px-4 py-6 sm:px-6"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column - User Details */}
            <div className="space-y-4">
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                  <User className="w-5 h-5 mr-2 text-[#ec4899]" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Full Name:</span>
                    <p className="text-gray-800">{user.fullName || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <p className="text-gray-800">{user.email || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Gender:</span>
                    <p className="text-gray-800">{user.gender || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Role:</span>
                    <p className="text-gray-800">{user.role || "N/A"}</p>
                  </div>
                </div>
              </div>

              {(user.role === "Trainer" || user.role === "Vet") && (
                <>
                  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                      <Briefcase className="w-5 h-5 mr-2 text-[#ec4899]" />
                      Contact Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="mr-2 font-medium text-gray-600">
                          Primary Phone:
                        </span>
                        <span className="text-gray-800">
                          {(user.role === "Trainer"
                            ? user.trainerDetails?.phone
                            : user.veterinarianDetails?.phone) || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="mr-2 font-medium text-gray-600">
                          Secondary Phone:
                        </span>
                        <span className="text-gray-800">
                          {(user.role === "Trainer"
                            ? user.trainerDetails?.secondaryPhone
                            : user.veterinarianDetails?.secondaryPhone) || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="mr-2 font-medium text-gray-600">
                          Email:
                        </span>
                        <span className="text-gray-800">
                          {user.email || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                      <MapPin className="w-5 h-5 mr-2 text-[#ffc929]" />
                      Location Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">
                          Delegation:
                        </span>
                        <p className="text-gray-800">
                          {(user.role === "Trainer"
                            ? user.trainerDetails?.delegation
                            : user.veterinarianDetails?.delegation) || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Governorate:
                        </span>
                        <p className="text-gray-800">
                          {(user.role === "Trainer"
                            ? user.trainerDetails?.governorate
                            : user.veterinarianDetails?.governorate) || "N/A"}
                        </p>
                      </div>
                      <div className="mt-4">
                        <span className="block mb-2 font-medium text-gray-600">
                          Map Location:
                        </span>
                        {position ? (
                          <div className="space-y-2">
                            <div
                              id={`map-${user._id}`}
                              className="w-full h-64 border border-[#ffc929]/20 rounded-lg overflow-hidden shadow-sm bg-gray-100"
                            >
                              <MapViewer position={position} />
                            </div>
                            <a
                              href={`https://www.google.com/maps?q=${position.lat},${position.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[#ffc929] hover:text-[#ec4899] hover:underline"
                              aria-label="View on Google Maps"
                            >
                              <Globe className="w-5 h-5" />
                              <span>View on Google Maps</span>
                            </a>
                          </div>
                        ) : (
                          <p className="italic text-red-600">
                            Unable to display map: {coordinates ? "Invalid coordinates format" : "No coordinates provided"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Professional Details */}
            <div className="space-y-4">
              {(user.role === "Trainer" || user.role === "Vet") && (
                <>
                  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                      <Camera className="w-5 h-5 mr-2 text-[#ffc929]" />
                      Photos
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {user.role === "Trainer" &&
                      user.trainerDetails?.trainingPhotos?.length > 0 ? (
                        user.trainerDetails.trainingPhotos
                          .slice(0, 4)
                          .map((photo, index) => (
                            <div
                              key={index}
                              className="relative w-full aspect-square"
                            >
                              <img
                                src={photo}
                                alt={`Training photo ${index + 1}`}
                                className="object-contain w-full h-full border border-gray-200 rounded-lg ring-1 ring-[#ec4899]/30"
                                onError={(e) =>
                                  (e.target.src = DEFAULT_PROFILE_IMAGE)
                                }
                                onLoad={handleImageLoad}
                              />
                            </div>
                          ))
                      ) : user.role === "Vet" &&
                        user.veterinarianDetails?.clinicPhotos?.length > 0 ? (
                        user.veterinarianDetails.clinicPhotos
                          .slice(0, 4)
                          .map((photo, index) => (
                            <div
                              key={index}
                              className="relative w-full aspect-square"
                            >
                              <img
                                src={photo}
                                alt={`Clinic photo ${index + 1}`}
                                className="object-contain w-full h-full border border-gray-200 rounded-lg ring-1 ring-[#ec4899]/30"
                                onError={(e) =>
                                  (e.target.src = DEFAULT_PROFILE_IMAGE)
                                }
                                onLoad={handleImageLoad}
                              />
                            </div>
                          ))
                      ) : (
                        <div className="relative w-full aspect-square">
                          <img
                            src={DEFAULT_PROFILE_IMAGE}
                            alt="Default profile"
                            className="object-contain w-full h-full border border-gray-200 rounded-lg ring-1 ring-[#ec4899]/30"
                            onLoad={handleImageLoad}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                      <FileText className="w-5 h-5 mr-2 text-[#ec4899]" />
                      Professional Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      {user.role === "Trainer" && (
                        <>
                          <div>
                            <span className="font-medium text-gray-600">
                              Facility Type:
                            </span>
                            <p className="text-gray-800">
                              {user.trainerDetails?.trainingFacilityType ||
                                "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Services:
                            </span>
                            <p className="text-gray-800">
                              {user.trainerDetails?.services?.length > 0
                                ? user.trainerDetails.services
                                    .map(
                                      (s) =>
                                        `${s.serviceName} (TND ${s.fee || "N/A"})`
                                    )
                                    .join(", ")
                                : "None"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Breeds Trained:
                            </span>
                            <p className="text-gray-800">
                              {user.trainerDetails?.breedsTrained?.length > 0
                                ? user.trainerDetails.breedsTrained
                                    .map(
                                      (b) => `${b.breedName} (${b.species})`
                                    )
                                    .join(", ")
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Languages Spoken:
                            </span>
                            <p className="text-gray-800">
                              {user.trainerDetails?.languagesSpoken?.length > 0
                                ? user.trainerDetails.languagesSpoken.join(", ")
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Certification:
                            </span>
                            <p className="text-gray-800">
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
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Business Card:
                            </span>
                            <p className="text-gray-800">
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
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Social Links:
                            </span>
                            <p className="text-gray-800">
                              {user.trainerDetails?.socialLinks &&
                              (user.trainerDetails.socialLinks.facebook ||
                                user.trainerDetails.socialLinks.instagram ||
                                user.trainerDetails.socialLinks.website) ? (
                                <div className="flex flex-col gap-1">
                                  {user.trainerDetails.socialLinks.facebook && (
                                    <a
                                      href={
                                        user.trainerDetails.socialLinks.facebook
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      Facebook
                                    </a>
                                  )}
                                  {user.trainerDetails.socialLinks.instagram && (
                                    <a
                                      href={
                                        user.trainerDetails.socialLinks.instagram
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      Instagram
                                    </a>
                                  )}
                                  {user.trainerDetails.socialLinks.website && (
                                    <a
                                      href={
                                        user.trainerDetails.socialLinks.website
                                      }
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
                            </p>
                          </div>
                        </>
                      )}
                      {user.role === "Vet" && (
                        <>
                          <div>
                            <span className="font-medium text-gray-600">
                              Title:
                            </span>
                            <p className="text-gray-800">
                              {user.veterinarianDetails?.title || "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Specializations:
                            </span>
                            <p className="text-gray-800">
                              {user.veterinarianDetails?.specializations?.length >
                              0
                                ? user.veterinarianDetails.specializations
                                    .map((s) => s.specializationName)
                                    .join(", ")
                                : "None"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Services:
                            </span>
                            <p className="text-gray-800">
                              {user.veterinarianDetails?.services?.length > 0
                                ? user.veterinarianDetails.services
                                    .map(
                                      (s) =>
                                        `${s.serviceName} (TND ${s.fee || "N/A"})`
                                    )
                                    .join(", ")
                                : "None"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Languages Spoken:
                            </span>
                            <p className="text-gray-800">
                              {user.veterinarianDetails?.languagesSpoken?.length >
                              0
                                ? user.veterinarianDetails.languagesSpoken.join(
                                    ", "
                                  )
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Diplomas & Training:
                            </span>
                            <p className="text-gray-800">
                              {user.veterinarianDetails?.diplomasAndTraining &&
                              !user.veterinarianDetails.diplomasAndTraining.startsWith(
                                "http"
                              ) ? (
                                user.veterinarianDetails.diplomasAndTraining
                              ) : user.veterinarianDetails?.diplomasAndTraining ? (
                                <a
                                  href={
                                    user.veterinarianDetails.diplomasAndTraining
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View Diploma
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Business Card:
                            </span>
                            <p className="text-gray-800">
                              {user.veterinarianDetails?.businessCardImage ? (
                                <a
                                  href={
                                    user.veterinarianDetails.businessCardImage
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View Business Card
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Professional Card:
                            </span>
                            <p className="text-gray-800">
                              {user.veterinarianDetails?.professionalCardImage ? (
                                <a
                                  href={
                                    user.veterinarianDetails.professionalCardImage
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View Professional Card
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                      <Calendar className="w-5 h-5 mr-2 text-[#ffc929]" />
                      Schedule & Status
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">
                          Status:
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(
                            user.isActive,
                            user.isArchieve
                          )}`}
                        >
                          {user.isArchieve ? "Archived" : user.isActive ? "Active" : "Pending"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Opening Hours:
                        </span>
                        <p className="text-gray-800">
                          {formatOpeningHours(
                            user.role === "Trainer"
                              ? user.trainerDetails?.openingHours
                              : user.veterinarianDetails?.openingHours
                          ) !== "N/A" ? (
                            formatOpeningHours(
                              user.role === "Trainer"
                                ? user.trainerDetails?.openingHours
                                : user.veterinarianDetails?.openingHours
                            )
                          ) : (
                            <span className="italic text-yellow-600">
                              Schedule unavailable
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          {user.role === "Trainer"
                            ? "Average Session Duration"
                            : "Average Consultation Duration"}
                          :
                        </span>
                        <p className="text-gray-800">
                          {(user.role === "Trainer"
                            ? user.trainerDetails?.averageSessionDuration
                            : user.veterinarianDetails?.averageConsultationDuration) ||
                            "N/A"}{" "}
                          {user.role === "Trainer" &&
                          user.trainerDetails?.averageSessionDuration
                            ? "minutes"
                            : user.role === "Vet" &&
                              user.veterinarianDetails?.averageConsultationDuration
                            ? "minutes"
                            : ""}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Created:
                        </span>
                        <p className="text-gray-800">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Last Login:
                        </span>
                        <p className="text-gray-800">
                          {user.lastLogin
                            ? formatDate(user.lastLogin)
                            : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
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
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={
                            selectedUsers.length > 0 &&
                            selectedUsers.length ===
                              displayedUsers.filter(
                                (u) =>
                                  u._id !== currentUser?._id &&
                                  u.role !== "SuperAdmin"
                              ).length &&
                              users.length > 0
                          }
                          onChange={onToggleSelectAll}
                          className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                          aria-label="Select all users"
                        />
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </div>
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
                      className={`transition-colors duration-200 hover:bg-gradient-to-r hover:from-pink-50 hover:to-yellow-50 cursor-pointer ${
                        expandedRows.has(user._id)
                          ? "bg-[#4682b4]/10"
                          : ""
                      }`}
                      onClick={() => handleRowClick(user)}
                    >
                      {onToggleSelection && (
                        <td
                          className="px-4 py-4 sm:px-6 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user._id)}
                              onChange={() => onToggleSelection(user._id)}
                              disabled={
                                user._id === currentUser?._id ||
                                user.role === "SuperAdmin"
                              }
                              className="w-4 h-4 text-yellow-500 border-gray-300 rounded-full cursor-pointer focus:ring-yellow-500 disabled:opacity-50"
                              aria-label={`Select ${user.fullName || "user"}`}
                            />
                            <ChevronRight
                              className={`w-4 h-4 mx-auto text-[#4682b4] transition-transform duration-200 ${
                                expandedRows.has(user._id) ? "rotate-90" : ""
                              }`}
                            />
                          </div>
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
                            {user.isActive && !user.isArchieve && (
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
                              user.role
                            )}`}
                          >
                            {user.role || "Unknown"}
                          </span>
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
                              <div className="absolute right-0 z-10 w-48 mt-2 transition-all duration-200 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-yellow-200">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      toggleRowExpansion(user._id);
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
                                      user.role === "SuperAdmin"
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
                    {expandedRows.has(user._id) &&
                      (user.role === "Trainer" || user.role === "Vet") && (
                        <ExpandedRowContent user={user} />
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