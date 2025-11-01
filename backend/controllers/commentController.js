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
    if (!question) return res.status(404).json({ error: "Question not found" });

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        userId,
        questionId: Number(questionId),
        parentCommentId: parentCommentId ? Number(parentCommentId) : null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        likedBy: true,
        reportedBy: true,
      },
    });

    // Include replies count (initially 0)
    const commentWithCount = { ...comment, repliesCount: 0 };

    res.status(201).json(commentWithCount);
  } catch (err) {
    console.error("Error creating comment:", err);
    next(err);
  }
};

// -----------------------------
// Get all top-level comments for a question (with replies count)
// GET /api/questions/:questionId/comments
// -----------------------------
export const getCommentsByQuestion = async (req, res, next) => {
  try {
    const questionId = Number(req.params.questionId);

    // 1️⃣ Fetch top-level comments
    const comments = await prisma.comment.findMany({
      where: { questionId, parentCommentId: null },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, studentId: true, avatar: true, name: true } },
        likedBy: true,
        reportedBy: true,
      },
    });

    const commentIds = comments.map(c => c.id);

    // 2️⃣ Fetch replies count for all comments in a single query
    const counts = await prisma.comment.groupBy({
      by: ["parentCommentId"],
      _count: { parentCommentId: true },
      where: { parentCommentId: { in: commentIds } },
    });

    const countMap = Object.fromEntries(counts.map(c => [c.parentCommentId, c._count.parentCommentId]));

    // 3️⃣ Add repliesCount to each comment
    const commentsWithCount = comments.map(c => ({
      ...c,
      repliesCount: countMap[c.id] || 0,
    }));

    res.json(commentsWithCount);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};


// -----------------------------
// Get direct replies of a comment (for lazy loading)
// GET /api/comments?parentCommentId=:id
// -----------------------------
export const getRepliesByComment = async (req, res, next) => {
  try {
    const parentCommentId = Number(req.query.parentCommentId);
    if (!parentCommentId) return res.status(400).json({ error: "parentCommentId is required" });

    // 1️⃣ Fetch direct replies
    const replies = await prisma.comment.findMany({
      where: { parentCommentId },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, studentId: true, avatar: true, name: true } },
        likedBy: true,
        reportedBy: true,
      },
    });

    const replyIds = replies.map(r => r.id);

    // 2️⃣ Fetch replies count for these replies in one query
    const counts = await prisma.comment.groupBy({
      by: ["parentCommentId"],
      _count: { parentCommentId: true },
      where: { parentCommentId: { in: replyIds } },
    });

    const countMap = Object.fromEntries(counts.map(c => [c.parentCommentId, c._count.parentCommentId]));

    // 3️⃣ Add repliesCount
    const repliesWithCount = replies.map(r => ({
      ...r,
      repliesCount: countMap[r.id] || 0,
    }));

    res.json(repliesWithCount);
  } catch (err) {
    console.error("Error fetching replies:", err);
    res.status(500).json({ error: "Failed to fetch replies" });
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
    console.error("Error reporting comment:", err);
    next(err);
  }
};

// -----------------------------
// Delete comment (recursive)
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

    // Recursive delete helper
    const deleteRecursively = async (id) => {
      const replies = await prisma.comment.findMany({ where: { parentCommentId: id } });
      for (let r of replies) {
        await deleteRecursively(r.id);
      }
      await prisma.comment.delete({ where: { id } });
    };

    await deleteRecursively(commentId);

    res.json({ message: "Comment and all its replies deleted" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    next(err);
  }
};
