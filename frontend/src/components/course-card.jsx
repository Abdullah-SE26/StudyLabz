import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Tag as TagIcon, Pencil, Trash2 } from "lucide-react";
import { useStore } from "../store/authStore"; // assuming your authStore has user info

export default function CourseCard({
  course,
  onTagClick,
  selectedTags = [],
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();
  const user = useStore((state) => state.user); // your logged-in user
  const isAdminMode = user?.role === "admin";   // auto-check role
  const formattedDate = new Date(course.createdAt).toLocaleDateString();

  const handleNavigate = () => navigate(`/courses/${course.id}/exams`);

  const TagButton = ({ tag, isSelected }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onTagClick?.(tag);
      }}
      className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full transition-all duration-300 
        animate-fadeIn
        ${
          isSelected
            ? "bg-amber-600 text-white shadow-sm"
            : "bg-amber-100/60 text-amber-800 hover:bg-amber-200/70"
        }`}
    >
      <TagIcon size={12} />
      {tag}
    </button>
  );

  const CardInner = (
    <div className="flex flex-col gap-3 p-5 animate-fadeInSlow">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 leading-snug text-center">
          {course.title || course.name}
        </h3>
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 m-2">
          <CalendarDays size={14} />
          <span>{formattedDate}</span>
        </div>
      </div>

      {course.description && (
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {course.description}
        </p>
      )}

      {course.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {course.tags.map((tag, i) => (
            <TagButton
              key={i}
              tag={tag}
              isSelected={selectedTags.includes(tag)}
            />
          ))}
        </div>
      )}

      {/* Only show buttons for admins */}
      {isAdminMode && (
        <div className="flex gap-3 mt-3 animate-fadeInDelay">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(course);
            }}
            className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md 
            bg-teal-100 text-teal-800 border border-teal-200 
            hover:bg-teal-200 transition-all duration-300 shadow-sm"
          >
            <Pencil size={14} /> Edit
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(course.id);
            }}
            className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md 
            bg-rose-100 text-rose-700 border border-rose-200 
            hover:bg-rose-200 transition-all duration-300 shadow-sm"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div
      onClick={!isAdminMode ? handleNavigate : undefined}
      className="group relative rounded-2xl border border-amber-100/60 
      bg-gradient-to-br from-amber-50 via-white to-amber-100/40 
      shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden"
    >
      {!isAdminMode ? (
        <Link to={`/courses/${course.id}/exams`} className="block h-full">
          {CardInner}
        </Link>
      ) : (
        CardInner
      )}

      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none"></div>
    </div>
  );
}
