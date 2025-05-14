import React from 'react'

const SortButton = ({ label, value, isActive, onClick }) => (
    <button
      onClick={() => onClick(value)}
      className={`px-3 py-1.5 text-sm font-medium rounded-md ${
        isActive
          ? "bg-gradient-to-r from-yellow-500 to-pink-500 text-white"
          : "text-gray-600 bg-gray-100 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50"
      }`}
      aria-label={`Sort by ${label}`}
    >
      {label}
    </button>
  );

export default SortButton