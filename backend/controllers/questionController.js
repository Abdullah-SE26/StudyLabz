import prisma from "../prismaClient.js";
import { sanitize } from "../utils/sanitize.js";

// ✅ GET /questions?page=1&limit=10&search=keyword
export const getQuestions = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where: {
          text: { contains: search, mode: "insensitive" },
        },
        include: {
          user: { select: { id: true, name: true } },
          _count: { select: { likes: true, reports: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.question.count({
        where: {
          text: { contains: search, mode: "insensitive" },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: questions,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ POST /questions
export const createQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      text,
      type,
      options,
      marks,
      courseId,
      examId,
      image,
    } = req.body;

    // --- 1️⃣ Validation ---
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: "Question text is required" });
    }

    if (!type || !["MCQ", "Essay"].includes(type)) {
      return res.status(400).json({ success: false, error: "Invalid question type" });
    }

    if (!marks || isNaN(marks) || marks <= 0) {
      return res.status(400).json({ success: false, error: "Marks must be a positive number" });
    }

    if (!courseId) {
      return res.status(400).json({ success: false, error: "Course ID is required" });
    }

    // --- 2️⃣ Verify Course & Exam existence ---
    const course = await prisma.course.findUnique({ where: { id: Number(courseId) } });
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    if (examId) {
      const exam = await prisma.exam.findUnique({ where: { id: Number(examId) } });
      if (!exam) {
        return res.status(404).json({ success: false, error: "Exam not found" });
      }
    }

    // --- 3️⃣ Sanitize the text ---
    const cleanText = sanitize(text);

    // --- 4️⃣ Handle options for MCQ only ---
    let parsedOptions = null;
    if (type === "MCQ") {
      if (!options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          success: false,
          error: "MCQ questions must have at least two options",
        });
      }
      parsedOptions = options.map((opt) => sanitize(opt));
    }

    // --- 5️⃣ Create the Question ---
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
        createdBy: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: question,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ POST /questions/:id/like (Toggle Like)
export const toggleLikeQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const questionId = Number(req.params.id);

    const existingLike = await prisma.like.findFirst({
      where: { userId, questionId },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return res.status(200).json({
        success: true,
        liked: false,
        message: "Like removed",
      });
    }

    await prisma.like.create({
      data: { userId, questionId },
    });

    res.status(200).json({
      success: true,
      liked: true,
      message: "Question liked successfully",
    });
  } catch (err) {
    next(err);
  }
};

// ✅ POST /questions/:id/report
export const reportQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const questionId = Number(req.params.id);
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, error: "Reason is required" });
    }

    const report = await prisma.report.create({
      data: {
        userId,
        questionId,
        reason: reason.trim(),
      },
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

// ✅ DELETE /questions/:id
export const deleteQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const questionId = Number(req.params.id);

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found" });
    }

    if (question.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to delete this question",
      });
    }

    await prisma.question.delete({ where: { id: questionId } });

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
