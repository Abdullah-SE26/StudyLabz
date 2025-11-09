import prisma from "../prismaClient.js";
import { subDays, formatISO } from "date-fns";

export const getDashboardStats = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, error: "Unauthorized" });

    const formatDate = (date) => formatISO(date, { representation: "date" });

    const aggregateAllTime = (records) => {
      const aggregated = records.reduce((acc, record) => {
        const date = formatDate(record.createdAt);
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(aggregated)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    if (user.role === "admin") {
      const [totalUsers, totalCourses, totalQuestions, totalReports, usersRaw, questionsRaw] =
        await Promise.all([
          prisma.user.count(),
          prisma.course.count(),
          prisma.question.count(),
          prisma.question.count({ where: { reportedBy: { some: {} } } }),
          prisma.user.findMany({ select: { createdAt: true } }),
          prisma.question.findMany({ select: { createdAt: true } }),
        ]);

      const dailyUsers = aggregateAllTime(usersRaw);
      const dailyQuestions = aggregateAllTime(questionsRaw);

      return res.json({
        success: true,
        data: { totalUsers, totalCourses, totalQuestions, totalReports, dailyUsers, dailyQuestions },
      });
    } else {
      const [userQuestions, userBookmarks, totalCourses, userQuestionsRaw, bookmarksRaw] =
        await Promise.all([
          prisma.question.count({ where: { createdById: user.id } }),
          prisma.question.count({ where: { bookmarkedBy: { some: { id: user.id } } } }),
          prisma.course.count(),
          prisma.question.findMany({ where: { createdById: user.id }, select: { createdAt: true } }),
          prisma.question.findMany({ where: { bookmarkedBy: { some: { id: user.id } } }, select: { createdAt: true } }),
        ]);

      const dailyUserQuestions = aggregateAllTime(userQuestionsRaw);
      const dailyBookmarks = aggregateAllTime(bookmarksRaw);

      return res.json({
        success: true,
        data: { userQuestions, userBookmarks, totalCourses, dailyUserQuestions, dailyBookmarks },
      });
    }
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ success: false, error: "Failed to fetch dashboard stats" });
  }
};
