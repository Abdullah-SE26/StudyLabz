import express from "express";
import { getCourses, createCourse, deleteCourse } from "../controllers/courseController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js"; // add isAdmin

const router = express.Router();

// GET all courses — public route
router.get("/", getCourses);

// POST new course — admin only
router.post("/", authMiddleware, isAdmin, createCourse);

// DELETE course — admin only
router.delete("/:id", authMiddleware, isAdmin, deleteCourse);

export default router;
