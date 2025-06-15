import { Calendar, Clock, DollarSign, TrendingUp, Users, Activity, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socket from "../../../utils/socket"; 
import { useApp } from "../../../context/AppContext";
import axiosInstance from "../../../utils/axiosInstance";

const SectionCard = ({ icon: Icon, title, children, className = "" }) => (
  <div className={`p-6 bg-white border border-gray-100 rounded-lg shadow-sm ${className}`}>
    <div className="flex items-center gap-3 pb-3 mb-4 border-b border-gray-100">
      <Icon className="w-6 h-6 text-[#ffc929]" />
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, title, value, subtitle, color = "text-[#ffc929]" }) => (
  <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-yellow-50`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    confirmed: { color: 'bg-blue-100 text-blue-800', icon: Clock },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
    notAvailable: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      <Icon className="w-3 h-3" />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
};

const FilterButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? "bg-gradient-to-r from-yellow-500 to-pink-500 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50"
    }`}
  >
    {label}
  </button>
);

const Stats = ({ isSidebarCollapsed = false }) => {
  const { user, currencySymbol } = useApp();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      if (!user?._id) {
        throw new Error("User ID is not available");
      }
      const response = await axiosInstance.get(`/api/appointments/trainer-appointments`, {
        params: { professionalId: user._id },
      });
      const fetchedAppointments = response.data.appointments || [];
      // Log any appointments with missing petOwnerId for debugging
      fetchedAppointments.forEach((appt, index) => {
        if (!appt.petOwnerId || !appt.petOwnerId._id) {
          console.warn(`Appointment at index ${index} has invalid petOwnerId:`, appt);
        }
      });
      setAppointments(fetchedAppointments);
    } catch (err) {
      setError("Failed to load appointment data");
      toast.error("Failed to load appointment data", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id && user?.role === "Trainer") {
      fetchAppointments();
    }
  }, [user]);

  useEffect(() => {
    socket.on("appointmentBooked", (data) => {
      if (data.professionalId === user?._id && data.professionalType === "Trainer") {
        setAppointments((prev) => [...prev, data]);
      }
    });

    socket.on("appointmentConfirmed", (data) => {
      if (data.professionalId === user?._id && data.professionalType === "Trainer") {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === data.appointmentId ? { ...appt, status: "confirmed" } : appt
          )
        );
      }
    });

    socket.on("appointmentCancelled", (data) => {
      if (data.professionalId === user?._id && data.professionalType === "Trainer") {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === data.appointmentId ? { ...appt, status: "cancelled" } : appt
          )
        );
      }
    });

    socket.on("appointmentCompleted", (data) => {
      if (data.professionalId === user?._id && data.professionalType === "Trainer") {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === data.appointmentId ? { ...appt, status: "completed" } : appt
          )
        );
      }
    });

    socket.on("appointmentNotAvailable", (data) => {
      if (data.professionalId === user?._id && data.professionalType === "Trainer") {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === data.appointmentId ? { ...appt, status: "notAvailable" } : appt
          )
        );
      }
    });

    return () => {
      socket.off("appointmentBooked");
      socket.off("appointmentConfirmed");
      socket.off("appointmentCancelled");
      socket.off("appointmentCompleted");
      socket.off("appointmentNotAvailable");
    };
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    if (timeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(appointment => {
        if (!appointment.date) return false;
        const appointmentDate = new Date(appointment.date);

        switch (timeFilter) {
          case 'today':
            return appointmentDate.toDateString() === today.toDateString();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return appointmentDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return appointmentDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }

    return filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [appointments, timeFilter, statusFilter]);

  const stats = useMemo(() => {
    try {
      const total = filteredAppointments.length;
      const completed = filteredAppointments.filter(a => a.status === 'completed').length;
      const confirmed = filteredAppointments.filter(a => a.status === 'confirmed').length;
      const pending = filteredAppointments.filter(a => a.status === 'pending').length;
      const cancelled = filteredAppointments.filter(a => a.status === 'cancelled').length;
      const notAvailable = filteredAppointments.filter(a => a.status === 'notAvailable').length;

      const totalRevenue = filteredAppointments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.price || 0), 0);

      const totalHours = filteredAppointments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.duration || 0), 0) / 60;

      const uniqueClients = new Set(
        filteredAppointments
          .filter(a => a.petOwnerId && a.petOwnerId._id)
          .map(a => a.petOwnerId._id)
      ).size;

      const uniquePets = new Set(
        filteredAppointments
          .filter(a => a.petName)
          .map(a => a.petName)
      ).size;

      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      const petTypes = filteredAppointments.reduce((acc, a) => {
        if (a.petType) {
          acc[a.petType] = (acc[a.petType] || 0) + 1;
        }
        return acc;
      }, {});

      const topBreeds = filteredAppointments.reduce((acc, a) => {
        if (a.breed) {
          acc[a.breed] = (acc[a.breed] || 0) + 1;
        }
        return acc;
      }, {});

      const trainingReasons = filteredAppointments.reduce((acc, a) => {
        if (a.reason) {
          acc[a.reason] = (acc[a.reason] || 0) + 1;
        }
        return acc;
      }, {});

      const averagePricePerSession = completed > 0 ? Math.round(totalRevenue / completed) : 0;
      const averageSessionDuration = completed > 0 ? Math.round((totalHours * 60) / completed) : 0;

      const dates = [...new Set(
        filteredAppointments
          .filter(a => a.date)
          .map(a => a.date)
      )].sort();

      const trendData = dates.map(date => ({
        date,
        completed: filteredAppointments.filter(a => a.date === date && a.status === 'completed').length,
        confirmed: filteredAppointments.filter(a => a.date === date && a.status === 'confirmed').length,
      }));

      return {
        total,
        completed,
        confirmed,
        pending,
        cancelled,
        notAvailable,
        totalRevenue,
        totalHours: Math.round(totalHours * 10) / 10,
        uniqueClients,
        uniquePets,
        completionRate,
        petTypes,
        topBreeds,
        trainingReasons,
        averagePricePerSession,
        averageSessionDuration,
        trendData,
      };
    } catch (err) {
      console.error("Error calculating stats:", err);
      return {
        total: 0,
        completed: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        notAvailable: 0,
        totalRevenue: 0,
        totalHours: 0,
        uniqueClients: 0,
        uniquePets: 0,
        completionRate: 0,
        petTypes: {},
        topBreeds: {},
        trainingReasons: {},
        averagePricePerSession: 0,
        averageSessionDuration: 0,
        trendData: [],
      };
    }
  }, [filteredAppointments]);

  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * appointmentsPerPage;
    return filteredAppointments.slice(start, start + appointmentsPerPage);
  }, [filteredAppointments, currentPage]);

  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  if (error) {
    return (
      <div className={`flex-1 p-4 sm:p-6 space-y-6 flex items-center justify-center h-screen bg-gradient-to-r from-yellow-50 to-pink-50 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? "ml-16" : "ml-0 sm:ml-64"
      }`}>
        <div className="p-6 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-[#ff4444]" />
          <h3 className="text-lg font-semibold text-red-800">Error Loading Statistics</h3>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex-1 p-4 sm:p-6 space-y-6 ease-in-out items-center justify-center h-screen bg-gradient-to-br from-yellow-50 to-pink-50 transition-all duration-300 ${
        isSidebarCollapsed ? "ml-16" : "ml-0 md:ml-64"
      }`}>
        <div className="flex items-center">
          <Loader2 className="w-10 h-10 text-[#ffc929] animate-spin" />
          <span className="ml-3 text-base text-gray-700">Loading training statistics...</span>
        </div>
      </div>
    );
  }

  return (
    <main className={`flex-1 p-4 sm:p-6 space-y-6 transition-all duration-300 ease-in-out ${
      isSidebarCollapsed ? "ml-16" : "ml-0 md:ml-64"
    }`}>
      <section className="overflow-hidden bg-white rounded-lg shadow-sm">
        <div
          className="px-6 py-4 border-l-4"
          style={{ borderImage: "linear-gradient(to bottom, #ffc929, #ffa726) 1" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center p-2 rounded-lg bg-yellow-50">
              <FaCalendarAlt className="w-6 h-6 text-[#ffc929]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Training Statistics</h1>
              <p className="text-sm text-gray-500">Track your pet training sessions</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-gray-200">
          <div className="flex flex-wrap gap-2 mb-2 sm:gap-3 sm:mb-0">
            <span className="self-center text-sm font-medium text-gray-700">Time Period:</span>
            {[
              { label: "All Time", value: "all" },
              { label: "Today", value: "today" },
              { label: "This Week", value: "week" },
              { label: "This Month", value: "month" },
            ].map((option) => (
              <FilterButton
                key={option.value}
                label={option.label}
                isActive={timeFilter === option.value}
                onClick={() => {
                  setTimeFilter(option.value);
                  setCurrentPage(1);
                }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <span className="self-center text-sm font-medium text-gray-700">Status:</span>
            {[
              { label: "All", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Confirmed", value: "confirmed" },
              { label: "Completed", value: "completed" },
              { label: "Cancelled", value: "cancelled" },
              { label: "Not Available", value: "notAvailable" },
            ].map((option) => (
              <FilterButton
                key={option.value}
                label={option.label}
                isActive={statusFilter === option.value}
                onClick={() => {
                  setStatusFilter(option.value);
                  setCurrentPage(1);
                }}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Key Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={Calendar}
                title="Total Sessions"
                value={stats.total}
                subtitle={`${stats.completionRate}% completion rate`}
              />
              <StatCard
                icon={DollarSign}
                title="Revenue"
                value={`${currencySymbol}${stats.totalRevenue}`}
                subtitle="From completed sessions"
              />
              <StatCard
                icon={Clock}
                title="Training Hours"
                value={stats.totalHours}
                subtitle="Total completed hours"
              />
              <StatCard
                icon={Users}
                title="Unique Clients"
                value={stats.uniqueClients}
                subtitle="Active pet owners"
              />
              <StatCard
                icon={Activity}
                title="Unique Pets"
                value={stats.uniquePets}
                subtitle="Pets trained"
              />
              <StatCard
                icon={TrendingUp}
                title="Avg. Session Price"
                value={`${currencySymbol}${stats.averagePricePerSession}`}
                subtitle="Per completed session"
              />
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SectionCard icon={Activity} title="Session Status Breakdown">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Completed</span>
                    </div>
                    <span className="text-2xl font-bold text-green-800">{stats.completed}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Confirmed</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-800">{stats.confirmed}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Pending</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-800">{stats.pending}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-800">Not Available</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{stats.notAvailable}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800">Cancelled</span>
                    </div>
                    <span className="text-2xl font-bold text-red-800">{stats.cancelled}</span>
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={TrendingUp} title="Performance Metrics">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completion Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-pink-500"
                          style={{ width: `${stats.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-gray-800">{stats.completionRate}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Average Session Value</span>
                    <span className="font-semibold text-gray-800">
                      {currencySymbol}{stats.averagePricePerSession}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Average Session Length</span>
                    <span className="font-semibold text-gray-800">
                      {stats.averageSessionDuration} min
                    </span>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Pet Demographics */}
            <SectionCard icon={Activity} title="Pet Demographics">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800">Pet Types</h4>
                  {Object.keys(stats.petTypes).length > 0 ? (
                    Object.entries(stats.petTypes).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between p-2">
                        <span className="text-gray-600">{type}</span>
                        <span className="font-semibold text-gray-800">{count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No pet types available</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Top Breeds</h4>
                  {Object.keys(stats.topBreeds).length > 0 ? (
                    Object.entries(stats.topBreeds)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([breed, count]) => (
                        <div key={breed} className="flex items-center justify-between p-2">
                          <span className="text-gray-600">{breed}</span>
                          <span className="font-semibold text-gray-800">{count}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-600">No breeds available</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Training Reasons</h4>
                  {Object.keys(stats.trainingReasons).length > 0 ? (
                    Object.entries(stats.trainingReasons)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([reason, count]) => (
                        <div key={reason} className="flex items-center justify-between p-2">
                          <span className="text-gray-600">{reason}</span>
                          <span className="font-semibold text-gray-800">{count}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-600">No training reasons available</p>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Training Session Trends */}
            <SectionCard icon={TrendingUp} title="Training Session Trends">
              {stats.trendData.length > 0 ? (
                ```
                chartjs
                {
                  "type": "line",
                  "data": {
                    "labels": [${stats.trendData.map(d => `"${d.date}"`).join(',')}],
                    "datasets": [
                      {
                        "label": "Completed Sessions",
                        "data": [${stats.trendData.map(d => d.completed).join(',')}],
                        "borderColor": "#22c55e",
                        "backgroundColor": "rgba(34, 197, 94, 0.2)",
                        "fill": true
                      },
                      {
                        "label": "Confirmed Sessions",
                        "data": [${stats.trendData.map(d => d.confirmed).join(',')}],
                        "borderColor": "#3b82f6",
                        "backgroundColor": "rgba(59, 130, 246, 0.2)",
                        "fill": true
                      }
                    ]
                  },
                  "options": {
                    "responsive": true,
                    "scales": {
                      "y": {
                        "beginAtZero": true,
                        "title": {
                          "display": true,
                          "text": "Number of Sessions"
                        }
                      },
                      "x": {
                        "title": {
                          "display": true,
                          "text": "Date"
                        }
                      }
                    },
                    "plugins": {
                      "legend": {
                        "display": true,
                        "position": "top"
                      }
                    }
                  }
                }
                ```
              ) : (
                <p className="text-sm text-gray-600">No trend data available for the selected filters.</p>
              )}
            </SectionCard>

            {/* Recent Training Sessions */}
            <SectionCard icon={Calendar} title="Recent Training Sessions">
              {filteredAppointments.length === 0 ? (
                <div className="py-6 text-center">
                  <Calendar className="w-10 h-10 mx-auto mb-3 text-[#ffc929]" />
                  <h3 className="text-lg font-semibold text-gray-800">No Sessions Found</h3>
                  <p className="text-sm text-gray-600">
                    {timeFilter !== 'all' || statusFilter !== 'all'
                      ? 'Try adjusting your filters to see more results.'
                      : 'Your upcoming training sessions will appear here.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Showing {paginatedAppointments.length} of {filteredAppointments.length} sessions
                  </p>
                  <div className="space-y-3">
                    {paginatedAppointments.map((appointment) => (
                      <div
                        key={appointment._id || Math.random()} // Fallback key if _id is missing
                        className="p-4 border border-gray-100 rounded-md bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
                              {appointment.petOwnerId?.image ? (
                                <img
                                  src={appointment.petOwnerId.image}
                                  alt={appointment.petOwnerId.fullName || "Client"}
                                  className="object-cover w-10 h-10 rounded-full"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="text-base text-gray-600">
                                  {appointment.petOwnerId?.fullName?.charAt(0) || "C"}
                                </span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {appointment.petOwnerId?.fullName || "Unknown Client"}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {appointment.petName || "Unknown Pet"} ({appointment.petType || "N/A"})
                              </p>
                              <p className="text-sm text-gray-600">{appointment.reason || "No reason specified"}</p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span>{formatDate(appointment.date)}</span>
                                <span>{formatTime(appointment.time)}</span>
                                <span>{appointment.duration || 0} min</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <StatusBadge status={appointment.status} />
                            <p className="mt-1 text-lg font-semibold text-gray-800">
                              {currencySymbol}{appointment.price || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center mt-6 space-x-3">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </section>
      <ToastContainer />
    </main>
  );
};

export default Stats;