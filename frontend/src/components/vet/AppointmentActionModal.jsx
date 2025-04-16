import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Trash2, Check, ChevronLeft, ChevronRight, Eye, Edit } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const AppointmentActionModal = ({ appointment, action, onClose, onSuccess }) => {
  const [step, setStep] = useState(action === "view" ? 0 : action === "delete" ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [reservedSlots, setReservedSlots] = useState([]);
  const [reservedSlotsByDate, setReservedSlotsByDate] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date(appointment.date));
  const [selectedDate, setSelectedDate] = useState(new Date(appointment.date));
  const [selectedTime, setSelectedTime] = useState(appointment.time);
  const [vet, setVet] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date(appointment.date).toLocaleDateString("en-CA"),
    time: appointment.time,
    reason: appointment.reason || "",
    notes: appointment.notes || "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedAction, setSelectedAction] = useState(action);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showReschedulePrompt, setShowReschedulePrompt] = useState(false);

  const professionalId = appointment.professionalId?._id || appointment.professionalId;
  const professionalType = appointment.professionalType;
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const consultationDuration = vet?.veterinarianDetails?.averageConsultationDuration || 30;

  // Fetch initial vet data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const endpoint =
          professionalType === "Vet" ? `/api/user/vet/${professionalId}` : `/api/user/trainer/${professionalId}`;
        const [professionalResponse, reservedResponse] = await Promise.all([
          axiosInstance.get(endpoint),
          axiosInstance.get(`/api/appointments/reserved-month`, {
            params: {
              professionalId,
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
              professionalType,
            },
          }),
        ]);
        const vetData = professionalResponse.data.vet;
        if (!vetData) {
          throw new Error(`No ${professionalType} data returned`);
        }
        setVet(vetData);
        setReservedSlotsByDate(reservedResponse.data.reservedSlotsByDate || {});
      } catch (err) {
        console.error("Fetch Initial Data Error:", err.message, err.response?.data);
        setError(`Failed to load ${professionalType.toLowerCase()} data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [professionalId, currentDate, professionalType]);

  // Fetch reserved slots for the selected date
  useEffect(() => {
    const fetchReservedSlots = async () => {
      if (!selectedDate || !vet) return;
      setLoading(true);
      try {
        const formattedDate = selectedDate.toISOString().split("T")[0];
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
  }, [selectedDate, professionalId, vet, professionalType]);

  // Calculate available slots
  useEffect(() => {
    if (selectedDate && vet) {
      const slots = getAvailableTimeSlots(selectedDate);
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, reservedSlots, vet]);

  // Helper functions for update action
  const isDayOpen = (date) => {
    const dayOfWeek = weekdays[date.getDay()].toLowerCase();
    const openingHours =
      professionalType === "Vet" ? vet?.veterinarianDetails?.openingHours : vet?.trainerDetails?.openingHours;
    return openingHours?.[dayOfWeek] !== "Closed";
  };

  const getPotentialTimeSlots = (date) => {
    if (!vet) return [];
    const details = professionalType === "Vet" ? vet.veterinarianDetails : vet.trainerDetails;
    if (!details?.openingHours) return [];
    const dayOfWeek = weekdays[date.getDay()].toLowerCase();
    const openingHours = details.openingHours;

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
  };

  const generateTimeSlots = (startTime, endTime, duration) => {
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
  };

  const getAvailableTimeSlots = (date) => {
    const potentialSlots = getPotentialTimeSlots(date);
    return potentialSlots.filter((slot) => !reservedSlots.includes(slot));
  };

  const isDayFullyBooked = (date) => {
    const potentialSlots = getPotentialTimeSlots(date);
    const dateStr = date.toISOString().split("T")[0];
    const reserved = reservedSlotsByDate[dateStr] || [];
    return potentialSlots.length > 0 && potentialSlots.every((slot) => reserved.includes(slot));
  };

  const getDaysInMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const result = [];

    const firstDayOfWeek = firstDayOfMonth.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      result.push({ date, isCurrentMonth: false, isOpen: isDayOpen(date), isFullyBooked: isDayFullyBooked(date) });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i);
      result.push({ date, isCurrentMonth: true, isOpen: isDayOpen(date), isFullyBooked: isDayFullyBooked(date) });
    }

    const lastDayOfWeek = lastDayOfMonth.getDay();
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      const date = new Date(year, month + 1, i);
      result.push({ date, isCurrentMonth: false, isOpen: isDayOpen(date), isFullyBooked: isDayFullyBooked(date) });
    }

    return result;
  };

  const handleDateSelect = (date) => {
    if (isDayFullyBooked(date)) {
      setError("This day is fully booked. Please select another date.");
      return;
    }
    setSelectedDate(date);
    setSelectedTime(null);
    setFormData({ ...formData, date: date.toLocaleDateString("en-CA"), time: "" });
    setError(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setFormData({ ...formData, time });
    setError(null);
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calculate time until appointment
      const appointmentDateTime = new Date(appointment.date);
      const [hours, minutes] = appointment.time.split(":").map(Number);
      appointmentDateTime.setHours(hours, minutes);
      const hoursUntilAppointment = (appointmentDateTime - new Date()) / (1000 * 60 * 60);

      if (appointment.status === "confirmed" && hoursUntilAppointment < 24 && !cancellationReason) {
        setError("Please provide a reason for cancelling within 24 hours.");
        setLoading(false);
        return;
      }

      const response = await axiosInstance.delete(`/api/appointments/cancel/${appointment._id}`, {
        data: { reason: cancellationReason },
      });

      if (response.data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          // Show reschedule prompt for ALL cancellations
          setShowReschedulePrompt(true);
        }, 2000);
      }
    } catch (err) {
      console.error("Delete/Cancel Error:", err);
      setError(err.response?.data?.message || "Failed to process appointment");
    } finally {
      setLoading(false);
    }
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

  const formatTimeSlot = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getGeneralHours = () => {
    if (!vet?.veterinarianDetails?.openingHours) {
      return "Availability not specified";
    }
    const openDays = weekdays
      .map((day) => day.toLowerCase())
      .filter((day) => vet.veterinarianDetails.openingHours[day] !== "Closed");
    if (openDays.length === 0) return "No regular hours available";
    return `Open: ${openDays.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}`;
  };

  const formatOpeningHours = (day) => {
    const details = professionalType === "Vet" ? vet?.veterinarianDetails : vet?.trainerDetails;
    if (!details?.openingHours) return "Not specified";
    const hours = details.openingHours[day];
    if (!hours || hours === "Closed") return "Closed";

    const start1 = details.openingHours[`${day}Start`];
    const end1 = details.openingHours[`${day}End`];
    let timeString = start1 && end1 ? `${start1} - ${end1}` : "N/A";

    if (hours === "Double Session") {
      const start2 = details.openingHours[`${day}Start2`];
      const end2 = details.openingHours[`${day}End2`];
      if (start2 && end2) {
        timeString += `, ${start2} - ${end2}`;
      }
    }

    return timeString;
  };

  const renderActionSelection = () => (
    <div className="space-y-6 p-6">
      <h3 className="text-xl font-semibold text-gray-800">What would you like to do?</h3>
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => setSelectedAction("view")}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
            selectedAction === "view"
              ? "border-pink-300 bg-pink-50 text-pink-700"
              : "border-gray-200 hover:bg-pink-50 hover:border-pink-300"
          }`}
        >
          <Eye size={20} className="text-pink-500" />
          <span className="text-sm font-medium">View Details</span>
        </button>
        <button
          onClick={() => setSelectedAction("update")}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
            selectedAction === "update"
              ? "border-yellow-300 bg-yellow-50 text-yellow-700"
              : "border-gray-200 hover:bg-yellow-50 hover:border-yellow-300"
          }`}
          disabled={appointment.status === "confirmed" || appointment.status === "cancelled"}
        >
          <Edit size={20} className="text-yellow-500" />
          <span className="text-sm font-medium">Update Appointment</span>
        </button>
        <button
          onClick={() => setSelectedAction("delete")}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
            selectedAction === "delete"
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-gray-200 hover:bg-red-50 hover:border-red-300"
          }`}
        >
          <Trash2 size={20} className="text-red-500" />
          <span className="text-sm font-medium">Cancel Appointment</span>
        </button>
      </div>
      <button
        onClick={() => {
          if (!selectedAction) {
            setError("Please select an action");
            return;
          }
          setStep(selectedAction === "view" ? 0 : selectedAction === "delete" ? 2 : 1);
          setError(null);
        }}
        className="w-full px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-yellow-300 rounded-xl shadow-sm hover:from-pink-500 hover:to-yellow-400 transition-all duration-300 disabled:opacity-50"
        disabled={!selectedAction || loading}
      >
        Continue
      </button>
    </div>
  );

  const renderViewDetails = () => (
    <div className="space-y-6 p-6">
      <h3 className="text-xl font-semibold text-gray-800">{professionalType} Details</h3>
      {loading ? (
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-600">Loading details...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            <strong>Name:</strong> {vet?.fullName || "Unknown"}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Email:</strong> {vet?.email || "N/A"}
          </p>
          {professionalType === "Vet" && (
            <p className="text-sm text-gray-700">
              <strong>Specialization:</strong>{" "}
              {vet?.veterinarianDetails?.specializations?.[0]?.specializationName || "N/A"}
            </p>
          )}
          {professionalType === "Trainer" && (
            <>
              <p className="text-sm text-gray-700">
                <strong>Training Specialty:</strong> {vet?.trainerDetails?.specialization || "N/A"}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Experience:</strong> {vet?.trainerDetails?.experienceYears || "N/A"} years
              </p>
            </>
          )}
          <p className="text-sm text-gray-700">
            <strong>Opening Hours:</strong>
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600">
            {["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map((day) => (
              <li key={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}: {formatOpeningHours(day)}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={onClose}
        className="w-full px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-yellow-300 rounded-xl shadow-sm hover:from-pink-500 hover:to-yellow-400 transition-all duration-300"
      >
        Close
      </button>
    </div>
  );

  const renderStepContent = () => {
    if (showSuccess && !showReschedulePrompt) {
      return (
        <div className="py-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check size={32} className="text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {selectedAction === "delete" ? "Appointment Cancelled!" : "Appointment Updated!"}
          </h3>
          <p className="text-center text-gray-600 text-sm">
            {selectedAction === "delete"
              ? `Your appointment for ${appointment.petName} has been cancelled.`
              : `Your appointment for ${appointment.petName} has been updated to ${selectedDate.toLocaleDateString()} at ${formatTimeSlot(formData.time)}.`}
          </p>
        </div>
      );
    }

    if (showReschedulePrompt) {
      return (
        <div className="space-y-6 p-6">
          <h3 className="text-xl font-semibold text-gray-800">Reschedule Your Appointment</h3>
          <p className="text-sm text-gray-600">
            Your appointment for {appointment.petName} has been cancelled. Would you like to book a new one with{" "}
            {vet?.fullName || "this professional"}?
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                onSuccess({
                  action: appointment.status === "pending" ? "delete" : "cancel",
                  appointmentId: appointment._id,
                });
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                window.location.href = "/vets"; // Adjust to your booking route
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-yellow-300 rounded-xl hover:from-pink-500 hover:to-yellow-400 transition-all"
            >
              Book Now
            </button>
          </div>
        </div>
      );
    }

    if (step === 0) {
      return renderViewDetails();
    }

    if (selectedAction === "delete") {
      // Calculate time until appointment
      const appointmentDateTime = new Date(appointment.date);
      const [hours, minutes] = appointment.time.split(":").map(Number);
      appointmentDateTime.setHours(hours, minutes);
      const hoursUntilAppointment = (appointmentDateTime - new Date()) / (1000 * 60 * 60);
      const isLastMinute = appointment.status === "confirmed" && hoursUntilAppointment < 24;

      return (
        <div className="space-y-4 p-6">
          <p className="text-sm text-gray-600">
            Are you sure you want to {appointment.status === "pending" ? "delete" : "cancel"} your appointment with{" "}
            {vet?.fullName || appointment.professionalId?.fullName || "Unknown"} for {appointment.petName} on{" "}
            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}?
          </p>
          {isLastMinute && (
            <>
              <p className="text-sm text-yellow-600">
                Note: Cancellations within 24 hours require a reason to help the {professionalType.toLowerCase()} plan
                their schedule.
              </p>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Reason for cancellation (required)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-300 text-sm"
                rows="3"
              />
            </>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              disabled={loading}
            >
              No, Keep It
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-400 rounded-xl hover:bg-red-500 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Processing..." : appointment.status === "pending" ? "Yes, Delete" : "Yes, Cancel"}
            </button>
          </div>
        </div>
      );
    }

    // Update steps
    switch (step) {
      case 1:
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
            ) : (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-full hover:bg-pink-50 transition-colors"
                  >
                    <ChevronLeft size={20} className="text-pink-400" />
                  </button>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                  </h4>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-full hover:bg-pink-50 transition-colors"
                  >
                    <ChevronRight size={20} className="text-pink-400" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-600 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="py-1">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonthView().map((day, index) => {
                    const today = new Date();
                    const isToday = day.date.toDateString() === today.toDateString();
                    const isPast = day.date < new Date(today.setHours(0, 0, 0, 0));
                    const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
                    const isFullyBooked = day.isFullyBooked;

                    return (
                      <button
                        key={index}
                        className={`
                          h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                          ${!day.isCurrentMonth ? "text-gray-300" : isPast || isFullyBooked ? "text-gray-400" : "text-gray-800"}
                          ${isToday ? "ring-2 ring-pink-300" : ""}
                          ${isSelected ? "bg-pink-400 text-white" : ""}
                          ${!day.isOpen || isPast || isFullyBooked ? "opacity-50 cursor-not-allowed" : "hover:bg-pink-100"}
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
                <div className="w-3 h-3 rounded-full bg-gray-400 opacity-50"></div>
                <span>Fully Booked</span>
              </div>
            </div>
          </div>
        );
      case 2:
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
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Consultation duration: {consultationDuration} minutes
                  </p>
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
            {error && step === 2 && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      case 3:
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
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Time:</span> {formatTimeSlot(formData.time)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{professionalType}:</span>{" "}
                    {vet?.fullName || appointment.professionalId?.fullName || "Unknown"}
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
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-yellow-50 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {vet && (
                <img
                  src={vet.image || "/default-vet.jpg"}
                  alt={vet.fullName || "Professional"}
                  className="w-12 h-12 rounded-full object-cover border-2 border-pink-200"
                  onError={(e) => (e.target.src = "/default-vet.jpg")}
                />
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {selectedAction === "delete"
                    ? "Cancel Appointment"
                    : selectedAction === "update"
                    ? "Update Appointment"
                    : selectedAction === "view"
                    ? "Appointment Details"
                    : "Manage Appointment"}
                </h2>
                {vet ? (
                  <div>
                    <p className="text-sm text-gray-600">
                      {vet.fullName} ({professionalType})
                    </p>
                    <p className="text-xs text-gray-500">{getGeneralHours()}</p>
                  </div>
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

        {/* Steps Progress */}
        {!showSuccess && !showReschedulePrompt && selectedAction !== "view" && selectedAction && selectedAction !== "delete" && (
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
                <span
                  className={`text-xs mt-1 ${step >= index + 1 ? "text-gray-800 font-medium" : "text-gray-500"}`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="max-h-[50vh] overflow-y-auto p-0 flex-1">
          {selectedAction ? renderStepContent() : renderActionSelection()}
        </div>

        {/* Footer Buttons */}
        {!showSuccess && !showReschedulePrompt && selectedAction && selectedAction !== "view" && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            {step > 1 && selectedAction !== "delete" ? (
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

            {selectedAction === "delete" ? null : step < 3 ? (
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

export default AppointmentActionModal;