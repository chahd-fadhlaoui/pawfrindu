import { AlertCircle } from "lucide-react";
import React from "react";

export const ErrorMessage = ({ error, id }) =>
  error && (
    <p
      id={id}
      className="flex items-center gap-1.5 px-4 py-1.5 mt-2 text-sm font-medium text-red-600 rounded-full bg-red-50"
      aria-live="polite"
    >
      <AlertCircle size={14} className="text-red-500" />
      {error}
    </p>
  );