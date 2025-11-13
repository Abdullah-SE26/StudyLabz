import express from "express";
import { getDashboardStats, getPublicStats } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth-protected dashboard stats (admin/user)
router.get("/stats", authMiddleware, getDashboardStats);

// Public stats for home page
router.get("/stats/public", getPublicStats);

export default router;
