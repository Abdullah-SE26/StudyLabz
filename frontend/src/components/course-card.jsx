import React from "react";
import { CalendarDays, Tag as TagIcon, Pencil, Trash2, Beaker } from "lucide-react";
import { Link } from "react-router-dom";

const CourseCard = ({
  course,
  onTagClick,
  selectedTags = [],
  isAdminMode = false,
  onEdit,
  onDelete,
}) => {
  const formattedDate = new Date(course.createdAt).toLocaleDateString();

  return (
    <div
      className={`relative rounded-2xl overflow-hidden backdrop-blur-md border border-white/30
        shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer
        bg-gradient-to-br from-white/70 to-blue-50/40`}
    >
      {/* Decorative top icon */}
      <div className="flex justify-center mt-4">
        <div className="bg-blue-100 p-2 rounded-full shadow-sm">
          <Beaker className="w-6 h-6 text-blue-600 animate-bounce-slow" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col items-center text-center">
        <h3 className="text-lg font-bold text-slate-800 mb-1">{course.title || course.name}</h3>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <span className="flex items-center gap-1">
            <CalendarDays size={14} className="text-blue-600" />
            {formattedDate}
          </span>
        </div>

        {course.description && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {course.description}
          </p>
        )}

        {/* Tags */}
        {course.tags?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {course.tags.map((tag, i) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    onTagClick?.(tag);
                  }}
                  className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-all duration-200
                    ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white/80 text-blue-700 border-blue-300 hover:bg-blue-50"
                    }`}
                >
                  <TagIcon size={12} />
                  {tag}
                </button>
              );
            })}
          </div>
        )}

        {/* Admin actions */}
        {isAdminMode && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onEdit(course)}
              className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200 transition"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={() => onDelete(course.id)}
              className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Link overlay for normal users */}
      {!isAdminMode && (
        <Link to={`/courses/${course.id}/exams`} className="absolute inset-0 z-0" />
      )}
    </div>
  );
};

export default CourseCard;
