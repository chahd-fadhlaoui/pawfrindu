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
  MoreVertical,
  AlertTriangle,
  Bell,
  Plus,
  LayoutGrid,
  CheckCircle,
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
  const [editPetModal, setEditPetModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const addNotification = (message, type = "info") => {
    setNotifications((prev) => [
      { id: Date.now(), message, type, timestamp: new Date().toLocaleString() },
      ...prev,
    ].slice(0, 10));
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
  
      console.log("Appointments API Raw Response:", response.data);
  
      if (response.data.success) {
        const fetchedAppointments = response.data.appointments.map((appt) => {
          const mappedAppt = {
            ...appt,
            id: appt.id || appt._id?.toString(),
            isPlatformPet: !!appt.petId,
            petName: appt.petName || "Unknown",
            petType: appt.petType || "Unknown", // Preserve original petType
            species: appt.petType || "Unknown", // Map petType to species for consistency
            breed: appt.breed || "Unknown",
            petAge: appt.petAge || "Unknown",
            gender: appt.gender || "Unknown",
            city: appt.city || "Unknown",
            isTrained: appt.isTrained ?? false,
            image: appt.image || null,
            fee: appt.fee || null,
          };
          console.log("Mapped Appointment:", mappedAppt); // Debug log
          return mappedAppt;
        });
  
        console.log("Processed Appointments:", fetchedAppointments);
        setAppointments(fetchedAppointments);
        setFilteredAppointments(fetchedAppointments);
        setError(null);
      } else {
        setError(response.data.message || "Failed to load appointments");
      }
    } catch (err) {
      console.error("Error fetching appointments:", err.response?.data || err.message);
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
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
        };
        console.log("Socket appointmentBooked:", newAppointment);
        setAppointments((prev) => {
          const updated = [newAppointment, ...prev].sort((a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time));
          return updated;
        });
        setFilteredAppointments((prev) => {
          const updated = [newAppointment, ...prev].sort((a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time));
          return activeFilter === "all" || activeFilter === "pending" ? updated : prev;
        });
        addNotification(`New appointment for ${data.petName} booked`, "info");
      }
    });

    socket.on("appointmentConfirmed", (data) => {
      const appointmentId = data.appointmentId.toString();
      if (data.professionalId?.toString() === user._id.toString()) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === appointmentId ? { ...appt, status: "confirmed", isNew: false, updatedAt: new Date().toLocaleDateString("en-US") } : appt
          )
        );
        setFilteredAppointments((prev) =>
          prev.map((appt) =>
            appt.id === appointmentId ? { ...appt, status: "confirmed", isNew: false, updatedAt: new Date().toLocaleDateString("en-US") } : appt
          )
        );
        addNotification(`Appointment ${appointmentId} confirmed`, "success");
      }
    });

    socket.on("appointmentCancelled", (data) => {
      const vetId = user._id.toString();
      const professionalId = (data.professionalId?._id || data.professionalId).toString();
      const appointmentId = data.appointmentId.toString();
      if (professionalId === vetId) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === appointmentId
              ? { ...appt, status: "cancelled", cancellationReason: data.cancellationReason || "", updatedAt: new Date().toLocaleDateString("en-US") }
              : appt
          )
        );
        setFilteredAppointments((prev) => {
          const updated = prev.map((appt) =>
            appt.id === appointmentId
              ? { ...appt, status: "cancelled", cancellationReason: data.cancellationReason || "", updatedAt: new Date().toLocaleDateString("en-US") }
              : appt
          );
          return activeFilter === "all" || activeFilter === "cancelled" ? updated : prev.filter((appt) => appt.status === activeFilter);
        });
        addNotification(`Appointment ${appointmentId} cancelled`, "warning");
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
              ? { ...appt, status: "cancelled", cancellationReason: data.cancellationReason || "", updatedAt: new Date().toLocaleDateString("en-US") }
              : appt
          )
        );
        setFilteredAppointments((prev) => {
          const updated = prev.map((appt) =>
            appt.id === appointmentId
              ? { ...appt, status: "cancelled", cancellationReason: data.cancellationReason || "", updatedAt: new Date().toLocaleDateString("en-US") }
              : appt
          );
          return activeFilter === "all" || activeFilter === "cancelled" ? updated : prev.filter((appt) => appt.status === activeFilter);
        });
        addNotification(`Appointment ${appointmentId} cancelled by vet`, "warning");
      }
    });

    socket.on("appointmentUpdated", (data) => {
      const vetId = user._id.toString();
      const professionalId = (data.professionalId?._id || data.professionalId).toString();
      const appointmentId = data._id.toString();
      if (professionalId === vetId) {
        const updatedAppointment = {
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
          createdAt: data.createdAt || new Date().toLocaleDateString("en-US"),
          updatedAt: new Date().toLocaleDateString("en-US"),
          isNew: false,
          isPlatformPet: !!data.petId,
          image: data.image || null,
          fee: data.fee || null,
          vaccines: data.vaccines || [],
          medications: data.medications || [],
        };
        console.log("Socket appointmentUpdated:", updatedAppointment);
        setAppointments((prev) => prev.map((appt) => (appt.id === appointmentId ? updatedAppointment : appt)));
        setFilteredAppointments((prev) => {
          const updated = prev.map((appt) => (appt.id === appointmentId ? updatedAppointment : appt));
          return activeFilter === "all" || activeFilter === data.status ? updated : prev.filter((appt) => appt.status === activeFilter);
        });
        addNotification(`Appointment ${appointmentId} updated`, "info");
      }
    });

    socket.on("appointmentDeleted", (data) => {
      const vetId = user._id.toString();
      const professionalId = (data.professionalId?._id || data.professionalId).toString();
      const appointmentId = data.appointmentId.toString();
      if (professionalId === vetId) {
        setAppointments((prev) => prev.filter((appt) => appt.id !== appointmentId));
        setFilteredAppointments((prev) => prev.filter((appt) => appt.id !== appointmentId));
        addNotification(`Appointment ${appointmentId} deleted`, "warning");
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
      try {
        const response = await axiosInstance.put(`/api/appointments/confirm/${id}`);
        if (response.data.success) {
          setAppointments((prev) =>
            prev.map((a) =>
              a.id === id ? { ...a, status: "confirmed", isNew: false, updatedAt: new Date().toLocaleDateString("en-US") } : a
            )
          );
          setFilteredAppointments((prev) =>
            prev.map((a) =>
              a.id === id ? { ...a, status: "confirmed", isNew: false, updatedAt: new Date().toLocaleDateString("en-US") } : a
            )
          );
          addToast("Appointment confirmed successfully", "success");
        } else {
          addToast(response.data.message || "Failed to confirm appointment", "error");
        }
      } catch (err) {
        let errorMessage = err.response?.data?.message || "Error confirming appointment";
        if (err.response?.status === 403) {
          errorMessage = "You are not authorized to confirm this appointment";
        } else if (err.response?.status === 400) {
          errorMessage = "Only pending appointments can be confirmed";
        }
        addToast(errorMessage, "error");
      }
    } else if (action === "call") {
      addToast(`Calling ${appt.ownerName} (Placeholder)`, "info");
    } else if (action === "remind") {
      addToast(`Reminder sent for ${appt.petName} (Placeholder)`, "info");
    } else if (action === "checkin") {
      addToast(`Checked in ${appt.petName} (Placeholder)`, "success");
    } else if (action === "cancel") {
      setDeleteModal(appt);
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/appointments/vet-delete/${id}`);
      if (response.data.success) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === id ? { ...appt, status: "cancelled", updatedAt: new Date().toLocaleDateString("en-US") } : appt
          )
        );
        setFilteredAppointments((prev) => {
          const updated = prev.map((appt) =>
            appt.id === id ? { ...appt, status: "cancelled", updatedAt: new Date().toLocaleDateString("en-US") } : appt
          );
          return activeFilter === "all" || activeFilter === "cancelled"
            ? updated
            : prev.filter((appt) => appt.status === activeFilter);
        });
        addToast("Appointment cancelled successfully", "success");
      } else {
        addToast(response.data.message || "Failed to cancel appointment", "error");
      }
    } catch (err) {
      let errorMessage = err.response?.data?.message || "Error cancelling appointment";
      if (err.response?.status === 404) {
        errorMessage = "Appointment not found.";
      } else if (err.response?.status === 403) {
        errorMessage = "You are not authorized to cancel this appointment.";
      } else if (err.response?.status === 400) {
        errorMessage = "Appointment cannot be cancelled in its current state.";
      }
      addToast(errorMessage, "error");
    } finally {
      setDeleteModal(null);
    }
  };



  if (loading) {
    return (
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 min-h-screen p-6 flex items-center justify-center">
        <div className="max-w-4xl w-full space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 min-h-screen p-6 flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center shadow">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-blue-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-full w-12 h-12 flex items-center justify-center mr-3 shadow-lg">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-blue-700 bg-clip-text text-transparent">Pawsome Vet Clinic</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm text-sm text-teal-800 font-medium">
              <Calendar className="w-4 h-4 mr-2 text-teal-600" />
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
            <NotificationCenter notifications={notifications} />
            <button className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-teal-700 transition-all shadow-md flex items-center">
              <Plus className="w-4 h-4 mr-1.5" /> + New Appointment
            </button>
          </div>
        </header>

        {socketError && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-sm flex items-center shadow">
            <AlertCircle className="w-5 h-5 mr-2" />
            {socketError}. Real-time updates may be unavailable.
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-grow max-w-md w-full">
                <div className="absolute left-3 top-3 text-blue-300 w-3 h-5">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search pets or owners..."
                  className="w-80 pl-10 pr-4 py-3 rounded-lg bg-white/90 focus:bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap md:flex-nowrap bg-white/20 w-full rounded-lg p-1 shadow-inner">
                {["all", "pending", "confirmed", "completed", "cancelled"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => filterAppointments(filter)}
                    className={`px-3 py-2 md:py-1.5 rounded-md text-sm font-medium flex-grow md:flex-1 transition-all ${
                      activeFilter === filter
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-white hover:bg-white/30"
                    }`}
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
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Search className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">No appointments found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </div>

        {deleteModal && (
          <DeleteModal
            appointment={deleteModal}
            onConfirm={() => handleDeleteConfirm(deleteModal.id)}
            onClose={() => setDeleteModal(null)}
          />
        )}

 

        <ToastContainer toasts={toasts} />
      </div>
    </div>
  );
}

function AppointmentCard({ appointment: appt, isExpanded, toggleExpand, onAction }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [contextMenu, setContextMenu] = useState(false);
  const statusConfig = {
    pending: { color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-300", icon: <AlertCircle className="w-4 h-4" />, label: "Pending" },
    confirmed: { color: "text-teal-600", bgColor: "bg-teal-50", borderColor: "border-teal-300", icon: <Check className="w-4 h-4" />, label: "Confirmed" },
    cancelled: { color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-300", icon: <X className="w-4 h-4" />, label: "Cancelled" },
    completed: { color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-300", icon: <Check className="w-4 h-4" />, label: "Completed" },
    adoptionPending: { color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-300", icon: <Clock className="w-4 h-4" />, label: "Adoption Pending" },
    adopted: { color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-300", icon: <Heart className="w-4 h-4" />, label: "Adopted" },
    sold: { color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-300", icon: <Check className="w-4 h-4" />, label: "Sold" },
  };

  const status = statusConfig[appt.status] || statusConfig.pending;
  const petEmoji = getPetEmoji(appt.species);
  const isIncompleteNonPlatform = !appt.isPlatformPet && (
    !appt.petName || appt.petName === "Unknown" || !appt.species || appt.species === "Unknown"
  );

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:bg-gray-50 cursor-pointer ${
        isExpanded ? "ring-2 ring-teal-300" : ""
      } ${appt.isNew ? "animate-pulse-subtle" : ""} ${
        appt.status === "pending" ? "border-l-4 border-amber-400" :
        appt.status === "confirmed" ? "border-l-4 border-teal-400" :
        appt.status === "completed" ? "border-l-4 border-blue-400" :
        appt.status === "cancelled" ? "border-l-4 border-red-400" : ""
      }`}
      onClick={(e) => {
        if (!e.target.closest("button")) toggleExpand();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && toggleExpand()}
    >
      <div className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 text-2xl">
              {petEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  {appt.petName || "Unknown Pet"}
                  {appt.breed && appt.breed !== "Unknown" && (
                    <span className="text-sm font-normal ml-2">({appt.breed})</span>
                  )}
                </h3>
                {isIncompleteNonPlatform && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Non-Platform Pet
                  </span>
                )}
                {appt.isNew && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">New</span>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                {appt.date || "N/A"} • <Clock className="w-4 h-4 mx-1" /> {appt.time || "N/A"} • {appt.duration || "N/A"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`flex items-center ${status.color} ${status.bgColor} px-3 py-1 rounded-lg text-sm font-medium shadow-sm ${
                status.label === "Pending" ? "animate-pulse" : ""
              }`}
            >
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </span>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenu(!contextMenu);
                }}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-300"
                aria-label="More actions"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {contextMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction("call", appt.id);
                      setContextMenu(false);
                    }}
                    className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-t-lg"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Owner
                  </button>
                  {appt.status === "pending" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction("remind", appt.id);
                        setContextMenu(false);
                      }}
                      className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-100 px-4 py-2"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Reminder
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand();
                      setContextMenu(false);
                    }}
                    className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-b-lg"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {appt.status === "pending" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction("confirm", appt.id);
              }}
              className="flex items-center text-sm bg-teal-600 text-white hover:bg-teal-700 px-4 py-2 rounded-lg transition-transform transform hover:scale-105 shadow"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Confirm
            </button>
          )}
          {appt.status === "confirmed" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction("checkin", appt.id);
              }}
              className="flex items-center text-sm bg-teal-600 text-white hover:bg-teal-700 px-4 py-2 rounded-lg transition-transform transform hover:scale-105 shadow"
            >
              <ArrowRight className="w-4 h-4 mr-1.5" />
              Check In
            </button>
          )}
          {["pending", "confirmed"].includes(appt.status) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction("cancel", appt.id);
              }}
              className="flex items-center text-sm border border-red-300 bg-white text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-transform transform hover:scale-105"
            >
              <X className="w-4 h-4 mr-1.5" />
              Cancel
            </button>
          )}
        </div>
        {isExpanded && (
          <div className="mt-6 animate-fade-in">
            <div className="border-t border-gray-100 pt-4">
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl overflow-hidden">
                <div className="flex border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur-sm">
                  {["Overview", "Pet Details", "History"].map((tab) => (
                    <button
                      key={tab}
                      className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
                        activeTab === tab
                          ? "bg-white text-teal-600 border-b-2 border-teal-500"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab(tab);
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="p-6">
                  {activeTab === "Overview" && <OverviewTab appointment={appt} />}
                  {activeTab === "Pet Details" && <PetDetailsTab appointment={appt} />}
                  {activeTab === "History" && <AppointmentHistoryTab appointment={appt} />}
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
            <h3 className="text-white text-sm font-medium flex items-center">
              <User className="w-4 h-4 mr-2" />
              Client Information
            </h3>
          </div>
          <div className="p-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-medium mr-3">
                {getInitials(appt.ownerName)}
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{appt.ownerName || "Unknown"}</h4>
                <p className="text-xs text-gray-500">Client since Unknown</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
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
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-4 py-3">
            <h3 className="text-white text-sm font-medium flex items-center">
              <CalendarClock className="w-4 h-4 mr-2" />
              Appointment Details
            </h3>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div className="text-sm text-gray-800">
                <span className="font-medium">{appt.date || "N/A"}</span> • {appt.time || "N/A"}
              </div>
              <div className="text-xs text-gray-500">{appt.duration || "N/A"}</div>
            </div>
            <div className="mb-4">
              <div className="flex items-start mb-3">
                <div className="mt-0.5 mr-2 p-1 rounded-md bg-teal-100">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Service</div>
                  <div className="text-sm font-medium text-gray-800">{appt.reason || "No reason provided"}</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-0.5 mr-2 p-1 rounded-md bg-blue-100">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Provider</div>
                  <div className="text-sm font-medium text-gray-800">{appt.provider || "Unknown"}</div>
                </div>
              </div>
            </div>
            <div className="relative pt-1 pb-1">
              <div className="flex items-center mb-2">
                <div className="flex-grow text-right pr-2 text-xs text-gray-500">Created</div>
                <div className="w-3 h-3 rounded-full bg-blue-500 z-10"></div>
                <div className="flex-grow pl-2">
                  <span className="text-xs text-gray-700">{appt.createdAt || "N/A"}</span>
                </div>
              </div>
              <div className="absolute left-1/2 top-3 bottom-3 w-0.5 bg-gray-200 transform -translate-x-1/2"></div>
              <div className="flex items-center mb-2">
                <div className="flex-grow text-right pr-2 text-xs text-gray-500">Status</div>
                <div className={`w-3 h-3 rounded-full z-10 ${getStatusColor(appt.status)}`}></div>
                <div className="flex-grow pl-2">
                  <span className="text-xs text-gray-700 capitalize">{appt.status || "Unknown"}</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-grow text-right pr-2 text-xs text-gray-500">Updated</div>
                <div className="w-3 h-3 rounded-full bg-gray-300 z-10"></div>
                <div className="flex-grow pl-2">
                  <span className="text-xs text-gray-700">{appt.updatedAt || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3">
            <h3 className="text-white text-sm font-medium flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Notes
            </h3>
          </div>
          <div className="p-4">
            {appt.notes ? (
              <div className="bg-amber-50 rounded-lg p-3 text-sm text-gray-700">{appt.notes}</div>
            ) : (
              <div className="text-sm text-gray-500 italic p-3 text-center">No notes available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PetDetailsTab({ appointment: appt }) {
  const getAgeCategory = (age) => {
    if (!age || age === "Unknown") return "Unknown";
    switch (age.toLowerCase()) {
      case "puppy":
      case "kitten":
        return age.charAt(0).toUpperCase() + age.slice(1);
      case "young":
        return "Young";
      case "adult":
        return "Adult";
      case "senior":
        return "Senior";
      default:
        return "Unknown";
    }
  };

  const ageCategory = getAgeCategory(appt.petAge);
  const ageStyles = {
    Puppy: "bg-blue-100 text-blue-600",
    Kitten: "bg-blue-100 text-blue-600",
    Young: "bg-green-100 text-green-600",
    Adult: "bg-teal-100 text-teal-600",
    Senior: "bg-amber-100 text-amber-600",
    Unknown: "bg-gray-100 text-gray-600",
  };
  const isIncompleteNonPlatform = !appt.isPlatformPet && (
    !appt.petName || appt.petName === "Unknown" || !appt.species || appt.species === "Unknown"
  );

  console.log("PetDetailsTab Appointment:", appt);
  console.log("PetDetails Fields:", {
    petName: appt.petName,
    species: appt.species,
    petType: appt.petType,
    petAge: appt.petAge,
    breed: appt.breed,
    gender: appt.gender,
    city: appt.city,
    isTrained: appt.isTrained,
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3">
          <h3 className="text-white text-sm font-medium flex items-center">
            <Heart className="w-4 h-4 mr-2" />
            Pet Details
          </h3>
        </div>
        <div className="p-4">
          {appt.image && (
            <div className="mb-4">
              <img
                src={appt.image}
                alt={appt.petName}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => (e.target.src = "/default-pet.jpg")}
              />
            </div>
          )}
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-teal-100 rounded-full text-xl mr-3">
              {getPetEmoji(appt.species)}
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{appt.petName || "Unknown"}</h4>
              <p className="text-xs text-gray-500">
                {appt.species || appt.petType || "Unknown"} • {appt.petAge || "Unknown"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-xs">
              <span className="text-gray-500">Age</span>
              <p className="font-medium text-gray-700">{appt.petAge || "Unknown"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-xs">
              <span className="text-gray-500">Gender</span>
              <p className="font-medium text-gray-700">{appt.gender || "Unknown"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-xs">
              <span className="text-gray-500">Breed</span>
              <p className="font-medium text-gray-700">{appt.breed || "Unknown"}</p>
            </div>
       
          </div>
          <div className="flex items-center mb-3">
            <span className="text-xs text-gray-500 mr-2">Age Category:</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${ageStyles[ageCategory]}`}>
              {ageCategory}
            </span>
          </div>
          <div className="flex items-center mb-3">
            <span className="text-xs text-gray-500 mr-2">Training Status:</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                appt.isTrained ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {appt.isTrained ? "Trained" : "Not Trained"}
            </span>
          </div>
          {appt.fee && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">Fee:</span>
              <span className="text-sm font-medium ml-2">{appt.fee}dt</span>
            </div>
          )}
          {isIncompleteNonPlatform && (
            <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 p-3 rounded-lg flex items-center">
              <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
              <p className="text-sm text-gray-700">This pet is not registered on the platform and has incomplete details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function AppointmentHistoryTab({ appointment: appt }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setHistory([
        { id: "hist1", date: "2024-10-15", time: "10:00 AM", reason: "Vaccination", status: "completed", provider: appt.provider },
        { id: "hist2", date: "2024-09-01", time: "2:00 PM", reason: "Checkup", status: "completed", provider: appt.provider },
      ]);
      setLoading(false);
    }, 1000);
  }, [appt.id]);

  if (loading) {
    return <div className="text-gray-600 text-sm">Loading history...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-gray-500 text-sm text-center">
        No appointment history available for {appt.petName}.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((hist) => (
        <div key={hist.id} className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-sm font-medium text-gray-800">{hist.reason}</p>
              <p className="text-xs text-gray-500">
                {hist.date} at {hist.time}
              </p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600`}>
              Completed
            </span>
          </div>
          <p className="text-xs text-gray-600">Provider: {hist.provider}</p>
        </div>
      ))}
    </div>
  );
}

function DeleteModal({ appointment, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Cancel Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-6">
          <div className="flex items-center p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-amber-500 mr-3" />
            <p className="text-gray-700">
              Are you sure you want to cancel the appointment for{" "}
              <span className="font-medium">{appointment.petName}</span> on{" "}
              <span className="font-medium">{appointment.date}</span> at{" "}
              <span className="font-medium">{appointment.time}</span>?
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Keep Appointment
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors shadow"
            >
              Cancel Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditPetModal({ appointment, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    petName: appointment.petName || "",
    petType: appointment.petType || "",
    petAge: appointment.petAge || "",
    gender: appointment.gender || "",
    breed: appointment.breed || "",
    city: appointment.city || "",
    isTrained: appointment.isTrained ?? false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.petName || !formData.petType) {
      alert("Pet name and type are required");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-teal-800">Add Pet Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Pet Name *</label>
            <input
              type="text"
              name="petName"
              value={formData.petName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Pet Type *</label>
            <select
              name="petType"
              value={formData.petType}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 focus:outline-none"
              required
            >
              <option value="">Select Type</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="bird">Bird</option>
              <option value="rabbit">Rabbit</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Age</label>
            <select
              name="petAge"
              value={formData.petAge}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 focus:outline-none"
            >
              <option value="">Select Age</option>
              <option value="puppy">Puppy/Kitten</option>
              <option value="young">Young</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 focus:outline-none"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Breed</label>
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Trained</label>
            <input
              type="checkbox"
              name="isTrained"
              checked={formData.isTrained}
              onChange={handleChange}
              className="h-4 w-4 text-teal-600 focus:ring-teal-300 border-gray-300 rounded"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NotificationCenter({ notifications }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-300 relative shadow-sm"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-10 border border-gray-100 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-blue-50 rounded-t-xl">
            <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <div className="p-6 text-sm text-gray-500 text-center">
              <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p>No notifications at this time</p>
            </div>
          ) : (
            <div>
              {notifications.map((notif) => (
                <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 flex items-start">
                  <div className={`rounded-full p-2 mr-3 flex-shrink-0 ${
                    notif.type === "success" ? "bg-green-100 text-green-600" :
                    notif.type === "warning" ? "bg-red-100 text-red-600" :
                    "bg-blue-100 text-blue-600"
                  }`}>
                    {notif.type === "success" && <Check className="w-4 h-4" />}
                    {notif.type === "warning" && <AlertCircle className="w-4 h-4" />}
                    {notif.type === "info" && <Bell className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center p-4 rounded-lg shadow-lg animate-slide-in-right ${
            toast.type === "success"
              ? "bg-green-100 text-green-700 border-l-4 border-green-500"
              : toast.type === "error"
              ? "bg-red-100 text-red-700 border-l-4 border-red-500"
              : "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
          }`}
          role="alert"
          aria-live="assertive"
        >
          {toast.type === "success" && <Check className="w-5 h-5 mr-2" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 mr-2" />}
          {toast.type === "info" && <Bell className="w-5 h-5 mr-2" />}
          <span className="text-sm">{toast.message}</span>
        </div>
      ))}
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
    case "adoptionPending":
      return "bg-purple-500";
    case "adopted":
      return "bg-green-500";
    case "sold":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
}