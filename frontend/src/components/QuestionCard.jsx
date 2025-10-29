import React, { useState } from "react";
import DOMPurify from "dompurify";
import { Heart, Bookmark, MessageCircle, Share } from "lucide-react";
import CommentsSection from "./CommentsSection";
import { useStore } from "../store/authStore";

const QuestionCard = ({ question, onToggleLike, onToggleBookmark }) => {
  const user = useStore(state => state.user);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(question.commentsCount || 0);

  const liked = question.likedBy?.some(u => u.id === user?.id);
  const bookmarked = question.bookmarkedBy?.some(u => u.id === user?.id);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/questions/${question.id}`;
    if (navigator.share) navigator.share({ title: "Check out this question", url: shareUrl }).catch(console.error);
    else navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 max-w-2xl mx-auto mb-6 overflow-hidden transition hover:shadow-xl">
      <div className="p-6 sm:p-8 flex flex-col gap-4">
        <div className="text-gray-900 font-medium text-sm sm:text-base leading-relaxed break-words"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.text || "") }}
        />

        {question.options?.length > 0 && (
          <ul className="list-disc list-inside text-gray-600 text-sm sm:text-base space-y-1">
            {question.options.map((opt, i) => <li key={i}>{opt}</li>)}
          </ul>
        )}

        <div className="border-t border-gray-200 my-3" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={onToggleLike} className={`flex items-center gap-2 text-2xl transition ${liked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}>
              <Heart fill={liked ? "red" : "none"} size={24} />
              <span className="text-base">{question.likedBy?.length || 0}</span>
            </button>

            <button onClick={() => setShowComments(prev => !prev)} className="flex items-center gap-2 text-2xl text-gray-500 hover:text-blue-500 transition">
              <MessageCircle size={24} />
              <span className="text-base">{commentsCount}</span>
            </button>

            <button onClick={handleShare} className="flex items-center text-2xl text-gray-500 hover:text-green-500 transition">
              <Share size={24} />
            </button>
          </div>

          <button onClick={onToggleBookmark} className={`flex items-center gap-2 text-2xl transition ${bookmarked ? "text-blue-500" : "text-gray-500 hover:text-blue-500"}`}>
            <Bookmark fill={bookmarked ? "blue" : "none"} size={24} />
            <span className="text-base">{question.bookmarkedBy?.length || 0}</span>
          </button>
        </div>

        {showComments && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <CommentsSection questionId={question.id} onNewComment={() => setCommentsCount(prev => prev + 1)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
