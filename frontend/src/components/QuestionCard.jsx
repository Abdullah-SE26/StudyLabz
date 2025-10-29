// src/components/QuestionCard.jsx
import React, { useState } from "react";
import DOMPurify from "dompurify";
import { Heart, Bookmark, Share2, Copy } from "lucide-react";
import toast from "react-hot-toast";
import CommentsSection from "./CommentsSection";
import { useStore } from "../store/authStore";

const QuestionCard = ({ question }) => {
  const user = useStore((state) => state.user);

  // Safe initialization in case likedBy or bookmarkedBy is undefined
  const [liked, setLiked] = useState(
    question?.likedBy?.some((u) => u.id === user?.id) || false
  );
  const [bookmarked, setBookmarked] = useState(
    question?.bookmarkedBy?.some((u) => u.id === user?.id) || false
  );
  const [likesCount, setLikesCount] = useState(question?._count?.likes || 0);
  const [showComments, setShowComments] = useState(false);

  // Toggle like with PATCH and proper auth
  const handleLike = async () => {
    if (!user?.token) {
      toast.error("You must be logged in to like a question");
      return;
    }

    // Optimistic UI update
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/questions/${question.id}/like`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to toggle like");
      }

      const data = await res.json();
      setLiked(data.liked);
      setLikesCount((prev) => (data.liked ? prev + 1 : prev - 1));
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      // Rollback on error
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  const handleBookmark = async () => {
    if (!user?.token) {
      toast.error("You must be logged in to bookmark");
      return;
    }

    // Optimistic update
    setBookmarked((prev) => !prev);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/questions/${question.id}/bookmark`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to toggle bookmark");
      }

      const data = await res.json();
      setBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? "Bookmarked!" : "Removed from bookmarks");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      // Rollback
      setBookmarked((prev) => !prev);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/questions/${question.id}`);
    toast.success("Link copied to clipboard!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Check out this question",
        url: `${window.location.origin}/questions/${question.id}`,
      }).catch(console.error);
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="card bg-white shadow-md border border-gray-100 rounded-xl overflow-hidden max-w-2xl mx-auto mb-4">
      <div className="p-4">
        {/* Question text */}
        <div
          className="text-gray-800 font-medium mb-2 break-words"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question?.text || "") }}
        />

        {/* MCQ options */}
        {question?.options?.length > 0 && (
          <ul className="list-disc list-inside text-gray-600 mb-3">
            {question.options.map((opt, i) => (
              <li key={i}>{opt}</li>
            ))}
          </ul>
        )}

        <div className="h-[2px] w-full my-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full" />

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 ${liked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
            >
              <Heart size={18} />
              <span className="text-sm">{likesCount}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1 ${bookmarked ? "text-yellow-500" : "text-gray-500 hover:text-yellow-500"}`}
            >
              <Bookmark size={18} />
            </button>

            <button onClick={handleCopyLink} className="hidden md:flex items-center text-gray-500 hover:text-blue-500 gap-1">
              <Copy size={16} />
            </button>

            <button onClick={handleShare} className="flex md:hidden items-center text-gray-500 hover:text-blue-500 gap-1">
              <Share2 size={16} />
            </button>
          </div>

          <button
            onClick={() => setShowComments((prev) => !prev)}
            className="text-gray-500 hover:text-blue-500 text-sm font-medium"
          >
            {showComments ? "Hide Comments" : "Comments"}
          </button>
        </div>

        {showComments && (
          <div className="mt-2">
            <CommentsSection questionId={question?.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
