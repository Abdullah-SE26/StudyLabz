import express from 'express';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';
import {
  createReport,
  getAllReports,
  updateReportStatus,
} from '../controllers/reportController.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(authMiddleware); // Authenticated users only

// Routes for reports
router.route('/')
  .post(createReport); // Any authenticated user can create a report

// Admin-only routes
router.route('/admin')
  .get(isAdmin, getAllReports); // Admin access

router.route('/:id')
  .put(isAdmin, updateReportStatus); // Admin access

export default router;
