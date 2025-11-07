import React from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Tag as TagIcon, Pencil, Trash2 } from "lucide-react";
import { useStore } from "../store/authStore";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

export default function CourseCard({
  course,
  onTagClick,
  selectedTags = [],
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const formattedDate = new Date(course.createdAt).toLocaleDateString();
  const handleNavigate = () => navigate(`/courses/${course.id}/questions`);

  const TagButton = ({ tag, isSelected }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onTagClick?.(tag);
      }}
      className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-all
        ${
          isSelected
            ? "bg-amber-600 text-white shadow-sm"
            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
        }`}
    >
      <TagIcon size={12} />
      {tag}
    </button>
  );

  return (
    <div
      onClick={handleNavigate}
      className="group relative flex flex-col justify-between rounded-2xl border border-amber-100
        bg-sf-gradient from-amber-50 via-white to-amber-100/50
        shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300
        cursor-pointer overflow-hidden w-full min-h-60 max-h-[280px] p-4"
    >
      {/* Title + Date */}
      <div className="text-center">
        <h3 className="text-md font-semibold text-gray-800 leading-snug line-clamp-2">
          {course.title || course.name}
        </h3>
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
          <CalendarDays size={12} />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Subtle centered divider */}
      {course.tags?.length > 0 && (
        <div className="mx-auto my-2 w-1/2 border-t border-gray-300"></div>
      )}

      {/* Tags below title */}
      {course.tags?.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {course.tags.map((tag, i) => (
            <TagButton
              key={i}
              tag={tag}
              isSelected={selectedTags.includes(tag)}
            />
          ))}
        </div>
      )}

      {/* Admin Actions */}
      {isAdmin && (
        <div className="flex justify-center gap-2 mt-3">
          <Tippy content="Edit Course" placement="bottom" arrow={true}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(course);
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full
                bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 transition-all"
            >
              <Pencil size={14} />
            </button>
          </Tippy>

          <Tippy content="Delete Course" placement="bottom" arrow={true}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(course);
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full
                bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </Tippy>
        </div>
      )}
    </div>
  );
}
