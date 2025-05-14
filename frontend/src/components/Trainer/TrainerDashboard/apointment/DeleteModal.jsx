import { AlertTriangle, X } from "lucide-react";

export function DeleteModal({ appointment, onConfirm, onClose }) {
  if (!appointment?.id) {
    console.error("DeleteModal: Missing appointment.id:", appointment);
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full border border-gray-100 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Cancel Appointment</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 text-gray-600"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-6">
          <div className="flex items-center p-4 bg-yellow-50 border-l-4 border-[#ffc929] rounded-lg">
            <AlertTriangle className="w-6 h-6 text-[#ffc929] mr-3" />
            <p className="text-sm text-gray-700">
              Are you sure you want to cancel the training session for{" "}
              <span className="font-medium">{appointment.petName}</span> on{" "}
              <span className="font-medium">{appointment.date}</span> at{" "}
              <span className="font-medium">{appointment.time}</span>?
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50"
            >
              Keep Appointment
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium rounded-md bg-gradient-to-r from-yellow-500 to-pink-500 text-white hover:bg-[#ffa726]"
            >
              Cancel Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}