import React from "react";

const QuestionCardSkeleton = () => {
  return (
    <div className="bg-theme border-theme rounded-xl max-w-2xl mx-auto mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-sm w-full">
          <div className="skeleton h-4 w-1/4"></div>
          <div className="flex gap-2 mt-1 sm:mt-0">
            <div className="skeleton h-4 w-16"></div>
            <div className="skeleton h-4 w-16"></div>
          </div>
        </div>
        <div className="skeleton h-6 w-6"></div>
      </div>

      {/* Question Body */}
      <div className="p-6 sm:p-8 flex flex-col gap-4">
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-5/6"></div>
        <div className="skeleton h-4 w-full"></div>

        <div className="skeleton h-40 w-full mt-4"></div>

        <div className="border-t border-gray-200 my-3" />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="skeleton h-8 w-16"></div>
            <div className="skeleton h-8 w-16"></div>
            <div className="skeleton h-8 w-8"></div>
            <div className="skeleton h-8 w-8"></div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <div className="skeleton h-10 w-40"></div>
            <div className="skeleton h-8 w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCardSkeleton;
