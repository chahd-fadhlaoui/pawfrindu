import React from "react";
import { X, AlertTriangle } from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, action, itemName, message }) => {
  if (!isOpen) return null;

  const getActionConfig = () => {
    const customMessage = message || "";
    const defaultMessages = {
      delete: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      archive: `Are you sure you want to archive "${itemName}"? It will be moved to the archived list.`,
      unarchive: `Are you sure you want to unarchive "${itemName}"? It will return to its previous state.`,
      deactivate: `Are you sure you want to deactivate "${itemName}"? They will lose system access until reactivated.`,
      reactivate: `Are you sure you want to reactivate "${itemName}"? They will regain system access.`,
      accept: `Are you sure you want to accept "${itemName}"? They will be activated and gain system access.`,
      reject: `Are you sure you want to reject "${itemName}"? They will be archived and lose system access.`,
      select: `Are you sure you want to select "${itemName}"? This will reject all other candidates.`,
      finalize: `Are you sure you want to finalize adoption for "${itemName}"? This completes the process.`,
      edit: `Are you sure you want to edit "${itemName}"? Changes will be submitted for approval.`,
    };

    const buttonStyles = {
      delete: "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 focus:ring-red-500",
      archive: "bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 focus:ring-gray-500",
      unarchive: "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:ring-blue-500",
      deactivate: "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 focus:ring-red-500",
      reactivate: "bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 focus:ring-green-500",
      accept: "bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 focus:ring-green-500",
      select: "bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 focus:ring-green-500",
      finalize: "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:ring-blue-500",
      edit: "bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 focus:ring-amber-400",
    };

    return {
      message: customMessage || defaultMessages[action] || "Are you sure you want to proceed with this action?",
      buttonStyle: buttonStyles[action] || "bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 focus:ring-amber-400",
    };
  };

  const { message: actionMessage, buttonStyle } = getActionConfig();

  return (
    <div className="fixed inset-0 flex items-center justify-center transition-opacity duration-300 z-60 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 transition-all duration-300 transform scale-100 bg-white shadow-2xl rounded-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute p-2 transition-all duration-200 rounded-full top-4 right-4 text-amber-600 hover:text-amber-800 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center space-y-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full shadow-md bg-amber-100">
            <AlertTriangle className="w-8 h-8 text-amber-600 animate-pulse" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900">Are You Sure?</h3>

          {/* Message */}
          <p className="max-w-md text-sm leading-relaxed text-center text-gray-600">
            {actionMessage}
          </p>

          {/* Buttons */}
          <div className="flex justify-center w-full gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2 text-sm font-medium text-white rounded-full shadow-md hover:scale-105 focus:outline-none focus:ring-2 transition-all duration-200 ${buttonStyle}`}
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