import prisma from "../prismaClient.js";

// Create comment or reply
export const createComment = async (req, res, next) => {
  try {
    const { questionId, parentCommentId = null, text } = req.body;
    const userId = req.user.id;

    if (!questionId || !text) {
      return res.status(400).json({ error: "Question and text are required" });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        userId,
        questionId,
        parentCommentId,
      },
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

// Get all comments for a question
export const getCommentsByQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { questionId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, studentId: true, avatar: true },
        },
        replies: true,
        likedBy: true,
        reportedBy: true,
      },
    });

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// Toggle like/unlike comment
export const toggleLikeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const existingLike = await prisma.comment.findFirst({
      where: {
        id: commentId,
        likedBy: { some: { id: userId } },
      },
    });

    let updatedComment;
    if (existingLike) {
      // Unlike
      updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: { likedBy: { disconnect: { id: userId } } },
        include: { likedBy: true },
      });
    } else {
      // Like
      updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: { likedBy: { connect: { id: userId } } },
        include: { likedBy: true },
      });
    }

    res.json({ likesCount: updatedComment.likedBy.length });
  } catch (err) {
    next(err);
  }
};

// Report comment
export const reportComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const existingReport = await prisma.comment.findFirst({
      where: {
        id: commentId,
        reportedBy: { some: { id: userId } },
      },
    });

    if (!existingReport) {
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

// Delete comment
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.userId !== userId && role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    res.json({ message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
};
