import express from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import {
  createReport,
  getAllReports,
  updateReportStatus,
} from "../controllers/reportController.js";

const router = express.Router();

// Protect all routes after this middleware
router.use(authMiddleware);

// Regular users
router.post("/", createReport);

// Admin routes
router.get("/admin", isAdmin, getAllReports);
router.put("/:id", isAdmin, updateReportStatus);

export default router;
