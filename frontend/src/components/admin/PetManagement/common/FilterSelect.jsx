import React from "react";

export const FilterSelect = ({ label, value, onChange, options }) => (
  <div className="relative w-full sm:w-48">
    <select
      className={`w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffc929] transition-all duration-300 appearance-none ${
        value
          ? "text-[#ffc929] font-semibold bg-gradient-to-r from-yellow-50 to-pink-50"
          : "text-gray-600 hover:bg-gray-50"
      }`}
      value={value}
      onChange={onChange}
      aria-label={`Filter by ${label}`}
    >
      <option value="" className="text-gray-600">
        {label}
      </option>
      {options.map((option) => (
        <optgroup
          key={option.label}
          label={option.label}
          className="font-medium text-gray-700 bg-white"
        >
          {option.subOptions ? (
            option.subOptions.map((subOption) => (
              <option
                key={subOption.value}
                value={subOption.value}
                className="text-gray-600 bg-white hover:bg-yellow-50"
              >
                {subOption.label}
              </option>
            ))
          ) : (
            <option value={option.value} className="text-gray-600 bg-white hover:bg-yellow-50">
              {option.label}
            </option>
          )}
        </optgroup>
      ))}
    </select>
    {/* Custom Dropdown Arrow */}
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg
        className="w-4 h-4 text-gray-400"
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