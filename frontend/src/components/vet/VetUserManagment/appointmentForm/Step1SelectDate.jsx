import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Step1SelectDate = ({
  professional,
  professionalType,
  currentDate,
  selectedDate,
  handleDateSelect,
  handlePrevMonth,
  handleNextMonth,
  isDayOpen,
  isDayFullyBooked,
  normalizeDate,
}) => {
  const getDaysInMonthView = () => {
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();
    const firstDayOfMonth = normalizeDate(new Date(Date.UTC(year, month, 1)));
    const lastDayOfMonth = normalizeDate(
      new Date(Date.UTC(year, month + 1, 0))
    );
    const result = [];

    const firstDayOfWeek = firstDayOfMonth.getDay();
    const startOffset = firstDayOfWeek;

    for (let i = startOffset - 1; i >= 0; i--) {
      const date = normalizeDate(
        new Date(Date.UTC(year, month, -(startOffset - 1 - i)))
      );
      result.push({
        date,
        isCurrentMonth: false,
        isOpen: isDayOpen(date),
        isFullyBooked: isDayFullyBooked(date),
      });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = normalizeDate(new Date(Date.UTC(year, month, i)));
      result.push({
        date,
        isCurrentMonth: true,
        isOpen: isDayOpen(date),
        isFullyBooked: isDayFullyBooked(date),
      });
    }

    const lastDayOfWeek = lastDayOfMonth.getDay();
    const remainingDays = 6 - lastDayOfWeek;
    for (let i = 1; i <= remainingDays; i++) {
      const date = normalizeDate(new Date(Date.UTC(year, month + 1, i)));
      result.push({
        date,
        isCurrentMonth: false,
        isOpen: isDayOpen(date),
        isFullyBooked: isDayFullyBooked(date),
      });
    }

    return result;
  };
  const openingHours = professional?.[professionalType === "Vet" ? "veterinarianDetails" : "trainerDetails"]?.openingHours;
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800">Select a Date</h3>
      {!openingHours ? (
        <p className="text-red-500">{professionalType === "Vet" ? "Veterinarian" : "Trainer"} opening hours not available.</p>
      ) : (
        <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <button
              className="p-2 transition-colors rounded-full hover:bg-yellow-50"
              onClick={handlePrevMonth}
            >
              <ChevronLeft size={20} className="text-pink-500" />
            </button>
            <h4 className="text-lg font-semibold text-gray-800">
              {currentDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h4>
            <button
              className="p-2 transition-colors rounded-full hover:bg-yellow-50"
              onClick={handleNextMonth}
            >
              <ChevronRight size={20} className="text-pink-500" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2 text-xs font-semibold text-center text-gray-600">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonthView().map((day, index) => {
              const today = normalizeDate(new Date());
              const isToday = day.date.toDateString() === today.toDateString();
              const isPast = day.date < today;
              const isSelected =
                selectedDate &&
                day.date.toDateString() === selectedDate.toDateString();
              const isFullyBooked = day.isFullyBooked;

              return (
                <button
                  key={index}
                  className={`
                    h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${
                      !day.isCurrentMonth
                        ? "text-gray-300"
                        : isPast
                        ? "text-gray-400"
                        : isFullyBooked
                        ? "text-red-600"
                        : "text-gray-800"
                    }
                    ${isToday ? "ring-2 ring-[#ffc929]" : ""}
                    ${isSelected ? "bg-pink-500 text-white" : ""}
                    ${isFullyBooked ? "ring-2 ring-red-500" : ""}
                    ${
                      !day.isOpen || isPast
                        ? "bg-gray-300 opacity-50 cursor-not-allowed"
                        : isFullyBooked
                        ? "bg-red-100 opacity-50 cursor-not-allowed"
                        : "hover:bg-yellow-100"
                    }
                  `}
                  onClick={() =>
                    !isPast &&
                    day.isOpen &&
                    !isFullyBooked &&
                    handleDateSelect(day.date)
                  }
                  disabled={isPast || !day.isOpen || isFullyBooked}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <span>Unavailable</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full ring-2 ring-[#ffc929]"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full ring-2 ring-red-500"></div>
          <span>Fully Booked</span>
        </div>
      </div>
    </div>
  );
};

export default Step1SelectDate;
