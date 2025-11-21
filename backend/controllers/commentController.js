import prisma from "../prismaClient.js";
import { invalidateCache } from "../utils/prismaCache.js";

// -----------------------------
// Helper: format comment for frontend
// -----------------------------
const formatComment = (comment, currentUserId) => ({
  id: comment.id,
  text: comment.text,
  user: {
    id: comment.user.id,
    studentId: comment.user.studentId,
    name: comment.user.name,
    avatar: comment.user.avatar,
    role: comment.user.role,
  },
  likesCount: comment._count?.likedBy || 0,
  userLiked: comment.likedBy?.some((u) => u.id === currentUserId) || false,
  repliesCount: comment._count?.replies || 0,
  reportsCount: comment._count?.reports || 0,
  parentCommentId: comment.parentCommentId,
  createdAt: comment.createdAt,
});

// -----------------------------
// Create a comment or reply
// -----------------------------
export const createComment = async (req, res, next) => {
  try {
    const { questionId, parentCommentId = null, text } = req.body;
    const userId = req.user.id;

    if (!questionId || !text?.trim())
      return res.status(400).json({ success: false, error: "Question and text are required" });

    // Verify question exists and get courseId for cache invalidation
    const question = await prisma.question.findUnique({
      where: { id: Number(questionId) },
      select: { id: true, courseId: true },
    });
    if (!question)
      return res.status(404).json({ success: false, error: "Question not found" });

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        userId,
        questionId: Number(questionId),
        parentCommentId: parentCommentId ? Number(parentCommentId) : null,
      },
      include: {
        user: { select: { id: true, studentId: true, name: true, avatar: true, role: true } },
        likedBy: { select: { id: true } },
        _count: { select: { replies: true, reports: true, likedBy: true } },
      },
    });

    // Invalidate caches to update comment counts
    await invalidateCache("questions:*");
    await invalidateCache(`question:${questionId}`);
    if (question.courseId) {
      await invalidateCache(`courseQuestions:${question.courseId}:*`);
    }
    await invalidateCache(`userBookmarks:*`);

    res.status(201).json({ success: true, data: formatComment(comment, userId) });
  } catch (err) {
    console.error("Error creating comment:", err);
    next(err);
  }
};

// -----------------------------
// Get top-level comments
// -----------------------------
export const getCommentsByQuestion = async (req, res, next) => {
  try {
    const questionId = Number(req.params.questionId);
    const limit = Number(req.query.limit) || 10;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    const userId = req.user?.id || 0;

    const comments = await prisma.comment.findMany({
      where: { questionId, parentCommentId: null },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        user: { select: { id: true, studentId: true, name: true, avatar: true, role: true } },
        likedBy: { select: { id: true } },
        _count: { select: { replies: true, reports: true, likedBy: true } },
      },
    });

    const nextCursor = comments.length === limit ? comments[comments.length - 1].id : null;

    res.status(200).json({
      success: true,
      data: {
        comments: comments.map((c) => formatComment(c, userId)),
        nextCursor,
      },
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    next(err);
  }
};

// -----------------------------
// Get replies of a comment
// -----------------------------
export const getRepliesByComment = async (req, res, next) => {
  try {
    const parentCommentId = Number(req.query.parentCommentId);
    if (!parentCommentId)
      return res.status(400).json({ success: false, error: "parentCommentId is required" });

    const limit = Number(req.query.limit) || 5;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    const userId = req.user?.id || 0;

    const replies = await prisma.comment.findMany({
      where: { parentCommentId },
      orderBy: { createdAt: "asc" },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        user: { select: { id: true, studentId: true, name: true, avatar: true, role: true } },
        likedBy: { select: { id: true } },
        _count: { select: { replies: true, reports: true, likedBy: true } },
      },
    });

    const nextCursor = replies.length === limit ? replies[replies.length - 1].id : null;

    res.status(200).json({
      success: true,
      data: {
        replies: replies.map((r) => formatComment(r, userId)),
        nextCursor,
      },
    });
  } catch (err) {
    console.error("Error fetching replies:", err);
    next(err);
  }
};

// -----------------------------
// Toggle like/unlike comment
// -----------------------------
export const toggleLikeComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.commentId);
    const userId = req.user.id;

    const alreadyLiked = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { likedBy: { where: { id: userId }, select: { id: true } } },
    });

    const liked = alreadyLiked.likedBy.length > 0;

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: liked
        ? { likedBy: { disconnect: { id: userId } } }
        : { likedBy: { connect: { id: userId } } },
      include: { _count: { select: { likedBy: true } } },
    });

    res.status(200).json({
      success: true,
      likesCount: updatedComment._count.likedBy,
      userLiked: !liked,
    });
  } catch (err) {
    console.error("Error toggling like:", err);
    next(err);
  }
};

// -----------------------------
// Report comment
// -----------------------------
export const reportComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.commentId);
    const userId = req.user.id;

    const existingReport = await prisma.report.findFirst({
      where: { commentId, reportedById: userId },
    });

    if (existingReport)
      return res.status(400).json({ success: false, error: "You already reported this comment" });

    await prisma.report.create({
      data: {
        commentId,
        reportedById: userId,
        reason: req.body.reason || "OTHER",
        description: req.body.description || null,
      },
    });

    res.status(200).json({ success: true, message: "Comment reported successfully" });
  } catch (err) {
    console.error("Error reporting comment:", err);
    next(err);
  }
};

// -----------------------------
// Delete comment and all its replies
// -----------------------------
export const deleteComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.commentId);
    const userId = req.user.id;
    const role = req.user.role;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true },
    });

    if (!comment) return res.status(404).json({ success: false, error: "Comment not found" });
    if (comment.userId !== userId && role !== "admin")
      return res.status(403).json({ success: false, error: "Unauthorized" });

    // Get question info before deleting for cache invalidation
    const commentToDelete = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { questionId: true, question: { select: { courseId: true } } },
    });

    // Recursive delete using CTE
    await prisma.$executeRaw`
      WITH RECURSIVE comment_tree AS (
        SELECT id FROM "Comment" WHERE id = ${commentId}
        UNION ALL
        SELECT c.id FROM "Comment" c JOIN comment_tree ct ON c."parentCommentId" = ct.id
      )
      DELETE FROM "Comment" WHERE id IN (SELECT id FROM comment_tree);
    `;

    // Invalidate caches to update comment counts
    if (commentToDelete) {
      await invalidateCache("questions:*");
      await invalidateCache(`question:${commentToDelete.questionId}`);
      if (commentToDelete.question?.courseId) {
        await invalidateCache(`courseQuestions:${commentToDelete.question.courseId}:*`);
      }
      await invalidateCache(`userBookmarks:*`);
    }

    res.status(200).json({ success: true, message: "Comment and all its replies deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    next(err);
  }
};
