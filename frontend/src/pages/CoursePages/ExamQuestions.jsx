// src/pages/ExamQuestions.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { Heart, Bookmark, Share2 } from "lucide-react";
import { useStore } from "../../store/authStore";
import toast from "react-hot-toast";
import CommentsSection from "../../components/CommentsSection";

const SkeletonCard = () => (
  <div className="card bg-base-100 shadow-md border p-4 space-y-3 animate-pulse max-w-full sm:max-w-lg mx-auto">
    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
    <div className="h-4 bg-gray-300 rounded w-full"></div>
    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
    <div className="flex gap-4 mt-2">
      <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
      <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
      <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
      <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
    </div>
  </div>
);

const ExamQuestions = () => {
  const { examId } = useParams();
  const user = useStore((state) => state.user);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/exams/${examId}/questions`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch questions");
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
  }, [examId, user.token]);

  const toggleLike = async (qId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/questions/${qId}/like`,
        { method: "POST", headers: { Authorization: `Bearer ${user.token}` } }
      );
      const data = await res.json();
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === qId
            ? {
                ...q,
                likedBy: data.liked
                  ? [...q.likedBy, user]
                  : q.likedBy.filter((u) => u.id !== user.id),
              }
            : q
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle like");
    }
  };

  const toggleBookmark = async (qId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/questions/${qId}/bookmark`,
        { method: "POST", headers: { Authorization: `Bearer ${user.token}` } }
      );
      const data = await res.json();
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === qId
            ? {
                ...q,
                bookmarkedBy: data.bookmarked
                  ? [...q.bookmarkedBy, user]
                  : q.bookmarkedBy.filter((u) => u.id !== user.id),
              }
            : q
        )
      );
      toast.success(data.bookmarked ? "Bookmarked" : "Removed bookmark");
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle bookmark");
    }
  };

  const copyLink = (qId) => {
    navigator.clipboard.writeText(`${window.location.origin}/questions/${qId}`);
    toast.success("Link copied!");
  };

  const shareQuestion = (qId) => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check this question",
          url: `${window.location.origin}/questions/${qId}`,
        })
        .catch((err) => console.error(err));
    } else {
      copyLink(qId);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!questions.length)
    return (
      <p className="text-center mt-10 text-gray-500">
        No questions available for this Course.
      </p>
    );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-6 text-center sm:text-left">
        Exam Questions
      </h2>
      {questions.map((q) => {
        const liked = q.likedBy?.some((u) => u.id === user.id);
        const bookmarked = q.bookmarkedBy?.some((u) => u.id === user.id);

        return (
          <div
            key={q.id}
            className="card bg-base-100 shadow-md border hover:border-blue-400 transition-all p-4 space-y-3 max-w-full sm:max-w-lg mx-auto"
          >
            {/* Question Text */}
            <div
              className="font-medium break-words"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.text) }}
            />
            {/* Options */}
            {q.options && Array.isArray(q.options) && (
              <ul className="list-disc list-inside mt-2 text-gray-600">
                {q.options.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 mt-2" />

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-500 text-sm">
              <button
                onClick={() => toggleLike(q.id)}
                className="flex items-center gap-1"
              >
                <Heart size={16} className={liked ? "text-red-500" : ""} />
                <span>{q.likedBy?.length || 0}</span>
              </button>
              <button
                onClick={() => toggleBookmark(q.id)}
                className="flex items-center gap-1"
              >
                <Bookmark
                  size={16}
                  className={bookmarked ? "text-blue-500" : ""}
                />
              </button>
              <button
                onClick={() => copyLink(q.id)}
                className="flex items-center gap-1"
              >
                <Share2 size={16} />
              </button>
              <button
                onClick={() => shareQuestion(q.id)}
                className="flex items-center gap-1"
              >
                Share
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mt-2" />

            {/* Comments Section */}
            <CommentsSection questionId={q.id} />
          </div>
        );
      })}
    </div>
  );
};

export default ExamQuestions;
