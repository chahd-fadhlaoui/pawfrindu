import React from "react";

export const FilterSelect = ({ label, value, onChange, options, className, disabled }) => (
  <div className={`relative ${className || "w-full sm:w-48"}`}>
    <select
      className={`w-full px-4 py-2 text-sm bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 appearance-none ${
        disabled 
          ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200" 
          : value
            ? "text-pink-600 font-semibold border-pink-300 bg-gradient-to-r from-pink-50 to-pink-50 focus:ring-pink-300"
            : "text-gray-600 border-gray-200 hover:border-pink-200 focus:ring-pink-200"
      }`}
      value={value}
      onChange={onChange}
      aria-label={`Filter by ${label}`}
      disabled={disabled}
    >
      <option value="" className="text-gray-600">
        {label}
      </option>
      {options.map((option) => (
        option.subOptions ? (
          <optgroup
            key={option.label}
            label={option.label}
            className="font-medium text-gray-700 bg-white"
          >
            {option.subOptions.map((subOption) => (
              <option
                key={subOption.value}
                value={subOption.value}
                className="text-gray-600 bg-white hover:bg-pink-50"
              >
                {subOption.label}
              </option>
            ))}
          </optgroup>
        ) : (
          <option 
            key={option.value || option.label}
            value={option.value}
            className="text-gray-600 bg-white hover:bg-pink-50"
          >
            {option.label}
          </option>
        )
      ))}
    </select>
    {/* Custom Dropdown Arrow */}
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg
        className={`w-4 h-4 ${disabled ? 'text-gray-300' : value ? 'text-pink-400' : 'text-gray-400'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);