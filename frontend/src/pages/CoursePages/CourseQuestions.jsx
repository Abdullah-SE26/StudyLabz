import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../../store/authStore";
import toast from "react-hot-toast";
import QuestionCard from "../../components/QuestionCard";
import Pagination from "../../components/Pagination";

// Daisy UI skeleton for question cards
const SkeletonCard = () => (
  <div className="card bg-base-100 shadow-md border p-4 space-y-3 animate-pulse max-w-full sm:max-w-lg mx-auto">
    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
    <div className="h-4 bg-gray-300 rounded w-full"></div>
    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
    <div className="flex gap-4 mt-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-5 w-5 bg-gray-300 rounded-full"></div>
      ))}
    </div>
  </div>
);

const EXAM_TYPES = ["quiz", "midterm", "final", "additional"];

const CourseQuestions = () => {
  const { courseId } = useParams();
  const authToken = useStore((state) => state.authToken);
  const user = useStore((state) => state.user);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExams, setSelectedExams] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchQuestions = async () => {
    if (!authToken) {
      setError("You must be logged in to view questions");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("page", page);
      query.append("limit", 10);
      if (selectedExams.length)
        query.append("examTypes", selectedExams.join(","));

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/courses/${courseId}/questions?${query.toString()}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (!res.ok) throw new Error(`Failed to fetch questions (${res.status})`);

      const data = await res.json();
      setQuestions(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, selectedExams, page]);

  const toggleLike = async (qId) => {
    const prev = [...questions];
    setQuestions((prevQs) =>
      prevQs.map((q) =>
        q.id === qId
          ? {
              ...q,
              likedBy: q.likedBy.some((u) => u.id === user?.id)
                ? q.likedBy.filter((u) => u.id !== user?.id)
                : [...q.likedBy, { id: user?.id }],
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
      toast.error("Failed to sync like with server");
    }
  };

  const toggleBookmark = async (qId) => {
    if (!user?.id)
      return toast.error("You must be logged in to bookmark questions");

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
          ? "Question added to bookmarks"
          : "Question removed from bookmarks"
      );
    } catch {
      setQuestions(prev);
      toast.error("Failed to sync bookmark with server");
    }
  };

  const handleExamFilter = (type) => {
    setPage(1);
    setSelectedExams((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  if (loading)
    return (
      <div className="p-6 space-y-6">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!questions.length)
    return (
      <p className="text-center mt-10 text-gray-500">No questions found.</p>
    );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-4 text-center sm:text-left">
        Course Questions
      </h2>

      {/* Exam type filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {EXAM_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => handleExamFilter(type)}
            className={`btn btn-sm ${
              selectedExams.includes(type) ? "btn-primary" : "btn-outline"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Question cards */}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          handlePageChange={setPage}
        />
      )}
    </div>
  );
};

export default CourseQuestions;
