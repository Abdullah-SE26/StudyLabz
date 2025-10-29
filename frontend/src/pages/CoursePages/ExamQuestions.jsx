import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../../store/authStore";
import toast from "react-hot-toast";
import QuestionCard from "../../components/QuestionCard";

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

const ExamQuestions = () => {
  const { examId } = useParams();
  const authToken = useStore((state) => state.authToken);
  const user = useStore((state) => state.user);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch questions
  useEffect(() => {
    if (!authToken) {
      setError("You must be logged in to view questions");
      setLoading(false);
      return;
    }

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/exams/${examId}/questions`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (!res.ok)
          throw new Error(`Failed to fetch questions (${res.status})`);
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [examId, authToken]);

  // Like a question (optimistic UI, no toast)
  const toggleLike = async (qId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const liked = q.likedBy.some((u) => u.id === user?.id);
        return {
          ...q,
          likedBy: liked
            ? q.likedBy.filter((u) => u.id !== user?.id)
            : [...q.likedBy, { id: user?.id }],
        };
      })
    );

    // sync with server
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/questions/${qId}/like`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (!res.ok) throw new Error("Failed to sync like with server");
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync like with server");
    }
  };

  // Bookmark a question (optimistic UI, proper toast)
  const toggleBookmark = async (qId) => {
    if (!user?.id) {
      toast.error("You must be logged in to bookmark questions");
      return;
    }

    const question = questions.find((q) => q.id === qId);
    if (!question) return;

    const isBookmarked = question.bookmarkedBy.some((u) => u.id === user.id);
    const actionMessage = isBookmarked
      ? "Question removed from bookmarks"
      : "Question added to bookmarks";

    // Optimistically update UI
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              bookmarkedBy: isBookmarked
                ? q.bookmarkedBy.filter((u) => u.id !== user.id)
                : [...q.bookmarkedBy, { id: user.id, name: user.name }],
            }
          : q
      )
    );

    toast.success(actionMessage);

    // sync with server
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/questions/${qId}/bookmark`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (!res.ok) throw new Error("Failed to sync bookmark with server");
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync bookmark with server");
    }
  };

  // UI states
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
      <p className="text-center mt-10 text-gray-500">
        No questions available for this Exam.
      </p>
    );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-6 text-center sm:text-left">
        Exam Questions
      </h2>

      {questions.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          onToggleLike={() => toggleLike(q.id)}
          onToggleBookmark={() => toggleBookmark(q.id)}
        />
      ))}
    </div>
  );
};

export default ExamQuestions;
