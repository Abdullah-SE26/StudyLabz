import React from "react";
import toast from "react-hot-toast";

export default function DeleteCourseModal({
  show,
  onClose,
  onConfirm,
  title,
  message,
  loading,
  courseName, // added prop for course name
}) {
  if (!show) return null;

  // Handle confirm click with course-specific toast
  const handleConfirm = async () => {
    try {
      await onConfirm(); // call the passed onConfirm function (should handle API delete)
      toast.success(`Course "${courseName}" deleted successfully!`);
      onClose(); // close modal after successful deletion
    } catch (err) {
      console.error(err);
      toast.error(`Failed to delete course "${courseName}". Try again.`);
    }
  };

  return (
    <>
      {/* Blurred Overlay */}
      <div
        className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in">
          <h4 className="font-bold text-lg mb-2">
            {title || "Confirm Deletion"}
          </h4>
          <p className="mb-4">
            {message || `Are you sure you want to delete the course "${courseName}"?`}
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading && (
                <span className="loading loading-spinner loading-sm"></span>
              )}
              {loading ? "Deleting..." : "Yes, Delete"}
            </button>

            <button
              onClick={!loading ? onClose : undefined}
              disabled={loading}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
