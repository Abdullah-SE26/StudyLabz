import prisma from "../prismaClient.js";

// Create a comment or reply
export const createCommentService = async (userId, questionId, text, parentCommentId = null) => {
  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) throw new Error("Question not found");

  return await prisma.comment.create({
    data: {
      text,
      userId,
      questionId,
      parentCommentId,
    },
  });
};

// Get all comments for a question
export const getCommentsByQuestionService = async (questionId) => {
  return await prisma.comment.findMany({
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
};

// Toggle like/unlike a comment
export const toggleLikeCommentService = async (userId, commentId) => {
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

  return { likesCount: updatedComment.likedBy.length };
};

// Report a comment
export const reportCommentService = async (userId, commentId) => {
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

  return { message: "Comment reported successfully" };
};

// Delete a comment
export const deleteCommentService = async (userId, role, commentId) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error("Comment not found");

  if (comment.userId !== userId && role !== "admin") {
    throw new Error("Unauthorized");
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return { message: "Comment deleted" };
};
