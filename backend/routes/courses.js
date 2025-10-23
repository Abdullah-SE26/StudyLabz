import express from "express";
import {
  getCourses,
  createCourse,
  deleteCourse,
  updateCourse, // 👈 add this
} from "../controllers/courseController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all courses — public
router.get("/", getCourses);

// POST new course — admin only
router.post("/", authMiddleware, isAdmin, createCourse);

// PATCH update course — admin only 👇
router.patch("/:id", authMiddleware, isAdmin, updateCourse);

// DELETE course — admin only
router.delete("/:id", authMiddleware, isAdmin, deleteCourse);

export default router;
