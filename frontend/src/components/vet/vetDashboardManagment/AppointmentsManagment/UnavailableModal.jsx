import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";
import { useApp } from "../../../../context/AppContext";

const UnavailableModal = ({ professional, onClose, onSuccess }) => {
  const { user, addToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [unavailableSlotsByDate, setUnavailableSlotsByDate] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [action, setAction] = useState("unavailable"); // "available" or "unavailable"

  useEffect(() => {
    console.log("UnavailableModal professional prop:", professional);
  }, []);

  const professionalType = professional?.role === "Vet" ? "Vet" : "Trainer";
  const isVet = professional?.role === "Vet";
  const shortWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const colorPalette = isVet
    ? {
        gradientFrom: "from-green-400",
        gradientTo: "to-blue-500",
        headerFrom: "from-green-50",
        headerTo: "to-blue-50",
        rangeBg: "bg-blue-100",
        rangeText: "text-blue-700",
      }
    : {
        gradientFrom: "from-[#ffc929]",
        gradientTo: "to-pink-500",
        headerFrom: "from-yellow-50",
        headerTo: "to-pink-50",
        rangeBg: "bg-pink-100",
        rangeText: "text-pink-700",
      };

  // Fallback notification
  const notify = (message, type) => {
    if (typeof addToast === "function") {
      addToast(message, type);
    } else {
      alert(`${type.toUpperCase()}: ${message}`);
    }
  };

  useEffect(() => {
    const fetchPeriods = async () => {
      if (!professional?._id) {
        console.log("Skipping fetchPeriods: professional._id is missing");
        setUnavailableSlotsByDate({});
        return;
      }
      try {
        const year = currentDate.getUTCFullYear();
        const month = currentDate.getUTCMonth() + 1;
        const response = await axiosInstance.get(`/api/appointments/professionals/unavailable-periods`, {
          params: { professionalId: professional._id, year, month, professionalType },
        });
        setUnavailableSlotsByDate(response.data.unavailableSlotsByDate || {});
      } catch (error) {
        console.error("Error fetching unavailable periods:", error);
        notify("Failed to fetch unavailable periods", "error");
        setUnavailableSlotsByDate({});
      }
    };
    fetchPeriods();
  }, [currentDate, professional?._id, professionalType]);

  // Set action based on selected dates
  useEffect(() => {
    if (!selectedStartDate) {
      setAction("unavailable");
      return;
    }
    let hasUnavailable = false;
    let current = new Date(selectedStartDate);
    while (current <= (selectedEndDate || selectedStartDate)) {
      if (unavailableSlotsByDate[formatDate(current)]) {
        hasUnavailable = true;
        break;
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }
    setAction(hasUnavailable ? "available" : "unavailable");
  }, [selectedStartDate, selectedEndDate, unavailableSlotsByDate]);

  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "";
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
  };

  const normalizeDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return new Date();
    const newDate = new Date(date);
    newDate.setUTCHours(0, 0, 0, 0);
    return newDate;
  };

  const handlePrevMonth = () =>
    setCurrentDate(
      normalizeDate(new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() - 1, 1)))
    );

  const handleNextMonth = () =>
    setCurrentDate(
      normalizeDate(new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 1)))
    );

  const validateForm = () => {
    const errors = {};
    if (!selectedStartDate) errors.date = "Please select a date";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (confirmed = false) => {
    if (!validateForm()) return;

    const startDate = formatDate(selectedStartDate);
    const endDate = selectedEndDate ? formatDate(selectedEndDate) : startDate;
    const markAvailable = action === "available";

    if (markAvailable && !confirmed) {
      setShowConfirm(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(`/api/appointments/professionals/unavailable-periods/${professional._id}`, {
        startDate,
        endDate,
        professionalType,
        markAvailable,
      });

      if (response.data.success) {
        const updatedUnavailableSlots = { ...unavailableSlotsByDate };
        let current = new Date(selectedStartDate);
        while (current <= (selectedEndDate || selectedStartDate)) {
          const dateStr = formatDate(current);
          if (markAvailable) {
            delete updatedUnavailableSlots[dateStr];
          } else {
            updatedUnavailableSlots[dateStr] = ["00:00"];
          }
          current.setUTCDate(current.getUTCDate() + 1);
        }
        setUnavailableSlotsByDate(updatedUnavailableSlots);
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setShowConfirm(false);
        notify(`Dates ${markAvailable ? "marked as available" : "marked as unavailable"}`, "success");
        onSuccess && onSuccess();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update availability. Please try again.";
      notify(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const renderDateRangeSelection = () => {
    const today = normalizeDate(new Date());
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const firstDayWeekday = firstDayOfMonth.getUTCDay();

    const handleDateClick = (date) => {
      if (unavailableSlotsByDate[formatDate(date)] && !selectedStartDate) {
        setSelectedStartDate(date);
        setSelectedEndDate(date); // Single-day deselection
      } else if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        setSelectedStartDate(date);
        setSelectedEndDate(null);
      } else if (selectedStartDate && !selectedEndDate && date >= selectedStartDate) {
        setSelectedEndDate(date);
      }
    };

    const isDateInRange = (date) => {
      if (!selectedStartDate || !selectedEndDate) return false;
      return date >= selectedStartDate && date <= selectedEndDate;
    };

    const renderDays = () => {
      const days = [];
      for (let i = 0; i < firstDayWeekday; i++) {
        days.push(<div key={`empty-${i}`} className="h-10"></div>);
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(Date.UTC(year, month, day));
        const isPast = date < today && date.toDateString() !== today.toDateString();
        const isSelected = selectedStartDate && date.toDateString() === selectedStartDate.toDateString();
        const isEndSelected = selectedEndDate && date.toDateString() === selectedEndDate.toDateString();
        const isInRange = isDateInRange(date);
        const isUnavailable = unavailableSlotsByDate[formatDate(date)];

        days.push(
          <button
            key={day}
            onClick={() => handleDateClick(date)}
            disabled={isPast}
            className={`relative h-10 w-full rounded-full text-sm font-medium transition-all ${
              isPast
                ? "text-gray-400 cursor-not-allowed"
                : isSelected || isEndSelected
                ? `bg-gradient-to-r ${colorPalette.gradientFrom} ${colorPalette.gradientTo} text-white`
                : isInRange
                ? `${colorPalette.rangeBg} ${colorPalette.rangeText}`
                : isUnavailable
                ? "bg-gray-200 text-gray-500 hover:border-green-500 hover:border-2"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            aria-label={`${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}, ${isUnavailable ? "unavailable" : "available"}`}
          >
            {day}
            {isUnavailable && (
              <Lock className="absolute top-0 right-0 w-3 h-3 text-gray-600" aria-hidden="true" />
            )}
          </button>
        );
      }
      return days;
    };

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Select Date Range</h3>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {shortWeekdays.map((day) => (
              <div key={day} className="text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
            {renderDays()}
          </div>
        </div>
        {(selectedStartDate || selectedEndDate) && (
          <div className="text-sm text-gray-600">
            <p>
              Selected Range:{" "}
              {selectedStartDate?.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }) || "Not selected"}{" "}
              {selectedEndDate &&
                selectedEndDate !== selectedStartDate &&
                `- ${selectedEndDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}`}
              {selectedStartDate && (
                <span>
                  {" - Will be marked as "}
                  {action === "available" ? "available" : "unavailable"}
                </span>
              )}
            </p>
          </div>
        )}
        {formErrors.date && <p className="text-xs text-red-500">{formErrors.date}</p>}
        {selectedStartDate && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Action</h4>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 p-2 border rounded-md cursor-pointer ${action === "available" ? "border-green-500 bg-green-50" : "border-gray-300"}`}>
                <input
                  type="radio"
                  name="action"
                  value="available"
                  checked={action === "available"}
                  onChange={() => setAction("available")}
                  className="text-green-500 focus:ring-green-500"
                  aria-label="Mark selected range as available"
                />
                <span className="text-sm text-green-600">Available</span>
              </label>
              <label className={`flex items-center gap-2 p-2 border rounded-md cursor-pointer ${action === "unavailable" ? "border-red-500 bg-red-50" : "border-gray-300"}`}>
                <input
                  type="radio"
                  name="action"
                  value="unavailable"
                  checked={action === "unavailable"}
                  onChange={() => setAction("unavailable")}
                  className="text-red-500 focus:ring-red-500"
                  aria-label="Mark selected range as unavailable"
                />
                <span className="text-sm text-red-600">Unavailable</span>
              </label>
            </div>
            {action === "available" && (
              <p className="text-xs text-gray-500">
                Use this to make previously unavailable dates available again.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleClose = () => {
    notify("Changes saved", "success");
    onClose();
  };

  if (!professional || !professional._id) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center mt-20 overflow-hidden bg-black/60">
        <div className="bg-white rounded-tl-lg rounded-tr-3xl rounded-br-xl rounded-bl-2xl w-full max-w-md shadow-xl border border-yellow-100 mx-4 my-8 max-h-[85vh] flex flex-col">
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Error</h2>
            <button
              onClick={onClose}
              className="p-2 transition-colors rounded-full hover:bg-pink-100"
              aria-label="Close modal"
            >
              <X size={18} className="text-pink-500" />
            </button>
          </div>
          <div className="p-6 flex-1">
            <p className="text-sm text-red-600">Professional information is missing. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center mt-20 overflow-hidden bg-black/60">
      <div className="bg-white rounded-tl-lg rounded-tr-3xl rounded-br-xl rounded-bl-2xl w-full max-w-md shadow-xl border border-yellow-100 mx-4 my-8 max-h-[85vh] flex flex-col">
        <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r ${colorPalette.headerFrom} ${colorPalette.headerTo}`}>
          <h2 className="text-lg font-bold text-gray-800">Set Availability</h2>
          <button
            onClick={handleClose}
            className="p-2 transition-colors rounded-full hover:bg-pink-100"
            aria-label="Close modal"
          >
            <X size={18} className="text-pink-500" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-6 flex-1">{renderDateRangeSelection()}</div>

        {showConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 max-w-xs w-full">
              <h3 className="text-lg font-bold text-gray-800">Confirm Action</h3>
              <p className="text-sm text-gray-600 mt-2">
                Make {selectedStartDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {selectedEndDate && selectedEndDate !== selectedStartDate &&
                  ` - ${selectedEndDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`} available again?
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmit(true)}
                  className={`px-4 py-2 text-sm font-medium text-white bg-gradient-to-r ${colorPalette.gradientFrom} ${colorPalette.gradientTo} rounded-full hover:shadow-md`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 transition-all"
            aria-label="Close modal"
          >
            Close
          </button>
          <button
            onClick={() => handleSubmit(false)}
            className={`px-6 py-2 text-sm font-medium text-white bg-gradient-to-r ${colorPalette.gradientFrom} ${colorPalette.gradientTo} rounded-full hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={loading || !selectedStartDate}
            aria-label={selectedStartDate ? `Save ${action === "available" ? "available" : "unavailable"} action for selected range` : "Select a date to proceed"}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                Processing...
              </span>
            ) : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnavailableModal;