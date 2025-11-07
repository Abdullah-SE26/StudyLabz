import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/authStore";
import { toast } from "react-hot-toast";
import {
  BookOpen,
  Plus,
  X,
  Tag,
  Hash,
  ArrowLeft,
  PencilLine,
} from "lucide-react";
import axios from "../../../lib/axios";

export default function CreateCoursesPage() {
  const user = useStore((state) => state.user);
  const authToken = useStore((state) => state.authToken);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (tags.length >= 4) return toast.error("Maximum of 4 tags allowed!");
    if (!trimmed) return toast.error("Please enter a valid tag!");
    if (tags.includes(trimmed)) return toast.error("Tag already exists!");

    setTags([...tags, trimmed]);
    setTagInput("");
    toast.success(`Tag "${trimmed}" added!`);
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

  const generateCourseCode = (courseName) => {
    const words = courseName.trim().split(" ");
    if (words.length >= 2)
      return words.map((w) => w.charAt(0).toUpperCase()).join("") + "101";
    return courseName.substring(0, 3).toUpperCase() + "101";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Course name is required!");
    if (tags.length === 0) return toast.error("At least one tag is required!");
    if (!authToken) return toast.error("You must be logged in to create a course!");

    setLoading(true);
    const loadingToast = toast.loading("Creating course...");

    try {
      const courseCode = generateCourseCode(name);

      await axios.post(
        "/courses",
        {
          name: name.trim(),
          code: courseCode,
          tags,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      toast.dismiss(loadingToast);
      toast.success("Course created successfully! 🎉");

      setName("");
      setTags([]);
      setTagInput("");

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error(err?.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 flex items-start justify-center pt-1 px-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <div className="p-3 rounded-lg bg-blue-600">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Create Course</h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 mt-6">
          {/* Course Name */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700">
              Course Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Foundation of Software Engineering"
              className="w-full px-5 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Tag className="w-4 h-4 text-slate-500" />
              Tags *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Software Engineering, General, CyberSecurity"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={tags.length >= 4}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={tags.length >= 4}
                className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !name.trim() || tags.length === 0}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <PencilLine className="w-5 h-5" />
            )}
            {loading ? "Creating..." : "Create Course"}
          </button>
        </form>
      </div>
    </div>
  );
}
