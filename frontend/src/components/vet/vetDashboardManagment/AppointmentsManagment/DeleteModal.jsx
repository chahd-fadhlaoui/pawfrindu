import { X, AlertTriangle } from "lucide-react";

export default function DeleteModal({ appointment, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Cancel Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-6">
          <div className="flex items-center p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-amber-500 mr-3" />
            <p className="text-gray-700">
              Are you sure you want to cancel the appointment for{" "}
              <span className="font-medium">{appointment.petName}</span> on{" "}
              <span className="font-medium">{appointment.date}</span> at{" "}
              <span className="font-medium">{appointment.time}</span>?
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Keep Appointment
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors shadow"
            >
              Cancel Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}