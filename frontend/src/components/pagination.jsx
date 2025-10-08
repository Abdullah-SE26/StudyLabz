import React from "react";

const Pagination = ({ totalPages = 1, currentPage = 1, handlePageChange = () => {} }) => {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-12">
      <div className="flex items-center gap-3 bg-white shadow-lg rounded-full px-5 py-3 border border-gray-200">
        {/* Previous Button */}
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer"
          }`}
          onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          ← Previous
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNumber = i + 1;
            const isActive = currentPage === pageNumber;

            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              Math.abs(pageNumber - currentPage) <= 1
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-10 h-10 rounded-full font-semibold transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? "bg-blue-500 text-white border-blue-500 shadow-md"
                      : "border-transparent text-gray-700 hover:bg-blue-500 hover:text-white"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            } else if (
              (pageNumber === currentPage - 2 && pageNumber > 1) ||
              (pageNumber === currentPage + 2 && pageNumber < totalPages)
            ) {
              return (
                <span
                  key={pageNumber}
                  className="px-2 text-gray-400 select-none"
                >
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>

        {/* Next Button */}
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer"
          }`}
          onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
