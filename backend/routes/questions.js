import express from "express";
import {
  createQuestion,
  getQuestions,
  toggleLikeQuestion,
  reportQuestion,
  deleteQuestion,
} from "../controllers/questionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getQuestions);
router.post("/", authMiddleware, createQuestion);
router.post("/:id/like", authMiddleware, toggleLikeQuestion);
router.post("/:id/report", authMiddleware, reportQuestion);
router.delete("/:id", authMiddleware, deleteQuestion);

export default router;
