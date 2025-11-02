// src/routes/examRoutes.js
import express from "express";
import {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
} from "../controllers/examController.js";
import { getQuestionsByExam } from "../controllers/questionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get questions for an exam – must come before `/:id` to avoid route conflict
router.get("/:id/questions", authMiddleware, getQuestionsByExam);

// Get single exam by ID
router.get("/:id", getExamById);

// Get all exams (with optional courseId query)
router.get("/", getAllExams);

// Create, update, delete exams
router.post("/", createExam);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);

export default router;
