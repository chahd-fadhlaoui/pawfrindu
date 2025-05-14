import React, { useState, useEffect } from "react";
import { X, Eye, Calendar } from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";

const ViewAppointmentModal = ({ appointment, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [professional, setProfessional] = useState(null);
  const [error, setError] = useState(null);
  const professionalId = appointment.professionalId?._id || appointment.professionalId;
  const professionalType = appointment.professionalType;

  // Utility functions
  function formatTimeSlot(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatOpeningHours(day) {
    const details = professionalType === "Vet" ? professional?.veterinarianDetails : professional?.trainerDetails;
    if (!details?.openingHours) return "Not specified";
    const hours = details.openingHours[day];
    if (!hours || hours === "Closed") return "Closed";
    const start1 = details.openingHours[`${day}Start`];
    const end1 = details.openingHours[`${day}End`];
    let timeString = start1 && end1 ? `${start1} - ${end1}` : "N/A";
    if (hours === "Double Session") {
      const start2 = details.openingHours[`${day}Start2`];
      const end2 = details.openingHours[`${day}End2`];
      if (start2 && end2) timeString += `, ${start2} - ${end2}`;
    }
    return timeString;
  }

  // Check if the professional is unavailable (e.g., inactive)
  if (appointment.professionalAvailable === false) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-hidden mt-20">
        <div className="bg-white rounded-tl-2xl rounded-tr-3xl rounded-br-2xl rounded-bl-3xl w-full max-w-lg shadow-lg border border-gray-100 mx-4 my-8 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Appointment Details</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-pink-100 transition-colors">
              <X size={18} className="text-pink-500" />
            </button>
          </div>
          <p className="text-red-500 text-center">
            The {professionalType.toLowerCase()} for this appointment is no longer available.
          </p>
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fetch professional data
  useEffect(() => {
    const fetchProfessionalData = async () => {
      setLoading(true);
      try {
        const endpoint =
          professionalType === "Vet" ? `/api/user/vet/${professionalId}` : `/api/user/trainer/${professionalId}`;
        const response = await axiosInstance.get(endpoint);
        const professionalData = professionalType === "Vet" ? response.data.vet : response.data.trainer;
        if (!professionalData) throw new Error(`No ${professionalType} data returned`);
        setProfessional(professionalData);
      } catch (err) {
        console.error("Fetch Professional Data Error:", err.message, err.response?.data);
        setError(
          err.response?.status === 404
            ? `${professionalType} not found. They may no longer be available.`
            : `Failed to load ${professionalType.toLowerCase()} data: ${err.message}`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfessionalData();
  }, [professionalId, professionalType]);

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
                <p className="text-sm text-gray-600">
                  {professional ? "View Appointment Details" : "Loading details..."}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-pink-100 transition-colors">
              <X size={18} className="text-pink-500" />
            </button>
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-0 flex-1">
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pink-100 rounded-full">
                <Eye size={20} className="text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Appointment Details</h3>
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-yellow-50 rounded-xl p-4 border border-pink-100">
              <div className="flex items-start gap-3">
                <Calendar className="text-pink-400 mt-1" size={20} />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(appointment.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Time:</span> {formatTimeSlot(appointment.time)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Pet:</span> {appointment.petName}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`inline-block px-2 py-0.5 ml-1 rounded-full text-xs ${
                        appointment.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : appointment.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </p>
                  {appointment.reason && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Reason:</span> {appointment.reason}
                    </p>
                  )}
                  {appointment.notes && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Notes:</span> {appointment.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mt-6">{professionalType} Details</h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-gray-600">Loading details...</p>
              </div>
            ) : error ? (
              <p className="text-sm text-red-500 text-center">{error}</p>
            ) : (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-gray-100">
                  {professional &&
                    (professionalType === "Vet"
                      ? professional.veterinarianDetails?.governorate || professional.veterinarianDetails?.delegation
                      : professional.trainerDetails?.governorate || professional.trainerDetails?.delegation) && (
                      <div className="flex items-start gap-2">
                        <div className="p-1 bg-gray-100 rounded-full mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700">Location</p>
                          <p className="text-sm text-gray-600">
                            {[
                              professionalType === "Vet"
                                ? professional.veterinarianDetails?.delegation
                                : professional.trainerDetails?.delegation,
                              professionalType === "Vet"
                                ? professional.veterinarianDetails?.governorate
                                : professional.trainerDetails?.governorate,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    )}
                  {professional &&
                    (professionalType === "Vet"
                      ? professional.veterinarianDetails?.landlinePhone
                      : professional.trainerDetails?.landlinePhone) && (
                      <div className="flex items-start gap-2">
                        <div className="p-1 bg-gray-100 rounded-full mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700">Phone</p>
                          <p className="text-sm text-gray-600">
                            {professionalType === "Vet"
                              ? professional.veterinarianDetails?.landlinePhone
                              : professional.trainerDetails?.landlinePhone}
                          </p>
                        </div>
                      </div>
                    )}
                </div>

                <div className="py-4 border-b border-gray-100">
                  <div className="flex flex-wrap gap-x-8 gap-y-4">
                    {professional &&
                      (professionalType === "Vet"
                        ? professional.veterinarianDetails?.services?.length > 0
                        : professional.trainerDetails?.services?.length > 0) && (
                        <div className="flex-1 min-w-[150px]">
                          <p className="text-xs font-medium text-gray-700 mb-2">Services</p>
                          <ul className="space-y-1">
                            {(professionalType === "Vet"
                              ? professional.veterinarianDetails?.services
                              : professional.trainerDetails?.services
                            ).map((service, index) => (
                              <li key={index} className="text-sm flex justify-between">
                                <span>{service.serviceName}</span>
                                {service.fee > 0 && <span className="text-gray-600">{service.fee} TND</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {professional &&
                      (professionalType === "Vet"
                        ? professional.veterinarianDetails?.languagesSpoken?.length > 0
                        : professional.trainerDetails?.languagesSpoken?.length > 0) && (
                        <div className="flex-1 min-w-[150px]">
                          <p className="text-xs font-medium text-gray-700 mb-2">Languages</p>
                          <div className="flex flex-wrap gap-1">
                            {(professionalType === "Vet"
                              ? professional.veterinarianDetails?.languagesSpoken
                              : professional.trainerDetails?.languagesSpoken
                            ).map((lang, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                              >
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <div className="py-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Availability</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                      const details =
                        professionalType === "Vet" ? professional?.veterinarianDetails : professional?.trainerDetails;
                      const dayData = details?.openingHours?.[day];
                      const dayStart = details?.openingHours?.[`${day}Start`];
                      const dayEnd = details?.openingHours?.[`${day}End`];
                      const dayStart2 = details?.openingHours?.[`${day}Start2`];
                      const dayEnd2 = details?.openingHours?.[`${day}End2`];
                      let timeString = "Closed";
                      if (dayData && dayData !== "Closed") {
                        timeString = dayStart && dayEnd ? `${dayStart} - ${dayEnd}` : "";
                        if (dayData === "Double Session" && dayStart2 && dayEnd2) {
                          timeString += dayStart && dayEnd ? `, ${dayStart2} - ${dayEnd2}` : `${dayStart2} - ${dayEnd2}`;
                        }
                      }
                      return (
                        <div
                          key={day}
                          className={`p-2 rounded ${
                            ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(
                              day.charAt(0).toUpperCase() + day.slice(1)
                            ) === new Date().getDay()
                              ? "bg-pink-50 border border-pink-100"
                              : "bg-gray-50 border border-gray-100"
                          }`}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                            <span className={dayData === "Closed" ? "text-red-500" : "text-green-600"}>
                              {dayData === "Closed" ? "Closed" : dayData}
                            </span>
                          </div>
                          {dayData !== "Closed" && <div className="text-xs text-gray-600 mt-1">{timeString}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">
                    Consultation duration:{" "}
                    <strong>
                      {(professionalType === "Vet"
                        ? professional?.veterinarianDetails?.averageConsultationDuration
                        : professional?.trainerDetails?.averageConsultationDuration)}{" "}
                      minutes
                    </strong>
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAppointmentModal;