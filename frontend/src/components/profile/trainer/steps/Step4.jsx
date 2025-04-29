import { CalendarClock, CheckCircle, Clock, Copy, Info, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useApp } from "../../../../context/AppContext";
import Input from "../../../common/Input";
import Select from "../../../common/Select";
import { Tooltip } from "../../../Tooltip";
import { SectionHeader } from "../../common/SectionHeader";
import { FaPaw } from "react-icons/fa";
import { trainingCategories } from "../../../../assets/trainer"; 
import { ErrorMessage } from "../../common/ErrorMessage"; 

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

  const getMinEndTime = (startTime) => {
    if (!startTime) return "06:15";
    const [hours, minutes] = startTime.split(":").map(Number);
    const minTime = new Date();
    minTime.setHours(hours, minutes + 15);
    return minTime.toTimeString().slice(0, 5);
  };

  const getMinStart2Time = (endTime) => {
    if (!endTime) return "06:15";
    const [hours, minutes] = endTime.split(":").map(Number);
    const minTime = new Date();
    minTime.setHours(hours, minutes + 15);
    return minTime.toTimeString().slice(0, 5);
  };

  const handleAddService = () => {
    const currentServices = formData.trainerDetails.services;
    const lastService = currentServices.slice(-1)[0];

    // Check if both services are already added
    if (currentServices.length >= 2) {
      setFormErrors((prev) => ({
        ...prev,
        services: "You can only add up to two services: Basic Training and Guard Dog Training.",
      }));
      return;
    }

    // Check if the last service is valid and not a duplicate
    if (
      !lastService ||
      (lastService?.serviceName?.trim() &&
        lastService?.fee >= 0 &&
        !currentServices.some(
          (service, index) =>
            service.serviceName === lastService.serviceName && index !== currentServices.length - 1
        ))
    ) {
      addService();
      setServiceSuccess("Service added successfully!");
      setTimeout(() => setServiceSuccess(null), 2000); // Fixed setTimeout syntax
    } else {
      setFormErrors((prev) => ({
        ...prev,
        services: lastService?.serviceName?.trim()
          ? "This service has already been added."
          : "Please fill out the current service before adding a new one.",
      }));
    }
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animationClass = prefersReducedMotion ? "" : "transition-all duration-300 ease-in-out";

  const formatDayName = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const getScheduleStatus = (day) => {
    const schedule = formData.trainerDetails.openingHours[day];
    return schedule === "Closed" ? "closed" : "open";
  };

  // Disable Add Service button if two services are added
  const isAddServiceDisabled = formData.trainerDetails.services.length >= 2;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SectionHeader
        title="Services & Schedule"
        icon={CalendarClock}
        description="Required fields are marked with *"
      />

      <section className="space-y-4" aria-labelledby="services-section">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label id="services-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
                <FaPaw size={16} className="text-[#ffc929]" />
              </span>
              Services Offered <span className="text-red-500">*</span>
            </label>
            <Tooltip
              text="Select up to two training services (Basic Training and Guard Dog Training) with their corresponding fees."
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
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-md focus:ring-2 focus:ring-[#ffc929]/50 focus:outline-none ${animationClass} ${
              isAddServiceDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-[#ffa726] hover:to-[#ffc929] hover:shadow-lg"
            }`}
            aria-label="Add new service"
            disabled={isAddServiceDisabled}
          >
            <Plus size={18} />
            Add Service
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Select the services you offer and their fees in {currencySymbol}. You can add up to two services.
        </p>

        <div className="space-y-3">
          {formData.trainerDetails.services.length === 0 ? (
            <div className="p-6 text-center border border-gray-300 border-dashed bg-gray-50 rounded-xl">
              <p className="text-gray-500">No services added yet. Add your first service above.</p>
            </div>
          ) : (
            formData.trainerDetails.services.map((service, index) => (
              <div
                key={index}
                className={`p-4 bg-white border border-[#ffc929]/10 rounded-xl shadow-sm hover:shadow-md ${animationClass}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#ffc929]/20 text-xs">
                      {index + 1}
                    </span>
                    {service.serviceName || "Select a Service"}
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
                    <Select
                      id={`service-name-${index}`}
                      value={service.serviceName || ""}
                      onChange={(e) => handleServiceChange(index, "serviceName", e.target.value)}
                      error={formErrors[`services[${index}].serviceName`]}
                      className={animationClass}
                      aria-describedby={`service-name-help-${index}`}
                    >
                      <option value="" disabled>
                        Select a service
                      </option>
                      {trainingCategories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                    <p id={`service-name-help-${index}`} className="mt-1 text-xs text-gray-500">
                      Select the training service.
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
                      className={`w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] pr-16 ${animationClass} ${
                        formErrors[`services[${index}].fee`] ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"
                      }`}
                      aria-describedby={`fee-help-${index}`}
                    />
                    <span className="absolute text-sm text-gray-500 -translate-y-1/2 right-4 top-1/2">
                      {currencySymbol}
                    </span>
                    <p id={`fee-help-${index}`} className="mt-1 text-xs text-gray-500">
                      Enter the fee in Dinar.
                    </p>
                    <ErrorMessage
                      id={`service-fee-error-${index}`}
                      error={formErrors[`services[${index}].fee`]}
                    />
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

      <section className="space-y-4" aria-labelledby="schedule-section">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label id="schedule-section" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span className="p-1.5 bg-[#ffc929]/10 rounded-full">
                <Clock size={16} className="text-[#ffc929]" />
              </span>
              Training Schedule <span className="text-red-500">*</span>
            </label>
            <Tooltip
              text="Set your training availability. Single session is one continuous block, double session allows for a break."
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
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl hover:from-[#ffa726] hover:to-[#ffc929] shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#ffc929]/50 focus:outline-none ${animationClass}`}
            aria-label="Copy Monday's schedule to all days"
          >
            <Copy size={16} />
            Copy Monday to All
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Set your training availability. Choose 'Closed' if not available, or select session type and specify times between 06:00 and 23:00.
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
                      className={`w-5 h-5 ${expandedDays[day] ? "rotate-180" : ""} ${animationClass}`}
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
                          value={formData.trainerDetails.openingHours[day] || "Closed"}
                          onChange={(e) =>
                            handleInputChange("trainerDetails", "openingHours", {
                              day,
                              value: e.target.value,
                            })
                          }
                          error={scheduleErrors[day]}
                          className={animationClass}
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
                          Single: One continuous block. Double: Two sessions with a break.
                        </p>
                      </div>

                      {formData.trainerDetails.openingHours[day] !== "Closed" && (
                        <div className="space-y-4">
                          <fieldset className="space-y-2">
                            <legend className="text-xs font-medium text-gray-500">Morning Session</legend>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div>
                                <label
                                  htmlFor={`${day}-start`}
                                  className="block mb-1 text-xs font-medium text-gray-700"
                                >
                                  Start Time
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Clock size={14} className="text-gray-400" />
                                  </div>
                                  <Input
                                    id={`${day}-start`}
                                    type="time"
                                    value={formData.trainerDetails.openingHours[`${day}Start`] || ""}
                                    onChange={(e) =>
                                      handleInputChange("trainerDetails", "openingHours", {
                                        day: `${day}Start`,
                                        value: e.target.value,
                                      })
                                    }
                                    min="06:00"
                                    max="22:45"
                                    step="900"
                                    className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                                      scheduleErrors[day] ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"
                                    }`}
                                    aria-label={`Morning start time for ${formatDayName(day)}`}
                                  />
                                </div>
                              </div>
                              <div>
                                <label
                                  htmlFor={`${day}-end`}
                                  className="block mb-1 text-xs font-medium text-gray-700"
                                >
                                  End Time
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Clock size={14} className="text-gray-400" />
                                  </div>
                                  <Input
                                    id={`${day}-end`}
                                    type="time"
                                    value={formData.trainerDetails.openingHours[`${day}End`] || ""}
                                    onChange={(e) =>
                                      handleInputChange("trainerDetails", "openingHours", {
                                        day: `${day}End`,
                                        value: e.target.value,
                                      })
                                    }
                                    min={getMinEndTime(formData.trainerDetails.openingHours[`${day}Start`])}
                                    max="23:00"
                                    step="900"
                                    className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                                      scheduleErrors[day] ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"
                                    }`}
                                    aria-label={`Morning end time for ${formatDayName(day)}`}
                                  />
                                </div>
                              </div>
                            </div>
                          </fieldset>
                        </div>
                      )}

                      {formData.trainerDetails.openingHours[day] === "Double Session" && (
                        <fieldset className="space-y-2">
                          <legend className="text-xs font-medium text-gray-500">Afternoon Session</legend>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label
                                htmlFor={`${day}-start2`}
                                className="block mb-1 text-xs font-medium text-gray-700"
                              >
                                Start Time
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <Clock size={14} className="text-gray-400" />
                                </div>
                                <Input
                                  id={`${day}-start2`}
                                  type="time"
                                  value={formData.trainerDetails.openingHours[`${day}Start2`] || ""}
                                  onChange={(e) =>
                                    handleInputChange("trainerDetails", "openingHours", {
                                      day: `${day}Start2`,
                                      value: e.target.value,
                                    })
                                  }
                                  min={getMinStart2Time(formData.trainerDetails.openingHours[`${day}End`])}
                                  max="22:45"
                                  step="900"
                                  className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                                    scheduleErrors[day] ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"
                                  }`}
                                  aria-label={`Afternoon start time for ${formatDayName(day)}`}
                                />
                              </div>
                            </div>
                            <div>
                              <label
                                htmlFor={`${day}-end2`}
                                className="block mb-1 text-xs font-medium text-gray-700"
                              >
                                End Time
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <Clock size={14} className="text-gray-400" />
                                </div>
                                <Input
                                  id={`${day}-end2`}
                                  type="time"
                                  value={formData.trainerDetails.openingHours[`${day}End2`] || ""}
                                  onChange={(e) =>
                                    handleInputChange("trainerDetails", "openingHours", {
                                      day: `${day}End2`,
                                      value: e.target.value,
                                    })
                                  }
                                  min={getMinEndTime(formData.trainerDetails.openingHours[`${day}Start2`])}
                                  max="23:00"
                                  step="900"
                                  className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-[#ffc929]/50 focus:border-[#ffc929] ${animationClass} ${
                                    scheduleErrors[day] ? "border-red-500 bg-red-50/30" : "border-[#ffc929]/20"
                                  }`}
                                  aria-label={`Afternoon end time for ${formatDayName(day)}`}
                                />
                              </div>
                            </div>
                          </div>
                        </fieldset>
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
