import {
  createCommentService,
  getCommentsByQuestionService,
  toggleLikeCommentService,
  reportCommentService,
  deleteCommentService,
} from "../services/commentService.js";

// Create comment/reply
export const createComment = async (req, res, next) => {
  try {
    const { questionId, parentCommentId = null, text } = req.body;
    const userId = req.user.id;

    if (!questionId || !text) {
      return res.status(400).json({ error: "Question and text are required" });
    }

    const comment = await createCommentService(userId, questionId, text, parentCommentId);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

// Get comments for a question
export const getCommentsByQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const comments = await getCommentsByQuestionService(questionId);
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// Toggle like on comment
export const toggleLikeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const result = await toggleLikeCommentService(userId, commentId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Report comment
export const reportComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const result = await reportCommentService(userId, commentId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Delete comment
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const result = await deleteCommentService(userId, role, commentId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
