import React from "react";
import { useStore } from "../store/authStore";
import { toast } from "react-hot-toast";

export default function DeleteCourseModal({ course, onClose, onDeleted }) {
  const authToken = useStore((state) => state.authToken);

  if (!course) return null;

  const handleConfirm = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/courses/${course.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (res.ok) {
        toast.success(
          `Course "${course.title || course.name}" deleted successfully!`
        );
        onDeleted();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to delete course");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting course");
    }
  };

  return (
    <>
      {/* Blurred Overlay */}
      <div
        className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40"
        onClick={onClose}
      ></div>

      {/* Modal with fade & scale animation */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in">
          <h4 className="font-bold text-lg mb-2">Delete Course</h4>
          <p className="mb-4">
            Are you sure you want to delete "
            <span className="font-semibold">{course.title || course.name}</span>
            "?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleConfirm}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition cursor-pointer"
            >
              Yes, Delete
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Tailwind Animation */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
}
