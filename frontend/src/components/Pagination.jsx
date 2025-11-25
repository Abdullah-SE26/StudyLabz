import React from "react";

const Pagination = ({
  totalPages = 1,
  currentPage = 1,
  handlePageChange = () => {},
}) => {
  if (!totalPages || totalPages <= 1) return null;

  const navBtnBase =
    "px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034F46]/40";
  const pageBtnBase =
    "w-10 h-10 rounded-full font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034F46]/40";

  return (
    <div className="flex justify-center mt-10">
      <div className="flex items-center gap-3 bg-sf-cream shadow-md rounded-full px-5 py-3 border border-sf-border">
        {/* Previous Button */}
        <button
          className={`${navBtnBase} ${
            currentPage === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-sf-green bg-white border border-transparent hover:bg-[#04695d] hover:text-white cursor-pointer"
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
                  className={`${pageBtnBase} border ${
                    isActive
                      ? "bg-sf-green text-white border-sf-green shadow-sm cursor-default"
                      : "bg-white border-sf-border text-sf-text hover:bg-[#F5EAD3] hover:text-sf-green cursor-pointer"
                  }`}
                  aria-current={isActive ? "page" : undefined}
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
                  className="px-2 text-sf-text select-none"
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
          className={`${navBtnBase} ${
            currentPage === totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "text-sf-green bg-white border border-transparent hover:bg-[#04695d] hover:text-white cursor-pointer"
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
