// controllers/commentController.js
import prisma from "../prismaClient.js";

// -----------------------------
// Create comment or reply
// POST /api/comments
// -----------------------------
export const createComment = async (req, res, next) => {
  try {
    const { questionId, parentCommentId = null, text } = req.body;
    const userId = req.user.id;

    if (!questionId || !text?.trim()) {
      return res.status(400).json({ error: "Question and text are required" });
    }

    const question = await prisma.question.findUnique({
      where: { id: Number(questionId) },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        userId,
        questionId: Number(questionId),
        parentCommentId: parentCommentId ? Number(parentCommentId) : null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: true,
        likedBy: true,
        reportedBy: true,
      },
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

// -----------------------------
// Get all comments for a question
// GET /api/questions/:questionId/comments
// -----------------------------
export const getCommentsByQuestion = async (req, res, next) => {
  try {
    const questionId = Number(req.params.questionId);

    const comments = await prisma.comment.findMany({
      where: { questionId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            likedBy: true,
            reportedBy: true,
          },
        },
        likedBy: true,
        reportedBy: true,
      },
    });

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// -----------------------------
// Toggle like/unlike comment
// PATCH /api/comments/:commentId/like
// -----------------------------
export const toggleLikeComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.commentId);
    const userId = req.user.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { likedBy: true },
    });

    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const alreadyLiked = comment.likedBy.some((u) => u.id === userId);

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: alreadyLiked
        ? { likedBy: { disconnect: { id: userId } } }
        : { likedBy: { connect: { id: userId } } },
      include: { likedBy: true },
    });

    res.json({ likesCount: updatedComment.likedBy.length });
  } catch (err) {
    next(err);
  }
};

// -----------------------------
// Report comment
// PATCH /api/comments/:commentId/report
// -----------------------------
export const reportComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.commentId);
    const userId = req.user.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { reportedBy: true },
    });

    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const alreadyReported = comment.reportedBy.some((u) => u.id === userId);

    if (!alreadyReported) {
      await prisma.comment.update({
        where: { id: commentId },
        data: { reportedBy: { connect: { id: userId } } },
      });
    }

    res.json({ message: "Comment reported successfully" });
  } catch (err) {
    next(err);
  }
};

// -----------------------------
// Delete comment
// DELETE /api/comments/:commentId
// -----------------------------
export const deleteComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.commentId);
    const userId = req.user.id;
    const role = req.user.role;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.userId !== userId && role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    res.json({ message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
};
