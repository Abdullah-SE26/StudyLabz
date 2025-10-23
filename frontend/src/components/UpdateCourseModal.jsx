import React, { useState } from "react";
import { useStore } from "../store/authStore";
import { toast } from "react-hot-toast";

export default function UpdateCourseModal({ course, onClose, onUpdated }) {
  const authToken = useStore((state) => state.authToken);

  const [name, setName] = useState(course.name);
  const [tags, setTags] = useState(course.tags?.join(", ") || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/courses/${course.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name, tags }),
      });

      if (res.ok) {
        const updated = await res.json();
        toast.success(`Course "${updated.name}" updated successfully!`);
        onUpdated(updated);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to update course");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Blurred Overlay */}
      <div
        className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-md mx-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in">
          <h4 className="font-bold text-lg mb-4">Edit Course</h4>

          <div className="flex flex-col gap-3 mb-4">
            <input
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Course name"
            />
            <input
              className="input input-bordered w-full"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma separated)"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <span className="loading loading-spinner loading-sm"></span>}
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="btn btn-ghost"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Tailwind animation */}
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
