import { useState } from "react";
import { X } from "lucide-react";

export default function StatusUpdateModal({ appointment, onSubmit, onClose }) {
  const [status, setStatus] = useState(appointment.status || "pending");
  const [completionNotes, setCompletionNotes] = useState("");
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "notAvailable", label: "Not Available" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(status, null, completionNotes);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Update Appointment Status
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 focus:outline-none"
              required
              aria-label="Select appointment status"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {status === "completed" && (
            <div>
              <label className="block text-sm text-gray-600">Completion Notes (Optional)</label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-300 focus:outline-none"
                placeholder="Add any notes about the completed appointment"
                aria-label="Completion notes"
              ></textarea>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors shadow"
            >
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}