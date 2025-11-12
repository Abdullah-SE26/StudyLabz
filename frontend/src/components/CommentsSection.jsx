import React, { useEffect, useState, useCallback } from "react";
import DOMPurify from "dompurify";
import { Heart, Trash2, AlertTriangle, CornerDownRight } from "lucide-react";
import { useStore } from "../store/authStore";
import toast from "react-hot-toast";
import axios from "../../lib/axios";
import ReportModal from "./ReportModal";

const CommentsSection = ({ questionId, questionCreatorId, onNewComment }) => {
  const authToken = useStore((state) => state.authToken);
  const user = useStore((state) => state.user);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);

  // Remove a comment recursively from state
  const removeCommentRecursively = (commentsArr, deletedId) =>
    commentsArr
      .filter((c) => c.id !== deletedId)
      .map((c) => ({
        ...c,
        replies: removeCommentRecursively(c.replies || [], deletedId),
      }));

  // Fetch top-level comments
  const fetchComments = useCallback(async () => {
    if (!authToken) return;
    setIsCommentsLoading(true);
    const controller = new AbortController();

    try {
      const res = await axios.get(`/comments/question/${questionId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        signal: controller.signal,
      });

      setComments(res.data.data.comments || []);
    } catch (err) {
      if (err.name !== "CanceledError") {
        console.error(err);
        toast.error("Failed to fetch comments");
      }
    } finally {
      setIsCommentsLoading(false);
    }

    return () => controller.abort();
  }, [questionId, authToken]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Add new top-level comment
  const submitComment = async () => {
    if (!newComment.trim() || !authToken) {
      toast.error("You must be logged in to comment");
      return;
    }

    const tempComment = {
      id: crypto.randomUUID(),
      text: newComment.trim(),
      user,
      likesCount: 0,
      userLiked: false,
      replies: [],
      repliesCount: 0,
    };

    setComments((prev) => [tempComment, ...prev]);
    setNewComment("");
    onNewComment?.();

    try {
      const { data } = await axios.post(
        `/comments`,
        { questionId, text: tempComment.text },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setComments((prev) =>
        prev.map((c) =>
          c.id === tempComment.id ? { ...c, id: data.data.id } : c
        )
      );
    } catch {
      toast.error("Failed to post comment");
      setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
    }
  };

  const getAuthorLabel = (user) => {
    if (!user) return <span>Unknown</span>;
    const badges = [];
    if (user.role === "admin") badges.push("Admin");
    if (user.studentId === questionCreatorId) badges.push("Author");

    return (
      <span className="flex items-center gap-2">
        {user.name || user.studentId || "Unknown"}
        {badges.map((b) => (
          <span
            key={b}
            className="px-2 py-0.5 text-[10px] font-semibold bg-purple-200 text-purple-800 rounded-full"
          >
            {b}
          </span>
        ))}
      </span>
    );
  };

  const Comment = ({ comment, depth = 0 }) => {
    const [liked, setLiked] = useState(comment.userLiked);
    const [likesCount, setLikesCount] = useState(comment.likesCount);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState([]);
    const [isRepliesLoading, setIsRepliesLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const handleLike = async () => {
      if (!authToken) return toast.error("You must be logged in");

      const prevLiked = liked;
      const prevCount = likesCount;
      setLiked(!prevLiked);
      setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

      try {
        const { data } = await axios.patch(
          `/comments/${comment.id}/like`,
          {},
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        setLikesCount(data.likesCount);
        setLiked(data.userLiked);
      } catch {
        setLiked(prevLiked);
        setLikesCount(prevCount);
        toast.error("Failed to toggle like");
      }
    };

    const handleDelete = async () => {
      if (!authToken) return toast.error("You must be logged in");
      setIsDeleting(true);

      try {
        await axios.delete(`/comments/${comment.id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        setComments((prev) => removeCommentRecursively(prev, comment.id));
        toast.success("Comment deleted");
        setShowModal(false);
      } catch {
        toast.error("Failed to delete comment");
      } finally {
        setIsDeleting(false);
      }
    };

    const handleReport = () => {
      if (!user) {
        toast.error("You need to be logged in to report a comment.");
        return;
      }
      setIsReportModalOpen(true);
    };

    const handleCloseReportModal = () => setIsReportModalOpen(false);

    const submitReply = async () => {
      if (!replyText.trim() || !authToken) return;

      const tempReply = {
        id: crypto.randomUUID(),
        text: replyText.trim(),
        user,
        likesCount: 0,
        userLiked: false,
        replies: [],
        repliesCount: 0,
      };

      setReplies((prev) => [...prev, tempReply]);
      setShowReplies(true);
      setReplyText("");
      setShowReplyInput(false);

      try {
        const { data } = await axios.post(
          `/comments`,
          { questionId, parentCommentId: comment.id, text: tempReply.text },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        setReplies((prev) =>
          prev.map((r) =>
            r.id === tempReply.id ? { ...r, id: data.data.id } : r
          )
        );
      } catch {
        toast.error("Failed to post reply");
        setReplies((prev) => prev.filter((r) => r.id !== tempReply.id));
      }
    };

    const fetchReplies = async () => {
      if (!authToken || isRepliesLoading) return;
      setShowReplies(true);
      setIsRepliesLoading(true);

      try {
        const { data } = await axios.get(
          `/comments/replies?parentCommentId=${comment.id}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        setReplies(data.data.replies);
      } catch {
        toast.error("Failed to load replies");
      } finally {
        setIsRepliesLoading(false);
      }
    };

    const canDelete = user?.studentId === comment.user?.studentId || user?.role === "admin";

    return (
      <div
        className={`flex flex-col gap-2 mt-2 ${
          depth > 0 ? "pl-6 border-l border-gray-200" : ""
        }`}
      >
        <div className="flex justify-between items-start gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">
              {getAuthorLabel(comment.user)}
            </p>
            <div
              className="text-gray-800 text-sm mt-1 leading-snug"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(comment.text),
              }}
            />

            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <button
                onClick={handleLike}
                className="flex items-center gap-1 hover:text-red-400"
              >
                <Heart
                  size={14}
                  fill={liked ? "red" : "none"}
                  className={liked ? "text-red-500" : "text-gray-500"}
                />
                <span>{likesCount}</span>
              </button>
              <button
                onClick={() => setShowReplyInput((prev) => !prev)}
                className="flex items-center gap-1 hover:text-blue-500"
              >
                <CornerDownRight size={14} /> Reply
              </button>
              {canDelete && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-600"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <button
                onClick={handleReport}
                className="flex items-center gap-1 text-amber-600 hover:text-amber-700"
              >
                <AlertTriangle size={14} /> Report
              </button>
            </div>

            {showReplyInput && (
              <div className="mt-2">
                <textarea
                  className="w-full border border-gray-300 rounded p-1 text-sm focus:ring focus:ring-blue-200"
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

        {(comment.repliesCount > 0 || replies.length > 0) && (
          <div className="flex flex-col mt-1">
            <button
              className="text-xs text-blue-500 hover:underline mb-1 self-start"
              onClick={() =>
                showReplies ? setShowReplies(false) : fetchReplies()
              }
            >
              {showReplies
                ? `Hide ${replies.length || comment.repliesCount} replies`
                : `Show ${comment.repliesCount || replies.length} replies`}
            </button>

            {isRepliesLoading && (
              <span className="loading loading-dots loading-md"></span>
            )}

            {showReplies &&
              replies.map((r) => <Comment key={r.id} comment={r} depth={depth + 1} />)}
          </div>
        )}

        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Delete Comment</h3>
              <p className="py-4">
                Are you sure you want to delete this comment and all its replies?
              </p>
              <div className="modal-action">
                <button className="btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  className={`btn btn-error ${isDeleting ? "loading" : ""}`}
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <ReportModal
          isOpen={isReportModalOpen}
          onClose={handleCloseReportModal}
          commentId={comment.id}
        />
      </div>
    );
  };

  return (
    <div className="mt-3">
      <div className="flex flex-col gap-2 mb-3">
        <textarea
          className="w-full border border-gray-300 rounded p-2 text-sm focus:ring focus:ring-blue-200"
          rows={2}
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          onClick={submitComment}
          className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 self-start"
        >
          Comment
        </button>
      </div>

      {isCommentsLoading && (
        <div className="flex justify-center py-4">
          <span className="loading loading-dots loading-md"></span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {comments.map((c) => (
          <Comment key={c.id} comment={c} />
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;
