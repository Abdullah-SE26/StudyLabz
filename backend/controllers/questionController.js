import prisma from "../prismaClient.js";

// GET /questions
export const getQuestions = async (req, res, next) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        user: { select: { id: true, name: true } },
        likes: true,
        reports: true,
      },
      orderBy: { createdAt: "desc" },
    });
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

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const question = await prisma.question.create({
      data: {
        text,
        userId,
      },
    });

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

    const existingLike = await prisma.like.findFirst({
      where: { userId, questionId },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      res.json({ liked: false });
    } else {
      await prisma.like.create({ data: { userId, questionId } });
      res.json({ liked: true });
    }
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

    if (!reason) {
      return res.status(400).json({ error: "Reason is required" });
    }

    const report = await prisma.report.create({
      data: {
        userId,
        questionId,
        reason,
      },
    });

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

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (question.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this question" });
    }

    await prisma.question.delete({ where: { id: questionId } });

    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    next(err);
  }
};
