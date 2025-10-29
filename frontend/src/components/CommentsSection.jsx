import React, { useEffect, useState, useCallback } from "react";
import DOMPurify from "dompurify";
import { Heart, Trash2, AlertTriangle, CornerDownRight } from "lucide-react";
import { useStore } from "../store/authStore";
import toast from "react-hot-toast";

const CommentsSection = ({ questionId, onNewComment }) => {
  const authToken = useStore((state) => state.authToken);
  const user = useStore((state) => state.user);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // -----------------------------
  // Recursive remove helper
  // -----------------------------
  const removeCommentRecursively = (commentsArr, deletedId) =>
    commentsArr
      .filter((c) => c.id !== deletedId)
      .map((c) => ({ ...c, replies: removeCommentRecursively(c.replies || [], deletedId) }));

  // -----------------------------
  // Fetch comments
  // -----------------------------
  const fetchComments = useCallback(async () => {
    if (!authToken) return; // wait for token
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/comments/question/${questionId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data.map((c) => ({ ...c, replies: [] })));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch comments");
    }
  }, [questionId, authToken]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // -----------------------------
  // Submit new comment
  // -----------------------------
  const submitComment = async () => {
    if (!newComment.trim() || !authToken) {
      toast.error("You must be logged in to comment");
      return;
    }

    const tempComment = {
      id: Date.now(),
      text: newComment,
      user,
      userId: user.id,
      likedBy: [],
      replies: [],
      repliesCount: 0,
    };

    setComments((prev) => [tempComment, ...prev]);
    setNewComment("");
    onNewComment?.();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ questionId, text: tempComment.text }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const data = await res.json();
      setComments((prev) =>
        prev.map((c) => (c.id === tempComment.id ? { ...c, id: data.id } : c))
      );
    } catch {
      toast.error("Failed to post comment");
      setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
    }
  };

  // -----------------------------
  // Recursive Comment component
  // -----------------------------
  const Comment = ({ comment, depth = 0 }) => {
    const [liked, setLiked] = useState(
      comment.likedBy?.some((u) => u.id === user?.id) || false
    );
    const [likesCount, setLikesCount] = useState(comment.likedBy?.length || 0);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState([]);
    const [isRepliesLoading, setIsRepliesLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Like/unlike
    const handleLike = async () => {
      if (!authToken) return toast.error("You must be logged in");
      const prevLiked = liked;
      const prevCount = likesCount;
      setLiked(!prevLiked);
      setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comments/${comment.id}/like`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) throw new Error("Failed to like comment");
        const data = await res.json();
        if (typeof data.likesCount === "number") setLikesCount(data.likesCount);
      } catch {
        setLiked(prevLiked);
        setLikesCount(prevCount);
        toast.error("Failed to toggle like");
      }
    };

    // Delete
    const handleDelete = async () => {
      if (!authToken) return toast.error("You must be logged in");
      setIsDeleting(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comments/${comment.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) throw new Error("Failed to delete comment");
        setComments((prev) => removeCommentRecursively(prev, comment.id));
        toast.success("Comment deleted");
        setShowModal(false);
      } catch {
        toast.error("Failed to delete comment");
      } finally {
        setIsDeleting(false);
      }
    };

    // Report
    const handleReport = async () => {
      if (!authToken) return toast.error("You must be logged in");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comments/${comment.id}/report`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) throw new Error("Failed to report comment");
        toast.success("Reported comment");
      } catch {
        toast.error("Failed to report comment");
      }
    };

    // Submit reply
    const submitReply = async () => {
      if (!replyText.trim() || !authToken) return;
      const tempReply = {
        id: Date.now(),
        text: replyText,
        user,
        userId: user.id,
        likedBy: [],
        replies: [],
        repliesCount: 0,
      };

      setReplies((prev) => [...prev, tempReply]);
      setReplyText("");
      setShowReplyInput(false);

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            questionId,
            parentCommentId: comment.id,
            text: tempReply.text,
          }),
        });
        if (!res.ok) throw new Error("Failed to post reply");
        const data = await res.json();
        setReplies((prev) =>
          prev.map((r) => (r.id === tempReply.id ? { ...r, id: data.id } : r))
        );
      } catch {
        toast.error("Failed to post reply");
        setReplies((prev) => prev.filter((r) => r.id !== tempReply.id));
      }
    };

    // Fetch replies
    const fetchReplies = async () => {
      if (!authToken) return;
      if (replies.length > 0) return setShowReplies(true);

      setIsRepliesLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comments?parentCommentId=${comment.id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) throw new Error("Failed to fetch replies");
        const data = await res.json();
        setReplies(data);
        setShowReplies(true);
      } catch {
        toast.error("Failed to load replies");
      } finally {
        setIsRepliesLoading(false);
      }
    };

    return (
      <div className={`flex flex-col gap-2 mt-2 ${depth > 0 ? "pl-6 border-l border-gray-200" : ""}`}>
        <div className="flex justify-between items-start gap-2 p-2 rounded-lg">
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
              <button
                onClick={() => setShowReplyInput((prev) => !prev)}
                className="flex items-center gap-1"
              >
                <CornerDownRight size={14} /> Reply
              </button>
              {comment.userId === user?.id && (
                <label
                  htmlFor={`delete-modal-${comment.id}`}
                  className="flex items-center gap-1 text-red-500 cursor-pointer"
                >
                  <Trash2 size={14} /> Delete
                </label>
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
                  onChange={(e) => setReplyText(e.target.value)}
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

        {/* Show/Hide Replies */}
        {comment.repliesCount > 0 && (
          <div className="flex flex-col mt-1">
            <button
              className="text-xs text-gray-400 mb-1 self-start hover:underline"
              onClick={() => {
                if (!showReplies) fetchReplies();
                else setShowReplies(false);
              }}
            >
              {showReplies ? `Hide ${replies.length || comment.repliesCount} replies` : `Show ${comment.repliesCount} replies`}
            </button>

            {isRepliesLoading && <span className="loading loading-dots loading-md"></span>}

            {showReplies &&
              replies.map((r) => (
                <Comment key={r.id} comment={r} depth={depth + 1} />
              ))}
          </div>
        )}

        {/* Delete Modal */}
        <input
          type="checkbox"
          id={`delete-modal-${comment.id}`}
          className="modal-toggle"
          checked={showModal}
          onChange={() => setShowModal(!showModal)}
        />
        <div className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Comment</h3>
            <p className="py-4">Are you sure you want to delete this comment and all its replies?</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className={`btn btn-error ${isDeleting ? "loading" : ""}`} onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-2">
      <div className="flex flex-col gap-2 mb-2">
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={2}
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          onClick={submitComment}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Comment
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {comments.map((c) => (
          <Comment key={c.id} comment={c} />
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;
