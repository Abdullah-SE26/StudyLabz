
import prisma from '../prismaClient.js';

// Get all exams
export const getAllExams = async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      include: { course: true },
    });
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exams', details: err.message });
  }
};

// Get single exam by ID
export const getExamById = async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: Number(id) },
      include: { course: true },
    });
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.status(200).json(exam);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching exam', details: err.message });
  }
};

// Create new exam
export const createExam = async (req, res) => {
  const { title, type, courseId } = req.body;
  try {
    const exam = await prisma.exam.create({
      data: { title, type, courseId: Number(courseId) },
    });
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ error: 'Error creating exam', details: err.message });
  }
};

// Update exam
export const updateExam = async (req, res) => {
  const { id } = req.params;
  const { title, type } = req.body;
  try {
    const exam = await prisma.exam.update({
      where: { id: Number(id) },
      data: { title, type },
    });
    res.status(200).json(exam);
  } catch (err) {
    res.status(500).json({ error: 'Error updating exam', details: err.message });
  }
};

// Delete exam
export const deleteExam = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.exam.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting exam', details: err.message });
  }
};
