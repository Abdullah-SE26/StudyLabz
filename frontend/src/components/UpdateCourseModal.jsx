import React, { useState } from "react";
import { useStore } from "../store/authStore";
import { toast } from "react-hot-toast";
import { BookOpen, X, Plus, Pickaxe } from "lucide-react";
import axios from "../../lib/axios";

export default function UpdateCourseModal({ course, onClose, onUpdated }) {
  const authToken = useStore((state) => state.authToken);

  const [name, setName] = useState(course.name);
  const [tags, setTags] = useState(course.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
      toast.success(`Tag "${trimmed}" added!`);
    } else if (tags.includes(trimmed)) {
      toast.error("Tag already exists!");
    } else {
      toast.error("Please enter a valid tag!");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    toast.success(`Tag "${tagToRemove}" removed!`);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Course name is required!");
      return;
    }
    if (tags.length === 0) {
      toast.error("At least one tag is required!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(
        `/courses/${course.id}`,
        { name: name.trim(), tags },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const updated = response.data;
      toast.success(`Course "${updated.name}" updated successfully!`);
      onUpdated(updated);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error updating course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 mx-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-800">Edit Course</h2>
            </div>
            <button onClick={onClose} className="text-slate-600 hover:text-red-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-3">
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Course Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />

            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 input input-bordered"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn btn-primary flex items-center gap-2"
                disabled={loading}
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={loading}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClose} disabled={loading} className="btn btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <Pickaxe className="w-4 h-4" />
              )}
              {loading ? "Saving..." : "Save"}
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
