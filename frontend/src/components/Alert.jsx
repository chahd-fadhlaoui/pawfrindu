import { AlertCircle, X } from "lucide-react";
import React from "react";

export const Alert = ({ message, onClose }) => (
    <div className="relative p-4 mb-6 text-red-600 bg-red-100 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <p className="flex-1">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 transition-colors rounded-full hover:bg-red-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );