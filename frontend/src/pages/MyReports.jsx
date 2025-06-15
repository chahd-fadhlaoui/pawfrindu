import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  MapPin,
  PawPrint,
  SearchX,
  Pencil,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import axiosInstance from "../utils/axiosInstance";
import LostPetUpdateForm from "../components/LostandFoundUserside/LostPetUpdateForm";
import FoundPetUpdateForm from "../components/LostandFoundUserside/FoundPetUpdateForm";


const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  archived: "bg-gray-100 text-gray-700 border-gray-200",
  reunited: "bg-blue-100 text-blue-700 border-blue-200",
  matched: "bg-purple-100 text-purple-700 border-purple-200",
};

const ITEMS_PER_PAGE = 9;
const STATUS_OPTIONS = ["pending", "approved", "archived", "reunited", "matched"];
const REPORT_TYPE_OPTIONS = ["lost", "found"];

const FilterSelect = ({ label, value, onChange, options, icon }) => (
  <div className="w-full sm:w-auto flex-1 min-w-[140px] relative">
    <select
      className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400 hover:border-pink-300 transition-all duration-300"
      value={value}
      onChange={onChange}
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </option>
      ))}
    </select>
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
      {icon}
    </div>
  </div>
);

const FilterBadge = ({ label, value, onClear }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-pink-600 bg-pink-50 rounded-full border border-pink-200 shadow-sm">
    {label}: {value.charAt(0).toUpperCase() + value.slice(1)}
    <button
      onClick={onClear}
      className="ml-1 text-pink-600 hover:text-pink-800 transition-colors duration-300"
    >
      <X size={14} />
    </button>
  </span>
);

const ReportCard = ({ report, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const truncateText = (text, maxLength) =>
    text && text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className={`h-2 ${getStatusColor(report.status)}`}></div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                report.status
              )}`}
            >
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </span>
            <h3 className="text-lg font-semibold text-gray-800 mt-2">
              {report.pet?.name || report.name || "Unnamed Pet"}
            </h3>
          </div>
          <div className="text-right flex items-center gap-2">
            <div>
              <div className="text-sm text-gray-500">
                {formatDate(report.date)}
              </div>
              <div className="font-medium text-pink-600">
                {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
              </div>
            </div>
            {report.status.toLowerCase() !== "matched" && (
              <button
                onClick={() => onEdit(report._id, report.type)}
                className="p-2 text-pink-500 hover:bg-pink-50 rounded-full transition-colors"
                title="Update Report"
              >
                <Pencil size={18} />
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
              <PawPrint size={18} className="text-pink-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Pet Type & Breed</div>
              <div className="font-medium text-gray-800">
                {report.species || "Unknown"}
                {report.breed ? `, ${report.breed}` : ""}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
              <MapPin size={18} className="text-pink-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Location</div>
              <div className="font-medium text-gray-800">
                {report.location?.governorate || "Not Provided"}
                {report.location?.delegation ? `, ${report.location.delegation}` : ""}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
              <PawPrint size={18} className="text-pink-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Gender</div>
              <div className="font-medium text-gray-800">
                {report.gender || "Unknown"}
                {report.gender === "Female" && report.isPregnant !== null
                  ? ` (${report.isPregnant ? "Pregnant" : "Not Pregnant"})`
                  : ""}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
              <PawPrint size={18} className="text-pink-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Color</div>
              <div className="font-medium text-gray-800">
                {report.color?.length > 0 ? report.color.join(", ") : "Unknown"}
              </div>
            </div>
          </div>
        </div>
        {report.photos?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                <PawPrint size={18} className="text-pink-500" />
              </div>
              <div className="text-xs text-gray-500">Photos</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {report.photos.slice(0, 3).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Pet photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border border-gray-200"
                />
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-center text-sm font-medium text-pink-600 hover:text-pink-800 transition-colors duration-300 flex items-center justify-center gap-2"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp size={16} />
            </>
          ) : (
            <>
              Show More Details <ChevronDown size={16} />
            </>
          )}
        </button>
        {isExpanded && (
          <div className="mt-4 border-t border-gray-100 pt-4 transition-opacity duration-300">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500">Description</div>
                <div className="text-sm text-gray-800">
                  {truncateText(report.description, 100) || "No description provided"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Microchip Number</div>
                <div className="text-sm text-gray-800">
                  {report.microchipNumber || "Not provided"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Contact</div>
                <div className="text-sm text-gray-800">
                  {report.email || report.phoneNumber
                    ? `${report.email || ""}${report.email && report.phoneNumber ? ", " : ""}${report.phoneNumber || ""}`
                    : "Not provided"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Size & Age</div>
                <div className="text-sm text-gray-800">
                  {report.size || report.age
                    ? `${report.size || "Unknown"} / ${report.age || "Unknown"}`
                    : "Not provided"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const MyReports = () => {
  const { user } = useApp();
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterReportType, setFilterReportType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/lost-and-found/my-reports");
      console.log("API Response:", response.data);
      setReports(response.data.reports || []);
      setError(null);
    } catch (err) {
      console.error("Fetch reports error:", err.response || err);
      setError(err.response?.data?.message || "Failed to fetch reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchReports();
    }
  }, [user?._id]);

  const handleEdit = (reportId, reportType) => {
    setSelectedReport({ id: reportId, type: reportType });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const handleUpdateSuccess = () => {
    fetchReports(); // Refresh reports after update
    closeModal();
  };

  const clearFilter = (filterType) => {
    switch (filterType) {
      case "status":
        setFilterStatus("");
        break;
      case "reportType":
        setFilterReportType("");
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilterStatus("");
    setFilterReportType("");
    setCurrentPage(1);
  };

  const filteredReports = reports.filter((report) => {
    const statusMatch = !filterStatus || report.status.toLowerCase() === filterStatus;
    const typeMatch = !filterReportType || report.type.toLowerCase() === filterReportType;
    return statusMatch && typeMatch;
  });

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-pink-50 pb-16">
      <div className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-pink-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array(8)
            .fill(null)
            .map((_, index) => (
              <PawPrint
                key={index}
                className={`absolute w-8 h-8 opacity-5 animate-float ${
                  index % 2 === 0 ? "text-[#ffc929]" : "text-pink-300"
                } ${
                  index % 3 === 0
                    ? "top-1/4"
                    : index % 3 === 1
                    ? "top-1/2"
                    : "top-3/4"
                } ${
                  index % 4 === 0
                    ? "left-1/4"
                    : index % 4 === 1
                    ? "left-1/2"
                    : "left-3/4"
                }`}
                style={{
                  animationDelay: `${index * 0.5}s`,
                  transform: `rotate(${index * 45}deg)`,
                }}
              />
            ))}
        </div>
        <div
          className="relative mx-auto max-w-7xl text-center space-y-6 animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
            <Calendar className="w-4 h-4 mr-2 text-[#ffc929]" />
            Your Lost & Found Reports
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="block">Manage Your</span>
            <span className="block text-pink-500">Pet Reports</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
            Keep track of all your lost and found pet reports in one place.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <button
            onClick={() => window.location.href = "/report-lost-pet"}
            className="flex items-center justify-center gap-2 px-6 py-3 text-white bg-[#ffc929] rounded-xl shadow-md hover:shadow-lg hover:bg-pink-500 transition-all duration-300 transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-pink-300 w-full sm:w-auto"
            disabled={loading}
          >
            <PawPrint size={18} />
            Report Lost Pet
          </button>
          {filteredReports.length > 0 && (
            <span className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-pink-600 bg-white border border-pink-100 rounded-full shadow-sm w-full sm:w-auto">
              <PawPrint size={16} className="text-pink-500" />
              {filteredReports.length}{" "}
              {filteredReports.length === 1 ? "Report" : "Reports"}
            </span>
          )}
          <button
            onClick={() => window.location.href = "/report-found-pet"}
            className="flex items-center justify-center gap-2 px-6 py-3 text-white bg-[#ffc929] rounded-xl shadow-md hover:shadow-lg hover:bg-pink-500 transition-all duration-300 transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-pink-300 w-full sm:w-auto"
            disabled={loading}
          >
            <PawPrint size={18} />
            Report Found Pet
          </button>
        </div>

        <div className="bg-white border border-gray-100 shadow-lg rounded-2xl mb-8 overflow-hidden">
          <div
            className="px-6 py-4 border-b border-gray-100 flex justify-between items-center"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Filter size={18} className="text-pink-500" />
              Filter Options
            </h2>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2 text-pink-500 hover:bg-pink-50 rounded-full transition-colors"
            >
              {isFilterOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
          </div>
          <div
            className={`transition-all duration-300 ease-in-out ${
              isFilterOpen
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FilterSelect
                  label="Status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={STATUS_OPTIONS}
                  icon={<PawPrint size={18} className="text-pink-400" />}
                />
                <FilterSelect
                  label="Report Type"
                  value={filterReportType}
                  onChange={(e) => setFilterReportType(e.target.value)}
                  options={REPORT_TYPE_OPTIONS}
                  icon={<PawPrint size={18} className="text-pink-400" />}
                />
              </div>
              {(filterStatus || filterReportType) && (
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Active Filters:
                    </span>
                    {filterStatus && (
                      <FilterBadge
                        label="Status"
                        value={filterStatus}
                        onClear={() => clearFilter("status")}
                      />
                    )}
                    {filterReportType && (
                      <FilterBadge
                        label="Type"
                        value={filterReportType}
                        onClear={() => clearFilter("reportType")}
                      />
                    )}
                    <button
                      onClick={clearAllFilters}
                      className="ml-auto px-4 py-1 text-sm font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 flex items-center gap-1"
                    >
                      <X size={14} /> Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px] bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="text-center animate-pulse">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-400 to-yellow-300 flex items-center justify-center">
                <PawPrint size={32} className="text-white" />
              </div>
              <p className="mt-4 text-lg font-medium text-gray-600">
                Loading your reports...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-16 h-16 mb-4 mx-auto rounded-full bg-pink-100 flex items-center justify-center">
              <AlertTriangle size={32} className="text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Unable to Load Reports
            </h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchReports}
              className="mt-6 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-yellow-300 rounded-xl shadow-sm hover:from-pink-500 hover:to-yellow-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              Try Again
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-20 h-20 mb-6 mx-auto rounded-full bg-gradient-to-r from-pink-200 to-yellow-100 flex items-center justify-center">
              <PawPrint size={40} className="text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              No Reports Yet
            </h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              You haven't submitted any reports yet. Start by reporting a lost or found pet now!
            </p>
            <button
              onClick={() => window.location.href = "/report-lost-pet"}
              className="mt-6 px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-yellow-300 rounded-xl shadow-md hover:shadow-lg hover:from-pink-500 hover:to-yellow-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
              disabled={loading}
            >
              Report Lost Pet
            </button>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-16 h-16 mb-4 mx-auto rounded-full bg-pink-100 flex items-center justify-center">
              <SearchX size={32} className="text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              No Matching Reports
            </h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              No reports match your current filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-6 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-yellow-300 rounded-xl shadow-sm hover:from-pink-500 hover:to-yellow-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn"
              style={{ animationDelay: "0.2s" }}
            >
              {paginatedReports.map((report, index) => (
                <ReportCard
                  key={report._id}
                  report={report}
                  onEdit={handleEdit}
                  style={{ animationDelay: `${0.1 * index}s` }}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-12 bg-white rounded-xl shadow-md p-2 max-w-md mx-auto">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className={`p-2 rounded-lg ${
                    currentPage === 1 || loading
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-pink-500 hover:bg-pink-50"
                  } transition-all duration-300 focus:outline-none`}
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium ${
                          currentPage === page
                            ? "bg-gradient-to-r from-pink-400 to-yellow-300 text-white shadow-md"
                            : "text-gray-600 hover:bg-pink-50"
                        } transition-all duration-300 focus:outline-none`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className={`p-2 rounded-lg ${
                    currentPage === totalPages || loading
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-pink-500 hover:bg-pink-50"
                  } transition-all duration-300 focus:outline-none`}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal for Update Form */}
       {isModalOpen && selectedReport && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">
          Update {selectedReport.type.charAt(0).toUpperCase() + selectedReport.type.slice(1)} Pet Report
        </h2>
        <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      <div className="p-6">
        {selectedReport.type.toLowerCase() === "lost" ? (
          <LostPetUpdateForm
            reportId={selectedReport.id}
            onSuccess={handleUpdateSuccess}
            onCancel={closeModal}
          />
        ) : (
          <FoundPetUpdateForm
            reportId={selectedReport.id}
            onSuccess={handleUpdateSuccess}
            onCancel={closeModal}
          />
        )}
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-300";
    case "approved":
      return "bg-green-400";
    case "archived":
      return "bg-gray-400";
    case "reunited":
      return "bg-blue-300";
    case "matched":
      return "bg-purple-300";
    default:
      return "bg-gray-400";
  }
}

function getStatusBadgeColor(status) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "approved":
      return "bg-green-100 text-green-700";
    case "archived":
      return "bg-gray-100 text-gray-700";
    case "reunited":
      return "bg-blue-100 text-blue-700";
    case "matched":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default MyReports;