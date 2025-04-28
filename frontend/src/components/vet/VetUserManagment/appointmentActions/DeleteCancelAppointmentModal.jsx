import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";

const DeleteCancelAppointmentModal = ({ appointment, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vet, setVet] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReschedulePrompt, setShowReschedulePrompt] = useState(false);

  const professionalId = appointment.professionalId?._id || appointment.professionalId;
  const professionalType = appointment.professionalType;

  // Fetch vet data
  useEffect(() => {
    const fetchVetData = async () => {
      setLoading(true);
      try {
        const endpoint =
          professionalType === "Vet" ? `/api/user/vet/${professionalId}` : `/api/user/trainer/${professionalId}`;
        const response = await axiosInstance.get(endpoint);
        const vetData = response.data.vet;
        if (!vetData) throw new Error(`No ${professionalType} data returned`);
        setVet(vetData);
      } catch (err) {
        console.error("Fetch Vet Data Error:", err.message, err.response?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchVetData();
  }, [professionalId, professionalType]);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
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

  const renderContent = () => {
    if (showSuccess) {
      return (
        <div className="py-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check size={32} className="text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Appointment Cancelled!</h3>
          <p className="text-center text-gray-600 text-sm">
            Your appointment for {appointment.petName} has been cancelled.
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
                window.location.href = "/vets";
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-yellow-300 rounded-xl hover:from-pink-500 hover:to-yellow-400 transition-all"
            >
              Book Now
            </button>
          </div>
        </div>
      );
    }

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
              Note: Cancellations within 24 hours require a reason to help the {professionalType.toLowerCase()} plan their
              schedule.
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
            {loading
              ? "Processing..."
              : appointment.status === "pending"
              ? "Yes, Delete"
              : "Yes, Cancel"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-hidden mt-20">
      <div className="bg-white rounded-tl-2xl rounded-tr-3xl rounded-br-2xl rounded-bl-3xl w-full max-w-lg shadow-lg border border-gray-100 mx-4 my-8 max-h-[85vh] flex flex-col">
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
                  {vet ? `${vet.fullName} (${professionalType})` : "Loading..."}
                </h2>
                <p className="text-sm text-gray-600">{vet ? "Cancel Appointment" : "Loading details..."}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-pink-100 transition-colors">
              <X size={18} className="text-pink-500" />
            </button>
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-0 flex-1">{renderContent()}</div>
      </div>
    </div>
  );
};

export default DeleteCancelAppointmentModal;