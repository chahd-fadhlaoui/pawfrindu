import React from "react";
import { ChevronLeft, Calendar, Clock } from "lucide-react";

const Step2ChooseTime = ({
  vet,
  selectedDate,
  selectedTime,
  availableSlots,
  loading,
  handleTimeSelect,
  setStep,
  formatTimeSlot,
  consultationDuration,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">Choose a Time</h3>
        <button
          className="flex items-center gap-1 text-pink-500 hover:text-pink-600 text-sm font-medium"
          onClick={() => setStep(1)}
        >
          <ChevronLeft size={10} />
          Change Date
        </button>
      </div>
      <div className="bg-yellow-50 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <Calendar className="text-pink-500 " size={45} />
          <div>
            <p className="text-sm font-medium text-gray-800">
              {selectedDate?.toLocaleDateString("en-US", {
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
          <div className="inline-block w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-gray-600">
            Loading available times...
          </p>
        </div>
      ) : availableSlots.length > 0 ? (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Available Time Slots:
          </h4>
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
                  ${
                    selectedTime === time
                      ? "bg-pink-500 text-white border-pink-500"
                      : "border-gray-200 hover:bg-yellow-50 hover:border-[#ffc929]"
                  }
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
          <p className="text-sm text-gray-700">
            No available times for this date.
          </p>
          <button
            className="mt-3 text-pink-500 hover:text-pink-600 text-sm font-medium"
            onClick={() => setStep(1)}
          >
            Pick Another Date
          </button>
        </div>
      )}
    </div>
  );
};

export default Step2ChooseTime;