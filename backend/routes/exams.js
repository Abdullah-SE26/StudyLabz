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

router.get("/", getAllExams);
router.get("/:id", getExamById);
router.post("/", createExam);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);
router.get("/:id/questions", authMiddleware, getQuestionsByExam);

export default router;
