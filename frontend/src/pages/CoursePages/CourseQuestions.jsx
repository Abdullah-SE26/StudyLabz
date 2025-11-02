import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../../store/authStore";
import toast from "react-hot-toast";
import QuestionCard from "../../components/QuestionCard";
import Pagination from "../../components/Pagination";

// Skeleton card for loading state
const SkeletonCard = () => (
  <div className="card bg-[#FFF8E0] shadow-md border border-[#E0CFA6] p-4 space-y-3 max-w-full sm:max-w-lg mx-auto animate-pulse">
    <div className="h-4 bg-[#E0CFA6] rounded w-3/4"></div>
    <div className="h-4 bg-[#E0CFA6] rounded w-full"></div>
    <div className="h-4 bg-[#E0CFA6] rounded w-5/6"></div>
    <div className="flex gap-4 mt-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-5 w-5 bg-[#E0CFA6] rounded-full"></div>
      ))}
    </div>
  </div>
);

const LoadingBar = () => (
  <span className="loading loading-bars loading-sm text-[#D2B48C]" />
);

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

// Fixed assessment types
const ASSESSMENT_TYPES = [
  "Midterm",
  "Final",
  "Quiz 1",
  "Quiz 2",
  "Additional Quizzes",
];

const CourseQuestions = () => {
  const { courseId } = useParams();
  const authToken = useStore((state) => state.authToken);
  const user = useStore((state) => state.user);

  const [courseName, setCourseName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [error, setError] = useState("");

  // Fetch course info
  const fetchCourse = useCallback(async () => {
    if (!authToken || !courseId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch course info");
      const data = await res.json();
      setCourseName(data.name || "Course");
    } catch (err) {
      console.error(err);
      setCourseName("Course");
    }
  }, [authToken, courseId]);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    if (!authToken || !courseId) {
      setError("You must be logged in to view questions.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({
        page,
        limit: 10,
        sort: sortOrder,
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/questions/courses/${courseId}/questions?${query.toString()}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (!res.ok) throw new Error(`Failed to fetch questions (${res.status})`);
      const data = await res.json();

      setQuestions(data.data || []);
      setTotalPages(data.totalPages || 1);
      setFirstLoad(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  }, [authToken, courseId, page, sortOrder]);

  useEffect(() => {
    fetchCourse();
    fetchQuestions();
  }, [fetchCourse, fetchQuestions]);

  // Toggle like
  const toggleLike = async (qId) => {
    if (!user?.id) return toast.error("You must be logged in to like questions.");

    const prev = [...questions];
    setQuestions((prevQs) =>
      prevQs.map((q) =>
        q.id === qId
          ? {
              ...q,
              likedBy: q.likedBy.some((u) => u.id === user.id)
                ? q.likedBy.filter((u) => u.id !== user.id)
                : [...q.likedBy, { id: user.id }],
            }
          : q
      )
    );

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/questions/${qId}/like`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (!res.ok) throw new Error("Failed to sync like with server");
      const updated = await res.json();
      setQuestions((prevQs) =>
        prevQs.map((q) => (q.id === qId ? updated.data : q))
      );
    } catch {
      setQuestions(prev);
      toast.error("Failed to sync like with server.");
    }
  };

  // Toggle bookmark
  const toggleBookmark = async (qId) => {
    if (!user?.id)
      return toast.error("You must be logged in to bookmark questions.");

    const prev = [...questions];
    setQuestions((prevQs) =>
      prevQs.map((q) =>
        q.id === qId
          ? {
              ...q,
              bookmarkedBy: q.bookmarkedBy.some((u) => u.id === user.id)
                ? q.bookmarkedBy.filter((u) => u.id !== user.id)
                : [...q.bookmarkedBy, { id: user.id }],
            }
          : q
      )
    );

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/questions/${qId}/bookmark`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (!res.ok) throw new Error("Failed to sync bookmark with server");
      const updated = await res.json();
      setQuestions((prevQs) =>
        prevQs.map((q) => (q.id === qId ? updated.data : q))
      );
      toast.success(
        updated.data.bookmarkedBy.some((u) => u.id === user.id)
          ? "Question added to bookmarks."
          : "Question removed from bookmarks."
      );
    } catch {
      setQuestions(prev);
      toast.error("Failed to sync bookmark with server.");
    }
  };

  // Handle filter toggling
  const handleTypeToggle = (type) => {
    setPage(1);
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTypes([]);
    setPage(1);
  };

  // Apply type filters locally
  const filteredQuestions =
    selectedTypes.length > 0
      ? questions.filter((q) =>
          selectedTypes.some((t) =>
            q.exam?.title?.toLowerCase().includes(t.toLowerCase())
          )
        )
      : questions;

  // UI
  if (firstLoad && loading) {
    return (
      <div className="p-6 space-y-6">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-4 text-center text-theme">
        {courseName} Questions
      </h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between flex-wrap gap-3 items-center mb-6">
        {/* Assessment Type Filters */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-start">
          {ASSESSMENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeToggle(type)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-all duration-200 ${
                selectedTypes.includes(type)
                  ? "bg-[#D2B48C] text-white border-[#D2B48C]"
                  : "bg-[#FFF8E0] text-[#5C4A3D] border border-[#E0CFA6]"
              }`}
            >
              {type}
            </button>
          ))}
          {selectedTypes.length > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E0CFA6] bg-white text-[#5C4A3D] hover:bg-[#F8EFD4] transition text-sm"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <label className="text-sm font-medium text-theme">Sort:</label>
          <select
            className="select select-sm border border-[#E0CFA6] bg-white text-theme"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1);
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && !firstLoad && (
        <div className="flex justify-center py-10">
          <LoadingBar />
        </div>
      )}

      {/* Question List */}
      {filteredQuestions.length > 0 ? (
        <div className="space-y-6">
          {filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id || q._id}
              question={q}
              onToggleLike={() => toggleLike(q.id)}
              onToggleBookmark={() => toggleBookmark(q.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center mt-10 text-gray-500">No questions found.</p>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            handlePageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default CourseQuestions;
