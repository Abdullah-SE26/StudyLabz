import express from "express";
import {
  getCommentsByQuestion,
  getRepliesByComment,
  createComment,
  toggleLikeComment,
  reportComment,
  deleteComment,
} from "../controllers/commentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// -----------------------------
// Create comment or reply
// POST /api/comments
// -----------------------------
router.post("/", authMiddleware, createComment);

// -----------------------------
// Toggle like/unlike comment
// PATCH /api/comments/:commentId/like
// -----------------------------
router.patch("/:commentId/like", authMiddleware, toggleLikeComment);

// -----------------------------
// Report comment
// PATCH /api/comments/:commentId/report
// -----------------------------
router.patch("/:commentId/report", authMiddleware, reportComment);

// -----------------------------
// Delete comment (recursive)
// DELETE /api/comments/:commentId
// -----------------------------
router.delete("/:commentId", authMiddleware, deleteComment);

// -----------------------------
// Get all top-level comments for a question
// GET /api/comments/question/:questionId
// -----------------------------
router.get("/question/:questionId", getCommentsByQuestion);

// -----------------------------
// Get direct replies for a comment (lazy load)
// GET /api/comments/replies?parentCommentId=ID
// -----------------------------
router.get("/replies", authMiddleware, getRepliesByComment);

export { router as commentRoutes };
