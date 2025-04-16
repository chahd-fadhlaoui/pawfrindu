  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { ChevronLeft, ChevronRight, Filter, Calendar, X, Trash2, Edit } from "lucide-react";
  import EmptyState from "../../components/EmptyState";
  import { Tooltip } from "../../components/Tooltip";
  import axiosInstance from "../../utils/axiosInstance";
  import { useApp } from "../../context/AppContext";
  import AppointmentActionModal from "../../components/vet/AppointmentActionModal";

  const STATUS_STYLES = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  const ITEMS_PER_PAGE = 9;
  const STATUS_OPTIONS = ["pending", "confirmed", "cancelled"];
  const PROFESSIONAL_TYPE_OPTIONS = ["Vet", "Trainer"];

  const StatusBadge = ({ status }) => (
    <span
      className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border shadow-sm transition-all duration-300 ${
        STATUS_STYLES[status] || "bg-gray-100 text-gray-600 border-gray-200"
      } hover:opacity-80`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  const FilterSelect = ({ label, value, onChange, options }) => (
    <div className="w-full sm:w-auto flex-1 min-w-[140px]">
      <select
        className="w-full px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400 hover:border-pink-300 transition-all duration-300"
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
    </div>
  );

  const FilterBadge = ({ label, value, onClear }) => (
    <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-pink-600 bg-pink-50 rounded-full border border-pink-200 shadow-sm">
      {label}: {value.charAt(0).toUpperCase() + value.slice(1)}
      <button onClick={onClear} className="ml-1 text-pink-600 hover:text-pink-800 transition-colors duration-300">
        <X size={14} />
      </button>
    </span>
  );

  const AppointmentCard = ({ appointment, onAction, disabled }) => {
    const formatDateTime = (date, time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const dateObj = new Date(date);
      dateObj.setHours(hours, minutes);
      return dateObj.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    return (
      <div
        className={`relative bg-white border-2 border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${
          disabled ? "opacity-50" : "hover:shadow-md hover:scale-[1.01]"
        }`}
      >
        <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-800 transition-colors duration-300 hover:text-pink-600">
              {appointment.petName}
            </h3>
            <p className="text-sm text-gray-600">
              {appointment.professionalType} • {appointment.professionalId?.fullName || "Unknown"}
            </p>
            <p className="text-sm text-gray-500">{formatDateTime(appointment.date, appointment.time)}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={appointment.status} />
            <Tooltip text="Update Appointment">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) onAction(appointment, "update");
                }}
                className="p-2 bg-white border border-gray-200 rounded-full hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-pink-200"
                disabled={disabled || appointment.status === "confirmed" || appointment.status === "cancelled"}
              >
                <Edit size={16} />
              </button>
            </Tooltip>
            <Tooltip text="Cancel Appointment">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) onAction(appointment, "delete");
                }}
                className="p-2 bg-white border border-gray-200 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                disabled={disabled || appointment.status === "cancelled"}
              >
                <Trash2 size={16} />
              </button>
            </Tooltip>
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
    const [actionModal, setActionModal] = useState(null);

    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/appointments/my-appointments");
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
            const response = await axiosInstance.get("/api/appointments/my-appointments");
            setAppointments(response.data.appointments || []);
          } catch (err) {
            console.error("Error fetching updated appointments:", err);
            setAppointments((prev) => [
              {
                _id: data.appointmentId,
                petOwnerId: data.petOwnerId,
                professionalId: { _id: data.professionalId },
                professionalType: data.professionalType,
                date: data.date,
                time: data.time,
                petName: data.petName,
                status: "pending",
              },
              ...prev,
            ].sort((a, b) => new Date(b.date) - new Date(a.date)));
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
    
      // Handle both vet and owner cancellations
      const handleCancellation = (data, eventName) => {
        console.log(`${eventName} event:`, data);
        console.log("Checking IDs - petOwnerId:", data.petOwnerId, "user._id:", user._id.toString());
        console.log("Checking appointmentId:", data.appointmentId, "appointments:", appointments.map((appt) => appt._id));
        if (data.petOwnerId === user._id.toString()) {
          setAppointments((prev) =>
            prev.map((appt) =>
              appt._id === data.appointmentId
                ? {
                    ...appt,
                    status: "cancelled",
                    cancellationReason: data.cancellationReason || appt.cancellationReason,
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
          setAppointments((prev) => prev.filter((appt) => appt._id !== data.appointmentId));
        }
      });
    
      socket.on("appointmentUpdated", (data) => {
        console.log("Appointment updated event:", data);
        if (data.petOwnerId === user?._id) {
          setAppointments((prev) => prev.map((appt) => (appt._id === data._id ? data : appt)));
        }
      });
    
      return () => {
        socket.off("connect");
        socket.off("connect_error");
        socket.off("roomJoined");
        socket.off("appointmentBooked");
        socket.off("appointmentConfirmed");
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
      const typeMatch = !filterProfessionalType || appointment.professionalType === filterProfessionalType;
      const dateMatch = !filterDateRange || (() => {
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
      setActionModal({ appointment, action: actionType });
    };

    const handleActionSuccess = ({ action, appointmentId, appointment }) => {
      if (action === "delete" || action === "cancel") {
        setAppointments((prev) =>
          action === "delete"
            ? prev.filter((appt) => appt._id !== appointmentId)
            : prev.map((appt) =>
                appt._id === appointmentId ? { ...appt, status: "cancelled", cancellationReason: appt.cancellationReason } : appt
              )
        );
      } else if (action === "update") {
        setAppointments((prev) => prev.map((appt) => (appt._id === appointment._id ? appointment : appt)));
      }
    };

    return (
      <div className="container mx-auto py-8 bg-gradient-to-br from-white to-pink-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Appointments</h1>
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-pink-400 to-yellow-300 rounded-xl shadow-sm hover:from-pink-500 hover:to-yellow-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                <Filter size={16} />
                {isFilterOpen ? "Hide Filters" : "Filter Appointments"}
              </button>
              {filteredAppointments.length > 0 && (
                <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-pink-600 bg-pink-50 border border-pink-200 rounded-full shadow-sm">
                  <Calendar size={16} className="text-pink-600" /> {filteredAppointments.length} Appointments
                </span>
              )}
              <button
                onClick={() => navigate("/vets")}
                className="flex items-center gap-2 px-6 py-2 text-white bg-gradient-to-r from-pink-400 to-yellow-300 rounded-xl shadow-sm hover:from-pink-500 hover:to-yellow-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-300"
                disabled={loading}
              >
                <Calendar size={16} />
                Book Appointment
              </button>
            </div>
            <div
              className={`grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 md:grid-cols-3 transition-all duration-300 ease-in-out ${
                isFilterOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <FilterSelect
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={STATUS_OPTIONS}
              />
              <FilterSelect
                label="Professional Type"
                value={filterProfessionalType}
                onChange={(e) => setFilterProfessionalType(e.target.value)}
                options={PROFESSIONAL_TYPE_OPTIONS}
              />
              <FilterSelect
                label="Date Range"
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                options={["upcoming", "past"]}
              />
            </div>
            {(filterStatus || filterProfessionalType || filterDateRange) && (
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="text-sm font-medium text-gray-600">Applied Filters:</span>
                {filterStatus && <FilterBadge label="Status" value={filterStatus} onClear={() => clearFilter("status")} />}
                {filterProfessionalType && (
                  <FilterBadge
                    label="Type"
                    value={filterProfessionalType}
                    onClear={() => clearFilter("professionalType")}
                  />
                )}
                {filterDateRange && (
                  <FilterBadge label="Date" value={filterDateRange} onClear={() => clearFilter("dateRange")} />
                )}
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-1 text-sm font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center animate-pulse">
                <Calendar size={48} className="mx-auto text-pink-500" />
                <p className="mt-4 text-lg font-medium text-gray-600">Loading your appointments...</p>
              </div>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-pink-500 animate-bounce" />
              <h3 className="text-xl font-semibold text-gray-800">Error</h3>
              <p className="mt-2 text-gray-600">{error}</p>
              <button
                onClick={fetchAppointments}
                className="mt-6 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-yellow-300 rounded-xl shadow-sm hover:from-pink-500 hover:to-yellow-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                Retry
              </button>
            </div>
          ) : appointments.length === 0 ? (
            <EmptyState
              message="You haven't booked any appointments yet. Start by booking one now!"
              buttonText="Book Appointment"
              buttonAction={() => navigate("/vets")}
              disabled={loading}
            />
          ) : filteredAppointments.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-pink-500 animate-bounce" />
              <h3 className="text-xl font-semibold text-gray-800">No Results Found</h3>
              <p className="mt-2 text-gray-600">Adjust your filters or book a new appointment!</p>
              <button
                onClick={clearAllFilters}
                className="mt-6 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-yellow-300 rounded-xl shadow-sm hover:from-pink-500 hover:to-yellow-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
                {paginatedAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    onAction={handleAction}
                    disabled={loading}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div
                  className="flex items-center justify-center gap-4 mt-12 animate-fadeIn"
                  style={{ animationDelay: "0.4s" }}
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className={`p-2 rounded-full ${
                      currentPage === 1 || loading ? "text-gray-300 cursor-not-allowed" : "text-pink-500 hover:bg-pink-50"
                    } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300`}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-full text-sm font-medium ${
                          currentPage === page
                            ? "bg-pink-400 text-white shadow-md"
                            : "text-gray-600 hover:bg-pink-50"
                        } transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-300`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className={`p-2 rounded-full ${
                      currentPage === totalPages || loading
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-pink-500 hover:bg-pink-50"
                    } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300`}
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Action Modal */}
          {actionModal && (
            <AppointmentActionModal
              appointment={actionModal.appointment}
              action={actionModal.action}
              onClose={() => setActionModal(null)}
              onSuccess={handleActionSuccess}
            />
          )}
        </div>
      </div>
    );
  };

  export default MyVetappointments;