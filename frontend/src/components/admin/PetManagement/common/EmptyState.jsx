import React from "react";
import { PawPrint } from "lucide-react";

const EmptyState = ({
  hasFilters = false,
  onClearFilters,
  customMessage,
  primaryMessage = "No items found",
  className = "w-full p-8 text-center bg-white shadow-xl rounded-xl animate-fade-in",
}) => {
  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full shadow-md bg-gradient-to-r from-yellow-100 to-pink-100">
          <PawPrint size={32} className="text-[#ffc929]" />
        </div>
        <p className="text-lg font-semibold text-gray-700">{primaryMessage}</p>
        <p className="text-sm text-gray-500">
          {customMessage || (hasFilters ? "Try adjusting your search or filters" : "No items available")}
        </p>
        {hasFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg shadow-md hover:bg-gray-50 hover:shadow-lg focus:ring-2 focus:ring-[#ffc929] transition-all duration-300"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;