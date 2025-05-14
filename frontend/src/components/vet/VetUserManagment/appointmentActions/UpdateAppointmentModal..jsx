import React, { useState, useEffect, useMemo } from "react";
import { X, Check, ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";

const UpdateAppointmentModal = ({ appointment, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [reservedSlots, setReservedSlots] = useState([]);
  const [reservedSlotsByDate, setReservedSlotsByDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(normalizeDate(new Date(appointment.date)));
  const [selectedDate, setSelectedDate] = useState(normalizeDate(new Date(appointment.date)));
  const [selectedTime, setSelectedTime] = useState(appointment.time);
  const [professional, setProfessional] = useState(null);
  const [formData, setFormData] = useState({
    date: formatDate(normalizeDate(new Date(appointment.date))),
    time: appointment.time,
    reason: appointment.reason || "",
    notes: appointment.notes || "",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const professionalId = appointment.professionalId?._id || appointment.professionalId;
  const professionalType = appointment.professionalType;
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const consultationDuration = professional?.details?.averageConsultationDuration || 60;
  const professionalName = appointment.professionalType.toLowerCase() === "vet" ? "Veterinarian" : "Trainer";

  // Utility functions (unchanged)
  function normalizeDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
      console.error("Invalid date input:", date);
      return new Date();
    }
    const newDate = new Date(date);
    newDate.setUTCHours(0, 0, 0, 0);
    return newDate;
  }

  function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
      console.error("Invalid date for formatting:", date);
      return "";
    }
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
  }

  function formatTimeSlot(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function getGeneralHours() {
    const openingHours = professional?.details?.openingHours;
    if (!openingHours) return "Availability not specified";
    const openDays = weekdays
      .map((day) => day.toLowerCase())
      .filter((day) => openingHours[day] !== "Closed");
    if (openDays.length === 0) return "No regular hours available";
    return `Open: ${openDays.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}`;
  }

  // Fetch initial professional data and reserved slots (with improved error handling)
  useEffect(() => {
    const fetchInitialData = async () => {
      console.log("fetchInitialData triggered for professionalId:", professionalId, "professionalType:", professionalType);
      setLoading(true);
      setReservedSlotsByDate(null);

      try {
        const year = currentDate.getUTCFullYear();
        const month = currentDate.getUTCMonth() + 1;
        const endpoint = professionalType === "Vet" ? `/api/user/vet/${professionalId}` : `/api/user/trainer/${professionalId}`;

        const [professionalResponse, reservedResponse] = await Promise.all([
          axiosInstance.get(endpoint),
          axiosInstance.get(`/api/appointments/reserved-month`, {
            params: { professionalId, year, month, professionalType },
          }),
        ]);

        console.log("Professional API response:", professionalResponse.data);
        console.log("Reserved slots API response:", reservedResponse.data);

        const proData = professionalType === "Vet" ? professionalResponse.data.vet : professionalResponse.data.trainer;
        if (!proData) throw new Error(`No ${professionalType} data returned`);
        setProfessional({
          ...proData,
          details: professionalType === "Vet" 
            ? proData.veterinarianDetails 
            : (proData.trainerDetails || { openingHours: {}, averageConsultationDuration: 30 }),
        });

        const reservedData = reservedResponse.data.reservedSlotsByDate || {};
        if (!reservedData || typeof reservedData !== "object") {
          console.warn("Invalid reserved slots data, using empty object");
          setReservedSlotsByDate({});
        } else {
          console.log("Fetched reserved slots for", `${year}-${month}:`, reservedData);
          setReservedSlotsByDate(reservedData);
        }
      } catch (err) {
        console.error("Fetch Initial Data Error:", err.message, err.response?.data);
        setError(
          err.response?.status === 404
            ? `${professionalType} not found. They may no longer be available.`
            : `Failed to load ${professionalType.toLowerCase()} data: ${err.message}`
        );
        setReservedSlotsByDate({});
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [professionalId, currentDate, professionalType]);

  // Rest of the useEffect hooks (unchanged)
  useEffect(() => {
    const fetchReservedSlots = async () => {
      if (!selectedDate || !professional) return;
      setLoading(true);
      try {
        const formattedDate = formatDate(selectedDate);
        const response = await axiosInstance.get(`/api/appointments/reserved/${professionalId}`, {
          params: { date: formattedDate, professionalType },
        });
        setReservedSlots(response.data.reservedSlots || []);
      } catch (err) {
        console.error("Fetch Reserved Slots Error:", err);
        setError("Failed to fetch reserved slots");
      } finally {
        setLoading(false);
      }
    };
    fetchReservedSlots();
  }, [selectedDate, professionalId, professional, professionalType]);

  useEffect(() => {
    if (selectedDate && professional && reservedSlotsByDate !== null) {
      const slots = getAvailableTimeSlots(selectedDate);
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, reservedSlots, reservedSlotsByDate, professional]);

  // Rest of the functions (unchanged)
  function isDayOpen(date) {
    const dayOfWeek = weekdays[date.getDay()].toLowerCase();
    const openingHours = professional?.details?.openingHours;
    return openingHours?.[dayOfWeek] !== "Closed";
  }

  function getPotentialTimeSlots(date) {
    if (!professional?.details?.openingHours) return [];
    const dayOfWeek = weekdays[date.getDay()].toLowerCase();
    const openingHours = professional.details.openingHours;
    if (!openingHours || openingHours[dayOfWeek] === "Closed") return [];

    const slots = [];
    const sessionType = openingHours[dayOfWeek];
    const start1 = openingHours[`${dayOfWeek}Start`];
    const end1 = openingHours[`${dayOfWeek}End`];
    if (start1 && end1) slots.push(...generateTimeSlots(start1, end1, consultationDuration));
    if (sessionType === "Double Session") {
      const start2 = openingHours[`${dayOfWeek}Start2`];
      const end2 = openingHours[`${dayOfWeek}End2`];
      if (start2 && end2) slots.push(...generateTimeSlots(start2, end2, consultationDuration));
    }
    return slots;
  }

  function generateTimeSlots(startTime, endTime, duration) {
    const slots = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);
    const endDate = new Date();
    endDate.setHours(endHour, endMinute, 0, 0);
    endDate.setMinutes(endDate.getMinutes() - duration);
    let currentTime = new Date(startDate);
    while (currentTime <= endDate) {
      const hours = currentTime.getHours().toString().padStart(2, "0");
      const minutes = currentTime.getMinutes().toString().padStart(2, "0");
      slots.push(`${hours}:${minutes}`);
      currentTime.setMinutes(currentTime.getMinutes() + duration);
    }
    return slots;
  }

  function getAvailableTimeSlots(date) {
    const normalizedDate = normalizeDate(date);
    const potentialSlots = getPotentialTimeSlots(normalizedDate);
    const dateStr = formatDate(normalizedDate);
    const reserved = [...new Set([...(reservedSlotsByDate?.[dateStr] || []), ...reservedSlots])];
    return potentialSlots.filter((slot) => !reserved.includes(slot));
  }

  function isDayFullyBooked(date) {
    if (!professional?.details?.openingHours || reservedSlotsByDate === null) return false;
    const normalizedDate = normalizeDate(date);
    const dateStr = formatDate(normalizedDate);
    const potentialSlots = getPotentialTimeSlots(normalizedDate);
    if (potentialSlots.length === 0) return false;
    const reservedSlotsForDate = reservedSlotsByDate[dateStr] || [];
    const allReservedSlots =
      dateStr === formatDate(selectedDate)
        ? [...new Set([...reservedSlotsForDate, ...reservedSlots])]
        : reservedSlotsForDate;
    return potentialSlots.every((slot) => allReservedSlots.includes(slot));
  }

  const getDaysInMonthView = useMemo(() => {
    if (!professional?.details?.openingHours || reservedSlotsByDate === null) {
      console.log("getDaysInMonthView: Data not ready, returning empty array");
      return [];
    }

    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
    firstDayOfMonth.setUTCHours(0, 0, 0, 0);
    const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));
    lastDayOfMonth.setUTCHours(0, 0, 0, 0);
    const result = [];
    const firstDayOfWeek = firstDayOfMonth.getDay();

    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(Date.UTC(year, month, 1 - (firstDayOfWeek - i)));
      date.setUTCHours(0, 0, 0, 0);
      const isOpen = isDayOpen(date);
      const isFullyBooked = isOpen ? isDayFullyBooked(date) : false;
      result.push({ date, isCurrentMonth: false, isOpen, isFullyBooked });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(Date.UTC(year, month, i));
      date.setUTCHours(0, 0, 0, 0);
      const isOpen = isDayOpen(date);
      const isFullyBooked = isOpen ? isDayFullyBooked(date) : false;
      result.push({ date, isCurrentMonth: true, isOpen, isFullyBooked });
    }

    const lastDayOfWeek = lastDayOfMonth.getDay();
    const daysToAdd = 6 - lastDayOfWeek;
    for (let i = 1; i <= daysToAdd; i++) {
      const date = new Date(Date.UTC(year, month + 1, i));
      date.setUTCHours(0, 0, 0, 0);
      const isOpen = isDayOpen(date);
      const isFullyBooked = isOpen ? isDayFullyBooked(date) : false;
      result.push({ date, isCurrentMonth: false, isOpen, isFullyBooked });
    }

    return result;
  }, [currentDate, professional, reservedSlotsByDate]);

  // Event handlers (unchanged)
  const handleDateSelect = (date) => {
    const normalizedDate = normalizeDate(date);
    if (isDayFullyBooked(normalizedDate)) {
      setError("This day is fully booked. Please select another date.");
      return;
    }
    setSelectedDate(normalizedDate);
    setSelectedTime(null);
    setFormData({ ...formData, date: formatDate(normalizedDate), time: "" });
    setError(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setFormData({ ...formData, time });
    setError(null);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setUTCMonth(newDate.getUTCMonth() - 1, 1);
    newDate.setUTCHours(0, 0, 0, 0);
    console.log("Moving to previous month:", newDate.toISOString());
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setUTCMonth(newDate.getUTCMonth() + 1, 1);
    newDate.setUTCHours(0, 0, 0, 0);
    console.log("Moving to next month:", newDate.toISOString());
    setCurrentDate(newDate);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const updateData = {
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        notes: formData.notes,
      };
      const response = await axiosInstance.put(`/api/appointments/update/${appointment._id}`, updateData);
      if (!response.data.success) throw new Error(response.data.message || "Update failed");

      const oldDate = appointment.date;
      const newDate = formData.date;
      setReservedSlotsByDate((prev) => {
        const updated = { ...prev };
        if (oldDate !== newDate) {
          updated[oldDate] = (updated[oldDate] || []).filter((t) => t !== appointment.time);
          if (updated[oldDate].length === 0) delete updated[oldDate];
          updated[newDate] = [...(updated[newDate] || []), formData.time];
        } else if (appointment.time !== formData.time) {
          updated[newDate] = (updated[newDate] || []).filter((t) => t !== appointment.time).concat(formData.time);
        }
        return updated;
      });

      setShowSuccess(true);
      setTimeout(() => {
        onSuccess({ action: "update", appointment: response.data.appointment });
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Update Error:", err);
      setError(err.response?.data?.message || "Failed to update appointment");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    if (showSuccess) {
      return (
        <div className="py-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check size={32} className="text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Appointment Updated!</h3>
          <p className="text-center text-gray-600 text-sm">
            Your appointment for {appointment.petName} has been updated to {selectedDate.toLocaleDateString()} at{" "}
            {formatTimeSlot(formData.time)}.
          </p>
        </div>
      );
    }

    switch (step) {
      case 1: // Select Date
        return (
          <div className="space-y-4 p-6">
            <h3 className="text-xl font-semibold text-gray-800">Select a Date</h3>
            {loading ? (
              <div className="text-center">
                <div className="inline-block w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-gray-600">Loading calendar...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : !professional?.details?.openingHours || reservedSlotsByDate === null ? (
              <div className="text-center text-red-500">
                Unable to load {professionalType.toLowerCase()} availability. Please try again later.
              </div>
            ) : (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-pink-50 transition-colors">
                    <ChevronLeft size={20} className="text-pink-400" />
                  </button>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                  </h4>
                  <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-pink-50 transition-colors">
                    <ChevronRight size={20} className="text-pink-400" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-600 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="py-1">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonthView.map((day, index) => {
                    const today = new Date();
                    today.setUTCHours(0, 0, 0, 0);
                    const isToday = day.date.toDateString() === today.toDateString();
                    const isPast = day.date < today;
                    const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
                    const isFullyBooked = day.isFullyBooked;

                    return (
                      <button
                        key={index}
                        className={`
                          h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                          ${!day.isCurrentMonth ? "text-gray-300" : isPast ? "text-gray-400" : isFullyBooked ? "text-red-600" : "text-gray-800"}
                          ${isToday ? "ring-2 ring-pink-300" : ""}
                          ${isSelected ? "bg-pink-400 text-white" : ""}
                          ${isFullyBooked ? "ring-2 ring-red-500 bg-red-100 text-black opacity-50 cursor-not-allowed" : isPast || !day.isOpen ? "bg-gray-300 opacity-50 cursor-not-allowed" : "hover:bg-pink-100"}
                        `}
                        onClick={() => !isPast && day.isOpen && !isFullyBooked && handleDateSelect(day.date)}
                        disabled={isPast || !day.isOpen || isFullyBooked}
                      >
                        {day.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-600 justify-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span>Unavailable</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full ring-2 ring-pink-300"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full ring-2 ring-red-500 bg-red-100"></div>
                <span>Fully Booked</span>
              </div>
            </div>
          </div>
        );
      case 2: // Choose Time
        return (
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Choose a Time</h3>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                <ChevronLeft size={16} />
                Change Date
              </button>
            </div>
            <div className="bg-pink-50 rounded-xl p-4 mb-4 border border-pink-100">
              <div className="flex items-start gap-3">
                <Calendar className="text-pink-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Consultation duration: {consultationDuration} minutes</p>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-gray-600">Loading available times...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Available Time Slots:</h4>
                {selectedTime && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Selected Time:</span>{" "}
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-lg">
                        {formatTimeSlot(selectedTime)}
                      </span>
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      className={`
                        py-2 px-2 text-sm font-medium rounded-lg border transition-all
                        ${selectedTime === time ? "bg-pink-400 text-white border-pink-400" : "border-gray-200 hover:bg-pink-100 hover:border-pink-300"}
                      `}
                      onClick={() => handleTimeSelect(time)}
                      disabled={selectedTime === time}
                    >
                      {formatTimeSlot(time)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Clock size={28} className="mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-700">{error || "No available times for this date."}</p>
                <button
                  onClick={() => setStep(1)}
                  className="mt-3 text-pink-500 hover:text-pink-600 text-sm font-medium"
                >
                  Pick Another Date
                </button>
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      case 3: // Confirm Details
        return (
          <div className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Confirm Details</h3>
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1 text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                <ChevronLeft size={16} />
                Change Time
              </button>
            </div>
            <div className="bg-gradient-to-r from-pink-50 to-yellow-50 rounded-xl p-4 border border-pink-100">
              <div className="flex items-start gap-3">
                <Calendar className="text-pink-400 mt-1" size={24} />
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Appointment Summary</h4>
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">Date:</span>{" "}
                    {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Time:</span> {formatTimeSlot(formData.time)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{professionalType}:</span>{" "}
                    {professional?.fullName || appointment.professionalId?.fullName || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Pet:</span> {appointment.petName}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-white"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-white"
                  rows="3"
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-hidden mt-20">
      <div className="bg-white rounded-tl-2xl rounded-tr-3xl rounded-br-2xl rounded-bl-3xl w-full max-w-lg shadow-lg border border-gray-100 mx-4 my-8 max-h-[85vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-yellow-50 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {professional && (
                <img
                  src={professional.image || `/default-${professionalType.toLowerCase()}.jpg`}
                  alt={professional.fullName || "Professional"}
                  className="w-12 h-12 rounded-full object-cover border-2 border-pink-200"
                  onError={(e) => (e.target.src = `/default-${professionalType.toLowerCase()}.jpg`)}
                />
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {professional ? `${professional.fullName} (${professionalType})` : "Loading..."}
                </h2>
                {professional ? (
                  <p className="text-xs text-gray-500">{getGeneralHours()}</p>
                ) : (
                  <p className="text-sm text-gray-600">Loading details...</p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-pink-100 transition-colors">
              <X size={18} className="text-pink-500" />
            </button>
          </div>
        </div>

        <div className="flex justify-between px-6 py-4 bg-gray-50 shrink-0">
          {["Select Date", "Choose Time", "Confirm Details"].map((label, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${step > index + 1 ? "bg-green-400 text-white" : step === index + 1 ? "bg-pink-400 text-white" : "bg-gray-200 text-gray-500"}
                `}
              >
                {step > index + 1 ? <Check size={16} /> : index + 1}
              </div>
              <span className={`text-xs mt-1 ${step >= index + 1 ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-0 flex-1">{renderStepContent()}</div>

        {!showSuccess && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-500 transition-colors"
                disabled={loading}
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1 && !selectedDate) {
                    setError("Please select a date");
                    return;
                  }
                  if (step === 2 && !selectedTime) {
                    setError("Please select a time");
                    return;
                  }
                  setError(null);
                  setStep(step + 1);
                }}
                className={`px-6 py-2 text-sm font-medium text-white rounded-xl transition-all
                  ${(step === 1 && !selectedDate) || (step === 2 && !selectedTime)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-pink-400 to-yellow-300 hover:from-pink-500 hover:to-yellow-400"}
                `}
                disabled={(step === 1 && !selectedDate) || (step === 2 && !selectedTime) || loading}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleUpdate}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-yellow-300 rounded-xl hover:from-pink-500 hover:to-yellow-400 transition-all disabled:opacity-50"
                disabled={loading || !formData.date || !formData.time}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </span>
                ) : (
                  "Confirm Update"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateAppointmentModal;