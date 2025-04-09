// components/profile/Step3ServicesSchedule.jsx
import React from "react";

const Step3ServicesSchedule = ({ formData, setFormData, formErrors, setFormErrors }) => {
  const handleServiceChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedServices = [...(prev.trainerDetails.services || [])];
      updatedServices[index] = { ...updatedServices[index], [field]: value };
      return {
        ...prev,
        trainerDetails: { ...prev.trainerDetails, services: updatedServices },
      };
    });
  };

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      trainerDetails: {
        ...prev.trainerDetails,
        services: [...(prev.trainerDetails.services || []), { serviceName: "", fee: "", duration: "" }],
      },
    }));
  };

  const removeService = (index) => {
    setFormData((prev) => ({
      ...prev,
      trainerDetails: {
        ...prev.trainerDetails,
        services: (prev.trainerDetails.services || []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => {
      if (section === "trainerDetails" && field === "openingHours") {
        return {
          ...prev,
          trainerDetails: {
            ...prev.trainerDetails,
            openingHours: { ...prev.trainerDetails.openingHours, [value.day]: value.value },
          },
        };
      }
      return { ...prev, [section]: { ...prev[section], [field]: value } };
    });
  };

  const copyMondayScheduleToAll = () => {
    const mondaySchedule = {
      status: formData.trainerDetails.openingHours.monday,
      start: formData.trainerDetails.openingHours.mondayStart,
      end: formData.trainerDetails.openingHours.mondayEnd,
      start2: formData.trainerDetails.openingHours.mondayStart2,
      end2: formData.trainerDetails.openingHours.mondayEnd2,
    };
    setFormData((prev) => ({
      ...prev,
      trainerDetails: {
        ...prev.trainerDetails,
        openingHours: {
          ...prev.trainerDetails.openingHours,
          tuesday: mondaySchedule.status, tuesdayStart: mondaySchedule.start, tuesdayEnd: mondaySchedule.end,
          tuesdayStart2: mondaySchedule.start2, tuesdayEnd2: mondaySchedule.end2,
          wednesday: mondaySchedule.status, wednesdayStart: mondaySchedule.start, wednesdayEnd: mondaySchedule.end,
          wednesdayStart2: mondaySchedule.start2, wednesdayEnd2: mondaySchedule.end2,
          thursday: mondaySchedule.status, thursdayStart: mondaySchedule.start, thursdayEnd: mondaySchedule.end,
          thursdayStart2: mondaySchedule.start2, thursdayEnd2: mondaySchedule.end2,
          friday: mondaySchedule.status, fridayStart: mondaySchedule.start, fridayEnd: mondaySchedule.end,
          fridayStart2: mondaySchedule.start2, fridayEnd2: mondaySchedule.end2,
          saturday: mondaySchedule.status, saturdayStart: mondaySchedule.start, saturdayEnd: mondaySchedule.end,
          saturdayStart2: mondaySchedule.start2, saturdayEnd2: mondaySchedule.end2,
          sunday: mondaySchedule.status, sundayStart: mondaySchedule.start, sundayEnd: mondaySchedule.end,
          sundayStart2: mondaySchedule.start2, sundayEnd2: mondaySchedule.end2,
        },
      },
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b border-[#ffc929] pb-2">Step 3: Services & Schedule</h3>
      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Services Offered <span className="text-red-500">*</span>
          </label>
          {(formData.trainerDetails.services || []).map((service, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-sm font-medium text-gray-800">Service #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    value={service.serviceName || ""}
                    onChange={(e) => handleServiceChange(index, "serviceName", e.target.value)}
                    className="w-full px-4 py-2 text-sm border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="e.g. Obedience Training"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fee (in TND)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">TND</span>
                    </div>
                    <input
                      type="number"
                      value={service.fee || ""}
                      onChange={(e) => handleServiceChange(index, "fee", e.target.value)}
                      className="w-full pl-14 pr-4 py-2 text-sm border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                  <select
                    value={service.duration || ""}
                    onChange={(e) => handleServiceChange(index, "duration", e.target.value)}
                    className="w-full p-2 border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Select Duration</option>
                    {[30, 45, 60, 90, 120].map((dur) => (
                      <option key={dur} value={dur}>{dur} mins</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addService}
            className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Service
          </button>
          {formErrors.services && <p className="text-sm text-red-500 mt-1">{formErrors.services}</p>}
        </div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">Training Schedule</label>
            <button
              type="button"
              onClick={copyMondayScheduleToAll}
              className="flex items-center px-3 py-1 text-xs font-medium text-teal-700 bg-teal-100 rounded-md hover:bg-teal-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy Monday to All
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left text-sm font-medium text-gray-700">Day</th>
                <th className="border p-2 text-left text-sm font-medium text-gray-700">Schedule Type</th>
                <th className="border p-2 text-left text-sm font-medium text-gray-700">Start</th>
                <th className="border p-2 text-left text-sm font-medium text-gray-700">End</th>
                <th className="border p-2 text-left text-sm font-medium text-gray-700">Start 2</th>
                <th className="border p-2 text-left text-sm font-medium text-gray-700">End 2</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(formData.trainerDetails.openingHours)
                .filter((key) => key.match(/^[a-z]+$/))
                .map((day) => (
                  <tr key={day} className="border-t">
                    <td className="border p-2 capitalize text-sm text-gray-700">{day}</td>
                    <td className="border p-2">
                      <select
                        value={formData.trainerDetails.openingHours[day] || "Closed"}
                        onChange={(e) =>
                          handleInputChange("trainerDetails", "openingHours", { day, value: e.target.value })
                        }
                        className="w-full p-1 border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500 text-sm"
                      >
                        <option value="Closed">Closed</option>
                        <option value="Single Session">Single Session</option>
                        <option value="Double Session">Double Session</option>
                      </select>
                    </td>
                    <td className="border p-2">
                      <input
                        type="time"
                        value={formData.trainerDetails.openingHours[`${day}Start`] || ""}
                        onChange={(e) =>
                          handleInputChange("trainerDetails", "openingHours", {
                            day: `${day}Start`,
                            value: e.target.value,
                          })
                        }
                        disabled={formData.trainerDetails.openingHours[day] === "Closed"}
                        className="w-full p-1 border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="time"
                        value={formData.trainerDetails.openingHours[`${day}End`] || ""}
                        onChange={(e) =>
                          handleInputChange("trainerDetails", "openingHours", {
                            day: `${day}End`,
                            value: e.target.value,
                          })
                        }
                        disabled={formData.trainerDetails.openingHours[day] === "Closed"}
                        className="w-full p-1 border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="time"
                        value={formData.trainerDetails.openingHours[`${day}Start2`] || ""}
                        onChange={(e) =>
                          handleInputChange("trainerDetails", "openingHours", {
                            day: `${day}Start2`,
                            value: e.target.value,
                          })
                        }
                        disabled={formData.trainerDetails.openingHours[day] !== "Double Session"}
                        className="w-full p-1 border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="time"
                        value={formData.trainerDetails.openingHours[`${day}End2`] || ""}
                        onChange={(e) =>
                          handleInputChange("trainerDetails", "openingHours", {
                            day: `${day}End2`,
                            value: e.target.value,
                          })
                        }
                        disabled={formData.trainerDetails.openingHours[day] !== "Double Session"}
                        className="w-full p-1 border rounded-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 text-sm"
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Step3ServicesSchedule;