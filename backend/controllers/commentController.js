import prisma from "../prismaClient.js";

// -----------------------------
// Create a comment or reply
// POST /api/comments
// -----------------------------
export const createComment = async (req, res, next) => {
  try {
    const { questionId, parentCommentId = null, text } = req.body;
    const userId = req.user.id;

    if (!questionId || !text?.trim()) {
      return res.status(400).json({ success: false, error: "Question and text are required" });
    }

    const question = await prisma.question.findUnique({ where: { id: Number(questionId) } });
    if (!question) return res.status(404).json({ success: false, error: "Question not found" });

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        userId,
        questionId: Number(questionId),
        parentCommentId: parentCommentId ? Number(parentCommentId) : null,
      },
      include: {
        user: { select: { id: true, studentId: true, name: true, avatar: true } },
        likedBy: true,
        reportedBy: true,
      },
    });

    res.status(201).json({ 
      success: true,
      data: { ...comment, repliesCount: 0 } 
    });
  } catch (err) {
    console.error("Error creating comment:", err);
    next(err);
  }
};

// -----------------------------
// Get top-level comments for a question
// GET /api/questions/:questionId/comments
// -----------------------------
export const getCommentsByQuestion = async (req, res, next) => {
  try {
    const questionId = Number(req.params.questionId);

    const comments = await prisma.comment.findMany({
      where: { questionId, parentCommentId: null },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, studentId: true, name: true, avatar: true } },
        likedBy: true,
        reportedBy: true,
      },
    });

    const commentIds = comments.map(c => c.id);

    const counts = await prisma.comment.groupBy({
      by: ["parentCommentId"],
      _count: { parentCommentId: true },
      where: { parentCommentId: { in: commentIds } },
    });

    const countMap = Object.fromEntries(counts.map(c => [c.parentCommentId, c._count.parentCommentId]));

    const commentsWithCount = comments.map(c => ({
      ...c,
      repliesCount: countMap[c.id] || 0,
    }));

    res.status(200).json({ success: true, data: commentsWithCount });
  } catch (err) {
    console.error("Error fetching comments:", err);
    next(err);
  }
};

// -----------------------------
// Get replies of a comment (lazy loading)
// GET /api/comments?parentCommentId=:id
// -----------------------------
export const getRepliesByComment = async (req, res, next) => {
  try {
    const parentCommentId = Number(req.query.parentCommentId);
    if (!parentCommentId) return res.status(400).json({ success: false, error: "parentCommentId is required" });

    const replies = await prisma.comment.findMany({
      where: { parentCommentId },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, studentId: true, name: true, avatar: true } },
        likedBy: true,
        reportedBy: true,
      },
    });

    const replyIds = replies.map(r => r.id);

    const counts = await prisma.comment.groupBy({
      by: ["parentCommentId"],
      _count: { parentCommentId: true },
      where: { parentCommentId: { in: replyIds } },
    });

    const countMap = Object.fromEntries(counts.map(c => [c.parentCommentId, c._count.parentCommentId]));

    const repliesWithCount = replies.map(r => ({
      ...r,
      repliesCount: countMap[r.id] || 0,
    }));

    res.status(200).json({ success: true, data: repliesWithCount });
  } catch (err) {
    console.error("Error fetching replies:", err);
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
    if (!comment) return res.status(404).json({ success: false, error: "Comment not found" });

    const alreadyLiked = comment.likedBy.some(u => u.id === userId);

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: alreadyLiked
        ? { likedBy: { disconnect: { id: userId } } }
        : { likedBy: { connect: { id: userId } } },
      include: { likedBy: true },
    });

    res.status(200).json({ success: true, likesCount: updatedComment.likedBy.length });
  } catch (err) {
    console.error("Error toggling like:", err);
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
    if (!comment) return res.status(404).json({ success: false, error: "Comment not found" });

    const alreadyReported = comment.reportedBy.some(u => u.id === userId);
    if (!alreadyReported) {
      await prisma.comment.update({
        where: { id: commentId },
        data: { reportedBy: { connect: { id: userId } } },
      });
    }

    res.status(200).json({ success: true, message: "Comment reported successfully" });
  } catch (err) {
    console.error("Error reporting comment:", err);
    next(err);
  }
};

// -----------------------------
// Delete comment and its replies (recursive)
// DELETE /api/comments/:commentId
// -----------------------------
export const deleteComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.commentId);
    const userId = req.user.id;
    const role = req.user.role;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ success: false, error: "Comment not found" });

    if (comment.userId !== userId && role !== "admin") {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    const deleteRecursively = async (id) => {
      const replies = await prisma.comment.findMany({ where: { parentCommentId: id } });
      for (let r of replies) {
        await deleteRecursively(r.id);
      }
      await prisma.comment.delete({ where: { id } });
    };

    await deleteRecursively(commentId);

    res.status(200).json({ success: true, message: "Comment and all its replies deleted" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    next(err);
  }
};
