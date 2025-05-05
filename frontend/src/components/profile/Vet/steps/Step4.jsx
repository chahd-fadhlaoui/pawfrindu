import { CalendarClock, CheckCircle, Clock, Copy, Info, Plus, Syringe, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useApp } from "../../../../context/AppContext";
import Input from "../../../common/Input";
import Select from "../../../common/Select";
import { Tooltip } from "../../../Tooltip";
import { ErrorMessage } from "../../common/ErrorMessage";
import { SectionHeader } from "../../common/SectionHeader";

const Step4 = ({
  formData,
  formErrors,
  scheduleErrors,
  handleInputChange,
  handleServiceChange,
  addService,
  removeService,
  copyMondayScheduleToAll,
}) => {
  const [serviceSuccess, setServiceSuccess] = useState(null);
  const [expandedDays, setExpandedDays] = useState({ monday: true });
  const { currencySymbol } = useApp();

  useEffect(() => {
    if (scheduleErrors) {
      const newExpandedState = { ...expandedDays };
      Object.keys(scheduleErrors).forEach((day) => {
        if (scheduleErrors[day]) {
          newExpandedState[day] = true;
        }
      });
      setExpandedDays(newExpandedState);
    }
  }, [scheduleErrors]);

  const toggleDay = (day) => {
    setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const validateFee = (value) => {
    const numValue = parseFloat(value);
    return numValue >= 0 ? numValue : 0;
  };

  const handleAddService = () => {
    const lastService = formData.veterinarianDetails.services.slice(-1)[0];
    if (lastService?.serviceName?.trim() && lastService?.fee >= 0) {
      addService();
      setServiceSuccess("Service added successfully!");
      setTimeout(() => setServiceSuccess(null), 2000);
    }
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animationClass = prefersReducedMotion ? "" : "transition-all duration-300 ease-in-out";

  const formatDayName = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const getScheduleStatus = (day) => {
    const schedule = formData.veterinarianDetails.openingHours[day];
    return schedule === "Closed" ? "closed" : "open";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SectionHeader
        title="Services & Schedule"
        icon={CalendarClock}
        description="Required fields are marked with *"
      />

      {/* Services Section */}
      <section className="space-y-4" aria-labelledby="services-section">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label id="services-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
                <Syringe size={16} className="text-[#ffc929]" />
              </span>
              Services Offered <span className="text-red-500">*</span>
            </label>
            <Tooltip
              text="List all veterinary services you provide with their corresponding fees."
              ariaLabel="Services information"
            >
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
              >
                <span className="sr-only">Services information</span>
                <Info size={16} className="text-gray-400" />
              </button>
            </Tooltip>
          </div>
          <button
            type="button"
            onClick={handleAddService}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#ffc929]/50 focus:outline-none"
            aria-label="Add new service"
          >
            <Plus size={18} />
            Add Service
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Enter the services you offer (e.g., Vaccination, Surgery) and their fees in {currencySymbol}.
        </p>

        <div className="space-y-3">
          {formData.veterinarianDetails.services.length === 0 ? (
            <div className="p-6 text-center border border-gray-300 border-dashed bg-gray-50 rounded-xl">
              <p className="text-gray-500">No services added yet. Add your first service above.</p>
            </div>
          ) : (
            formData.veterinarianDetails.services.map((service, index) => (
              <div
                key={index}
                className={`p-4 bg-white border border-[#ffc929]/10 rounded-xl shadow-sm hover:shadow-md ${animationClass}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#ffc929]/20 text-xs">
                      {index + 1}
                    </span>
                    {service.serviceName || "New Service"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-gray-400 rounded-full hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Remove service ${service.serviceName || index + 1}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`service-name-${index}`}
                      className="block mb-1 text-xs font-medium text-gray-700"
                    >
                      Service Name
                    </label>
                    <Input
                      id={`service-name-${index}`}
                      type="text"
                      value={service.serviceName || ""}
                      onChange={(e) => handleServiceChange(index, "serviceName", e.target.value)}
                      placeholder="e.g., Vaccination"
                      className="w-full px-4 py-3 text-sm border-2 border-[#ffc929]/20 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929]"
                      aria-describedby={`service-name-help-${index}`}
                    />
                    <p id={`service-name-help-${index}`} className="mt-1 text-xs text-gray-500">
                      Enter the name of the service.
                    </p>
                  </div>
                  <div className="relative">
                    <label
                      htmlFor={`service-fee-${index}`}
                      className="block mb-1 text-xs font-medium text-gray-700"
                    >
                      Service Fee
                    </label>
                    <Input
                      id={`service-fee-${index}`}
                      type="number"
                      value={service.fee || ""}
                      onChange={(e) => handleServiceChange(index, "fee", validateFee(e.target.value).toString())}
                      placeholder="e.g., 50.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 text-sm border-2 border-[#ffc929]/20 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] pr-16"
                      aria-describedby={`fee-help-${index}`}
                    />
                    <span className="absolute text-sm text-gray-500 -translate-y-1/2 right-4 top-1/2">
                      {currencySymbol}
                    </span>
                    <p id={`fee-help-${index}`} className="mt-1 text-xs text-gray-500">
                      Enter the fee in Dinar.
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {serviceSuccess && (
          <p
            className="flex items-center gap-1.5 text-sm font-medium text-green-600 animate-pulse"
            aria-live="polite"
          >
            <CheckCircle size={14} className="text-green-500" />
            {serviceSuccess}
          </p>
        )}

        <ErrorMessage id="services-error" error={formErrors.services} />
      </section>

      {/* Schedule Section */}
      <section className="space-y-4" aria-labelledby="schedule-section">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label id="schedule-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
                <Clock size={16} className="text-[#ffc929]" />
              </span>
              Clinic Schedule <span className="text-red-500">*</span>
            </label>
            <Tooltip
              text="Set your clinic's operating hours. Choose 'Closed', 'Single Session' (one time slot), or 'Double Session' (two time slots)."
              ariaLabel="Schedule information"
            >
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffc929] rounded-full"
              >
                <span className="sr-only">Schedule information</span>
                <Info size={16} className="text-gray-400" />
              </button>
            </Tooltip>
          </div>
          <button
            type="button"
            onClick={copyMondayScheduleToAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#ffc929]/50 focus:outline-none"
            aria-label="Copy Monday's schedule to all days"
          >
            <Copy size={16} />
            Copy Monday to All
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Set your clinic's operating hours using time inputs for each day.
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
            (day) => {
              const scheduleStatus = getScheduleStatus(day);
              return (
                <div
                  key={day}
                  className={`bg-white border ${scheduleErrors[day] ? "border-red-200" : "border-[#ffc929]/10"} rounded-xl shadow-sm hover:shadow-md ${animationClass}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`flex items-center justify-between w-full p-4 text-left bg-white ${scheduleErrors[day] ? "bg-red-50/50" : ""}`}
                    aria-expanded={!!expandedDays[day]}
                    aria-controls={`schedule-${day}`}
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-800">
                        {formatDayName(day)}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          scheduleStatus === "closed"
                            ? "bg-gray-100 text-gray-500"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {scheduleStatus === "closed" ? "Closed" : "Open"}
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 ${expandedDays[day] ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    id={`schedule-${day}`}
                    className={`bg-white p-4 pt-0 ${expandedDays[day] ? "block" : "hidden"}`}
                    style={{ maxHeight: expandedDays[day] ? "1000px" : "0", overflow: "hidden" }}
                  >
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor={`schedule-type-${day}`}
                          className="block mb-1 text-xs font-medium text-gray-700"
                        >
                          Schedule Type
                        </label>
                        <Select
                          id={`schedule-type-${day}`}
                          value={formData.veterinarianDetails.openingHours[day] || "Closed"}
                          onChange={(e) =>
                            handleInputChange("veterinarianDetails", "openingHours", {
                              day,
                              value: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 text-sm border-2 border-[#ffc929]/20 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929]"
                          aria-describedby={`schedule-type-help-${day}`}
                        >
                          <option value="Closed">Closed</option>
                          <option value="Single Session">Single Session</option>
                          <option value="Double Session">Double Session</option>
                        </Select>
                        <p
                          id={`schedule-type-help-${day}`}
                          className="mt-1 text-xs text-gray-500"
                        >
                          Select the schedule type for this day.
                        </p>
                      </div>

                      {formData.veterinarianDetails.openingHours[day] !== "Closed" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label
                                htmlFor={`${day}-start`}
                                className="block mb-1 text-xs font-medium text-gray-700"
                              >
                                Start Time
                              </label>
                              <Input
                                id={`${day}-start`}
                                type="time"
                                value={formData.veterinarianDetails.openingHours[`${day}Start`] || ""}
                                onChange={(e) =>
                                  handleInputChange("veterinarianDetails", "openingHours", {
                                    day: `${day}Start`,
                                    value: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 text-sm border-2 border-[#ffc929]/20 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929]"
                                aria-label={`Start time for ${formatDayName(day)}`}
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`${day}-end`}
                                className="block mb-1 text-xs font-medium text-gray-700"
                              >
                                End Time
                              </label>
                              <Input
                                id={`${day}-end`}
                                type="time"
                                value={formData.veterinarianDetails.openingHours[`${day}End`] || ""}
                                onChange={(e) =>
                                  handleInputChange("veterinarianDetails", "openingHours", {
                                    day: `${day}End`,
                                    value: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 text-sm border-2 border-[#ffc929]/20 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929]"
                                aria-label={`End time for ${formatDayName(day)}`}
                              />
                            </div>
                          </div>

                          {formData.veterinarianDetails.openingHours[day] === "Double Session" && (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div>
                                <label
                                  htmlFor={`${day}-start2`}
                                  className="block mb-1 text-xs font-medium text-gray-700"
                                >
                                  Second Start Time
                                </label>
                                <Input
                                  id={`${day}-start2`}
                                  type="time"
                                  value={formData.veterinarianDetails.openingHours[`${day}Start2`] || ""}
                                  onChange={(e) =>
                                    handleInputChange("veterinarianDetails", "openingHours", {
                                      day: `${day}Start2`,
                                      value: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-3 text-sm border-2 border-[#ffc929]/20 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929]"
                                  aria-label={`Second start time for ${formatDayName(day)}`}
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor={`${day}-end2`}
                                  className="block mb-1 text-xs font-medium text-gray-700"
                                >
                                  Second End Time
                                </label>
                                <Input
                                  id={`${day}-end2`}
                                  type="time"
                                  value={formData.veterinarianDetails.openingHours[`${day}End2`] || ""}
                                  onChange={(e) =>
                                    handleInputChange("veterinarianDetails", "openingHours", {
                                      day: `${day}End2`,
                                      value: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-3 text-sm border-2 border-[#ffc929]/20 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929]"
                                  aria-label={`Second end time for ${formatDayName(day)}`}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <ErrorMessage id={`schedule-${day}-error`} error={scheduleErrors[day]} />
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>

        <ErrorMessage id="schedule-error" error={formErrors.schedule} />
      </section>
    </div>
  );
};

export default Step4;