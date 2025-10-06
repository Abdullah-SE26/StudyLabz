import express from "express";
import {
  getCourses,
  createCourse,
  deleteCourse,
} from "../controllers/courseController.js";

const router = express.Router();

// Middleware: ensure authentication before routes (adjust if using custom middleware)
import { authMiddleware } from "../middleware/authMiddleware.js";
router.use(authMiddleware);

router.get("/", authMiddleware, getCourses);
router.post("/", authMiddleware, createCourse);
router.delete("/:id", authMiddleware, deleteCourse);

export default router;
