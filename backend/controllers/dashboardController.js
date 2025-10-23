import prisma from "../prismaClient.js";

// GET /dashboard/stats - Get dashboard statistics based on user role
export const getDashboardStats = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role === "admin") {
      // Admin gets global statistics
      const [
        totalUsers,
        totalCourses,
        totalQuestions,
        totalReports,
        recentQuestions,
        courseStats,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.question.count(),
        prisma.question.count({
          where: {
            reportedBy: {
              some: {},
            },
          },
        }),
        prisma.question.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            course: { select: { name: true } },
            createdBy: { select: { name: true, email: true } },
          },
        }),
        prisma.course.findMany({
          include: {
            _count: {
              select: { questions: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          totalCourses,
          totalQuestions,
          totalReports,
          recentQuestions: recentQuestions.map((q) => ({
            id: q.id,
            text: q.text.substring(0, 50) + "...",
            course: q.course.name,
            createdBy: q.createdBy.name || q.createdBy.email,
            createdAt: q.createdAt,
          })),
          courseStats: courseStats.map((c) => ({
            id: c.id,
            name: c.name,
            questionCount: c._count.questions,
          })),
        },
      });
    } else {
      // Regular users get their personal statistics
      const [
        userQuestions,
        userBookmarks,
        totalCourses,
        recentQuestions,
        courseStats,
      ] = await Promise.all([
        prisma.question.count({
          where: { createdById: user.id },
        }),
        prisma.question.count({
          where: {
            bookmarkedBy: {
              some: { id: user.id },
            },
          },
        }),
        prisma.course.count(),
        prisma.question.findMany({
          where: { createdById: user.id },
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            course: { select: { name: true } },
          },
        }),
        prisma.course.findMany({
          include: {
            _count: {
              select: { questions: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        }),
      ]);

      res.json({
        success: true,
        data: {
          userQuestions,
          userBookmarks,
          totalCourses,
          recentQuestions: recentQuestions.map((q) => ({
            id: q.id,
            text: q.text.substring(0, 50) + "...",
            course: q.course.name,
            createdAt: q.createdAt,
          })),
          courseStats: courseStats.map((c) => ({
            id: c.id,
            name: c.name,
            questionCount: c._count.questions,
          })),
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

