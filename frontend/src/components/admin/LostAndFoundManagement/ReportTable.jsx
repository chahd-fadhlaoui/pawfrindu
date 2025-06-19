import { Calendar, Camera, ChevronDown, ChevronRight, ChevronUp, FileText, Globe, Heart, Mail, MapPin, PawPrint, Phone, User } from "lucide-react";
import { useState } from "react";
import MapViewer from "../../map/MapViewer";

const DEFAULT_PET_IMAGE = "/images/default-pet.png";

const ReportTable = ({
  reports,
  selectedReports,
  currentUser,
  onToggleSelection,
  onToggleSelectAll,
  customActions,
  bulkAction,
  onRowClick,
  canPerformAction,
}) => {
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [expandedRows, setExpandedRows] = useState(new Set());

  const handleSort = (field) => {
    setSortField(field);
    setSortDirection((prev) => (sortField === field && prev === "asc" ? "desc" : "asc"));
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="inline-block w-4 h-4 ml-1 text-gray-600" />
    ) : (
      <ChevronDown className="inline-block w-4 h-4 ml-1 text-gray-600" />
    );
  };

  const toggleRowExpansion = (reportId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(reportId)) {
      newExpandedRows.delete(reportId);
    } else {
      newExpandedRows.add(reportId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleRowClick = (report) => {
    if (currentUser?.role === "Admin") {
      toggleRowExpansion(report._id);
    } else {
      onRowClick(report);
    }
  };

  const sortedReports = [...reports].sort((a, b) => {
    let fieldA = a[sortField] || "";
    let fieldB = b[sortField] || "";
    if (sortField === "date") {
      fieldA = new Date(a.date);
      fieldB = new Date(b.date);
      return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA;
    }
    if (typeof fieldA === "string") {
      return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
    }
    return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA;
  });

  const getStatusBadgeStyle = (status, isArchived) => {
    if (isArchived) {
      return "bg-gray-600/20 text-gray-600 border border-gray-600/30 shadow-sm";
    }
    const styles = {
      Pending: "bg-[#ffc929]/20 text-[#ffc929] border border-[#ffc929]/30",
      Matched: "bg-[#60a5fa]/20 text-[#60a5fa] border border-[#60a5fa]/30",
      Reunited: "bg-[#14b8a6]/20 text-[#14b8a6] border border-[#14b8a6]/30",
    };
    return styles[status] || "bg-gray-100 text-gray-600 border border-gray-200";
  };

  const getApprovalBadgeStyle = (isApproved) => {
    return isApproved
      ? "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30"
      : "bg-[#ffc929]/20 text-[#ffc929] border border-[#ffc929]/30";
  };

  const formatDate = (date) => {
    return date && !isNaN(new Date(date).getTime())
      ? new Date(date).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "N/A";
  };

  const ExpandedRowContent = ({ report }) => {
    // Define handleImageLoad at the top of the component
    const handleImageLoad = (e) => {
      console.log(`Image loaded for report ${report._id}:`, {
        src: e.target.src,
        width: e.target.naturalWidth,
        height: e.target.naturalHeight,
      });
    };

    // Construct position object from GeoJSON coordinates
    let position = null;
    let coordinates = null;

    // Handle GeoJSON format
    if (report.location?.coordinates?.type === "Point" && Array.isArray(report.location.coordinates.coordinates)) {
      coordinates = report.location.coordinates.coordinates;
    }
    // Handle raw array format (potential data inconsistency)
    else if (Array.isArray(report.location?.coordinates)) {
      coordinates = report.location.coordinates;
    }

    if (coordinates && coordinates.length === 2) {
      const [longitude, latitude] = coordinates;
      if (
        typeof latitude === "number" && !isNaN(latitude) && latitude >= -90 && latitude <= 90 &&
        typeof longitude === "number" && !isNaN(longitude) && longitude >= -180 && longitude <= 180
      ) {
        position = { lat: latitude, lng: longitude };
      }
    }

    // Debug logging for coordinates
    console.log(`Report ${report._id} MapViewer props:`, {
      position,
      location: report.location,
      coordinates,
    });

    return (
      <tr key={report._id} className="border-l-4 border-[#ffc929] bg-gradient-to-r from-[#ffc929]/10 to-[#ec4899]/10 animate-fade-in">
        <td colSpan={currentUser?.role === "Admin" ? 6 : 5} className="px-4 py-6 sm:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column - Pet Details */}
            <div className="space-y-4">
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                  <PawPrint className="w-5 h-5 mr-2 text-[#ec4899]" />
                  Pet Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <p className="text-gray-800">{report.name || "Unnamed"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Type:</span>
                    <p className="text-gray-800">{report.type || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Species:</span>
                    <p className="text-gray-800">{report.species || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Breed:</span>
                    <p className="text-gray-800">{report.breed || "No breed"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Age:</span>
                    <p className="text-gray-800">{report.age || "Unknown"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Gender:</span>
                    <p className="text-gray-800">{report.gender || "Unknown"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Colors:</span>
                    <p className="text-gray-800">
                      {Array.isArray(report.color) && report.color.length > 0
                        ? report.color.join(", ")
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Size:</span>
                    <p className="text-gray-800">{report.size || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Microchip:</span>
                    <p className="text-gray-800">{report.microchipNumber || "None"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Pregnancy:</span>
                    <p className="text-gray-800">{report.isPregnant ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                  <User className="w-5 h-5 mr-2 text-[#ec4899]" />
                  Contact Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="mr-2 font-medium text-gray-600">Name:</span>
                    <span className="text-gray-800">{report.owner?.fullName || report.email || "Not provided"}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="mr-2 font-medium text-gray-600">Phone:</span>
                    <span className="text-gray-800">{report.phoneNumber || "Not provided"}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="mr-2 font-medium text-gray-600">Email:</span>
                    <span className="text-gray-800">{report.email || "Not provided"}</span>
                  </div>
                </div>
              </div>

              {/* Location Information with Map */}
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                  <MapPin className="w-5 h-5 mr-2 text-[#ffc929]" />
                  Location Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Delegation:</span>
                    <p className="text-gray-800">{report.location?.delegation || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Governorate:</span>
                    <p className="text-gray-800">{report.location?.governorate || "Not specified"}</p>
                  </div>
                  <div className="mt-4">
                    <span className="block mb-2 font-medium text-gray-600">Map Location:</span>
                    {position ? (
                      <div className="space-y-2">
                        <div
                          id={`map-${report._id}`}
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
            </div>

            {/* Right Column - Photos and Additional Info */}
            <div className="space-y-4">
              {/* Photos */}
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                  <Camera className="w-5 h-5 mr-2 text-[#ffc929]" />
                  Photos
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {report.photos && report.photos.length > 0 ? (
                    report.photos.map((photo, index) => (
                      <div key={index} className="relative w-full aspect-square">
                        <img
                          src={photo}
                          alt={`${report.name || "Pet"} photo ${index + 1}`}
                          className="object-contain w-full h-full border border-gray-200 rounded-lg ring-1 ring-[#ec4899]/30"
                          onError={(e) => (e.target.src = DEFAULT_PET_IMAGE)}
                          onLoad={handleImageLoad}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="relative w-full aspect-square">
                      <img
                        src={DEFAULT_PET_IMAGE}
                        alt="Default pet"
                        className="object-contain w-full h-full border border-gray-200 rounded-lg ring-1 ring-[#ec4899]/30"
                        onLoad={handleImageLoad}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                  <FileText className="w-5 h-5 mr-2 text-[#ec4899]" />
                  Description
                </h3>
                <p className="text-sm leading-relaxed text-gray-700">
                  {report.description || "No description provided."}
                </p>
              </div>

              {/* Status and Dates */}
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                  <Calendar className="w-5 h-5 mr-2 text-[#ffc929]" />
                  Status & Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(report.status, report.isArchived)}`}>
                      {report.isArchived ? "Archived" : report.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Approval Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getApprovalBadgeStyle(report.isApproved)}`}>
                      {report.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">{report.type === "Lost" ? "Last Seen Date" : "Found Date"}:</span>
                    <p className="text-gray-800">{formatDate(report.date)}</p>
                  </div>
                  {report.updatedAt && (
                    <div>
                      <span className="font-medium text-gray-600">Last Updated:</span>
                      <p className="text-gray-800">{formatDate(report.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-hidden bg-white shadow-xl rounded-xl animate-fade-in">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {currentUser?.role === "Admin" && (
                <th className="px-4 py-3 sm:px-6">
                  <input
                    type="checkbox"
                    checked={selectedReports.length === reports.filter((r) => canPerformAction(r, bulkAction)).length}
                    onChange={onToggleSelectAll}
                    className="w-4 h-4 text-[#ec4899] border-gray-300 rounded focus:ring-[#ffc929]"
                  />
                </th>
              )}
              <th
                className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase cursor-pointer sm:px-6 hover:text-[#ec4899]"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  <span>Name</span>
                  {getSortIcon("name")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase cursor-pointer sm:px-6 hover:text-[#ec4899]"
                onClick={() => handleSort("species")}
              >
                <div className="flex items-center">
                  <span>Species</span>
                  {getSortIcon("species")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase cursor-pointer sm:px-6 hover:text-[#ec4899]"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {getSortIcon("status")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase cursor-pointer sm:px-6 hover:text-[#ec4899]"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  <span>Last Seen / Found</span>
                  {getSortIcon("date")}
                </div>
              </th>
              <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right text-gray-700 uppercase sm:px-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-space-y-0">
            {sortedReports.map((report) => (
              <>
                <tr
                  key={report._id}
                  className={`transition-colors duration-200 cursor-pointer hover:bg-gradient-to-r hover:from-[#4682b4]/5 hover:to-[#87ceeb]/10 ${
                    expandedRows.has(report._id) ? 'bg-[#4682b4]/10' : ''
                  }`}
                  onClick={() => handleRowClick(report)}
                >
                  {currentUser?.role === "Admin" && (
                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedReports.includes(report._id)}
                          onChange={() => onToggleSelection(report._id)}
                          disabled={bulkAction && !canPerformAction(report, bulkAction)}
                          className="w-4 h-4 text-[#4682b4] border-gray-300 rounded cursor-pointer focus:ring-[#87ceeb]"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <ChevronRight
                          className={`w-4 h-4 mx-auto text-[#4682b4] transition-transform duration-200 ${
                            expandedRows.has(report._id) ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                    <div className="flex items-center">
                      <div className="relative flex-shrink-0 w-12 h-12">
                        <img
                          src={report.photos?.[0] || DEFAULT_PET_IMAGE}
                          alt={report.name || "Pet"}
                          className="object-contain w-12 h-12 rounded-full ring-2 ring-[#4682b4]"
                          onError={(e) => (e.target.src = DEFAULT_PET_IMAGE)}
                          onLoad={(e) => {
                            console.log(`Avatar loaded for report ${report._id}:`, {
                              src: e.target.src,
                              width: e.target.naturalWidth,
                              height: e.target.naturalHeight,
                            });
                          }}
                        />
                        {!report.isArchived && (
                          <span className="absolute bottom-0 right-0 block w-4 h-4 bg-[#22c55e] rounded-full ring-2 ring-[#4682b4]" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-900">
                          {report.name || "Unnamed"} ({report.type})
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <PawPrint className="w-4 h-4 mr-2 text-[#4682b4]" />
                        <span className="truncate max-w-none" title={report.species || 'N/A'}>
                          {report.species || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-2 text-[#4682b4]" />
                        {report.breed || "No breed"}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap sm:px-6">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(report.status, report.isArchived)}`}
                    >
                      {report.isArchived ? "Archived" : report.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                    <div className="text-sm text-gray-900">
                      <span title={report.type === "Lost" ? "Last Seen" : "Found"}>
                        {formatDate(report.date)}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-4 py-4 text-right whitespace-nowrap sm:px-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {customActions(report)}
                  </td>
                </tr>
                {expandedRows.has(report._id) && <ExpandedRowContent report={report} />}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportTable;