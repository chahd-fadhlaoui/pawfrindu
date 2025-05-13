import { AlertTriangle, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "../../../context/AppContext";
import {
  AppointmentCard,
  DeleteModal,
  StatusUpdateModal,
  ToastContainer
} from "../../../utils/appointmentUtils";
import axiosInstance from "../../../utils/axiosInstance";

export default function TrainerAppointmentDashboard() {
  const { socket, user } = useApp();
  const [expandedId, setExpandedId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 5000);
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please log in.");
      const response = await axiosInstance.get("/api/appointments/trainer-appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
              ownerName: appt.petOwnerId?.fullName || appt.owner?.fullName || "Unknown",
              phone: appt.petOwnerId?.petOwnerDetails?.phone || appt.owner?.phone || "",
              email: appt.petOwnerId?.email || appt.owner?.email || "",
              address: appt.petOwnerId?.petOwnerDetails?.address || appt.owner?.address || "",
              provider: appt.professionalId?.fullName || user?.fullName || "Unknown",
              createdAt: appt.createdAt || new Date().toLocaleDateString("en-US"),
            };
          })
          .filter((appt) => appt !== null);

        const uniqueIds = new Set(fetchedAppointments.map((appt) => appt.id));
        if (fetchedAppointments.length !== uniqueIds.size) {
          throw new Error("Duplicate appointment IDs found");
        }
        setAppointments(fetchedAppointments);
        setFilteredAppointments(fetchedAppointments);
        setError(null);
      } else {
        setError(response.data.message || "Failed to load training sessions");
      }
    } catch (err) {
      setError(err.message || "Failed to load training sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus, reason = null, completionNotes = null) => {
    if (!id || typeof id !== "string" || id.length !== 24) {
      addToast("Invalid appointment ID", "error");
      return;
    }
    try {
      const payload = { status: newStatus };
      if (reason) payload.reason = reason;
      if (newStatus === "completed" && completionNotes) payload.completionNotes = completionNotes;
      const response = await axiosInstance.put(`/api/appointments/update-status/${id}`, payload);
      if (response.data.success) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === id
              ? {
                  ...appt,
                  status: newStatus,
                  cancellationReason: reason || null,
                  completionNotes: newStatus === "completed" ? (completionNotes || "") : null,
                  isNew: false,
                  updatedAt: new Date().toLocaleDateString("en-US"),
                }
              : appt
          )
        );
        setFilteredAppointments((prev) => {
          const updated = prev.map((appt) =>
            appt.id === id
              ? {
                  ...appt,
                  status: newStatus,
                  cancellationReason: reason || null,
                  completionNotes: newStatus === "completed" ? (completionNotes || "") : null,
                  isNew: false,
                  updatedAt: new Date().toLocaleDateString("en-US"),
                }
              : appt
          );
          return activeFilter === "all" || activeFilter === newStatus
            ? updated
            : prev.filter((appt) => appt.status === activeFilter);
        });
        addToast(`Training session ${newStatus}`, "success");
      } else {
        addToast(response.data.message || "Failed to update status", "error");
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
      addToast(errorMessage, "error");
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
      const professionalId = (data.professionalId?._id || data.professionalId)?.toString();
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
          ownerName: data.petOwnerId?.fullName || data.owner?.fullName || "Unknown",
          phone: data.petOwnerId?.petOwnerDetails?.phone || data.owner?.phone || "",
          email: data.petOwnerId?.email || data.owner?.email || "",
          address: data.petOwnerId?.petOwnerDetails?.address || data.owner?.address || "",
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
            (a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time)
          )
        );
        setFilteredAppointments((prev) => {
          const updated = [newAppointment, ...prev].sort(
            (a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time)
          );
          return activeFilter === "all" || activeFilter === "pending" ? updated : prev;
        });
        addToast(`New training session for ${data.petName} booked`, "success");
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
        setFilteredAppointments((prev) => {
          const updated = prev.map((appt) =>
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
          );
          return activeFilter === "all" || activeFilter === "confirmed"
            ? updated
            : prev.filter((appt) => appt.status === activeFilter);
        });
        addToast(`Training session confirmed`, "success");
      }
    });
    socket.on("appointmentCancelled", (data) => {
      const trainerId = user._id.toString();
      const professionalId = (data.professionalId?._id || data.professionalId)?.toString();
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
      setFilteredAppointments((prev) => {
        const updated = prev.map((appt) =>
          appt.id === appointmentId
            ? {
                ...appt,
                status: "cancelled",
                cancellationReason: data.cancellationReason || null,
                completionNotes: null,
                updatedAt: new Date().toLocaleDateString("en-US"),
              }
            : appt
        );
        return activeFilter === "all" || activeFilter === "cancelled"
          ? updated
          : prev.filter((appt) => appt.status === activeFilter);
      });
      addToast(`Training session cancelled`, "warning");
    });
    socket.on("appointmentNotAvailable", (data) => {
      const trainerId = user._id.toString();
      const professionalId = (data.professionalId?._id || data.professionalId)?.toString();
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
      setFilteredAppointments((prev) => {
        const updated = prev.map((appt) =>
          appt.id === appointmentId
            ? {
                ...appt,
                status: "notAvailable",
                cancellationReason: data.cancellationReason || null,
                completionNotes: null,
                updatedAt: new Date().toLocaleDateString("en-US"),
              }
            : appt
        );
        return activeFilter === "all" || activeFilter === "notAvailable"
          ? updated
          : prev.filter((appt) => appt.status === activeFilter);
      });
      addToast(`Training session marked as not available`, "warning");
    });
    socket.on("appointmentCompleted", (data) => {
      const trainerId = user._id.toString();
      const professionalId = (data.professionalId?._id || data.professionalId)?.toString();
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
      setFilteredAppointments((prev) => {
        const updated = prev.map((appt) =>
          appt.id === appointmentId
            ? {
                ...appt,
                status: "completed",
                completionNotes: data.completionNotes || null,
                cancellationReason: null,
                updatedAt: new Date().toLocaleDateString("en-US"),
              }
            : appt
        );
        return activeFilter === "all" || activeFilter === "completed"
          ? updated
          : prev.filter((appt) => appt.status === activeFilter);
      });
      addToast(`Training session completed`, "success");
    });
    socket.on("appointmentUpdated", (data) => {
      const trainerId = user._id.toString();
      const professionalId = (data.professionalId?._id || data.professionalId)?.toString();
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
      setFilteredAppointments((prev) => {
        const updated = prev.map((appt) =>
          appt.id === appointmentId
            ? {
                ...appt,
                status: data.status,
                cancellationReason: data.cancellationReason || null,
                completionNotes: data.completionNotes || null,
                updatedAt: new Date().toLocaleDateString("en-US"),
              }
            : appt
        );
        return activeFilter === "all" || activeFilter === data.status
          ? updated
          : prev.filter((appt) => appt.status === activeFilter);
      });
      addToast(`Training session updated`, "info");
    });
    if (!socket.connected) socket.connect();
  }, [socket, user, activeFilter]);

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

  const filterAppointments = (filter) => {
    setActiveFilter(filter);
    if (filter === "all") {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter((appt) => appt.status === filter));
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      filterAppointments(activeFilter);
      return;
    }
    const lowerTerm = term.toLowerCase();
    const filtered = appointments.filter(
      (appt) =>
        (appt.petName || "").toLowerCase().includes(lowerTerm) ||
        (appt.ownerName || "").toLowerCase().includes(lowerTerm)
    );
    setFilteredAppointments(filtered);
  };

  const handleAction = (action, id) => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) {
      addToast("Training session not found", "error");
      return;
    }
    if (action === "confirm") {
      if (
        !appt.isPlatformPet &&
        (!appt.petName || !appt.petType || appt.petName === "Unknown" || appt.petType === "Unknown")
      ) {
        addToast("Cannot confirm: Incomplete pet details", "error");
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
      } else {
        addToast("Status update only available for cancelled sessions", "info");
      }
    } else if (action === "complete") {
      if (appt.status === "confirmed") {
        handleStatusUpdate(appt.id, "completed");
      } else {
        addToast("Complete action only available for confirmed sessions", "info");
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen p-6 flex items-center justify-center">
        <div className="max-w-4xl w-full space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-100 rounded"></div>
                    <div className="h-3 w-20 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-24 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen p-6 flex items-center justify-center">
        <div className="bg-yellow-50 border-l-4 border-[#ffc929] p-6 rounded-lg flex items-center shadow-lg max-w-md w-full">
          <AlertTriangle className="w-6 h-6 text-[#ffc929] mr-3" />
          <div className="flex-1">
            <p className="text-sm text-gray-700">{error}</p>
            <button
              onClick={fetchAppointments}
              className="mt-2 text-sm bg-gradient-to-r from-yellow-500 to-pink-500 text-white px-4 py-1 rounded-lg hover:bg-[#ffa726] focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-[#ffc929]" />
            <input
              type="text"
              placeholder="Search pets or owners..."
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ffc929] focus:outline-none transition-all text-sm text-gray-700"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              aria-label="Search training sessions"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 p-1 text-gray-600 hover:text-[#ffc929] focus:outline-none"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["all", "pending", "confirmed", "cancelled", "completed", "notAvailable"].map((filter) => (
              <button
                key={filter}
                onClick={() => filterAppointments(filter)}
                className={`px-4 py-2 text-sm rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929] ${
                  activeFilter === filter
                    ? "bg-gradient-to-r from-yellow-500 to-pink-500 text-white shadow"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
                aria-label={`Filter by ${filter} appointments`}
              >
                {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appt) =>
              appt.id ? (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  isExpanded={expandedId === appt.id}
                  toggleExpand={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
                  onAction={handleAction}
                  professionalType="Trainer"
                />
              ) : null
            )
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center border border-gray-100">
              <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-semibold text-gray-800">No training sessions found</p>
              <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

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
              handleStatusUpdate(statusUpdateModal.id, status, reason, completionNotes)
            }
            onClose={() => setStatusUpdateModal(null)}
          />
        )}

        <ToastContainer toasts={toasts} />
      </div>
    </div>
  );
}
