import React from "react";
import { CalendarDays, Tag as TagIcon } from "lucide-react";
import { Link } from "react-router-dom";

const CourseCard = ({ course, onTagClick, selectedTags = [] }) => {
  const formattedDate = new Date(course.createdAt).toLocaleDateString();

  return (
    <Link
      to={`/courses/${course.id}/exams`}
      className="cursor-pointer relative rounded-2xl bg-gradient-to-br from-white/80 to-blue-50/60 backdrop-blur-md 
      border border-blue-100 shadow-sm hover:shadow-lg hover:-translate-y-1 
      transition-all duration-300 ease-out p-6 flex flex-col justify-between"
    >
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center leading-snug">
          {course.title || course.name}
        </h3>

        {/* Meta info */}
        <div className="flex justify-center items-center gap-2 text-xs text-gray-500 mb-2">
          {course.code && <span className="font-medium">#{course.code}</span>}
          <span className="flex items-center gap-1">
            <CalendarDays size={14} />
            {formattedDate}
          </span>
        </div>

        {/* Description */}
        {course.description && (
          <p className="text-gray-600 text-sm leading-relaxed text-center">
            {course.description.length > 110
              ? `${course.description.slice(0, 110)}...`
              : course.description}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent my-4"></div>

      {/* Tags */}
      {course.tags && course.tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {course.tags.map((tag, index) => {
            const isSelected = selectedTags.includes(tag);

            return (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.preventDefault(); // Prevent link navigation when clicking tag
                  onTagClick && onTagClick(tag);
                }}
                className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all 
                  ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
                  }`}
                title="Filter by this tag"
              >
                <TagIcon size={12} />
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </Link>
  );
};

export default CourseCard;
