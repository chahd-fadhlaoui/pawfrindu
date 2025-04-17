import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Phone,
  User,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  Search,
  Heart,
  Mail,
  MapPin,
  CalendarClock,
  Stethoscope,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";
import { useApp } from "../../../context/AppContext";

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

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Fetching appointments with token:", token ? "Present" : "Missing");

      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await axiosInstance.get("/api/appointments/vet-appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API response:", {
        status: response.status,
        data: response.data,
        appointments: response.data.appointments,
      });

      if (response.data.success) {
        const fetchedAppointments = response.data.appointments || [];
        fetchedAppointments.forEach((appt, index) => {
          console.log(`Appointment ${index}:`, {
            id: appt.id,
            petName: appt.petName,
            status: appt.status,
          });
        });
        setAppointments(fetchedAppointments);
        setFilteredAppointments(fetchedAppointments);
        setError(null);
      } else {
        console.error("API returned unsuccessful response:", response.data);
        setError(response.data.message || "Failed to load appointments");
      }
    } catch (err) {
      console.error("Fetch appointments error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      let errorMessage = "Error fetching appointments";
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Unauthorized: Invalid or expired token. Please log in again.";
        } else if (err.response.status === 403) {
          errorMessage = "Access denied: Only vets can view appointments.";
        } else if (err.response.status === 500) {
          errorMessage = "Server error: Failed to fetch appointments.";
        } else {
          errorMessage = err.response.data?.message || err.message;
        }
      } else {
        errorMessage = err.message || "Network error: Unable to reach the server.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = useCallback(() => {
    if (!socket || !user?._id) {
      console.log("Socket or user ID missing, skipping listeners");
      setSocketError("Socket not initialized");
      return;
    }
  
    socket.on("connect", () => {
      console.log("Connected to Socket.IO server:", socket.id);
      setSocketError(null);
      socket.emit("joinRoom", user._id.toString());
      console.log(`Joined room: ${user._id.toString()}`);
    });
  
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setSocketError("Failed to connect to real-time updates");
    });
  
    socket.on("appointmentBooked", (data) => {
      console.log("Événement appointmentBooked reçu dans VetAppointmentDashboard:", {
        data: JSON.stringify(data, null, 2),
        userId: user._id.toString(),
        professionalId: data.professionalId?._id || data.professionalId,
        isMatch: (data.professionalId?._id || data.professionalId)?.toString() === user._id.toString(),
      });
      const vetId = user._id.toString();
      const professionalId = (data.professionalId?._id || data.professionalId)?.toString();
      if (professionalId === vetId) {
        console.log("Événement pertinent pour ce vétérinaire, traitement en cours...");
        const newAppointment = {
          id: data._id.toString(),
          petName: data.petName || "Unknown",
          petType: data.petType || "Unknown",
          petAge: data.petAge || "Unknown",
          ownerName: data.petOwnerId?.fullName || "Unknown",
          phone: data.petOwnerId?.petOwnerDetails?.phone || "",
          email: data.petOwnerId?.email || "",
          address: "",
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
        };
        setAppointments((prev) => {
          const updated = [newAppointment, ...prev].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB || a.time.localeCompare(b.time);
          });
          console.log("Appointments mis à jour:", updated);
          return updated;
        });
        setFilteredAppointments((prev) => {
          const updated = [newAppointment, ...prev].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB || a.time.localeCompare(b.time);
          });
          console.log("FilteredAppointments mis à jour:", updated);
          return activeFilter === "all" || activeFilter === "pending" ? updated : prev;
        });
      } else {
        console.log("Événement ignoré : professionalId ne correspond pas à user._id");
      }
    });
  
    socket.on("appointmentConfirmed", (data) => {
      console.log("Appointment confirmed event:", data);
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
                }
              : appt
          )
        );
        setFilteredAppointments((prev) =>
          prev.map((appt) =>
            appt.id === appointmentId
              ? {
                  ...appt,
                  status: "confirmed",
                  isNew: false,
                  updatedAt: new Date().toLocaleDateString("en-US"),
                }
              : appt
          )
        );
      }
    });
  
    socket.on("appointmentCancelled", (data) => {
      console.log("Pet owner cancelled event:", data);
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
                  cancellationReason: data.cancellationReason || appt.cancellationReason || "",
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
                  cancellationReason: data.cancellationReason || appt.cancellationReason || "",
                  updatedAt: new Date().toLocaleDateString("en-US"),
                }
              : appt
          );
          return activeFilter === "all" || activeFilter === "cancelled" ? updated : prev.filter((appt) => appt.status === activeFilter);
        });
      }
    });
  
    socket.on("vetAppointmentCancelled", (data) => {
      console.log("Vet cancelled event:", data);
      const vetId = user._id.toString();
      const professionalId = (data.professionalId?._id || data.professionalId).toString();
      const appointmentId = data.appointmentId.toString();
      if (professionalId === vetId) {
        setAppointments((prev) => {
          const updated = prev.map((appt) =>
            appt.id === appointmentId
              ? {
                  ...appt,
                  status: "cancelled",
                  cancellationReason: data.cancellationReason || appt.cancellationReason || "",
                  updatedAt: new Date().toLocaleDateString("en-US"),
                }
              : appt
          );
          console.log("Updated appointments (vetCancelled):", updated);
          return updated;
        });
        setFilteredAppointments((prev) => {
          const updated = prev.map((appt) =>
            appt.id === appointmentId
              ? {
                  ...appt,
                  status: "cancelled",
                  cancellationReason: data.cancellationReason || appt.cancellationReason || "",
                  updatedAt: new Date().toLocaleDateString("en-US"),
                }
              : appt
          );
          console.log("Updated filteredAppointments (vetCancelled):", updated);
          return activeFilter === "all" || activeFilter === "cancelled" ? updated : prev.filter((appt) => appt.status === activeFilter);
        });
      }
    });
  
    socket.on("appointmentUpdated", (data) => {
      console.log("Appointment updated event:", data);
      const vetId = user._id.toString();
      const professionalId = (data.professionalId?._id || data.professionalId).toString();
      const appointmentId = data._id.toString();
      if (professionalId === vetId) {
        const updatedAppointment = {
          id: data._id.toString(),
          petName: data.petName || "Unknown",
          petType: data.petType || "Unknown",
          petAge: data.petAge || "Unknown",
          ownerName: data.petOwnerId?.fullName || "Unknown",
          phone: data.petOwnerId?.petOwnerDetails?.phone || "",
          email: data.petOwnerId?.email || "",
          address: "",
          date: data.date,
          time: data.time,
          duration: data.duration || "30 minutes",
          reason: data.reason || "General Checkup",
          provider: data.professionalId?.fullName || user.fullName || "Unknown",
          status: data.status || "pending",
          notes: data.notes || "",
          createdAt: data.createdAt || new Date().toLocaleDateString("en-US"),
          updatedAt: new Date().toLocaleDateString("en-US"),
          isNew: false,
        };
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === appointmentId ? updatedAppointment : appt
          )
        );
        setFilteredAppointments((prev) => {
          const updated = prev.map((appt) =>
            appt.id === appointmentId ? updatedAppointment : appt
          );
          return activeFilter === "all" || activeFilter === data.status ? updated : prev.filter((appt) => appt.status === activeFilter);
        });
      }
    });
  
    socket.on("appointmentDeleted", (data) => {
      console.log("Appointment deleted event:", data);
      const vetId = user._id.toString();
      const professionalId = (data.professionalId?._id || data.professionalId).toString();
      const appointmentId = data.appointmentId.toString();
      if (professionalId === vetId) {
        setAppointments((prev) => {
          const updated = prev.filter((appt) => appt.id !== appointmentId);
          console.log("Appointments after deletion:", updated);
          return updated;
        });
        setFilteredAppointments((prev) => {
          const updated = prev.filter((appt) => appt.id !== appointmentId);
          console.log("FilteredAppointments after deletion:", updated);
          return updated;
        });
      }
    });
  
    if (!socket.connected) {
      console.log("Socket not connected, attempting to connect");
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
        socket.off("appointmentCancelled");
        socket.off("vetAppointmentCancelled");
        socket.off("appointmentUpdated");
        socket.off("appointmentDeleted");
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
      alert("Invalid appointment ID");
      console.error("handleAction called with undefined ID");
      return;
    }

    const appt = appointments.find((a) => a.id === id);
    if (!appt) {
      alert("Appointment not found");
      console.error("Appointment not found for ID:", id);
      return;
    }

    if (action === "confirm") {
      try {
        console.log("Attempting to confirm appointment with ID:", id);
        const response = await axiosInstance.put(`/api/appointments/confirm/${id}`);
        console.log("Confirm response:", response.data);
        if (response.data.success) {
          setAppointments((prev) => {
            const updated = prev.map((a) =>
              a.id === id
                ? {
                    ...a,
                    status: "confirmed",
                    isNew: false,
                    updatedAt: new Date().toLocaleDateString("en-US"),
                  }
                : a
            );
            console.log("Updated appointments (confirm):", updated); // Debug
            return updated;
          });
          setFilteredAppointments((prev) => {
            const updated = prev.map((a) =>
              a.id === id
                ? {
                    ...a,
                    status: "confirmed",
                    isNew: false,
                    updatedAt: new Date().toLocaleDateString("en-US"),
                  }
                : a
            );
            console.log("Updated filteredAppointments (confirm):", updated); // Debug
            return updated;
          });
          alert("Appointment confirmed successfully");
        } else {
          alert(response.data.message || "Failed to confirm appointment");
        }
      } catch (err) {
        console.error("Confirm appointment error:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        let errorMessage = err.response?.data?.message || "Error confirming appointment";
        if (err.response?.status === 403) {
          errorMessage = "You are not authorized to confirm this appointment";
        } else if (err.response?.status === 400) {
          errorMessage = "Only pending appointments can be confirmed";
        }
        alert(errorMessage);
      }
    } else if (action === "call") {
      alert(`Calling owner for appointment ID: ${id} (Placeholder)`);
    } else if (action === "remind") {
      alert(`Send reminder for appointment ID: ${id} (Placeholder)`);
    } else if (action === "checkin") {
      alert(`Check-in appointment ID: ${id} (Placeholder)`);
    } else if (action === "cancel") {
      setDeleteModal(appt);
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      console.log("Attempting to cancel appointment with ID:", id);
      const response = await axiosInstance.delete(`/api/appointments/vet-delete/${id}`);
      console.log("Cancel response:", response.data);
      if (response.data.success) {
        setAppointments((prev) => {
          const updated = prev.map((appt) =>
            appt.id === id
              ? {
                  ...appt,
                  status: "cancelled",
                  updatedAt: new Date().toLocaleDateString("en-US"),
                }
              : appt
          );
          console.log("Updated appointments (cancel):", updated); // Debug
          return updated;
        });
        setFilteredAppointments((prev) => {
          const updated = prev.map((appt) =>
            appt.id === id
              ? {
                  ...appt,
                  status: "cancelled",
                  updatedAt: new Date().toLocaleDateString("en-US"),
                }
              : appt
          );
          console.log("Updated filteredAppointments (cancel):", updated); // Debug
          return activeFilter === "all" || activeFilter === "cancelled"
            ? updated
            : prev.filter((appt) => appt.status === activeFilter);
        });
        alert("Appointment cancelled successfully");
      } else {
        alert(response.data.message || "Failed to cancel appointment");
      }
    } catch (err) {
      console.error("Cancel appointment error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      let errorMessage = err.response?.data?.message || "Error cancelling appointment";
      if (err.response?.status === 404) {
        errorMessage = "Appointment not found.";
      } else if (err.response?.status === 403) {
        errorMessage = "You are not authorized to cancel this appointment.";
      } else if (err.response?.status === 400) {
        errorMessage = "Appointment cannot be cancelled in its current state.";
      }
      alert(errorMessage);
    } finally {
      setDeleteModal(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 min-h-screen p-6 flex items-center justify-center">
        <div className="text-teal-600 text-lg">Loading appointments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 min-h-screen p-6 flex items-center justify-center">
        <div className="text-red-600 text-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-blue-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-teal-800">Pawsome Vet Clinic</h1>
            <div className="flex space-x-3">
              <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <button className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                + New Appointment
              </button>
            </div>
          </div>
        </header>

        {socketError && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
            {socketError}. Real-time updates may be unavailable.
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-2.5 text-blue-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search pets or owners..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/90 focus:bg-white focus:ring-2 focus:ring-white focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <div className="flex space-x-1 bg-white/20 rounded-lg p-1">
                <button
                  onClick={() => filterAppointments("all")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === "all" ? "bg-white text-blue-600" : "text-white hover:bg-white/20"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => filterAppointments("pending")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === "pending" ? "bg-white text-blue-600" : "text-white hover:bg-white/20"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => filterAppointments("confirmed")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === "confirmed" ? "bg-white text-blue-600" : "text-white hover:bg-white/20"
                  }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => filterAppointments("completed")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === "completed" ? "bg-white text-blue-600" : "text-white hover:bg-white/20"
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => filterAppointments("cancelled")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === "cancelled" ? "bg-white text-blue-600" : "text-white hover:bg-white/20"
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
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
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Search className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium">No appointments found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </div>

        {deleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl animate-slide-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-teal-800">Cancel Appointment</h2>
                <button
                  onClick={() => setDeleteModal(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel the appointment for{" "}
                <span className="font-medium">{deleteModal.petName}</span> on{" "}
                <span className="font-medium">{deleteModal.date}</span> at{" "}
                <span className="font-medium">{deleteModal.time}</span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={() => handleDeleteConfirm(deleteModal.id)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Cancel Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ appointment: appt, isExpanded, toggleExpand, onAction }) {
  const statusConfig = {
    pending: {
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      icon: <AlertCircle className="w-4 h-4" />,
      label: "Pending",
    },
    confirmed: {
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-300",
      icon: <Check className="w-4 h-4" />,
      label: "Confirmed",
    },
    cancelled: {
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      icon: <X className="w-4 h-4" />,
      label: "Cancelled",
    },
    completed: {
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      icon: <Check className="w-4 h-4" />,
      label: "Completed",
    },
  };

  const status = statusConfig[appt.status] || statusConfig.pending;
  const petEmoji = getPetEmoji(appt.petType);

  return (
    <div
      className={`bg-white rounded-xl shadow overflow-hidden transition-all ${
        isExpanded ? "ring-2 ring-teal-300" : ""
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 text-2xl">
              {petEmoji}
            </div>
            <div>
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  {appt.petName || "Unknown"}
                </h3>
                {appt.isNew && (
                  <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {appt.time || "N/A"} • {appt.duration || "N/A"}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`flex items-center ${status.color} ${status.bgColor} px-2 py-1 rounded text-xs font-medium`}
            >
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </span>
            <button
              onClick={toggleExpand}
              className={`p-1 rounded-full hover:bg-gray-100 text-gray-500 ${
                isExpanded ? "bg-gray-100" : ""
              }`}
              aria-label="Toggle details"
            >
              <ChevronRight
                className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 animate-fade-in">
            <div className="border-t border-gray-100 pt-4">
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl overflow-hidden">
                <div className="p-4">
                  <OverviewTab appointment={appt} />
                </div>

                <div className="bg-white/40 backdrop-blur-sm border-t border-teal-100 p-3 flex flex-wrap gap-2 justify-end">
                  <button
                    className="flex items-center text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                    onClick={() => onAction("call", appt.id)}
                  >
                    <Phone className="w-4 h-4 mr-1.5" />
                    Call Owner
                  </button>

                  {appt.status === "pending" && (
                    <>
                      <button
                        className="flex items-center text-sm bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                        onClick={() => onAction("remind", appt.id)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1.5" />
                        Send Reminder
                      </button>
                      <button
                        className="flex items-center text-sm bg-teal-600 text-white hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors"
                        onClick={() => onAction("confirm", appt.id)}
                      >
                        <Check className="w-4 h-4 mr-1.5" />
                        Confirm
                      </button>
                    </>
                  )}

                  {appt.status === "confirmed" && (
                    <button
                      className="flex items-center text-sm bg-teal-600 text-white hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors"
                      onClick={() => onAction("checkin", appt.id)}
                    >
                      <ArrowRight className="w-4 h-4 mr-1.5" />
                      Check In
                    </button>
                  )}

                  {["pending", "confirmed"].includes(appt.status) && (
                    <button
                      className="flex items-center text-sm bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
                      onClick={() => onAction("cancel", appt.id)}
                    >
                      <X className="w-4 h-4 mr-1.5" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ appointment: appt }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2">
            <h3 className="text-white text-sm font-medium flex items-center">
              <User className="w-4 h-4 mr-2" />
              Client Information
            </h3>
          </div>
          <div className="p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-medium mr-3">
                {getInitials(appt.ownerName)}
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{appt.ownerName || "Unknown"}</h4>
                <p className="text-xs text-gray-500">Client since Unknown</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" />
                <span>{appt.phone || "No phone provided"}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" />
                <span>{appt.email || "No email provided"}</span>
              </div>
              {appt.address && (
                <div className="flex items-start text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>{appt.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2">
            <h3 className="text-white text-sm font-medium flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Pet Details
            </h3>
          </div>
          <div className="p-4">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 flex items-center justify-center bg-teal-100 rounded-full text-xl mr-3">
                {getPetEmoji(appt.petType)}
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{appt.petName || "Unknown"}</h4>
                <p className="text-xs text-gray-500">
                  {appt.petType || "Unknown"} • {appt.petAge || "Unknown"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-gray-50 rounded p-2 text-xs">
                <span className="text-gray-500">Age</span>
                <p className="font-medium text-gray-700">{appt.petAge || "Unknown"}</p>
              </div>
              <div className="bg-gray-50 rounded p-2 text-xs">
                <span className="text-gray-500">Weight</span>
                <p className="font-medium text-gray-700">Unknown</p>
              </div>
              <div className="bg-gray-50 rounded p-2 text-xs">
                <span className="text-gray-500">Sex</span>
                <p className="font-medium text-gray-700">Unknown</p>
              </div>
              <div className="bg-gray-50 rounded p-2 text-xs">
                <span className="text-gray-500">Microchip</span>
                <p className="font-medium text-gray-700">None</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-4 py-2">
            <h3 className="text-white text-sm font-medium flex items-center">
              <CalendarClock className="w-4 h-4 mr-2" />
              Appointment Details
            </h3>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <div className="text-sm text-gray-800">
                <span className="font-medium">{appt.date || "N/A"}</span> • {appt.time || "N/A"}
              </div>
              <div className="text-xs text-gray-500">{appt.duration || "N/A"}</div>
            </div>

            <div className="mb-3">
              <div className="flex items-start mb-2">
                <div className="mt-0.5 mr-2 p-1 rounded-md bg-teal-100">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Service</div>
                  <div className="text-sm font-medium text-gray-800">
                    {appt.reason || "No reason provided"}
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mt-0.5 mr-2 p-1 rounded-md bg-blue-100">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Provider</div>
                  <div className="text-sm font-medium text-gray-800">
                    {appt.provider || "Unknown"}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative pt-1 pb-1">
              <div className="flex items-center mb-1">
                <div className="flex-grow text-right pr-2 text-xs text-gray-500">
                  Created
                </div>
                <div className="w-3 h-3 rounded-full bg-blue-500 z-10"></div>
                <div className="flex-grow pl-2">
                  <span className="text-xs text-gray-700">{appt.createdAt || "N/A"}</span>
                </div>
              </div>
              <div className="absolute left-1/2 top-3 bottom-3 w-0.5 bg-gray-200 transform -translate-x-1/2"></div>
              <div className="flex items-center mb-1">
                <div className="flex-grow text-right pr-2 text-xs text-gray-500">
                  Status
                </div>
                <div className={`w-3 h-3 rounded-full z-10 ${getStatusColor(appt.status)}`}></div>
                <div className="flex-grow pl-2">
                  <span className="text-xs text-gray-700 capitalize">
                    {appt.status || "Unknown"}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-grow text-right pr-2 text-xs text-gray-500">
                  Updated
                </div>
                <div className="w-3 h-3 rounded-full bg-gray-300 z-10"></div>
                <div className="flex-grow pl-2">
                  <span className="text-xs text-gray-700">{appt.updatedAt || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2">
            <h3 className="text-white text-sm font-medium flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Notes
            </h3>
          </div>
          <div className="p-4">
            {appt.notes ? (
              <div className="bg-amber-50 rounded p-3 text-sm text-gray-700">
                {appt.notes}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic p-3 text-center">
                No notes available for this appointment
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPetEmoji(petType) {
  switch (petType?.toLowerCase()) {
    case "dog":
      return "🐶";
    case "cat":
      return "🐱";
    case "bird":
      return "🐦";
    case "rabbit":
      return "🐰";
    default:
      return "🐾";
  }
}

function getInitials(name) {
  if (!name) return "N/A";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getStatusColor(status) {
  switch (status) {
    case "pending":
      return "bg-amber-500";
    case "confirmed":
      return "bg-teal-500";
    case "cancelled":
      return "bg-red-500";
    case "completed":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
}