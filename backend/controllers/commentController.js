// controllers/commentController.js
import Comment from "../models/Comment.js";
import Question from "../models/Question.js";
import mongoose from "mongoose";

// -----------------------------
// Create a comment or reply
// -----------------------------
export const createComment = async (req, res) => {
  const { questionId, parentCommentId = null, text } = req.body;
  const userId = req.user.id; // assuming auth middleware sets req.user

  if (!questionId || !text) {
    return res.status(400).json({ error: "Question and text are required" });
  }

  try {
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const comment = new Comment({
      question: questionId,
      user: userId,
      text,
      parentComment: parentCommentId,
    });

    await comment.save();

    // Update replies count if it's a reply
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, { $inc: { repliesCount: 1 } });
    }

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------
// Get all comments for a question
// -----------------------------
export const getCommentsByQuestion = async (req, res) => {
  const { questionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(questionId))
    return res.status(400).json({ error: "Invalid question ID" });

  try {
    const comments = await Comment.find({ question: questionId })
      .sort({ createdAt: -1 })
      .populate("user", "name studentId avatar") // user info
      .lean();

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------
// Toggle like on a comment
// -----------------------------
export const toggleLikeComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(commentId))
    return res.status(400).json({ error: "Invalid comment ID" });

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const updatedComment = await comment.toggleLike(userId);
    res.json({ likesCount: updatedComment.likesCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------
// Report a comment
// -----------------------------
export const reportComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(commentId))
    return res.status(400).json({ error: "Invalid comment ID" });

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (!comment.reportedBy.includes(userId)) {
      comment.reportedBy.push(userId);
      await comment.save();
    }

    res.json({ message: "Comment reported successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------
// Delete a comment
// -----------------------------
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(commentId))
    return res.status(400).json({ error: "Invalid comment ID" });

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Only allow owner or admin to delete
    if (comment.user.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // If it's a reply, decrement parent repliesCount
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } });
    }

    await comment.deleteOne();

    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
