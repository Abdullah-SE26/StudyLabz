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
  Save,
  FileText,
  Image,
} from "lucide-react";

export default function CreateCoursesPage() {
  const user = useStore((state) => state.user);
  const authToken = useStore((state) => state.authToken);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [tags, setTags] = useState([]);
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

  const generateCourseCode = (courseName) => {
    const words = courseName.trim().split(" ");
    if (words.length >= 2) {
      return words.map((word) => word.charAt(0).toUpperCase()).join("") + "101";
    }
    return courseName.substring(0, 3).toUpperCase() + "101";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
      toast.error("Course name is required!");
      setLoading(false);
      return;
    }

    if (tags.length === 0) {
      toast.error("At least one tag is required!");
      setLoading(false);
      return;
    }

    if (!authToken) {
      toast.error("You must be logged in to create a course!");
      setLoading(false);
      return;
    }

    const loadingToast = toast.loading("Creating course...");

    try {
      const courseCode = generateCourseCode(name);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          code: courseCode,
          description: description || null,
          image: image || null,
          tags,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create course");
      }

      const data = await res.json();

      toast.dismiss(loadingToast);
      toast.success("Course created successfully! 🎉");

      // Reset form
      setName("");
      setDescription("");
      setImage("");
      setTags([]);
      setTagInput("");

      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Create Course</h1>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Course Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Introduction to Computer Science"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          {/* Course Code - Disabled */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Hash className="w-4 h-4 text-slate-500" />
              Course Code
            </label>
            <input
              type="text"
              value={name ? generateCourseCode(name) : ""}
              placeholder="Auto Generated"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
              disabled
            />
          </div>

          {/* Description - Disabled */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="w-4 h-4 text-slate-500" />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed resize-none"
              rows={3}
              disabled
            />
          </div>

          {/* Image URL - Disabled */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Image className="w-4 h-4 text-slate-500" />
              Image URL
            </label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
              disabled
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
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
                placeholder="e.g., programming, beginner"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
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

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !name.trim() || tags.length === 0}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
