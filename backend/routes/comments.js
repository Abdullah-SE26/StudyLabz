import express from "express";
import { getCommentsByQuestion, createComment, toggleLikeComment, reportComment, deleteComment } from "../controllers/commentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// -----------------------------
// Create comment
// POST /api/comments
// -----------------------------
router.post("/", authMiddleware, createComment);

// -----------------------------
// Toggle like
// PATCH /api/comments/:commentId/like
// -----------------------------
router.patch("/:commentId/like", authMiddleware, toggleLikeComment);

// -----------------------------
// Report comment
// PATCH /api/comments/:commentId/report
// -----------------------------
router.patch("/:commentId/report", authMiddleware, reportComment);

// -----------------------------
// Delete comment
// DELETE /api/comments/:commentId
// -----------------------------
router.delete("/:commentId", authMiddleware, deleteComment);

// -----------------------------
// Get all comments for a question
// GET /api/questions/:questionId/comments
// -----------------------------
const questionCommentsRouter = express.Router();
questionCommentsRouter.get("/:questionId/comments", getCommentsByQuestion);

export { router as commentRoutes, questionCommentsRouter };
