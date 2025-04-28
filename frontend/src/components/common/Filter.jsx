import React from 'react';
import { X } from 'lucide-react';

export const FilterBadge = ({ label, value, onClear }) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs sm:text-sm font-medium text-gray-800 bg-[#ffc929]/20 rounded-full shadow-sm">
      <span className="truncate max-w-[120px] sm:max-w-[150px]">{label}: {value}</span>
      <button
        onClick={onClear}
        className="p-0.5 text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ffc929]/30"
        aria-label={`Clear ${label} filter`}
      >
        <X size={14} className="sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};

export const FilterSelect = ({ label, value, onChange, options, disabled }) => {
  console.log(`FilterSelect options for ${label}:`, options); // Debug options
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-700 sm:text-sm">{label}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`block w-full px-3 py-2 text-sm sm:text-base text-gray-800 bg-white border border-[#ffc929]/20 rounded-lg shadow-sm focus:ring-2 focus:ring-[#ffc929]/30 focus:outline-none transition-all duration-300 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#ffc929]/5'
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((option, index) => {
          const optionValue = typeof option === 'object' && option !== null ? option.value : option;
          const optionLabel = typeof option === 'object' && option !== null ? option.label : option;
          return (
            <option key={`${optionValue}-${index}`} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
};
