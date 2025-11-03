// controllers/questionController.js
import prisma from "../prismaClient.js";
import { sanitize } from "../utils/sanitize.js";

// GET /questions?page=1&limit=10&search=keyword
export const getQuestions = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where: { text: { contains: search, mode: "insensitive" } },
        include: {
          createdBy: { select: { id: true, studentId: true } },
          likedBy: { select: { id: true } },
          bookmarkedBy: { select: { id: true } },
          course: { select: { id: true, name: true } },
          exam: { select: { id: true, title: true } },
          _count: { select: { likes: true, reports: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.question.count({
        where: { text: { contains: search, mode: "insensitive" } },
      }),
    ]);

    const formatted = questions.map((q) => ({
      ...q,
      commentsCount: q._count.comments,
      creatorName: q.createdBy?.studentId || "Unknown",
    }));

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};

// GET /courses/:courseId/questions?examIds=1,2,3&page=1&limit=10
export const getQuestionsByCourse = async (req, res, next) => {
  try {
    const courseId = Number(req.params.courseId);
    const examIds = req.query.examIds
      ? req.query.examIds.split(",").map(Number)
      : [];
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course)
      return res.status(404).json({ success: false, error: "Course not found" });

    // Build filter
    const where = { courseId };

    if (examIds.length > 0) {
      where.examId = { in: examIds };
    }

    const orderBy = req.query.sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

    console.log("Fetching questions:", examIds, orderBy, page);

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          createdBy: { select: { id: true, studentId: true } },
          likedBy: { select: { id: true } },
          bookmarkedBy: { select: { id: true } },
          exam: { select: { id: true, title: true } },
          _count: { select: { comments: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    console.log("Fetched questions:", questions.map(q => q.id));

    const formatted = questions.map((q) => ({
      ...q,
      commentsCount: q._count.comments,
      creatorName: q.createdBy?.studentId || "Unknown",
      marks: q.marks,
    }));

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: formatted,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// GET /questions/exam/:id
export const getQuestionsByExam = async (req, res, next) => {
  try {
    const examId = Number(req.params.id);

    const questions = await prisma.question.findMany({
      where: { examId },
      include: {
        createdBy: { select: { id: true, studentId: true } },
        course: { select: { id: true, name: true } },
        exam: { select: { id: true, title: true } },
        bookmarkedBy: { where: { id: req.user.id }, select: { id: true } },
        likedBy: { where: { id: req.user.id }, select: { id: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = questions.map((q) => ({
      ...q,
      commentsCount: q._count.comments,
      creatorName: q.createdBy?.studentId || "Unknown",
      marks: q.marks,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
};

// POST /questions
export const createQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { text, type, options, marks, courseId, examId, image } = req.body;

    if (!text?.trim())
      return res
        .status(400)
        .json({ success: false, error: "Question text is required" });
    if (!["MCQ", "Essay"].includes(type))
      return res
        .status(400)
        .json({ success: false, error: "Invalid question type" });
    if (!marks || isNaN(marks) || marks <= 0)
      return res
        .status(400)
        .json({ success: false, error: "Marks must be positive" });
    if (!courseId)
      return res
        .status(400)
        .json({ success: false, error: "Course ID is required" });

    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    if (examId) {
      const exam = await prisma.exam.findUnique({
        where: { id: Number(examId) },
      });
      if (!exam)
        return res
          .status(404)
          .json({ success: false, error: "Exam not found" });
    }

    const cleanText = sanitize(text);

    let parsedOptions = null;
    if (type === "MCQ") {
      if (!options?.length || options.length < 2)
        return res.status(400).json({
          success: false,
          error: "MCQ must have at least two options",
        });
      parsedOptions = options.map(sanitize);
    }

    const question = await prisma.question.create({
      data: {
        type,
        text: cleanText,
        options: parsedOptions,
        marks: Number(marks),
        image: image?.trim() || null,
        course: { connect: { id: Number(courseId) } },
        exam: examId ? { connect: { id: Number(examId) } } : undefined,
        createdBy: { connect: { id: userId } },
      },
      include: {
        course: { select: { id: true, name: true } },
        exam: { select: { id: true, title: true } },
        createdBy: { select: { id: true, studentId: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: {
        ...question,
        creatorName: question.createdBy?.studentId || "Unknown",
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /questions/:id/like
export const toggleLikeQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const questionId = Number(req.params.id);

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { likedBy: true },
    });
    if (!question)
      return res
        .status(404)
        .json({ success: false, error: "Question not found" });

    const hasLiked = question.likedBy.some((user) => user.id === userId);

    await prisma.question.update({
      where: { id: questionId },
      data: hasLiked
        ? { likedBy: { disconnect: { id: userId } } }
        : { likedBy: { connect: { id: userId } } },
    });

    const updated = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        likedBy: { select: { id: true, studentId: true } },
        bookmarkedBy: { select: { id: true, studentId: true } },
        createdBy: { select: { id: true, studentId: true } },
        course: { select: { id: true, name: true } },
        exam: { select: { id: true, title: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: hasLiked ? "Like removed" : "Question liked",
      data: {
        ...updated,
        creatorName: updated.createdBy?.studentId || "Unknown",
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /questions/:id/bookmark
export const toggleBookmarkQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const questionId = Number(req.params.id);

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { bookmarkedBy: true },
    });
    if (!question)
      return res
        .status(404)
        .json({ success: false, error: "Question not found" });

    const hasBookmarked = question.bookmarkedBy.some(
      (user) => user.id === userId
    );

    await prisma.question.update({
      where: { id: questionId },
      data: hasBookmarked
        ? { bookmarkedBy: { disconnect: { id: userId } } }
        : { bookmarkedBy: { connect: { id: userId } } },
    });

    const updated = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        likedBy: { select: { id: true, studentId: true } },
        bookmarkedBy: { select: { id: true, studentId: true } },
        createdBy: { select: { id: true, studentId: true } },
        course: { select: { id: true, name: true } },
        exam: { select: { id: true, title: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: hasBookmarked ? "Bookmark removed" : "Question bookmarked",
      data: {
        ...updated,
        creatorName: updated.createdBy?.studentId || "Unknown",
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /questions/:id/report
export const reportQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const questionId = Number(req.params.id);
    const { reason } = req.body;

    if (!reason?.trim())
      return res
        .status(400)
        .json({ success: false, error: "Reason is required" });

    const report = await prisma.report.create({
      data: { userId, questionId, reason: reason.trim() },
    });

    res.status(201).json({
      success: true,
      message: "Question reported successfully",
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

// GET /questions/:id
export const getQuestionById = async (req, res, next) => {
  try {
    const questionId = Number(req.params.id);

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        createdBy: { select: { id: true, studentId: true } },
        likedBy: { select: { id: true } },
        bookmarkedBy: { select: { id: true } },
        course: { select: { id: true, name: true } },
        exam: { select: { id: true, title: true } },
        _count: { select: { comments: true } },
      },
    });

    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found" });
    }

    const formatted = {
      ...question,
      commentsCount: question._count.comments,
      creatorName: question.createdBy?.studentId || "Unknown",
    };

    res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
};

// DELETE /questions/:id
export const deleteQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const questionId = Number(req.params.id);

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, createdById: true },
    });
    if (!question)
      return res
        .status(404)
        .json({ success: false, error: "Question not found" });
    if (question.createdById !== userId)
      return res.status(403).json({
        success: false,
        error: "Unauthorized to delete this question",
      });

    await prisma.question.delete({ where: { id: questionId } });

    res
      .status(200)
      .json({ success: true, message: "Question deleted successfully" });
  } catch (err) {
    next(err);
  }
};
