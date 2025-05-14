import { useState } from "react";
import { X } from "lucide-react";

export function StatusUpdateModal({ appointment, onSubmit, onClose }) {
  if (!appointment?.id) {
    console.error("StatusUpdateModal: Missing appointment.id:", appointment);
    return null;
  }

  const [status, setStatus] = useState(appointment.status || "pending");
  const [reason, setReason] = useState("");
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
    onSubmit(status, reason, completionNotes);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full border border-gray-100 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Update Training Session Status</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 text-gray-600"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc929] focus:outline-none text-sm text-gray-700"
              required
              aria-label="Select training session status"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {status === "cancelled" && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cancellation Reason (Optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc929] focus:outline-none text-sm text-gray-700"
                placeholder="Reason for cancellation"
                aria-label="Cancellation reason"
              ></textarea>
            </div>
          )}
          {status === "completed" && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Completion Notes (Optional)</label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ffc929] focus:outline-none text-sm text-gray-700"
                placeholder="Add any notes about the completed training session"
                aria-label="Completion notes"
              ></textarea>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-md bg-gradient-to-r from-yellow-500 to-pink-500 text-white hover:bg-[#ffa726]"
            >
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}