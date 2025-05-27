import {
  CheckCircle,
  Link,
  Loader2,
  PawPrint,
  Search,
  Trash2,
  Heart,
  User,
  MapPin,
  FileText,
  Clock,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../../context/AppContext";
import axiosInstance from "../../../utils/axiosInstance";
import ConfirmationModal from "../../ConfirmationModal";
import EmptyState from "../../EmptyState";
import { ErrorAlert } from "../common/ErrorAlert";
import { PaginationControls } from "../common/PaginationControls";
import { FilterSelect } from "./common/FilterSelect";
import Modal from "./common/Modal";
import ReportTable from "./ReportTable";
import MapViewer from "../../map/MapViewer";

const DEFAULT_PET_IMAGE = "/images/default-pet.png";

const ActiveReports = () => {
  const { user, socket } = useApp();
  const [reports, setReports] = useState([]);
  const [localReports, setLocalReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReports, setSelectedReports] = useState([]);
  const [actionError, setActionError] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [bulkAction, setBulkAction] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [expandedMatches, setExpandedMatches] = useState({}); // Added missing state
  const reportsPerPage = 10;

  const statusOptions = [
    { value: "Pending", label: "Pending" },
  ];

  const bulkActionOptions = [
    { value: "approve", label: "Approve" },
    { value: "delete", label: "Reject" },
  ];

  const getStatusBadgeStyle = (status) => {
    const styles = {
      Pending: "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300 shadow-sm",
      Matched: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 shadow-sm",
      Reunited: "bg-gradient-to-r from-green-100 to-teal-200 text-green-800 border border-green-300 shadow-sm",
    };
    return styles[status] || "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300 shadow-sm";
  };

  const canPerformAction = (report, action) => {
    if (!user || user?.role !== "Admin") return false;
    switch (action) {
      case "approve":
        return !report.isApproved && report.status === "Pending";
      case "delete":
        return !report.isApproved;
      case "match":
        return report.isApproved && !report.matchedReport && report.status === "Pending";
      default:
        return false;
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/lost-and-found");
      const activeReports = response.data.data.filter((r) => r.status === "Pending");
      setReports(activeReports);
      setLocalReports(activeReports);
      setCurrentPage(1);
      setSelectedReports([]);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    socket.on("foundReportCreated", fetchReports);
    socket.on("lostReportCreated", fetchReports);
    socket.on("reportApproved", fetchReports);
    socket.on("reportDeleted", fetchReports);
    socket.on("reportMatched", fetchReports);

    return () => {
      socket.off("foundReportCreated");
      socket.off("lostReportCreated");
      socket.off("reportApproved");
      socket.off("reportDeleted");
      socket.off("reportMatched");
    };
  }, [socket]);

  const filteredReports = useMemo(() => {
    let result = localReports;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(query) ||
          (r.species || "").toLowerCase().includes(query) ||
          (r.breed || "").toLowerCase().includes(query) ||
          (r.location?.governorate || "").toLowerCase().includes(query)
      );
    }
    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter);
    }
    return result;
  }, [localReports, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const currentReports = filteredReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  const handleAction = async (action, reportId) => {
    setIsActionLoading(true);
    try {
      const optimisticReports = localReports.map((r) =>
        r._id === reportId
          ? {
              ...r,
              status: action === "approve" ? "Pending" : r.status,
              isApproved: action === "approve" ? true : r.isApproved,
            }
          : r
      );
      if (action === "delete") {
        setLocalReports(localReports.filter((r) => r._id !== reportId));
      } else {
        setLocalReports(optimisticReports);
      }

      let url;
      let method = "put";
      switch (action) {
        case "approve":
          url = `/api/lost-and-found/${reportId}/approve`;
          break;
        case "delete":
          url = `/api/lost-and-found/${reportId}`;
          method = "delete";
          break;
        default:
          return;
      }

      if (method === "delete") {
        await axiosInstance.delete(url);
      } else {
        await axiosInstance.put(url);
      }

      await fetchReports();
      setIsConfirmModalOpen(false);
    } catch (error) {
      setActionError(error.response?.data?.message || `Failed to ${action} report`);
      setLocalReports(reports);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedReports.length === 0) return;
    setIsActionLoading(true);
    try {
      const eligibleReports = selectedReports.filter((id) =>
        canPerformAction(localReports.find((r) => r._id === id), bulkAction)
      );
      if (eligibleReports.length === 0) {
        setActionError(`No reports eligible for ${bulkAction}.`);
        setIsConfirmModalOpen(false);
        return;
      }

      const optimisticReports = localReports
        .map((r) =>
          eligibleReports.includes(r._id)
            ? {
                ...r,
                status: bulkAction === "approve" ? "Pending" : r.status,
                isApproved: bulkAction === "approve" ? true : r.isApproved,
              }
            : r
        )
        .filter((r) => bulkAction !== "delete" || !eligibleReports.includes(r._id));
      setLocalReports(optimisticReports);
      setSelectedReports([]);

      const promises = eligibleReports.map((id) => {
        let url;
        let method = "put";
        switch (bulkAction) {
          case "approve":
            url = `/api/lost-and-found/${id}/approve`;
            break;
          case "delete":
            url = `/api/lost-and-found/${id}`;
            method = "delete";
            break;
          default:
            return Promise.resolve();
        }
        return method === "delete"
          ? axiosInstance.delete(url)
          : axiosInstance.put(url);
      });

      await Promise.all(promises);
      await fetchReports();
      setIsConfirmModalOpen(false);
    } catch (error) {
      setActionError(error.response?.data?.message || "Failed to perform bulk action");
      setLocalReports(reports);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSingleAction = (action, reportId) => {
    setSelectedReportId(reportId);
    setConfirmAction(action);
    setIsConfirmModalOpen(true);
  };

  const fetchPotentialMatches = async (reportId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/lost-and-found/potential-matches/${reportId}`);
      setPotentialMatches(response.data.data);
      setExpandedMatches({}); // Reset expanded state
      setIsMatchModalOpen(true);
    } catch (error) {
      setActionError(error.response?.data?.message || "Failed to fetch potential matches");
    } finally {
      setLoading(false);
    }
  };

  const openMatchModal = (report) => {
    setSelectedReport(report);
    fetchPotentialMatches(report._id);
  };

  const handleMatchAction = async (reportId, matchedReportId) => {
    setIsActionLoading(true);
    try {
      await axiosInstance.post("/api/lost-and-found/match", { reportId, matchedReportId });
      await fetchReports();
      setIsMatchModalOpen(false);
    } catch (error) {
      setActionError(error.response?.data?.message || "Failed to match report");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleSelection = (reportId) => {
    const report = currentReports.find((r) => r._id === reportId);
    if (!canPerformAction(report, bulkAction)) return;
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleToggleSelectAll = () => {
    const selectableReports = currentReports
      .filter((r) => canPerformAction(r, bulkAction))
      .map((r) => r._id);
    setSelectedReports((prev) =>
      prev.length === selectableReports.length ? [] : selectableReports
    );
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedReports([]);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCurrentPage(1);
    setSelectedReports([]);
    setBulkAction("");
  };

  const customActions = (report) => (
    <div className="relative flex items-center justify-end gap-2">
      {!report.isApproved && report.status === "Pending" && (
        <div
          className="relative"
          onMouseEnter={() => setHoveredAction(`approve-${report._id}`)}
          onMouseLeave={() => setHoveredAction(null)}
        >
          <button
            onClick={() => handleSingleAction("approve", report._id)}
            disabled={isActionLoading}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
          >
            <CheckCircle className="w-3 h-3" />
            Approve
          </button>
          {hoveredAction === `approve-${report._id}` && (
            <div className="absolute right-0 z-10 px-3 py-2 mt-2 text-xs text-white bg-gray-800 rounded-md shadow-lg top-full animate-fade-in-up">
              <div className="flex items-center gap-1">
                <span>Approve this report</span>
              </div>
            </div>
          )}
        </div>
      )}
      {!report.isApproved && (
        <div
          className="relative"
          onMouseEnter={() => setHoveredAction(`delete-${report._id}`)}
          onMouseLeave={() => setHoveredAction(null)}
        >
          <button
            onClick={() => handleSingleAction("delete", report._id)}
            disabled={isActionLoading}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
          >
            <Trash2 className="w-3 h-3" />
            Reject
          </button>
          {hoveredAction === `delete-${report._id}` && (
            <div className="absolute right-0 z-10 px-3 py-2 mt-2 text-xs text-white bg-gray-800 rounded-md shadow-lg top-full animate-fade-in-up">
              <div className="flex items-center gap-1">
                <span>Are you really sure you want to reject this report?</span>
              </div>
            </div>
          )}
        </div>
      )}
      {report.isApproved && !report.matchedReport && report.status === "Pending" && (
        <div
          className="relative"
          onMouseEnter={() => setHoveredAction(`match-${report._id}`)}
          onMouseLeave={() => setHoveredAction(null)}
        >
          <button
            onClick={() => openMatchModal(report)}
            disabled={isActionLoading}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
          >
            <Link className="w-3 h-3" />
            Match
          </button>
          {hoveredAction === `match-${report._id}` && (
            <div className="absolute right-0 z-10 px-3 py-2 mt-2 text-xs text-white bg-gray-800 rounded-md shadow-lg top-full animate-fade-in-up">
              <div className="flex items-center gap-1">
                <span>Find potential matches</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white shadow-md rounded-xl animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by name, species, breed, or location..."
              className="w-full py-3 pl-10 pr-4 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-[#ffc929] focus:border-[#ffc929] transition-all duration-300"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
              className="bg-white border-gray-200 shadow-sm focus:ring-[#ffc929] focus:border-[#ffc929] rounded-lg py-2 px-3 text-sm transition-all duration-300"
            />
            {user?.role === "Admin" && (
              <FilterSelect
                label="Bulk Action"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                options={bulkActionOptions}
                className="bg-white border-gray-200 shadow-sm focus:ring-[#ffc929] focus:border-[#ffc929] rounded-lg py-2 px-3 text-sm transition-all duration-300"
              />
            )}
            {(searchQuery || statusFilter || bulkAction) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg shadow-md hover:bg-gray-50 hover:shadow-lg focus:ring-2 focus:ring-[#ffc929] transition-all duration-300"
              >
                Clear Filters
              </button>
            )}
            {bulkAction && selectedReports.length > 0 && (
              <button
                onClick={() => setIsConfirmModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 focus:ring-2 focus:ring-gray-400"
              >
                {isActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {bulkAction === "approve" && <CheckCircle className="w-4 h-4" />}
                    {bulkAction === "delete" && <Trash2 className="w-4 h-4" />}
                  </>
                )}
                Apply ({selectedReports.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {actionError && (
        <ErrorAlert
          message={actionError}
          onDismiss={() => setActionError("")}
          className="animate-fade-in"
        />
      )}

      {loading ? (
        <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-[#ffc929] animate-spin" />
            <PawPrint className="w-8 h-8 text-[#ec4899] animate-pulse" />
            <p className="text-lg font-semibold text-gray-700">Loading reports...</p>
          </div>
        </div>
      ) : error ? (
        <ErrorAlert
          message={error}
          title="Error Loading Reports"
          onDismiss={() => setError("")}
        />
      ) : filteredReports.length === 0 ? (
        <EmptyState
          hasFilters={searchQuery || statusFilter}
          onClearFilters={resetFilters}
          primaryMessage="No reports found"
          customMessage={
            searchQuery || statusFilter
              ? "Try adjusting your search or filters"
              : "No active reports available"
          }
        />
      ) : (
        <>
          <ReportTable
            reports={currentReports}
            selectedReports={selectedReports}
            currentUser={user}
            onToggleSelection={handleToggleSelection}
            onToggleSelectAll={handleToggleSelectAll}
            customActions={customActions}
            bulkAction={bulkAction}
            canPerformAction={canPerformAction}
            className="overflow-hidden shadow-xl rounded-xl animate-fade-in"
          />
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 animate-fade-in">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={reportsPerPage}
              />
            </div>
          )}
        </>
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() =>
          confirmAction === "bulk" ? handleBulkAction() : handleAction(confirmAction, selectedReportId)
        }
        action={confirmAction === "bulk" ? bulkAction : confirmAction}
        itemName={
          confirmAction === "bulk"
            ? `${selectedReports.length} reports`
            : localReports.find((r) => r._id === selectedReportId)?.name || "this report"
        }
        additionalMessage={
          confirmAction === "delete" || (confirmAction === "bulk" && bulkAction === "delete") ? (
            <p className="text-sm text-gray-600">This will permanently delete the report(s).</p>
          ) : confirmAction === "approve" || (confirmAction === "bulk" && bulkAction === "approve") ? (
            <p className="text-sm text-gray-600">This will approve the report(s).</p>
          ) : null
        }
        className="shadow-xl rounded-xl"
      />
<Modal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        title="Find Potential Matches"
        className="shadow-xl rounded-2xl"
        report={selectedReport}
        onMatchAction={handleMatchAction}
        isActionLoading={isActionLoading}
      >
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-8 h-8 text-[#ffc929] animate-spin" />
          </div>
        ) : potentialMatches.length === 0 ? (
          <div className="p-6 text-center">
            <PawPrint className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-sm font-semibold text-gray-500">No matches found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {potentialMatches.map((match) => {
              const formatDate = (dateString) => {
                if (!dateString || isNaN(new Date(dateString).getTime())) {
                  return "Invalid date";
                }
                return new Date(dateString).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              };

              const toggleExpanded = () => {
                setExpandedMatches((prev) => ({
                  ...prev,
                  [match._id]: !prev[match._id],
                }));
              };

              const isExpanded = expandedMatches[match._id] || false;

              // MapViewer coordinates logic (mirroring ReportTable)
              let position = null;
              let coordinates = null;
              if (match.location?.coordinates?.type === "Point" && Array.isArray(match.location.coordinates.coordinates)) {
                coordinates = match.location.coordinates.coordinates;
              } else if (Array.isArray(match.location?.coordinates)) {
                coordinates = match.location.coordinates;
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
              console.log(`Match ${match._id} MapViewer props:`, { position, location: match.location, coordinates });

              return (
                <div
                  key={match._id}
                  className="p-6 transition-all duration-200 bg-white border shadow-sm rounded-xl hover:shadow-md"
                  role="region"
                  aria-labelledby={`match-title-${match._id}`}
                >
                  <h3
                    className="mb-2 text-lg font-semibold text-gray-800"
                    id={`match-title-${match._id}`}
                  >
                    {match.name || "Unnamed"} ({match.type})
                  </h3>

                  {/* Primary Photo and Basic Info */}
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={match.photos[0] || DEFAULT_PET_IMAGE}
                        alt={match.name || "Pet"}
                        className="object-cover w-full h-48 rounded-lg ring-1 ring-pink-300"
                        onError={(e) => (e.target.src = DEFAULT_PET_IMAGE)}
                      />
                      {match.photos?.length > 1 && (
                        <span className="absolute px-2 py-1 text-xs font-medium text-white rounded-full top-2 right-2 bg-black/50 backdrop-blur-sm">
                          {match.photos.length} photos
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-600">Species:</span>
                        <span className="text-gray-600">{match.species || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-600">Family:</span>
                        <span className="text-gray-600">{match.breed || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-600">Colors:</span>
                        <span className="text-gray-600">
                          {Array.isArray(match.color) && match.color.length > 0
                            ? match.color.join(", ")
                            : "Not specified"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-600">Location:</span>
                        <span className="text-gray-600">{match.location?.governorate || "Unknown"}</span>
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={toggleExpanded}
                      className="w-full px-4 py-2 text-sm font-semibold text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100 focus:ring-2 focus:ring-blue-400"
                      aria-expanded={isExpanded}
                      aria-controls={`match-details-${match._id}`}
                    >
                      {isExpanded ? "Hide Details" : "Show All Details"}
                    </button>

                    {/* Confirm Match Button */}
                    <button
                      onClick={() => handleMatchAction(selectedReport?._id, match._id)}
                      className="flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white transition-colors rounded-lg bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 focus:ring-2 focus:ring-pink-400 disabled:opacity-50"
                      disabled={isActionLoading}
                      aria-label={`Confirm match with ${match.name || "Unnamed"}`}
                    >
                      {isActionLoading ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Link className="w-5 h-5 mr-2" />
                      )}
                      Confirm Match
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div id={`match-details-${match._id}`} className="pt-4 mt-6 space-y-6 border-t border-gray-200">
                      {/* Pet Information */}
                      <div>
                        <h4 className="flex items-center mb-3 text-base font-semibold text-gray-800">
                          <Heart className="w-5 h-5 mr-2 text-blue-500" />
                          Pet Information
                        </h4>
                        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <span className="font-medium">Age:</span>
                            <span className="ml-2 text-gray-600">{match.age || "Unknown"}</span>
                          </div>
                          <div>
                            <span className="font-medium">Gender:</span>
                            <span className="ml-2 text-gray-600">{match.gender || "Unknown"}</span>
                          </div>
                          <div>
                            <span className="font-medium">Size:</span>
                            <span className="ml-2 text-gray-600">{match.size || "Not specified"}</span>
                          </div>
                          <div>
                            <span className="font-medium">Microchip:</span>
                            <span className="ml-2 text-gray-600">{match.microchipNumber || "None"}</span>
                          </div>
                          <div>
                            <span className="font-medium">Pregnancy:</span>
                            <span className="ml-2 text-gray-600">{match.isPregnant ? "Yes" : "No"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div>
                        <h4 className="flex items-center mb-3 text-base font-semibold text-gray-800">
                          <User className="w-5 h-5 mr-2 text-orange-500" />
                          Contact Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">Name:</span>
                            <span className="ml-2 text-gray-600">{match.owner?.fullName || match.email || "Not provided"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">Phone:</span>
                            <span className="ml-2 text-gray-600">{match.phoneNumber || "Not provided"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">Email:</span>
                            <span className="ml-2 text-gray-600 break-words">{match.email || "Not provided"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Location Details */}
                      <div>
                        <h4 className="flex items-center mb-3 text-base font-semibold text-gray-800">
                          <MapPin className="w-5 h-5 mr-2 text-red-500" />
                          Location Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Delegation:</span>
                            <span className="ml-2 text-gray-600">{match.location?.delegation || "Not provided"}</span>
                          </div>
                          <div>
                            <span className="font-medium">Governorate:</span>
                            <span className="ml-2 text-gray-600">{match.location?.governorate || "Not provided"}</span>
                          </div>
                          <div>
                            <span className="font-medium">Coordinates:</span>
                            <span className="ml-2 text-gray-600">
                              {coordinates ? `[${coordinates.join(", ")}]` : "Not available"}
                            </span>
                          </div>
                          <div className="p-4 mt-2 border border-pink-200 rounded-lg shadow-sm bg-white/70">
                            {position ? (
                              <div className="space-y-2">
                                <div
                                  id={`map-match-${match._id}`}
                                  className="w-full h-64 overflow-hidden bg-gray-100 border border-pink-200 rounded-lg shadow-sm"
                                >
                                  <MapViewer position={position} />
                                </div>
                                <a
                                  href={`https://www.google.com/maps?q=${position.lat},${position.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-yellow-500 hover:text-pink-500 hover:underline"
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

                      {/* Description */}
                      <div>
                        <h4 className="flex items-center mb-3 text-base font-semibold text-gray-800">
                          <FileText className="w-5 h-5 mr-2 text-blue-500" />
                          Description
                        </h4>
                        <div className="p-4 border rounded-lg bg-white/70">
                          <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                            {match.description || "No description provided."}
                          </p>
                        </div>
                      </div>

                      {/* Status & Timeline */}
                      <div>
                        <h4 className="flex items-center mb-3 text-base font-semibold text-gray-800">
                          <Clock className="w-5 h-5 mr-2 text-violet-500" />
                          Status & Timeline
                        </h4>
                        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <span className="font-medium">Status:</span>
                            <span
                              className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeStyle(match.status)}`}
                            >
                              {match.status}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Approval:</span>
                            <span
                              className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full ${
                                match.isApproved
                                  ? "bg-gradient-to-r from-yellow-100 to-pink-100 text-yellow-800 border border-yellow-200"
                                  : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200"
                              }`}
                            >
                              {match.isApproved ? "Approved" : "Pending"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">{match.type === "Lost" ? "Last Seen" : "Found Date"}:</span>
                            <span className="ml-2 text-gray-600">{formatDate(match.date)}</span>
                          </div>
                          {match.updatedAt && (
                            <div>
                              <span className="font-medium">Last Updated:</span>
                              <span className="ml-2 text-gray-600">{formatDate(match.updatedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Photos */}
                      {match.photos && match.photos.length > 1 && (
                        <div>
                          <h4 className="flex items-center mb-3 text-base font-semibold text-gray-800">
                            <PawPrint className="w-5 h-5 mr-2 text-purple-500" />
                            Additional Photos
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {match.photos.map((photo, index) => (
                              <img
                                key={`photo-${match._id}-${index}`}
                                src={photo}
                                alt={`Match photo ${index + 1}`}
                                className="object-cover w-24 h-24 border border-gray-300 rounded-lg"
                                onError={(e) => (e.target.src = DEFAULT_PET_IMAGE)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ActiveReports;