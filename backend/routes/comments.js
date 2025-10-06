// routes/comments.js
import express from "express";
import {
  createComment,
  getCommentsByQuestion,
  toggleLikeComment,
  reportComment,
  deleteComment,
} from "../controllers/commentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// -----------------------------
// Create a comment or reply
// POST /api/comments
// -----------------------------
router.post("/", authMiddleware, createComment);

// -----------------------------
// Get all comments for a question
// GET /api/comments/:questionId
// -----------------------------
router.get("/:questionId", getCommentsByQuestion);

// -----------------------------
// Toggle like on a comment
// PATCH /api/comments/:commentId/like
// -----------------------------
router.patch("/:commentId/like", authMiddleware, toggleLikeComment);

// -----------------------------
// Report a comment
// PATCH /api/comments/:commentId/report
// -----------------------------
router.patch("/:commentId/report", authMiddleware, reportComment);

// -----------------------------
// Delete a comment
// DELETE /api/comments/:commentId
// -----------------------------
router.delete("/:commentId", authMiddleware, deleteComment);

export default router;
