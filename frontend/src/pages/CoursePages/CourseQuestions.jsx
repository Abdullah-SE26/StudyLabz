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

// Small loading bar
const LoadingBar = () => <span className="loading loading-bars loading-sm text-[#D2B48C]" />;

// Sort options
const SORT_OPTIONS = ["newest", "oldest"];

const CourseQuestions = () => {
  const { courseId } = useParams();
  const authToken = useStore((state) => state.authToken);
  const user = useStore((state) => state.user);

  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [error, setError] = useState("");

  // Fetch exams for filter
  const fetchExams = useCallback(async () => {
    if (!authToken || !courseId) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}/exams`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch exams");
      const data = await res.json();
      setExams(data || []);
    } catch (err) {
      console.error(err);
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
      if (selectedExams.length) query.append("examIds", selectedExams.join(","));

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/questions/courses/${courseId}/questions?${query.toString()}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
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
  }, [authToken, courseId, page, selectedExams, sortOrder]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Toggle like
  const toggleLike = async (qId) => {
    if (!user?.id) return toast.error("You must be logged in to like questions.");

    const prevQuestions = [...questions];
    setQuestions((prev) =>
      prev.map((q) =>
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/${qId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed to sync like.");
      const updated = await res.json();
      setQuestions((prev) => prev.map((q) => (q.id === qId ? updated.data : q)));
    } catch {
      setQuestions(prevQuestions);
      toast.error("Failed to sync like with server.");
    }
  };

  // Toggle bookmark
  const toggleBookmark = async (qId) => {
    if (!user?.id) return toast.error("You must be logged in to bookmark questions.");

    const prevQuestions = [...questions];
    setQuestions((prev) =>
      prev.map((q) =>
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/${qId}/bookmark`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed to sync bookmark.");
      const updated = await res.json();
      setQuestions((prev) => prev.map((q) => (q.id === qId ? updated.data : q)));
      toast.success(
        updated.data.bookmarkedBy.some((u) => u.id === user.id)
          ? "Question added to bookmarks."
          : "Question removed from bookmarks."
      );
    } catch {
      setQuestions(prevQuestions);
      toast.error("Failed to sync bookmark with server.");
    }
  };

  // Handle exam filter toggle
  const handleExamFilter = (examId) => {
    setPage(1);
    setSelectedExams((prev) =>
      prev.includes(examId) ? prev.filter((id) => id !== examId) : [...prev, examId]
    );
  };

  // Render
  if (firstLoad && loading) {
    return (
      <div className="p-6 space-y-6">
        {[...Array(3)].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-4 text-center sm:text-left text-theme">
        Course Questions
      </h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between flex-wrap gap-2 sm:gap-4 items-center mb-6">
        <div className="flex gap-2 sm:gap-4 flex-wrap w-full sm:w-auto">
          {exams.map((exam) => (
            <label
              key={exam.id}
              className={`flex items-center gap-1 cursor-pointer text-sm px-2 py-1 rounded transition ${
                selectedExams.includes(exam.id)
                  ? "bg-[#D2B48C] text-white"
                  : "bg-[#FFF8E0] text-[#5C4A3D] border border-[#E0CFA6]"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedExams.includes(exam.id)}
                onChange={() => handleExamFilter(exam.id)}
                className="checkbox checkbox-xs"
              />
              {exam.title}
            </label>
          ))}
        </div>

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
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && !firstLoad && (
        <div className="flex justify-center py-10">
          <LoadingBar />
        </div>
      )}

      {questions.length > 0 ? (
        <div className="space-y-6">
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
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
          <Pagination totalPages={totalPages} currentPage={page} handlePageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default CourseQuestions;
