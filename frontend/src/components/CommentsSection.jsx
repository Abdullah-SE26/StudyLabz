// src/components/CommentsSection.jsx
import React, { useEffect, useState, useCallback } from "react";
import DOMPurify from "dompurify";
import { Heart, Trash2, AlertTriangle, CornerDownRight } from "lucide-react";
import { useStore } from "../store/authStore";
import toast from "react-hot-toast";

// Recursive Comment component
const Comment = ({ comment, onReplySubmit, onDeleteComment, depth = 0 }) => {
  const user = useStore((state) => state.user);
  const [liked, setLiked] = useState(comment.likedBy?.some(u => u.id === user?.id) || false);
  const [likesCount, setLikesCount] = useState(comment.likedBy?.length || 0);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(true);

  const handleLike = async () => {
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/comments/${comment.id}/like`,
        { method: "PATCH", headers: { Authorization: `Bearer ${user.token}` } }
      );
      const data = await res.json();
      setLikesCount(data.likesCount);
    } catch (err) {
      console.error(err);
      setLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error("Failed to toggle like");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/comments/${comment.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success("Comment deleted");
      onDeleteComment(comment.id);
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const handleReport = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/comments/${comment.id}/report`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success("Reported comment");
    } catch {
      toast.error("Failed to report comment");
    }
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    await onReplySubmit(comment.id, replyText);
    setReplyText("");
    setShowReplyInput(false);
  };

  return (
    <div className={`flex flex-col gap-2 mt-2 ${depth > 0 ? "pl-6 border-l border-gray-200" : ""}`}>
      <div className="flex justify-between items-start gap-2 bg-gray-50 p-2 rounded-lg">
        <div className="flex-1">
          <p className="text-sm font-medium">{comment.user?.name}</p>
          <div
            className="text-gray-700 text-sm break-words"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.text) }}
          />
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <button onClick={handleLike} className="flex items-center gap-1">
              <Heart size={14} className={liked ? "text-red-500" : ""} />
              <span>{likesCount}</span>
            </button>
            <button onClick={() => setShowReplyInput(prev => !prev)} className="flex items-center gap-1">
              <CornerDownRight size={14} /> Reply
            </button>
            {comment.userId === user?.id && (
              <button onClick={handleDelete} className="flex items-center gap-1 text-red-500">
                <Trash2 size={14} /> Delete
              </button>
            )}
            <button onClick={handleReport} className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle size={14} /> Report
            </button>
          </div>

          {showReplyInput && (
            <div className="mt-1">
              <textarea
                className="w-full border rounded p-1 text-sm"
                rows={2}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply..."
              />
              <button
                onClick={submitReply}
                className="mt-1 px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Reply
              </button>
            </div>
          )}
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div className="flex flex-col mt-1">
          <button
            className="text-xs text-gray-400 mb-1 self-start hover:underline"
            onClick={() => setShowReplies(prev => !prev)}
          >
            {showReplies ? `Hide ${comment.replies.length} replies` : `Show ${comment.replies.length} replies`}
          </button>
          {showReplies && comment.replies.map(reply => (
            <Comment
              key={reply.id}
              comment={{ ...reply }}
              onReplySubmit={onReplySubmit}
              onDeleteComment={onDeleteComment}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Recursive delete helper
const removeCommentRecursively = (commentsArr, deletedId) => {
  return commentsArr
    .filter(c => c.id !== deletedId)
    .map(c => ({
      ...c,
      replies: removeCommentRecursively(c.replies || [], deletedId)
    }));
};

const CommentsSection = ({ questionId }) => {
  const user = useStore((state) => state.user);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/${questionId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch comments");
    }
  }, [questionId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ questionId, text: newComment }),
      });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to post comment");
    }
  };

  const handleReplySubmit = async (parentCommentId, text) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ questionId, parentCommentId, text }),
      });
      fetchComments();
    } catch {
      toast.error("Failed to post reply");
    }
  };

  const handleDeleteComment = (deletedId) => {
    setComments(prev => removeCommentRecursively(prev, deletedId));
  };

  return (
    <div className="mt-2">
      <div className="flex flex-col gap-2 mb-2">
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={2}
          placeholder="Add a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button
          onClick={submitComment}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Comment
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {comments.map(c => (
          <Comment
            key={c.id}
            comment={c}
            onReplySubmit={handleReplySubmit}
            onDeleteComment={handleDeleteComment}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;
