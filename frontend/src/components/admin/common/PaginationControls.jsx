import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export const PaginationControls = ({ currentPage, totalPages, onPageChange, itemsPerPage = 5 }) => {
  // Calculate the range of items shown
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalPages * itemsPerPage);
  const totalItems = totalPages * itemsPerPage;

  return (
    <div className="flex items-center justify-center p-4 bg-white shadow-md rounded-xl">
      <div className="flex items-center gap-2">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg shadow-sm transition-all duration-300 ${
            currentPage === 1
              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
              : "text-[#ffc929] bg-white hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
          }`}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg shadow-sm transition-all duration-300 ${
            currentPage === 1
              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
              : "text-[#ffc929] bg-white hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
          }`}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-sm font-medium shadow-sm transition-all duration-300 ${
                currentPage === page
                  ? "bg-gradient-to-r from-yellow-500 to-pink-500 text-white"
                  : "text-gray-700 bg-white hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
              }`}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg shadow-sm transition-all duration-300 ${
            currentPage === totalPages
              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
              : "text-[#ffc929] bg-white hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
          }`}
          aria-label="Go to next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg shadow-sm transition-all duration-300 ${
            currentPage === totalPages
              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
              : "text-[#ffc929] bg-white hover:bg-gradient-to-r hover:from-yellow-50 hover:to-pink-50 focus:outline-none focus:ring-2 focus:ring-[#ffc929]"
          }`}
          aria-label="Go to last page"
        >
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};