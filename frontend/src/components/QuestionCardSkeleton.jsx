import React from "react";

const QuestionCardSkeleton = () => {
  return (
    <div
      className="card shadow-md border border-[#E0CFA6] p-4 space-y-3 max-w-full sm:max-w-2xl mx-auto animate-pulse"
      style={{ background: "var(--bg-sf-gradient)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 w-full">
          <div className="h-4 bg-[#E0CFA6] rounded w-1/4"></div>
          <div className="flex gap-2 mt-1 sm:mt-0">
            <div className="h-4 w-16 bg-[#E0CFA6] rounded"></div>
            <div className="h-4 w-16 bg-[#E0CFA6] rounded"></div>
          </div>
        </div>
        <div className="h-6 w-6 bg-[#E0CFA6] rounded-full"></div>
      </div>

      {/* Question Body */}
      <div className="flex flex-col gap-3 mt-4">
        <div className="h-4 bg-[#E0CFA6] rounded w-full"></div>
        <div className="h-4 bg-[#E0CFA6] rounded w-5/6"></div>
        <div className="h-4 bg-[#E0CFA6] rounded w-full"></div>

        <div className="h-40 w-full bg-[#E0CFA6] rounded mt-4"></div>

        <div className="border-t border-[#E0CFA6] my-3" />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-16 bg-[#E0CFA6] rounded"></div>
            <div className="h-8 w-16 bg-[#E0CFA6] rounded"></div>
            <div className="h-8 w-8 bg-[#E0CFA6] rounded-full"></div>
            <div className="h-8 w-8 bg-[#E0CFA6] rounded-full"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-40 bg-[#E0CFA6] rounded"></div>
            <div className="h-8 w-16 bg-[#E0CFA6] rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCardSkeleton;
