import prisma from "../prismaClient.js";

// Get all questions (with optional pagination later)
export const getQuestionsService = async () => {
  return await prisma.question.findMany({
    include: {
      user: { select: { id: true, name: true } }, // include author info if you want
      likes: true,
      reports: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// Create a new question
export const createQuestionService = async (userId, text) => {
  return await prisma.question.create({
    data: {
      text,
      userId,
    },
  });
};

// Toggle like/unlike on a question
export const toggleLikeQuestionService = async (userId, questionId) => {
  const existingLike = await prisma.like.findFirst({
    where: { userId, questionId },
  });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
    return { liked: false };
  } else {
    await prisma.like.create({ data: { userId, questionId } });
    return { liked: true };
  }
};

// Report a question
export const reportQuestionService = async (userId, questionId, reason) => {
  return await prisma.report.create({
    data: {
      userId,
      questionId,
      reason,
    },
  });
};

// Delete a question
export const deleteQuestionService = async (userId, questionId) => {
  const question = await prisma.question.findUnique({ where: { id: questionId } });

  if (!question) {
    throw new Error("Question not found");
  }

  // Only the owner can delete
  if (question.userId !== userId) {
    throw new Error("Unauthorized to delete this question");
  }

  return await prisma.question.delete({ where: { id: questionId } });
};
