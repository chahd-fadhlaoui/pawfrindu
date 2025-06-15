import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  LayoutGrid,
  Plus,
  Search,
  Stethoscope,
  X
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "../../../../context/AppContext";
import axiosInstance from "../../../../utils/axiosInstance";
import AppointmentCard from "./AppointmentCard";
import DeleteModal from "./DeleteModal";
import StatusUpdateModal from "./StatusUpdateModal";
import ToastContainer from "./ToastContainer";
import UnavailableModal from "./UnavailableModal";

export default function VetAppointmentDashboard() {
  const { socket, user } = useApp();
  const [expandedId, setExpandedId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketError, setSocketError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editPetModal, setEditPetModal] = useState(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };



  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await axiosInstance.get("/api/appointments/vet-appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const fetchedAppointments = response.data.appointments.map((appt) => ({
          ...appt,
          id: appt.id || appt._id?.toString(),
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
        }));
        setAppointments(fetchedAppointments);
        setFilteredAppointments(fetchedAppointments);
        setError(null);
      } else {
        setError(response.data.message || "Failed to load appointments");
      }
    } catch (err) {
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus, reason = null, completionNotes = null) => {
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
        addToast(`Appointment status updated to ${newStatus}`, "success");
      } else {
        addToast(response.data.message || "Failed to update appointment status", "error");
      }
    } catch (err) {
      let errorMessage = err.response?.data?.message || "Error updating appointment status";
      if (err.response?.status === 400) {
        errorMessage = err.response.data.message || "Invalid status update";
      } else if (err.response?.status === 403) {
        errorMessage = "You are not authorized to update this appointment";
      } else if (err.response?.status === 404) {
        errorMessage = "Appointment not found";
      }
      addToast(errorMessage, "error");
    } finally {
      setStatusUpdateModal(null);
      setDeleteModal(null);
    }
  };

  const setupSocketListeners = useCallback(() => {
    if (!socket || !user?._id) {
      setSocketError("Socket not initialized");
      return;
    }

    socket.on("connect", () => {
      setSocketError(null);
      socket.emit("joinRoom", user._id.toString());
    });

    socket.on("connect_error", () => {
      setSocketError("Failed to connect to real-time updates");
    });

    socket.on("appointmentBooked", (data) => {
      const vetId = user._id.toString();
      const professionalId = (data.professionalId?._id || data.professionalId)?.toString();
      if (professionalId === vetId) {
        const newAppointment = {
          id: data._id.toString(),
          petName: data.petName || "Unknown",
          petType: data.petType || "Unknown",
          species: data.petType || "Unknown",
          petAge: data.petAge || "Unknown",
          breed: data.breed || "Unknown",
          gender: data.gender || "Unknown",
          city: data.city || "Unknown",
          isTrained: data.isTrained ?? false,
          ownerName: data.petOwnerId?.fullName || "Unknown",
          phone: data.petOwnerId?.petOwnerDetails?.phone || "",
          email: data.petOwnerId?.email || "",
          address: data.petOwnerId?.petOwnerDetails?.address || "",
          date: data.date,
          time: data.time,
          duration: data.duration || "30 minutes",
          reason: data.reason || "General Checkup",
          provider: data.professionalId?.fullName || user.fullName || "Unknown",
          status: data.status || "pending",
          notes: data.notes || "",
          createdAt: new Date().toLocaleDateString("en-US"),
          updatedAt: new Date().toLocaleDateString("en-US"),
          isNew: true,
          isPlatformPet: !!data.petId,
          image: data.image || null,
          fee: data.fee || null,
          vaccines: data.vaccines || [],
          medications: data.medications || [],
          cancellationReason: null,
          completionNotes: null,
        };
        setAppointments((prev) => {
          const updated = [newAppointment, ...prev].sort((a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time));
          return updated;
        });
        setFilteredAppointments((prev) => {
          const updated = [newAppointment, ...prev].sort((a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time));
          return activeFilter === "all" || activeFilter === "pending" ? updated : prev;
        });
      }
    });

    socket.on("appointmentConfirmed", (data) => {
      const appointmentId = data.appointmentId.toString();
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
      }
    });

    socket.on("vetAppointmentCancelled", (data) => {
      const vetId = user._id.toString();
      const professionalId = (data.professionalId?._id || data.professionalId).toString();
      const appointmentId = data.appointmentId.toString();
      if (professionalId === vetId) {
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
      }
    });

    socket.on("appointmentCompleted", (data) => {
      const vetId = user._id.toString();
      const professionalId = (data.professionalId?._id || data.professionalId).toString();
      const appointmentId = data.appointmentId.toString();
      if (professionalId === vetId) {
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
      }
    });

    socket.on("appointmentUpdated", (data) => {
      const vetId = user._id.toString();
      const professionalId = (data.professionalId?._id || data.professionalId).toString();
      const appointmentId = data.appointmentId.toString();
      if (professionalId === vetId) {
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
      }
    });

    if (!socket.connected) {
      socket.connect();
    }
  }, [socket, user, activeFilter]);

  useEffect(() => {
    fetchAppointments();
    setupSocketListeners();

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("connect_error");
        socket.off("appointmentBooked");
        socket.off("appointmentConfirmed");
        socket.off("vetAppointmentCancelled");
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

  const handleAction = async (action, id) => {
    if (!id) {
      addToast("Invalid appointment ID", "error");
      return;
    }

    const appt = appointments.find((a) => a.id === id);
    if (!appt) {
      addToast("Appointment not found", "error");
      return;
    }

    if (action === "confirm") {
      if (!appt.isPlatformPet && (!appt.petName || !appt.petType || appt.petName === "Unknown" || appt.petType === "Unknown")) {
        setEditPetModal(appt);
        return;
      }
      handleStatusUpdate(appt.id, "confirmed");
    } else if (action === "call") {
      addToast(`Calling ${appt.ownerName} (Placeholder)`, "info");
    } else if (action === "remind") {
      addToast(`Reminder sent for ${appt.petName} (Placeholder)`, "info");
    } else if (action === "checkin") {
      addToast(`Checked in ${appt.petName} (Placeholder)`, "success");
    } else if (action === "cancel") {
      setDeleteModal(appt);
    } else if (action === "updateStatus") {
      setStatusUpdateModal(appt);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="w-full max-w-4xl space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white shadow rounded-xl animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    <div className="w-20 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="flex items-center p-4 text-red-700 bg-red-100 rounded-lg shadow">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 mr-3 rounded-full shadow-lg bg-gradient-to-r from-teal-500 to-blue-500">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-teal-700 to-blue-700 bg-clip-text">Appointment Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm text-sm text-teal-800 font-medium">
              <Calendar className="w-4 h-4 mr-2 text-teal-600" />
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
            <button 
              onClick={() => setIsUnavailableModalOpen(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Manage My Schedule
            </button>
          </div>
        </header>

        {socketError && (
          <div className="flex items-center p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg shadow">
            <AlertCircle className="w-5 h-5 mr-2" />
            {socketError}. Real-time updates may be unavailable.
          </div>
        )}

        <div className="mb-6 overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="p-4 bg-gradient-to-r from-teal-500 to-blue-500 md:p-6">
            <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
              <div className="relative flex-grow w-full max-w-md">
                <div className="absolute w-3 h-5 text-blue-300 left-3 top-3">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search pets or owners..."
                  className="py-3 pl-10 pr-4 transition-all rounded-lg shadow-sm w-80 bg-white/90 focus:bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  aria-label="Search appointments"
                />
              </div>
              <div className="flex flex-wrap w-full p-1 rounded-lg shadow-inner md:flex-nowrap bg-white/20">
                {["all", "pending", "confirmed", "completed", "cancelled"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => filterAppointments(filter)}
                    className={`px-3 py-2 md:py-1.5 rounded-md text-sm font-medium flex-grow md:flex-1 transition-all ${
                      activeFilter === filter
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-white hover:bg-white/30"
                    }`}
                    aria-label={`Filter by ${filter} appointments`}
                  >
                    {filter === "all" && <LayoutGrid className="w-3.5 h-3.5 mr-1.5 inline" />}
                    {filter === "pending" && <Clock className="w-3.5 h-3.5 mr-1.5 inline" />}
                    {filter === "confirmed" && <Check className="w-3.5 h-3.5 mr-1.5 inline" />}
                    {filter === "completed" && <CheckCircle className="w-3.5 h-3.5 mr-1.5 inline" />}
                    {filter === "cancelled" && <X className="w-3.5 h-3.5 mr-1.5 inline" />}
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                isExpanded={expandedId === appt.id}
                toggleExpand={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
                onAction={handleAction}
              />
            ))
          ) : (
            <div className="p-8 text-center bg-white shadow-lg rounded-xl">
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Search className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">No appointments found</p>
                <p className="mt-1 text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </div>

        {deleteModal && (
          <DeleteModal
            appointment={deleteModal}
            onConfirm={() => handleStatusUpdate(deleteModal.id, "cancelled")}
            onClose={() => setDeleteModal(null)}
          />
        )}

        {statusUpdateModal && (
          <StatusUpdateModal
            appointment={statusUpdateModal}
            onSubmit={(status, reason, completionNotes) =>
              handleStatusUpdate(statusUpdateModal.id, status, reason, completionNotes)
            }
            onClose={() => setStatusUpdateModal(null)}
          />
        )}

        {isUnavailableModalOpen && (
          <UnavailableModal
          professional={user}
            onClose={() => setIsUnavailableModalOpen(false)}
            onSuccess={() => {
              addToast("Availability updated", "success");
              setIsUnavailableModalOpen(false);
            }}
          />
        )}

        <ToastContainer toasts={toasts} />
      </div>
    </div>
  );
}