// src/routes/examRoutes.js
import express from 'express';
import {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
} from '../controllers/examController.js';

const router = express.Router();

router.get('/', getAllExams);
router.get('/:id', getExamById);
router.post('/', createExam);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);

export default router;
