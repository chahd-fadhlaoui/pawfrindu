import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Edit,
  Eye,
  Filter,
  MapPin,
  PawPrint,
  SearchX,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "../../../components/Tooltip";
import DeleteCancelAppointmentModal from "../../../components/vet/VetUserManagment/appointmentActions/DeleteCancelAppointmentModal";
import UpdateAppointmentModal from "../../../components/vet/VetUserManagment/appointmentActions/UpdateAppointmentModal";
import ViewAppointmentModal from "../../../components/vet/VetUserManagment/appointmentActions/ViewAppointmentModal";
import { useApp } from "../../../context/AppContext";
import axiosInstance from "../../../utils/axiosInstance";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  notAvailable: "bg-orange-100 text-orange-700 border-orange-200",
};

const ITEMS_PER_PAGE = 9;
const STATUS_OPTIONS = ["pending", "confirmed", "cancelled", "notAvailable"];
const PROFESSIONAL_TYPE_OPTIONS = ["Vet", "Trainer"];

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
          {option === "notAvailable"
            ? "Not Available"
            : option.charAt(0).toUpperCase() + option.slice(1)}
        </option>
      ))}
    </select>
    <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
      {icon}
    </div>
  </div>
);

const FilterBadge = ({ label, value, onClear }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-pink-600 border border-pink-200 rounded-full shadow-sm bg-pink-50">
    {label}:{" "}
    {value === "notAvailable"
      ? "Not Available"
      : value.charAt(0).toUpperCase() + value.slice(1)}
    <button
      onClick={onClear}
      className="ml-1 text-pink-600 transition-colors duration-300 hover:text-pink-800"
    >
      <X size={14} />
    </button>
  </span>
);

const AppointmentCard = ({ appointment, onAction, disabled }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const formatTime = (time) => time;

  return (
    <div
      className="overflow-hidden transition-shadow duration-300 bg-white border border-gray-100 shadow-lg rounded-2xl hover:shadow-xl"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <div className={`h-2 ${getStatusColor(appointment.status)}`}></div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                appointment.status
              )}`}
            >
              {appointment.status === "notAvailable"
                ? "Not Available"
                : appointment.status.charAt(0).toUpperCase() +
                  appointment.status.slice(1)}
            </span>
            <h3 className="mt-2 text-lg font-semibold text-gray-800">
              {appointment.petName}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {formatDate(appointment.date)}
            </div>
            <div className="font-medium text-pink-600">
              {formatTime(appointment.time)}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full">
              <User size={18} className="text-pink-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Professional</div>
              <div className="font-medium text-gray-800">
                {appointment.professionalId?.fullName || "Unknown"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full">
              <MapPin size={18} className="text-pink-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Location</div>
              <div className="font-medium text-gray-800">
              {appointment.address || "Location Not Available"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full">
              <PawPrint size={18} className="text-pink-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Pet</div>
              <div className="font-medium text-gray-800">
                {appointment.petName}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t border-gray-100">
          {appointment.status === "completed" ? (
            <div className="w-full text-center">
              <span className="text-sm text-gray-500">
                You have already visited this{" "}
                {appointment.professionalType === "Vet"
                  ? "Veterinarian"
                  : "Trainer"}{" "}
              </span>
            </div>
          ) : appointment.status === "cancelled" ? (
            <div className="w-full text-center">
              <span className="text-sm text-gray-500">
                This appointment has been cancelled
              </span>
            </div>
          ) : appointment.status === "notAvailable" ? (
            <div className="w-full text-center">
              <span className="text-sm text-gray-500">
                This appointment has been marked as not available
              </span>
            </div>
          ) : (
            <Tooltip
              text={`${
                appointment.status === "pending" ? "delete" : "cancel"
              } Appointment`}
            >
              <button
                onClick={() => onAction(appointment, "delete")}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-red-600 transition-colors rounded-lg bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                disabled={disabled}
              >
                <Trash2 size={16} />
                {appointment.status === "pending" ? "Delete" : "Cancel"}
              </button>
            </Tooltip>
          )}
          <div className="flex gap-3 ml-auto">
            {appointment.status !== "cancelled" &&
              appointment.status !== "completed" && (
                <Tooltip text="Update Appointment">
                  <button
                    onClick={() => onAction(appointment, "update")}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    disabled={disabled}
                  >
                    <Edit size={16} />
                    Update
                  </button>
                </Tooltip>
              )}
            <Tooltip text="View Details">
              <button
                onClick={() => onAction(appointment, "view")}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-pink-600 transition-colors rounded-lg bg-pink-50 hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
                disabled={disabled}
              >
                <Eye size={16} />
                View Details
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyVetappointments = () => {
  const navigate = useNavigate();
  const { socket, user } = useApp();
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProfessionalType, setFilterProfessionalType] = useState("");
  const [filterDateRange, setFilterDateRange] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [updateModal, setUpdateModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        "/api/appointments/my-appointments"
      );
      console.log("API Response:", response.data.appointments); // Debug the response
      setAppointments(response.data.appointments || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    if (!socket || !user?._id) {
      console.log("Socket or user ID missing, skipping socket listeners");
      return;
    }

    const joinRoom = () => {
      socket.emit("joinRoom", user._id.toString());
      console.log(`Emitted joinRoom: ${user._id.toString()}`);
    };

    if (socket.connected) {
      joinRoom();
    } else {
      console.log("Socket not connected, waiting for connect event");
    }

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server:", socket.id);
      joinRoom();
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("roomJoined", (room) => {
      console.log(`Confirmed joined room: ${room}`);
    });

    socket.on("appointmentBooked", async (data) => {
      if (data.petOwnerId === user?._id) {
        try {
          const response = await axiosInstance.get(
            "/api/appointments/my-appointments"
          );
          setAppointments(response.data.appointments || []);
        } catch (err) {
          console.error("Error fetching updated appointments:", err);
          setAppointments((prev) =>
            [
              {
                _id: data.appointmentId,
                petOwnerId: data.petOwnerId,
                professionalId: {
                  _id: data.professionalId,
                  fullName: data.professionalName || "Unknown",
                  
                },
                professionalType: data.professionalType,
                date: data.date,
                time: data.time,
                petName: data.petName,
                status: "pending",
                address: data.location || "Location Not Available", 
                            },
              ...prev,
            ].sort((a, b) => new Date(b.date) - new Date(a.date))
          );
        }
      }
    });

    socket.on("appointmentConfirmed", (data) => {
      console.log("Appointment confirmed event:", data);
      if (data.petOwnerId === user._id.toString()) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === data.appointmentId
              ? { ...appt, status: "confirmed" }
              : appt
          )
        );
      }
    });

    socket.on("appointmentNotAvailable", (data) => {
      console.log("Appointment not available event:", data);
      if (data.petOwnerId === user._id.toString()) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === data.appointmentId
              ? {
                  ...appt,
                  status: "notAvailable",
                  cancellationReason:
                    data.cancellationReason || appt.cancellationReason,
                }
              : appt
          )
        );
      }
    });

    const handleCancellation = (data, eventName) => {
      console.log(`${eventName} event:`, data);
      console.log(
        "Checking IDs - petOwnerId:",
        data.petOwnerId,
        "user._id:",
        user._id.toString()
      );
      console.log(
        "Checking appointmentId:",
        data.appointmentId,
        "appointments:",
        appointments.map((appt) => appt._id)
      );
      if (data.petOwnerId === user._id.toString()) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === data.appointmentId
              ? {
                  ...appt,
                  status: "cancelled",
                  cancellationReason:
                    data.cancellationReason || appt.cancellationReason,
                }
              : appt
          )
        );
      }
    };

    socket.on("vetAppointmentCancelled", (data) => {
      handleCancellation(data, "vetAppointmentCancelled");
    });

    socket.on("appointmentCancelled", (data) => {
      handleCancellation(data, "appointmentCancelled");
    });

    socket.on("appointmentDeleted", (data) => {
      console.log("Appointment deleted event:", data);
      if (data.petOwnerId === user?._id) {
        setAppointments((prev) =>
          prev.filter((appt) => appt._id !== data.appointmentId)
        );
      }
    });

    socket.on("appointmentUpdated", (data) => {
      console.log("Appointment updated event:", data);
      if (data.petOwnerId === user?._id) {
        setAppointments((prev) =>
          prev.map((appt) => (appt._id === data._id ? data : appt))
        );
      }
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("roomJoined");
      socket.off("appointmentBooked");
      socket.off("appointmentConfirmed");
      socket.off("appointmentNotAvailable");
      socket.off("vetAppointmentCancelled");
      socket.off("appointmentCancelled");
      socket.off("appointmentDeleted");
      socket.off("appointmentUpdated");
    };
  }, [socket, user?._id]);

  const clearFilter = (filterType) => {
    switch (filterType) {
      case "status":
        setFilterStatus("");
        break;
      case "professionalType":
        setFilterProfessionalType("");
        break;
      case "dateRange":
        setFilterDateRange("");
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilterStatus("");
    setFilterProfessionalType("");
    setFilterDateRange("");
    setCurrentPage(1);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const statusMatch = !filterStatus || appointment.status === filterStatus;
    const typeMatch =
      !filterProfessionalType ||
      appointment.professionalType === filterProfessionalType;
    const dateMatch =
      !filterDateRange ||
      (() => {
        const now = new Date();
        const appointmentDate = new Date(appointment.date);
        switch (filterDateRange) {
          case "upcoming":
            return appointmentDate >= now;
          case "past":
            return appointmentDate < now;
          default:
            return true;
        }
      })();
    return statusMatch && typeMatch && dateMatch;
  });

  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handleAction = (appointment, actionType) => {
    switch (actionType) {
      case "view":
        setViewModal({ appointment });
        break;
      case "update":
        setUpdateModal({ appointment });
        break;
      case "delete":
        setDeleteModal({ appointment });
        break;
      default:
        break;
    }
  };

  const handleActionSuccess = ({ action, appointmentId, appointment }) => {
    if (action === "delete" || action === "cancel") {
      setAppointments((prev) =>
        action === "delete"
          ? prev.filter((appt) => appt._id !== appointmentId)
          : prev.map((appt) =>
              appt._id === appointmentId
                ? {
                    ...appt,
                    status: "cancelled",
                    cancellationReason: appt.cancellationReason,
                  }
                : appt
            )
      );
    } else if (action === "update") {
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === appointment._id
            ? {
                ...appointment,
                status:
                  appt.status === "confirmed" || appt.status === "notAvailable"
                    ? "pending"
                    : appointment.status,
              }
            : appt
        )
      );
    }
    setViewModal(null);
    setUpdateModal(null);
    setDeleteModal(null);
  };

  return (
    <div className="min-h-screen pb-16 bg-gradient-to-br from-white to-pink-50">
      <div className="relative px-4 pt-16 pb-12 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-pink-50">
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
          className="relative mx-auto space-y-6 text-center max-w-7xl animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
            <Calendar className="w-4 h-4 mr-2 text-[#ffc929]" />
            Your Pet Care Schedule
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="block">Manage Your</span>
            <span className="block text-pink-500">Pet Appointments</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
            Keep track of all your pet care appointments in one place.
          </p>
        </div>
      </div>

      <div className="container px-4 mx-auto">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          {/* Book Veterinarian Appointment Button (Left) */}
          <button
            onClick={() => navigate("/vets")}
            className="flex items-center justify-center gap-2 px-6 py-3 text-white bg-[#ffc929] rounded-xl shadow-md hover:shadow-lg hover:bg-pink-500 transition-all duration-300 transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-pink-300 w-full sm:w-auto"
            disabled={loading}
          >
            <Calendar size={18} />
            Book New Veterinarian Appointment
          </button>

          {/* Appointments Span (Center) */}
          {filteredAppointments.length > 0 && (
            <span className="flex items-center justify-center w-full gap-2 px-5 py-2 text-sm font-medium text-pink-600 bg-white border border-pink-100 rounded-full shadow-sm sm:w-auto">
              <Calendar size={16} className="text-pink-500" />
              {filteredAppointments.length}{" "}
              {filteredAppointments.length === 1
                ? "Appointment"
                : "Appointments"}
            </span>
          )}

          {/* Book Trainer Appointment Button (Right) */}
          <button
            onClick={() => navigate("/trainers")}
            className="flex items-center justify-center gap-2 px-6 py-3 text-white bg-[#ffc929] rounded-xl shadow-md hover:shadow-lg hover:bg-pink-500 transition-all duration-300 transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-pink-300 w-full sm:w-auto"
            disabled={loading}
          >
            <Calendar size={18} />
            Book New Trainer Appointment
          </button>
        </div>

        <div className="mb-8 overflow-hidden bg-white border border-gray-100 shadow-lg rounded-2xl">
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Filter size={18} className="text-pink-500" />
              Filter Options
            </h2>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2 text-pink-500 transition-colors rounded-full hover:bg-pink-50"
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <FilterSelect
                  label="Status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={STATUS_OPTIONS}
                  icon={<Clock size={18} className="text-pink-400" />}
                />
                <FilterSelect
                  label="Professional Type"
                  value={filterProfessionalType}
                  onChange={(e) => setFilterProfessionalType(e.target.value)}
                  options={PROFESSIONAL_TYPE_OPTIONS}
                  icon={<User size={18} className="text-pink-400" />}
                />
                <FilterSelect
                  label="Date Range"
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  options={["upcoming", "past"]}
                  icon={<Calendar size={18} className="text-pink-400" />}
                />
              </div>
              {(filterStatus || filterProfessionalType || filterDateRange) && (
                <div className="pt-4 mt-6 border-t border-gray-100">
                  <div className="flex flex-wrap items-center gap-2">
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
                    {filterProfessionalType && (
                      <FilterBadge
                        label="Type"
                        value={filterProfessionalType}
                        onClear={() => clearFilter("professionalType")}
                      />
                    )}
                    {filterDateRange && (
                      <FilterBadge
                        label="Date"
                        value={filterDateRange}
                        onClear={() => clearFilter("dateRange")}
                      />
                    )}
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center gap-1 px-4 py-1 ml-auto text-sm font-medium text-pink-600 transition-all duration-300 rounded-full bg-pink-50 hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
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
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-400 to-yellow-300">
                <Calendar size={32} className="text-white" />
              </div>
              <p className="mt-4 text-lg font-medium text-gray-600">
                Loading your appointments...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-white border border-gray-100 shadow-lg rounded-2xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-pink-100 rounded-full">
              <AlertTriangle size={32} className="text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Unable to Load Appointments
            </h3>
            <p className="max-w-md mx-auto mt-2 text-gray-600">{error}</p>
            <button
              onClick={fetchAppointments}
              className="px-6 py-2 mt-6 text-sm font-medium text-white transition-all duration-300 shadow-sm bg-gradient-to-r from-pink-400 to-yellow-300 rounded-xl hover:from-pink-500 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              Try Again
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-16 text-center bg-white border border-gray-100 shadow-lg rounded-2xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-pink-200 to-yellow-100">
              <Calendar size={40} className="text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              No Appointments Yet
            </h3>
            <p className="max-w-md mx-auto mt-2 text-gray-600">
              You haven't booked any appointments yet. Start by booking one now!
            </p>
            <button
              onClick={() => navigate("/vets")}
              className="px-8 py-3 mt-6 text-sm font-medium text-white transition-all duration-300 shadow-md bg-gradient-to-r from-pink-400 to-yellow-300 rounded-xl hover:shadow-lg hover:from-pink-500 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
              disabled={loading}
            >
              Book Your First Appointment
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-16 text-center bg-white border border-gray-100 shadow-lg rounded-2xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-pink-100 rounded-full">
              <SearchX size={32} className="text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              No Matching Appointments
            </h3>
            <p className="max-w-md mx-auto mt-2 text-gray-600">
              No appointments match your current filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2 mt-6 text-sm font-medium text-white transition-all duration-300 shadow-sm bg-gradient-to-r from-pink-400 to-yellow-300 rounded-xl hover:from-pink-500 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-1 gap-6 md:grid-cols-2 animate-fadeIn"
              style={{ animationDelay: "0.2s" }}
            >
              {paginatedAppointments.map((appointment, index) => (
                <AppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                  onAction={handleAction}
                  disabled={loading}
                  style={{ animationDelay: `${0.1 * index}s` }}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center max-w-md p-2 mx-auto mt-12 bg-white shadow-md rounded-xl">
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

        {viewModal && (
          <ViewAppointmentModal
            appointment={viewModal.appointment}
            onClose={() => setViewModal(null)}
          />
        )}
        {updateModal && (
          <UpdateAppointmentModal
            appointment={updateModal.appointment}
            onClose={() => setUpdateModal(null)}
            onSuccess={handleActionSuccess}
          />
        )}
        {deleteModal && (
          <DeleteCancelAppointmentModal
            appointment={deleteModal.appointment}
            onClose={() => setDeleteModal(null)}
            onSuccess={handleActionSuccess}
          />
        )}
      </div>
    </div>
  );
};

function getStatusColor(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-300";
    case "confirmed":
      return "bg-green-400";
    case "completed":
      return "bg-blue-300";
    case "cancelled":
      return "bg-red-400";
    case "notAvailable":
      return "bg-gray-400";
  }
}

function getStatusBadgeColor(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "confirmed":
      return "bg-green-100 text-green-700";
    case "completed":
      return "bg-blue-100 text-blue-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "notAvailable":
      return "bg-gray-100 text-gray-700";
  }
}

export default MyVetappointments;
