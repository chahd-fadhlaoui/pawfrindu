import React from "react";
import { X, AlertTriangle } from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, action, itemName, message }) => {
  if (!isOpen) return null;

  const getActionMessage = () => {
    // Use custom message if provided
    if (message) return message;

    // Fallback to predefined messages
    switch (action) {
      case "delete":
        return `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;
      case "archive":
        return `Are you sure you want to archive "${itemName}"? It will be moved to the archived list.`;
      case "unarchive":
        return `Are you sure you want to unarchive "${itemName}"? It will return to its previous state.`;
      case "deactivate":
        return `Are you sure you want to deactivate "${itemName}"? They will no longer be able to access the system until reactivated.`;
      case "reactivate":
        return `Are you sure you want to reactivate "${itemName}"? They will regain access to the system.`;
      case "accept":
        return `Are you sure you want to accept "${itemName}"? They will be activated and able to access the system.`;
      case "reject":
        return `Are you sure you want to reject "${itemName}"? They will be archived and unable to access the system.`;
      case "edit":
        return `Are you sure you want to edit "${itemName}"? Changes will be submitted for approval.`;
      default:
        return "Are you sure you want to proceed with this action?";
    }
  };

  const getConfirmButtonStyle = () => {
    switch (action) {
      case "delete":
        return "bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:ring-red-400";
      case "archive":
      case "reject":
        return "bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 focus:ring-gray-400";
      case "unarchive":
        return "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:ring-blue-400";
      case "deactivate":
        return "bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:ring-red-400";
      case "reactivate":
      case "accept":
      case "select": // Add for consistency with button color
      case "finalize": // Add for consistency with button color
        return "bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:ring-green-400";
      case "edit":
      default:
        return "bg-gradient-to-r from-[#ffc929] to-[#ffa726] hover:from-[#ffa726] hover:to-[#ffc929] focus:ring-[#ffc929]/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 transition-all duration-300 transform scale-100 bg-white shadow-xl rounded-xl">
        <button
          onClick={onClose}
          className="absolute p-2 text-gray-500 transition-all duration-300 rounded-full top-4 right-4 hover:text-[#ffc929] hover:bg-[#ffc929]/10 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#ffc929]/10 shadow-sm">
            <AlertTriangle className="w-7 h-7 text-[#ffc929] animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Confirm Action</h3>
          <p className="max-w-md text-sm leading-relaxed text-center text-gray-600">
            {getActionMessage()}
          </p>
          <div className="flex justify-end w-full gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 transition-all duration-300 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2 text-sm font-medium text-white transition-all duration-300 transform rounded-lg shadow-md hover:scale-105 focus:outline-none focus:ring-2 ${getConfirmButtonStyle()}`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;