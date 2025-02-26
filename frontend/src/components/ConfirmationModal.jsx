import React from "react";
import { X, AlertTriangle } from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, action, itemName }) => {
  if (!isOpen) return null;

  const getActionMessage = () => {
    switch (action) {
      case "delete":
        return `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;
      case "archive":
        return `Are you sure you want to archive "${itemName}"? It will be moved to the archived list.`;
      case "edit":
        return `Are you sure you want to edit "${itemName}"? Changes will be submitted for approval.`;
      case "unarchive":
        return `Are you sure you want to unarchive "${itemName}"? It will return to the active list.`;
      default:
        return "Are you sure you want to proceed with this action?";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 transition-all duration-300 transform scale-100 bg-white border-2 border-[#ffc929]/20 shadow-lg rounded-3xl hover:shadow-xl">
        <button
          onClick={onClose}
          className="absolute p-2 text-gray-500 transition-all duration-300 rounded-full top-4 right-4 hover:text-[#ffc929] hover:bg-[#ffc929]/10 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center justify-center rounded-full shadow-sm w-14 h-14 bg-[#ffc929]/10">
            <AlertTriangle className="w-7 h-7 text-[#ffc929] animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Confirm Action</h3>
          <p className="max-w-md text-sm leading-relaxed text-center text-gray-600">
            {getActionMessage()}
          </p>
          <div className="flex justify-end w-full gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-600 transition-all duration-300 transform bg-gray-100 shadow-sm rounded-xl hover:bg-gray-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 text-sm font-medium text-white transition-all duration-300 transform bg-gradient-to-r from-[#ffc929] to-[#ffa726] rounded-xl shadow-sm hover:from-[#ffa726] hover:to-[#ffc929] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
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