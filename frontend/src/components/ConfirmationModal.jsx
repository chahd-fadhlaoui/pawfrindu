// components/ConfirmationModal.jsx
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-white border-2 shadow-2xl rounded-xl border-amber-200">
        <button
          onClick={onClose}
          className="absolute p-1 text-gray-500 transition-all rounded-full top-2 right-2 hover:text-amber-700 hover:bg-amber-100"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-amber-800">Confirm Action</h3>
          <p className="text-center text-gray-600">{getActionMessage()}</p>
          <div className="flex justify-end w-full gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 transition-all duration-200 rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
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