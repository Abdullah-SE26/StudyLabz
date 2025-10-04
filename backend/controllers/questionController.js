import {
  getQuestionsService,
  createQuestionService,
  toggleLikeQuestionService,
  reportQuestionService,
  deleteQuestionService,
} from "../services/questionService.js";

// GET /questions
export const getQuestions = async (req, res, next) => {
  try {
    const questions = await getQuestionsService();
    res.json(questions);
  } catch (err) {
    next(err);
  }
};

// POST /questions
export const createQuestion = async (req, res, next) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;
    const question = await createQuestionService(userId, text);
    res.status(201).json(question);
  } catch (err) {
    next(err);
  }
};

// POST /questions/:id/like
export const toggleLikeQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const questionId = req.params.id;
    const result = await toggleLikeQuestionService(userId, questionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /questions/:id/report
export const reportQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const questionId = req.params.id;
    const { reason } = req.body;

    const report = await reportQuestionService(userId, questionId, reason);
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
};

// DELETE /questions/:id
export const deleteQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const questionId = req.params.id;

    const deleted = await deleteQuestionService(userId, questionId);
    res.json(deleted);
  } catch (err) {
    next(err);
  }
};
