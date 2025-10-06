import React from "react";

const CourseCard = ({ course, onTagClick, selectedTags = [] }) => {
  const formattedDate = new Date(course.createdAt).toLocaleDateString();

  return (
    <div className="rounded-2xl shadow-sm hover:shadow-md bg-gradient-to-br from-white to-blue-50 transition-all p-5 cursor-pointer flex flex-col justify-between">
      {/* Course Info */}
      <div>
        <h3 className="text-lg text-center font-bold text-gray-900 mb-1">
          {course.title || course.name}
        </h3>
        {course.code && (
          <p className="text-sm text-gray-500 mb-1">Code: {course.code}</p>
        )}
        <p className="text-xs text-gray-400 mb-2">Created: {formattedDate}</p>
        {course.description && (
          <p className="text-gray-600 text-sm mb-2">
            {course.description.length > 100
              ? course.description.slice(0, 100) + "..."
              : course.description}
          </p>
        )}
      </div>

      {/* Tags */}
      {course.tags && course.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {course.tags.map((tag, index) => {
            const isSelected = selectedTags.includes(tag);

            return (
              <button
                key={index}
                onClick={() => onTagClick && onTagClick(tag)}
                className={`text-xs font-semibold px-2 py-1 rounded-full transition-all cursor-pointer
                  ${isSelected ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-800"}
                  hover:bg-blue-200`}
                title="Click to filter by this tag"
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseCard;
