import React from "react";
import { AlertCircle } from "lucide-react";

const Input = ({
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  error,
  id,
  disabled = false,
  ...props
}) => {
  return (
    <div className="space-y-2">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffc929]/50 transition-all duration-300 ${
          error
            ? "border-red-500 bg-red-50/30"
            : "border-[#ffc929]/20 hover:border-[#ffc929]/50"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${className}`}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-red-600 rounded-full bg-red-50"
          aria-live="polite"
        >
          <AlertCircle size={14} className="text-red-500" />
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;