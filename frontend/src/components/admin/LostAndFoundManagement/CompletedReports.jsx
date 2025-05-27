import {
    CheckCircle,
    Loader2,
    PawPrint,
    Search,
    Unlink,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../../context/AppContext";
import axiosInstance from "../../../utils/axiosInstance";
import ConfirmationModal from "../../ConfirmationModal";
import EmptyState from "../../EmptyState";
import { ErrorAlert } from "../common/ErrorAlert";
import { PaginationControls } from "../common/PaginationControls";
import { FilterSelect } from "./common/FilterSelect";
import ReportTable from "./ReportTable";

const DEFAULT_PET_IMAGE = "/images/default-pet.png";

const CompletedReports = () => {
  const { user, socket } = useApp();
  const [reports, setReports] = useState([]);
  const [localReports, setLocalReports] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const reportsPerPage = 10;

  const statusOptions = [
    { value: "Matched", label: "Matched" },
    { value: "Reunited", label: "Reunited" },
  ];

  const bulkActionOptions = [
    { value: "unmatch", label: "Unmatch" },
    { value: "reunited", label: "Reunited" },
  ];

  const canPerformAction = (report, action) => {
    if (!user || user?.role !== "Admin") return false;
    switch (action) {
      case "unmatch":
        return report.status === "Matched";
      case "reunited":
        return report.status === "Matched";
      default:
        return false;
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/lost-and-found");
      const completedReports = response.data.data.filter(
        (r) => ["Matched", "Reunited"].includes(r.status)
      );
      setReports(completedReports);
      setLocalReports(completedReports);
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

    socket.on("reportMatched", fetchReports);
    socket.on("reportUnmatched", fetchReports);
    socket.on("reportReunited", fetchReports);

    return () => {
      socket.off("reportMatched");
      socket.off("reportUnmatched");
      socket.off("reportReunited");
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
              status: action === "reunited" ? "Reunited" : action === "unmatch" ? "Pending" : r.status,
              matchedReport: action === "unmatch" ? null : r.matchedReport,
            }
          : r
      );
      setLocalReports(optimisticReports);

      const url =
        action === "unmatch"
          ? `/api/lost-and-found/${reportId}/unmatch`
          : `/api/lost-and-found/${reportId}/reunited`;

      await axiosInstance.put(url);

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

      const optimisticReports = localReports.map((r) =>
        eligibleReports.includes(r._id)
          ? {
              ...r,
              status: bulkAction === "reunited" ? "Reunited" : bulkAction === "unmatch" ? "Pending" : r.status,
              matchedReport: bulkAction === "unmatch" ? null : r.matchedReport,
            }
          : r
      );
      setLocalReports(optimisticReports);
      setSelectedReports([]);

      const promises = eligibleReports.map((id) => {
        const url =
          bulkAction === "unmatch"
            ? `/api/lost-and-found/${id}/unmatch`
            : `/api/lost-and-found/${id}/reunited`;
        return axiosInstance.put(url);
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
      {report.status === "Matched" && (
        <div
          className="relative"
          onMouseEnter={() => setHoveredAction(`unmatch-${report._id}`)}
          onMouseLeave={() => setHoveredAction(null)}
        >
          <button
            onClick={() => handleSingleAction("unmatch", report._id)}
            disabled={isActionLoading}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800"
          >
            <Unlink className="w-3 h-3" />
            Unmatch
          </button>
          {hoveredAction === `unmatch-${report._id}` && (
            <div className="absolute right-0 z-10 px-3 py-2 mt-2 text-xs text-white bg-gray-800 rounded-md shadow-lg top-full animate-fade-in-up">
              <div className="flex items-center gap-1">
                <span>Remove match</span>
              </div>
            </div>
          )}
        </div>
      )}
      {report.status === "Matched" && (
        <div
          className="relative"
          onMouseEnter={() => setHoveredAction(`reunited-${report._id}`)}
          onMouseLeave={() => setHoveredAction(null)}
        >
          <button
            onClick={() => handleSingleAction("reunited", report._id)}
            disabled={isActionLoading}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800"
          >
            <CheckCircle className="w-3 h-3" />
            Reunited
          </button>
          {hoveredAction === `reunited-${report._id}` && (
            <div className="absolute right-0 z-10 px-3 py-2 mt-2 text-xs text-white bg-gray-800 rounded-md shadow-lg top-full animate-fade-in-up">
              <div className="flex items-center gap-1">
                <span>Mark as reunited</span>
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
                    {bulkAction === "unmatch" && <Unlink className="w-4 h-4" />}
                    {bulkAction === "reunited" && <CheckCircle className="w-4 h-4" />}
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
              : "No completed reports available"
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
          confirmAction === "unmatch" || (confirmAction === "bulk" && bulkAction === "unmatch") ? (
            <p className="text-sm text-gray-600">This will remove the match from the report(s).</p>
          ) : confirmAction === "reunited" || (confirmAction === "bulk" && bulkAction === "reunited") ? (
            <p className="text-sm text-gray-600">This will mark the report(s) as reunited.</p>
          ) : null
        }
        className="shadow-xl rounded-xl"
      />
    </div>
  );
};

export default CompletedReports;