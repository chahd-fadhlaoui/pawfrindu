import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, ChevronLeft, ChevronRight, Info, Check } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const AppointmentModal = ({ vet, onClose, onSuccess }) => {
  const { user, userPets } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [reservedSlots, setReservedSlots] = useState([]);
  const [reservedSlotsByDate, setReservedSlotsByDate] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null); // Initially null to enforce selection
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({
    ownerName: user?.fullName || "",
    phone: user?.petOwnerDetails?.phone || "",
    email: user?.email || "",
    reason: "",
    notes: "",
    customPetName: "",
    customPetType: "",
    customPetAge: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const consultationDuration = vet?.veterinarianDetails?.averageConsultationDuration || 30;

  const allPets = [
    ...(user?.petOwnerDetails?.currentPets || []).map((pet) => ({ ...pet, source: "owned" })),
    ...(userPets || []).map((pet) => ({ ...pet, source: "adopted" })),
  ];

  useEffect(() => {
    const fetchReservedSlotsForMonth = async () => {
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        console.log(`Fetching reserved slots for month: ${year}-${month}`);
        const response = await axiosInstance.get(`/api/appointments/reserved-month`, {
          params: { professionalId: vet._id, year, month, professionalType: "Vet" },
        });
        console.log("Reserved slots for month:", response.data.reservedSlotsByDate);
        setReservedSlotsByDate(response.data.reservedSlotsByDate || {});
      } catch (error) {
        console.error("Error fetching reserved slots for month:", error);
        setReservedSlotsByDate({});
      }
    };
    fetchReservedSlotsForMonth();
  }, [currentDate, vet._id]);

  const fetchReservedSlots = async (date) => {
    if (!vet || !date) return;

    const formattedDate = date.toISOString().split("T")[0];
    console.log("Fetching reserved slots for date:", formattedDate, "vet._id:", vet._id);
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/appointments/reserved/${vet._id}`, {
        params: { date: formattedDate, professionalType: "Vet" },
      });
      console.log(`Reserved slots for ${formattedDate}:`, response.data.reservedSlots);
      setReservedSlots(response.data.reservedSlots || []);
      console.log("Updated reservedSlots:", response.data.reservedSlots || []);
    } catch (error) {
      console.error("Error fetching reserved slots:", error);
      setReservedSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vet?._id && selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      console.log("useEffect triggered - Fetching for selectedDate:", formattedDate);
      fetchReservedSlots(selectedDate);
    }
  }, [vet?._id, selectedDate]);

  useEffect(() => {
    if (selectedDate && vet?.veterinarianDetails?.openingHours) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      console.log("Calculating available slots for:", formattedDate);
      const slots = getAvailableTimeSlots(selectedDate);
      console.log(`Available slots for ${selectedDate.toDateString()}:`, slots);
      setAvailableSlots(slots);
    }
  }, [selectedDate, reservedSlots, reservedSlotsByDate, vet?.veterinarianDetails?.openingHours]);

  const normalizeDate = (date) => {
    const newDate = new Date(date);
    newDate.setUTCHours(0, 0, 0, 0); // Use UTC to avoid timezone shifts
    return newDate;
  };

  const isDayOpen = (date) => {
    const dayOfWeek = weekdays[date.getDay()].toLowerCase();
    const openingHours = vet?.veterinarianDetails?.openingHours;
    return openingHours && openingHours[dayOfWeek] !== "Closed";
  };

  const generateTimeSlots = (startTime, endTime, duration) => {
    const slots = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
      console.error(`Invalid time format - Start: ${startTime}, End: ${endTime}`);
      return [];
    }

    const start = new Date();
    start.setUTCHours(startHour, startMinute, 0, 0);
    const end = new Date();
    end.setUTCHours(endHour, endMinute, 0, 0);
    if (end <= start) end.setUTCDate(end.getUTCDate() + 1);
    end.setUTCMinutes(end.getUTCMinutes() - duration);

    let currentTime = new Date(start);
    while (currentTime <= end) {
      const hours = currentTime.getUTCHours().toString().padStart(2, "0");
      const minutes = currentTime.getUTCMinutes().toString().padStart(2, "0");
      slots.push(`${hours}:${minutes}`);
      currentTime.setUTCMinutes(currentTime.getUTCMinutes() + duration);
    }
    return slots;
  };

  const getPotentialTimeSlots = (date) => {
    if (!vet?.veterinarianDetails?.openingHours) {
      console.log("No opening hours available for vet:", vet?._id);
      return [];
    }

    const dayOfWeek = weekdays[date.getDay()].toLowerCase();
    const openingHours = vet.veterinarianDetails.openingHours;

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
    console.log(`Potential slots for ${date.toDateString()}:`, slots);
    return slots;
  };

  const isDayFullyBooked = (date) => {
    const normalizedDate = normalizeDate(date);
    const potentialSlots = getPotentialTimeSlots(normalizedDate);
    const dateStr = normalizedDate.toISOString().split("T")[0];
    const reserved = reservedSlotsByDate[dateStr] || reservedSlots || [];
    console.log(`Checking if ${dateStr} is fully booked with reserved:`, reserved);
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
      const date = normalizeDate(new Date(year, month, -i));
      result.push({ date, isCurrentMonth: false, isOpen: isDayOpen(date), isFullyBooked: isDayFullyBooked(date) });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = normalizeDate(new Date(year, month, i));
      result.push({ date, isCurrentMonth: true, isOpen: isDayOpen(date), isFullyBooked: isDayFullyBooked(date) });
    }

    const lastDayOfWeek = lastDayOfMonth.getDay();
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      const date = normalizeDate(new Date(year, month + 1, i));
      result.push({ date, isCurrentMonth: false, isOpen: isDayOpen(date), isFullyBooked: isDayFullyBooked(date) });
    }
    return result;
  };

  const getAvailableTimeSlots = (date) => {
    const normalizedDate = normalizeDate(date);
    const potentialSlots = getPotentialTimeSlots(normalizedDate);
    const dateStr = normalizedDate.toISOString().split("T")[0];
    const reserved = reservedSlotsByDate[dateStr] || reservedSlots || [];
    console.log(`Filtering slots for ${dateStr} with reserved:`, reserved);
    const available = potentialSlots.filter((slot) => !reserved.includes(slot));
    return available;
  };

  const handleDateSelect = async (date) => {
    const normalizedDate = normalizeDate(date);
    const dateStr = normalizedDate.toISOString().split("T")[0];
    console.log("Selected date in handleDateSelect:", dateStr);
    if (isDayFullyBooked(normalizedDate)) {
      alert("This day is fully booked. Please select another date.");
      return;
    }
    setSelectedDate(normalizedDate);
    setSelectedTime(null);
    await fetchReservedSlots(normalizedDate);
    const slots = getAvailableTimeSlots(normalizedDate);
    setAvailableSlots(slots);
    console.log("After fetch, available slots set to:", slots);
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handlePrevMonth = () => setCurrentDate(normalizeDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)));
  const handleNextMonth = () => setCurrentDate(normalizeDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: "" });
  };

  const handlePetSelect = (e) => {
    const value = e.target.value;
    if (value === "other") {
      setSelectedPet(null);
    } else {
      const [name, source] = value.split("-");
      const pet = allPets.find((p) => p.name === name && p.source === source);
      setSelectedPet(pet);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!selectedPet && !formData.customPetName.trim()) errors.petName = "Please select a pet or enter a custom pet name";
    if (!formData.reason.trim()) errors.reason = "Please specify the reason for your visit";
    if (!formData.ownerName.trim()) errors.ownerName = "Please enter your name";
    if (!formData.phone.trim()) errors.phone = "Please enter your phone number";
    if (!formData.email.trim()) errors.email = "Please enter your email";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const appointmentDate = selectedDate.toISOString().split("T")[0]; // Use ISO format for consistency
      const appointmentData = {
        professionalId: vet._id,
        professionalType: "Vet",
        date: appointmentDate,
        time: selectedTime,
        duration: consultationDuration,
        petName: selectedPet ? selectedPet.name : formData.customPetName,
        petType: selectedPet ? selectedPet.type || selectedPet.species || "Unknown" : formData.customPetType || "Unknown",
        petAge: selectedPet ? selectedPet.age || "Unknown" : formData.customPetAge || "Unknown",
        petSource: selectedPet ? selectedPet.source : "other",
        reason: formData.reason,
        notes: formData.notes,
      };
      console.log("Submitting appointment data:", appointmentData);

      const response = await axiosInstance.post("/api/appointments/book", appointmentData);
      console.log("Booking response:", response.data);
      if (response.data.success) {
        setShowSuccess(true);
        await fetchReservedSlots(selectedDate);
        setReservedSlotsByDate((prev) => ({
          ...prev,
          [appointmentDate]: [...(prev[appointmentDate] || []), selectedTime],
        }));
        setTimeout(() => {
          onSuccess && onSuccess(response.data);
          onClose();
          navigate("/Vetappointments");
        }, 2000);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      const errorMessage = error.response?.data?.message || "Failed to book appointment. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSlot = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const renderStepContent = () => {
    if (showSuccess) {
      return (
        <div className="py-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check size={32} className="text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Appointment Booked!</h3>
          <p className="text-center text-gray-600 text-sm">
            Your appointment with Dr. {vet.fullName} for {selectedPet?.name || formData.customPetName} has been confirmed for{" "}
            {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at{" "}
            {formatTimeSlot(selectedTime)}.
          </p>
          <p className="text-center text-gray-500 text-xs">A confirmation has been sent to {formData.email}.</p>
        </div>
      );
    }

    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Select a Date</h3>
            {!vet?.veterinarianDetails?.openingHours ? (
              <p className="text-red-500">Vet opening hours not available.</p>
            ) : (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <button className="p-2 rounded-full hover:bg-yellow-50 transition-colors" onClick={handlePrevMonth}>
                    <ChevronLeft size={20} className="text-pink-500" />
                  </button>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                  </h4>
                  <button className="p-2 rounded-full hover:bg-yellow-50 transition-colors" onClick={handleNextMonth}>
                    <ChevronRight size={20} className="text-pink-500" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-600 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="py-1">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonthView().map((day, index) => {
                    const today = normalizeDate(new Date());
                    const isToday = day.date.toDateString() === today.toDateString();
                    const isPast = day.date < today;
                    const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
                    const isFullyBooked = day.isFullyBooked;

                    return (
                      <button
                        key={index}
                        className={`
                          h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                          ${!day.isCurrentMonth ? "text-gray-300" : isPast || isFullyBooked ? "text-gray-400" : "text-gray-800"}
                          ${isToday ? "ring-2 ring-[#ffc929]" : ""}
                          ${isSelected ? "bg-pink-500 text-white" : ""}
                          ${!day.isOpen || isPast || isFullyBooked ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-100"}
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
                <div className="w-3 h-3 rounded-full ring-2 ring-[#ffc929]"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Choose a Time</h3>
              <button
                className="flex items-center gap-1 text-pink-500 hover:text-pink-600 text-sm font-medium"
                onClick={() => setStep(1)}
              >
                <ChevronLeft size={16} />
                Change Date
              </button>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Calendar className="text-pink-500 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Consultation duration: {consultationDuration} minutes</p>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
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
                        ${selectedTime === time ? "bg-pink-500 text-white border-pink-500" : "border-gray-200 hover:bg-yellow-50 hover:border-[#ffc929]"}
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
                <p className="text-sm text-gray-700">No available times for this date.</p>
                <button className="mt-3 text-pink-500 hover:text-pink-600 text-sm font-medium" onClick={() => setStep(1)}>
                  Pick Another Date
                </button>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Confirm Details</h3>
              <button
                className="flex items-center gap-1 text-pink-500 hover:text-pink-600 text-sm font-medium"
                onClick={() => setStep(2)}
              >
                <ChevronLeft size={16} />
                Change Time
              </button>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-pink-50 rounded-xl p-4 border border-yellow-100">
              <div className="flex items-start gap-3">
                <Calendar className="text-pink-500 mt-1" size={24} />
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Appointment Summary</h4>
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">Date:</span>{" "}
                    {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Time:</span> {formatTimeSlot(selectedTime)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Vet:</span> Dr. {vet.fullName}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Duration:</span> {consultationDuration} minutes
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="petSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Pet*
                </label>
                <select
                  id="petSelect"
                  value={selectedPet ? `${selectedPet.name}-${selectedPet.source}` : formData.customPetName ? "other" : ""}
                  onChange={handlePetSelect}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    formErrors.petName ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-pink-200"
                  } focus:outline-none focus:ring-2 text-sm`}
                >
                  <option value="">Select a pet</option>
                  {allPets.map((pet, index) => (
                    <option key={index} value={`${pet.name}-${pet.source}`}>
                      {pet.name} ({pet.source === "owned" ? "Owned" : "Adopted"})
                    </option>
                  ))}
                  <option value="other">Other (Not on platform)</option>
                </select>
                {formErrors.petName && <p className="mt-1 text-xs text-red-500">{formErrors.petName}</p>}
              </div>

              {(!selectedPet || selectedPet === "other") && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="customPetName" className="block text-sm font-medium text-gray-700 mb-1">
                      Pet Name*
                    </label>
                    <input
                      type="text"
                      id="customPetName"
                      name="customPetName"
                      value={formData.customPetName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        formErrors.petName ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-pink-200"
                      } focus:outline-none focus:ring-2 text-sm`}
                      placeholder="Enter pet's name"
                    />
                  </div>
                  <div>
                    <label htmlFor="customPetType" className="block text-sm font-medium text-gray-700 mb-1">
                      Pet Type
                    </label>
                    <input
                      type="text"
                      id="customPetType"
                      name="customPetType"
                      value={formData.customPetType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                      placeholder="e.g., Dog, Cat"
                    />
                  </div>
                  <div>
                    <label htmlFor="customPetAge" className="block text-sm font-medium text-gray-700 mb-1">
                      Pet Age
                    </label>
                    <input
                      type="text"
                      id="customPetAge"
                      name="customPetAge"
                      value={formData.customPetAge}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                      placeholder="e.g., 2 years"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name*
                </label>
                <input
                  type="text"
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    formErrors.ownerName ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-pink-200"
                  } focus:outline-none focus:ring-2 text-sm`}
                  placeholder="Your full name"
                />
                {formErrors.ownerName && <p className="mt-1 text-xs text-red-500">{formErrors.ownerName}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number*
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    formErrors.phone ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-pink-200"
                  } focus:outline-none focus:ring-2 text-sm`}
                  placeholder="Your phone number"
                />
                {formErrors.phone && <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    formErrors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-pink-200"
                  } focus:outline-none focus:ring-2 text-sm`}
                  placeholder="Your email address"
                />
                {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit*
                </label>
                <input
                  type="text"
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    formErrors.reason ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-pink-200"
                  } focus:outline-none focus:ring-2 text-sm`}
                  placeholder="e.g., Vaccination, Check-up, Illness"
                />
                {formErrors.reason && <p className="mt-1 text-xs text-red-500">{formErrors.reason}</p>}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                  placeholder="Any additional information about your pet's condition"
                ></textarea>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
                <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  By confirming this booking, you agree to our cancellation policy. Please arrive 10 minutes before your appointment time.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-hidden mt-20">
      <div className="bg-white rounded-tl-lg rounded-tr-3xl rounded-br-xl rounded-bl-2xl w-full max-w-md shadow-xl border border-yellow-100 mx-4 my-8 max-h-[85vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-pink-50 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800">Book an Appointment</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-pink-100 transition-colors">
            <X size={18} className="text-pink-500" />
          </button>
        </div>

        {!showSuccess && (
          <div className="flex justify-between px-6 py-4 bg-gray-50 shrink-0">
            {["Select Date", "Choose Time", "Confirm Details"].map((label, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                    ${step > index + 1 ? "bg-green-500 text-white" : step === index + 1 ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-500"}
                  `}
                >
                  {step > index + 1 ? <Check size={16} /> : index + 1}
                </div>
                <span className={`text-xs mt-1 ${step >= index + 1 ? "text-gray-800 font-medium" : "text-gray-500"}`}>{label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="max-h-[50vh] overflow-y-auto p-6 flex-1">{renderStepContent()}</div>

        {!showSuccess && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-500 transition-colors">
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1 && !selectedDate) {
                    alert("Please select a date");
                    return;
                  }
                  if (step === 2 && !selectedTime) {
                    alert("Please select a time");
                    return;
                  }
                  setStep(step + 1);
                }}
                className={`px-6 py-2 text-sm font-medium text-white rounded-full transition-all
                  ${(step === 1 && !selectedDate) || (step === 2 && !selectedTime)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#ffc929] to-pink-500 hover:shadow-md"}
                `}
                disabled={(step === 1 && !selectedDate) || (step === 2 && !selectedTime)}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-pink-500 rounded-full hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Booking...
                  </span>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentModal;