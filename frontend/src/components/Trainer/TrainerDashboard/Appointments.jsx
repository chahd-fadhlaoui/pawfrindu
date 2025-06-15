import { debounce } from "lodash";
import {
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  Filter,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useApp } from "../../../context/AppContext";
import axiosInstance from "../../../utils/axiosInstance";
import { AppointmentCard } from "./apointment/AppointmentCard";
import { DeleteModal } from "./apointment/DeleteModal";
import { StatusUpdateModal } from "./apointment/StatusUpdateModal";
import SortButton from "./common/SortButton";
import UnavailableModal from "../../vet/vetDashboardManagment/AppointmentsManagment/UnavailableModal";

const FilterBadge = ({ label, value, onClear }) => (
  <div className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 border border-[#ffc929]/20 rounded-full shadow-sm">
    <span>
      {label}: {value}
    </span>
    <button
      onClick={onClear}
      className="ml-1 text-[#ffc929] hover:text-pink-500 focus:outline-none"
      aria-label={`Clear ${label} filter`}
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

export default function TrainerAppointmentDashboard({ isSidebarCollapsed }) {
  const { socket, user } = useApp();
  const [expandedId, setExpandedId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState(null);
  const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("No authentication token found. Please log in.");
      const response = await axiosInstance.get(
        "/api/appointments/trainer-appointments",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        const fetchedAppointments = response.data.appointments
          .map((appt) => {
            const apptId = appt._id || appt.id;
            if (!apptId) return null;
            return {
              ...appt,
              id: apptId.toString(),
              isPlatformPet: !!appt.petId,
              petName: appt.petName || "Unknown",
              petType: appt.petType || "Unknown",
              species: appt.petType || "Unknown",
              breed: appt.breed || "Unknown",
              petAge: appt.petAge || "Unknown",
              gender: appt.gender || "Unknown",
              city: appt.city || "Unknown",
              isTrained: appt.isTrained ?? false,
              image: appt.image || null,
              fee: appt.fee || null,
              cancellationReason: appt.cancellationReason || null,
              completionNotes: appt.completionNotes || null,
              petId: appt.petId?.toString() || null,
              ownerName:
                appt.petOwnerId?.fullName || appt.owner?.fullName || "Unknown",
              phone:
                appt.petOwnerId?.petOwnerDetails?.phone ||
                appt.owner?.phone ||
                "",
              email: appt.petOwnerId?.email || appt.owner?.email || "",
              address:
                appt.petOwnerId?.petOwnerDetails?.address ||
                appt.owner?.address ||
                "",
              provider:
                appt.professionalId?.fullName || user?.fullName || "Unknown",
              createdAt:
                appt.createdAt || new Date().toLocaleDateString("en-US"),
            };
          })
          .filter((appt) => appt !== null);

        const uniqueIds = new Set(fetchedAppointments.map((appt) => appt.id));
        if (fetchedAppointments.length !== uniqueIds.size) {
          throw new Error("Duplicate appointment IDs found");
        }
        setAppointments(fetchedAppointments);
        setError(null);
      } else {
        setError(response.data.message || "Failed to load training sessions");
        toast.error(
          response.data.message || "Failed to load training sessions",
          {
            position: "top-right",
            autoClose: 3000,
            theme: "light",
          }
        );
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to load training sessions";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    id,
    newStatus,
    reason = null,
    completionNotes = null
  ) => {
    if (!id || typeof id !== "string" || id.length !== 24) {
      toast.error("Invalid appointment ID", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
      return;
    }
    try {
      const payload = { status: newStatus };
      if (reason) payload.reason = reason;
      if (newStatus === "completed" && completionNotes)
        payload.completionNotes = completionNotes;
      const response = await axiosInstance.put(
        `/api/appointments/update-status/${id}`,
        payload
      );
      if (response.data.success) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === id
              ? {
                  ...appt,
                  status: newStatus,
                  cancellationReason: reason || null,
                  completionNotes:
                    newStatus === "completed" ? completionNotes || "" : null,
                  isNew: false,
                  updatedAt: new Date().toLocaleDateString("en-US"),
                }
              : appt
          )
        );
        toast.success(`Training session ${newStatus}`, {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
      } else {
        toast.error(response.data.message || "Failed to update status", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
      }
    } catch (err) {
      const errorMessage =
        err.response?.status === 400
          ? err.response.data.message || "Invalid status update"
          : err.response?.status === 403
          ? "You are not authorized to update this session"
          : err.response?.status === 404
          ? "Training session not found"
          : "Error updating status";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    } finally {
      setStatusUpdateModal(null);
      setDeleteModal(null);
    }
  };

  const setupSocketListeners = useCallback(() => {
    if (!socket || !user?._id) return;
    socket.on("connect", () => socket.emit("joinRoom", user._id.toString()));
    socket.on("appointmentBooked", (data) => {
      const trainerId = user._id.toString();
      const professionalId = (
        data.professionalId?._id || data.professionalId
      )?.toString();
      if (professionalId === trainerId) {
        const apptId = data._id || data.id;
        if (!apptId) return;
        const newAppointment = {
          id: apptId.toString(),
          petName: data.petName || "Unknown",
          petType: data.petType || "Unknown",
          species: data.petType || "Unknown",
          petAge: data.petAge || "Unknown",
          breed: data.breed || "Unknown",
          gender: data.gender || "Unknown",
          city: data.city || "Unknown",
          isTrained: data.isTrained ?? false,
          ownerName:
            data.petOwnerId?.fullName || data.owner?.fullName || "Unknown",
          phone:
            data.petOwnerId?.petOwnerDetails?.phone || data.owner?.phone || "",
          email: data.petOwnerId?.email || data.owner?.email || "",
          address:
            data.petOwnerId?.petOwnerDetails?.address ||
            data.owner?.address ||
            "",
          date: data.date,
          time: data.time,
          duration: data.duration || "60 minutes",
          reason: data.reason || "Training Session",
          provider: data.professionalId?.fullName || user.fullName || "Unknown",
          status: data.status || "pending",
          notes: data.notes || "",
          createdAt: new Date().toLocaleDateString("en-US"),
          updatedAt: new Date().toLocaleDateString("en-US"),
          isNew: true,
          isPlatformPet: !!data.petId,
          image: data.image || null,
          fee: data.fee || null,
          petId: data.petId?.toString() || null,
        };
        setAppointments((prev) =>
          [newAppointment, ...prev].sort(
            (a, b) =>
              new Date(a.date) - new Date(b.date) ||
              a.time.localeCompare(b.time)
          )
        );
        toast.success(`New training session booked for ${data.petName}`, {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
      }
    });
    socket.on("appointmentConfirmed", (data) => {
      const appointmentId = (data.appointmentId || data.id)?.toString();
      if (!appointmentId) return;
      if (data.professionalId?.toString() === user._id.toString()) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === appointmentId
              ? {
                  ...appt,
                  status: "confirmed",
                  isNew: false,
                  updatedAt: new Date().toLocaleDateString("en-US"),
                  cancellationReason: null,
                  completionNotes: null,
                }
              : appt
          )
        );
        toast.success("Training session confirmed", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
      }
    });
    socket.on("appointmentCancelled", (data) => {
      const trainerId = user._id.toString();
      const professionalId = (
        data.professionalId?._id || data.professionalId
      )?.toString();
      const appointmentId = (data.appointmentId || data.id)?.toString();
      if (!appointmentId || professionalId !== trainerId) return;
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId
            ? {
                ...appt,
                status: "cancelled",
                cancellationReason: data.cancellationReason || null,
                completionNotes: null,
                updatedAt: new Date().toLocaleDateString("en-US"),
              }
            : appt
        )
      );
      toast.warn("Training session cancelled", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    });
    socket.on("appointmentNotAvailable", (data) => {
      const trainerId = user._id.toString();
      const professionalId = (
        data.professionalId?._id || data.professionalId
      )?.toString();
      const appointmentId = (data.appointmentId || data.id)?.toString();
      if (!appointmentId || professionalId !== trainerId) return;
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId
            ? {
                ...appt,
                status: "notAvailable",
                cancellationReason: data.cancellationReason || null,
                completionNotes: null,
                updatedAt: new Date().toLocaleDateString("en-US"),
              }
            : appt
        )
      );
      toast.warn("Training session marked as not available", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    });
    socket.on("appointmentCompleted", (data) => {
      const trainerId = user._id.toString();
      const professionalId = (
        data.professionalId?._id || data.professionalId
      )?.toString();
      const appointmentId = (data.appointmentId || data.id)?.toString();
      if (!appointmentId || professionalId !== trainerId) return;
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId
            ? {
                ...appt,
                status: "completed",
                completionNotes: data.completionNotes || null,
                cancellationReason: null,
                updatedAt: new Date().toLocaleDateString("en-US"),
              }
            : appt
        )
      );
      toast.success("Training session completed", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    });
    socket.on("appointmentUpdated", (data) => {
      const trainerId = user._id.toString();
      const professionalId = (
        data.professionalId?._id || data.professionalId
      )?.toString();
      const appointmentId = (data.appointmentId || data.id)?.toString();
      if (!appointmentId || professionalId !== trainerId) return;
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId
            ? {
                ...appt,
                status: data.status,
                cancellationReason: data.cancellationReason || null,
                completionNotes: data.completionNotes || null,
                updatedAt: new Date().toLocaleDateString("en-US"),
              }
            : appt
        )
      );
      toast.info("Training session updated", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    });
    if (!socket.connected) socket.connect();
  }, [socket, user]);

  useEffect(() => {
    fetchAppointments();
    setupSocketListeners();
    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("appointmentBooked");
        socket.off("appointmentConfirmed");
        socket.off("appointmentCancelled");
        socket.off("appointmentNotAvailable");
        socket.off("appointmentCompleted");
        socket.off("appointmentUpdated");
      }
    };
  }, [setupSocketListeners]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        setSearchQuery(query);
      }, 300),
    []
  );

  // Memoized filtered appointments
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    if (activeFilter !== "all") {
      filtered = filtered.filter((appt) => appt.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (appt) =>
          (appt.petName || "").toLowerCase().includes(query) ||
          (appt.ownerName || "").toLowerCase().includes(query) ||
          (appt.breed || "").toLowerCase().includes(query) ||
          (appt.city || "").toLowerCase().includes(query)
      );
    }

    // Sort by date and time
    return filtered.sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time)
    );
  }, [appointments, activeFilter, searchQuery]);

  const clearFilter = (filterType) => {
    switch (filterType) {
      case "status":
        setActiveFilter("all");
        break;
      case "search":
        setSearchQuery("");
        break;
      default:
        break;
    }
  };

  const clearAllFilters = () => {
    setActiveFilter("all");
    setSearchQuery("");
    setIsFilterOpen(false);
  };

  const handleAction = (action, id) => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) {
      toast.error("Appointment not found", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
      return;
    }
    if (action === "confirm") {
      if (
        !appt.isPlatformPet &&
        (!appt.petName ||
          !appt.petType ||
          appt.petName === "Unknown" ||
          appt.petType === "Unknown")
      ) {
        toast.warn("Cannot confirm non-platform pet with incomplete details", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
        return;
      }
      handleStatusUpdate(appt.id, "confirmed");
    } else if (action === "notAvailable") {
      handleStatusUpdate(appt.id, "notAvailable");
    } else if (action === "cancel") {
      setDeleteModal(appt);
    } else if (action === "updateStatus") {
      if (appt.status === "cancelled") {
        setStatusUpdateModal(appt);
      }
    } else if (action === "complete") {
      if (appt.status === "confirmed") {
        handleStatusUpdate(appt.id, "completed");
      } else {
        toast.warn("Only confirmed sessions can be completed", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
      }
    }
  };

  if (loading) {
    return (
      <div
        className={`flex-1 p-4 sm:p-6 space-y-6 items-center bg-gradient-to-br from-yellow-50 to-pink-50 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-0 md:ml-64"
        }`}
      >
        <Loader2 className="w-10 h-10 text-[#ffc929] animate-spin" />
        <span className="ml-3 text-base text-gray-700">
          Loading training sessions...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-0 md:ml-64"
        }`}
      >
        <div className="max-w-md p-6 text-center bg-white border border-gray-100 rounded-lg shadow-sm">
          <X className="w-8 h-8 mx-auto mb-3 text-[#ffc929]" />
          <h2 className="mb-2 text-lg font-semibold text-gray-800">Error</h2>
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={fetchAppointments}
            className="px-4 py-2 mt-4 text-sm font-medium rounded-md bg-gradient-to-r from-yellow-500 to-pink-500 text-white hover:bg-[#ffa726] transition-transform transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main
      className={`flex-1 p-4 sm:p-6 space-y-6 transition-all duration-300 ease-in-out bg-gradient-to-br from-yellow-50 to-pink-50 ${
        isSidebarCollapsed ? "ml-16" : "ml-0 md:ml-64"
      }`}
    >
      <section className="overflow-hidden bg-white border border-gray-100 rounded-lg shadow-sm">
        <div
          className="px-6 py-4 border-l-4"
          style={{
            borderImage: "linear-gradient(to bottom, #ffc929, #ffa726) 1",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center p-2 rounded-lg bg-yellow-50">
              <CalendarClock className="w-6 h-6 text-[#ffc929]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Training Sessions
              </h1>
              <p className="text-sm text-gray-500">Manage your appointments</p>
            </div>
          </div>
        </div>
        {!user.isActive && (
          <div className="flex items-center gap-3 p-3 border-b border-red-100 bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-red-700">
              Your account is deactivated. Appointments are disabled until
              reactivated.
            </p>
          </div>
        )}
        <div className="p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white backdrop-blur-sm bg-opacity-90 border border-[#ffc929]/20 shadow-sm rounded-lg p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-yellow-500 to-pink-500 rounded-md shadow-md hover:bg-[#ffa726] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                  aria-label={isFilterOpen ? "Hide filters" : "Show filters"}
                >
                  <Filter className="w-4 h-4" />
                  {isFilterOpen ? "Hide Filters" : "Show Filters"}
                </button>
                <div className="relative flex items-center w-full sm:w-auto">
                  <Search className="absolute left-3 w-5 h-5 text-[#ffc929]" />
                  <input
                    type="text"
                    placeholder="Search pets, owners, breeds, or cities..."
                    className="w-full sm:w-64 pl-10 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ffc929] focus:outline-none transition-all text-sm text-gray-700"
                    value={searchQuery}
                    onChange={(e) => debouncedSearch(e.target.value)}
                    aria-label="Search training sessions"
                  />
                  <button
                    onClick={() => setIsUnavailableModalOpen(true)}
                    className="flex items-center px-4 py-2 ml-10 text-sm font-medium text-white transition-all rounded-md shadow-md bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Manage My Schedule
                  </button>
                  {searchQuery && (
                    <button
                      onClick={() => clearFilter("search")}
                      className="absolute right-3 p-1 text-gray-600 hover:text-[#ffc929] focus:outline-none"
                      aria-label="Clear search"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <span className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 border border-[#ffc929]/20 rounded-full shadow-inner">
                  <CalendarClock className="w-4 h-4 text-[#ffc929]" />
                  {filteredAppointments.length} Sessions
                </span>
              </div>
              <div
                className={`flex flex-wrap gap-2 mt-4 transition-all duration-300 ease-in-out ${
                  isFilterOpen
                    ? "max-h-[100px] opacity-100"
                    : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                {[
                  { label: "All", value: "all" },
                  { label: "Pending", value: "pending" },
                  { label: "Confirmed", value: "confirmed" },
                  { label: "Completed", value: "completed" },
                  { label: "Cancelled", value: "cancelled" },
                  { label: "Not Available", value: "notAvailable" },
                ].map((option) => (
                  <SortButton
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    isActive={activeFilter === option.value}
                    onClick={() => {
                      setActiveFilter(option.value);
                    }}
                  />
                ))}
              </div>
              {(activeFilter !== "all" || searchQuery) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-sm font-medium text-gray-600">
                    Applied Filters:
                  </span>
                  {activeFilter !== "all" && (
                    <FilterBadge
                      label="Status"
                      value={
                        activeFilter.charAt(0).toUpperCase() +
                        activeFilter.slice(1)
                      }
                      onClear={() => clearFilter("status")}
                    />
                  )}
                  {searchQuery && (
                    <FilterBadge
                      label="Search"
                      value={searchQuery}
                      onClear={() => clearFilter("search")}
                    />
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-1.5 ml-2 text-sm font-medium text-[#ffc929] bg-[#ffc929]/10 hover:bg-[#ffc929]/20 transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
                    aria-label="Clear all filters"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
            {filteredAppointments.length > 0 ? (
              <div className="space-y-2">
                {filteredAppointments.map((appt) =>
                  appt.id ? (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      isExpanded={expandedId === appt.id}
                      toggleExpand={() =>
                        setExpandedId(expandedId === appt.id ? null : appt.id)
                      }
                      onAction={handleAction}
                      professionalType="Trainer"
                    />
                  ) : null
                )}
              </div>
            ) : (
              <div className="py-6 text-center">
                <AlertCircle className="w-10 h-10 mx-auto mb-3 text-[#ffc929]" />
                <h3 className="text-lg font-semibold text-gray-800">
                  No Training Sessions Found
                </h3>
                <p className="text-sm text-gray-600">
                  Try adjusting your search or filters.
                </p>
                {(searchQuery || activeFilter !== "all") && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 mt-4 text-sm font-medium rounded-md bg-gradient-to-r from-yellow-500 to-pink-500 text-white hover:bg-[#ffa726] transition-transform transform hover:scale-105"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      {deleteModal && deleteModal.id && (
        <DeleteModal
          appointment={deleteModal}
          onConfirm={() => handleStatusUpdate(deleteModal.id, "cancelled")}
          onClose={() => setDeleteModal(null)}
        />
      )}
      {statusUpdateModal && statusUpdateModal.id && (
        <StatusUpdateModal
          appointment={statusUpdateModal}
          onSubmit={(status, reason, completionNotes) =>
            handleStatusUpdate(
              statusUpdateModal.id,
              status,
              reason,
              completionNotes
            )
          }
          onClose={() => setStatusUpdateModal(null)}
        />
      )}
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      {isUnavailableModalOpen && (
      <UnavailableModal
        professional={user}
        onClose={() => setIsUnavailableModalOpen(false)}
        onSuccess={() => {
          toast.success("Availability updated", { position: "top-right", autoClose: 3000, theme: "light" });
          setIsUnavailableModalOpen(false);
        }}
      />
)}
    </main>
  );
}
