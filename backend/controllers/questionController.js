// controllers/questionController.js
import prisma from "../prismaClient.js";
import { sanitize } from "../utils/sanitize.js";

// -----------------------------
// GET /questions?page=1&limit=10&search=&sort=&tags=tag1,tag2
// -----------------------------
export const getQuestions = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || "";
    const sort = req.query.sort || "latest";
    const tags = req.query.tags
      ? req.query.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    const examType = req.query.examType?.trim() || "";

    const where = {
      ...(search && { text: { contains: search, mode: "insensitive" } }),
      ...(tags.length && { course: { tags: { hasSome: tags } } }),
      ...(examType && { examType }),
      ...(userId && !isAdmin && { createdById: userId }),
    };

    const orderBy =
      sort === "oldest"
        ? { createdAt: "asc" }
        : sort === "marks_asc"
        ? { marks: "asc" }
        : sort === "marks_desc"
        ? { marks: "desc" }
        : { createdAt: "desc" };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, studentId: true, name: true, email: true },
          },
          course: { select: { id: true, name: true, tags: true } },
          likedBy: { select: { id: true } },
          bookmarkedBy: { select: { id: true } },
          _count: { select: { likedBy: true, reports: true, comments: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    const formatted = questions.map((q) => ({
      ...q,
      likesCount: q._count.likedBy,
      reportsCount: q._count.reports,
      commentsCount: q._count.comments,
      bookmarksCount: q.bookmarkedBy.length,
      creatorName:
        q.createdBy?.studentId ||
        q.createdBy?.name ||
        q.createdBy?.email ||
        "Unknown",
      tags: q.course?.tags || [],
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

// -----------------------------
// GET /questions/:id
// -----------------------------
export const getQuestionById = async (req, res, next) => {
  try {
    const questionId = Number(req.params.id);

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        createdBy: {
          select: { id: true, studentId: true, name: true, email: true },
        },
        likedBy: { select: { id: true } },
        bookmarkedBy: { select: { id: true } },
        course: { select: { id: true, name: true, tags: true } },
        _count: { select: { likedBy: true, reports: true, comments: true } },
      },
    });

    if (!question)
      return res
        .status(404)
        .json({ success: false, error: "Question not found" });

    res.status(200).json({
      ...question,
      likesCount: question._count.likedBy,
      reportsCount: question._count.reports,
      commentsCount: question._count.comments,
      bookmarksCount: question.bookmarkedBy.length,
      creatorName:
        question.createdBy?.studentId ||
        question.createdBy?.name ||
        question.createdBy?.email ||
        "Unknown",
      tags: question.course?.tags || [],
      examType: question.examType || null,
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------
// GET /courses/:courseId/questions
// -----------------------------
export const getQuestionsByCourse = async (req, res, next) => {
  try {
    const courseId = Number(req.params.courseId);
    const examType = req.query.examType?.trim() || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "latest";
    const tags = req.query.tags
      ? req.query.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    const where = {
      courseId,
      ...(examType && { examType }),
      ...(tags.length && { course: { tags: { hasSome: tags } } }),
    };

    const orderBy =
      sort === "oldest"
        ? { createdAt: "asc" }
        : sort === "marks_asc"
        ? { marks: "asc" }
        : sort === "marks_desc"
        ? { marks: "desc" }
        : { createdAt: "desc" };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, studentId: true, name: true, email: true },
          },
          course: { select: { id: true, name: true, tags: true } },
          likedBy: { select: { id: true } },
          bookmarkedBy: { select: { id: true } },
          _count: { select: { likedBy: true, reports: true, comments: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    const formatted = questions.map((q) => ({
      ...q,
      likesCount: q._count.likedBy,
      reportsCount: q._count.reports,
      commentsCount: q._count.comments,
      bookmarksCount: q.bookmarkedBy.length,
      creatorName:
        q.createdBy?.studentId ||
        q.createdBy?.name ||
        q.createdBy?.email ||
        "Unknown",
      tags: q.course?.tags || [],
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

// -----------------------------
// POST /questions
// -----------------------------
export const createQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { text, type, options, marks, courseId, examType, image } = req.body;

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
    if (!examType)
      return res
        .status(400)
        .json({ success: false, error: "Exam type is required" });

    const validExamTypes = [
      "Quiz 1",
      "Quiz 2",
      "Midterm",
      "Additional Quiz",
      "Final",
    ];
    if (!validExamTypes.includes(examType))
      return res
        .status(400)
        .json({ success: false, error: "Invalid exam type" });

    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    const cleanText = sanitize(text);
let parsedOptions = null;

if (type === "MCQ") {
  if (!options || !Array.isArray(options) || options.length !== 4) {
    return res.status(400).json({
      success: false,
      error: "MCQ must have exactly 4 options",
    });
  }
  parsedOptions = options.map(opt => sanitize(opt.trim())).filter(Boolean);
  if (parsedOptions.length !== 4) {
    return res.status(400).json({
      success: false,
      error: "All 4 MCQ options must be non-empty",
    });
  }
}


    const question = await prisma.question.create({
      data: {
        type,
        text: cleanText,
        options: parsedOptions,
        marks: Number(marks),
        image: image?.trim() || null,
        examType,
        course: { connect: { id: Number(courseId) } },
        createdBy: { connect: { id: userId } },
      },
      include: {
        course: { select: { id: true, name: true, tags: true } },
        createdBy: {
          select: { id: true, studentId: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: {
        ...question,
        creatorName:
          question.createdBy?.studentId ||
          question.createdBy?.name ||
          question.createdBy?.email ||
          "Unknown",
        tags: question.course?.tags || [],
        likesCount: 0,
        commentsCount: 0,
        bookmarksCount: 0,
        reportsCount: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------
// GET user bookmarks
// -----------------------------
export const getUserBookmarks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where: { bookmarkedBy: { some: { id: userId } } },
        include: {
          createdBy: {
            select: { id: true, studentId: true, name: true, email: true },
          },
          course: { select: { id: true, name: true, tags: true } },
          likedBy: { select: { id: true } },
          bookmarkedBy: { select: { id: true } },
          _count: { select: { likedBy: true, reports: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.question.count({
        where: { bookmarkedBy: { some: { id: userId } } },
      }),
    ]);

    const formatted = questions.map((q) => ({
      ...q,
      likesCount: q._count.likedBy,
      reportsCount: q._count.reports,
      commentsCount: q._count.comments,
      bookmarksCount: q.bookmarkedBy.length,
      creatorName:
        q.createdBy?.studentId ||
        q.createdBy?.name ||
        q.createdBy?.email ||
        "Unknown",
      tags: q.course?.tags || [],
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

// -----------------------------
// LIKE / BOOKMARK / REPORT / DELETE
// -----------------------------
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

    const hasLiked = question.likedBy.some((u) => u.id === userId);
    await prisma.question.update({
      where: { id: questionId },
      data: hasLiked
        ? { likedBy: { disconnect: { id: userId } } }
        : { likedBy: { connect: { id: userId } } },
    });

    const updated = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        likedBy: { select: { id: true } },
        bookmarkedBy: { select: { id: true } },
        createdBy: {
          select: { id: true, studentId: true, name: true, email: true },
        },
        course: { select: { id: true, name: true, tags: true } },
        _count: { select: { likedBy: true, reports: true, comments: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: hasLiked ? "Like removed" : "Question liked",
      data: {
        ...updated,
        likesCount: updated._count.likedBy,
        reportsCount: updated._count.reports,
        commentsCount: updated._count.comments,
        bookmarksCount: updated.bookmarkedBy.length,
        creatorName:
          updated.createdBy?.studentId ||
          updated.createdBy?.name ||
          updated.createdBy?.email ||
          "Unknown",
        tags: updated.course?.tags || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

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

    const hasBookmarked = question.bookmarkedBy.some((u) => u.id === userId);
    await prisma.question.update({
      where: { id: questionId },
      data: hasBookmarked
        ? { bookmarkedBy: { disconnect: { id: userId } } }
        : { bookmarkedBy: { connect: { id: userId } } },
    });

    const updated = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        likedBy: { select: { id: true } },
        bookmarkedBy: { select: { id: true } },
        createdBy: {
          select: { id: true, studentId: true, name: true, email: true },
        },
        course: { select: { id: true, name: true, tags: true } },
        _count: { select: { likedBy: true, reports: true, comments: true } }, // ✅ updated
      },
    });

    res.status(200).json({
      success: true,
      message: hasBookmarked ? "Bookmark removed" : "Question bookmarked",
      data: {
        ...updated,
        likesCount: updated._count.likedBy,
        reportsCount: updated._count.reports,
        commentsCount: updated._count.comments,
        bookmarksCount: updated.bookmarkedBy.length,
        creatorName:
          updated.createdBy?.studentId ||
          updated.createdBy?.name ||
          updated.createdBy?.email ||
          "Unknown",
        tags: updated.course?.tags || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

export const reportQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const questionId = Number(req.params.id);
    const reason = req.body.reason?.trim();
    if (!reason)
      return res
        .status(400)
        .json({ success: false, error: "Reason is required" });

    const report = await prisma.report.create({
      data: { userId, questionId, reason },
    });
    res
      .status(201)
      .json({
        success: true,
        message: "Question reported successfully",
        data: report,
      });
  } catch (err) {
    next(err);
  }
};

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
      return res
        .status(403)
        .json({
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
