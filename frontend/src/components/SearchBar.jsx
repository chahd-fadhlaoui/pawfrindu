import React from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="relative flex-grow w-full max-w-md">
      <div className="relative flex items-center transition-all duration-300 bg-white border border-pink-100 shadow-sm rounded-xl hover:shadow-md focus-within:ring-2 focus-within:ring-pink-300 focus-within:border-pink-500">
        <Search
          className={`absolute left-4 w-5 h-5 text-pink-500 transition-transform duration-300 ${value ? "scale-110" : "scale-100"}`}
        />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full py-2.5 pl-12 pr-10 text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none rounded-xl focus:outline-none"
          aria-label="Search pets"
        />
        {value && (
          <button
            onClick={() => onChange({ target: { value: "" } })}
            className="absolute p-1 text-gray-400 transition-colors duration-200 right-3 hover:text-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-300"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="absolute inset-0 transition-opacity duration-300 opacity-0 -z-10 bg-gradient-to-r from-yellow-50/30 to-pink-50/30 hover:opacity-100 rounded-xl" />
    </div>
  );
};

export default SearchBar;