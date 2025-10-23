import prisma from "../prismaClient.js";

// GET /dashboard/stats - Get dashboard statistics based on user role
export const getDashboardStats = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (user.role === "admin") {
      // Admin: global stats
      const totalUsers = await prisma.user.count().catch(() => 0);
      const totalCourses = await prisma.course.count().catch(() => 0);
      const totalQuestions = await prisma.question.count().catch(() => 0);

      const totalReports = await prisma.question.count({
        where: { reportedBy: { some: {} } },
      }).catch(() => 0);

      const recentQuestions = await prisma.question.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          course: { select: { name: true } },
          createdBy: { select: { name: true, email: true } },
        },
      }).catch(() => []);

      const courseStats = await prisma.course.findMany({
        include: { _count: { select: { questions: true } } },
        orderBy: { createdAt: "desc" },
        take: 3,
      }).catch(() => []);

      return res.json({
        success: true,
        data: {
          totalUsers,
          totalCourses,
          totalQuestions,
          totalReports,
          recentQuestions: recentQuestions.map(q => ({
            id: q.id,
            text: q.text.length > 50 ? q.text.slice(0, 50) + "..." : q.text,
            course: q.course?.name || "N/A",
            createdBy: q.createdBy?.name || q.createdBy?.email || "Unknown",
            createdAt: q.createdAt,
          })),
          courseStats: courseStats.map(c => ({
            id: c.id,
            name: c.name,
            questionCount: c._count.questions || 0,
          })),
        },
      });
    } else {
      // Regular user: personal stats
      const userQuestions = await prisma.question.count({
        where: { createdById: user.id },
      }).catch(() => 0);

      const userBookmarks = await prisma.question.count({
        where: { bookmarkedBy: { some: { id: user.id } } },
      }).catch(() => 0);

      const totalCourses = await prisma.course.count().catch(() => 0);

      const recentQuestions = await prisma.question.findMany({
        where: { createdById: user.id },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { course: { select: { name: true } } },
      }).catch(() => []);

      const courseStats = await prisma.course.findMany({
        include: { _count: { select: { questions: true } } },
        orderBy: { createdAt: "desc" },
        take: 3,
      }).catch(() => []);

      return res.json({
        success: true,
        data: {
          userQuestions,
          userBookmarks,
          totalCourses,
          recentQuestions: recentQuestions.map(q => ({
            id: q.id,
            text: q.text.length > 50 ? q.text.slice(0, 50) + "..." : q.text,
            course: q.course?.name || "N/A",
            createdAt: q.createdAt,
          })),
          courseStats: courseStats.map(c => ({
            id: c.id,
            name: c.name,
            questionCount: c._count.questions || 0,
          })),
        },
      });
    }
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ success: false, error: "Failed to fetch dashboard stats" });
  }
};
