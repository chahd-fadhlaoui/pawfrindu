import React from "react";
import { PawPrint } from "lucide-react";

const EmptyState = ({ hasFilters, onClearFilters }) => {
  return (
    <div className="w-full p-8 text-center bg-white shadow-xl rounded-xl animate-fadeIn">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-yellow-100 to-pink-100">
          <PawPrint size={32} className="text-[#ffc929]" />
        </div>
        <p className="text-lg font-semibold text-gray-700">No active users found</p>
        <p className="text-sm text-gray-500">
          {hasFilters ? "Try adjusting your search or filters" : "Add a user to get started"}
        </p>
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;