import prisma from "../prismaClient.js";
import { subDays, formatISO } from "date-fns";

export const getDashboardStats = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, error: "Unauthorized" });

    const today = new Date();
    const startDate = subDays(today, 6); // last 7 days including today
    const formatDate = (date) => formatISO(date, { representation: "date" }); // YYYY-MM-DD

    // Helper to aggregate records per day
    const aggregatePerDay = (records) =>
      [...Array(7)].map((_, i) => {
        const date = formatDate(subDays(today, 6 - i));
        const count = records.filter(r => formatDate(r.createdAt) === date).length;
        return { date, count };
      });

    if (user.role === "admin") {
      // Admin stats
      const [totalUsers, totalCourses, totalQuestions, totalReports, usersRaw, questionsRaw] =
        await Promise.all([
          prisma.user.count(),
          prisma.course.count(),
          prisma.question.count(),
          prisma.question.count({ where: { reportedBy: { some: {} } } }),
          prisma.user.findMany({ where: { createdAt: { gte: startDate } }, select: { createdAt: true } }),
          prisma.question.findMany({ where: { createdAt: { gte: startDate } }, select: { createdAt: true } }),
        ]);

      const dailyUsers = aggregatePerDay(usersRaw);
      const dailyQuestions = aggregatePerDay(questionsRaw);

      return res.json({
        success: true,
        data: { totalUsers, totalCourses, totalQuestions, totalReports, dailyUsers, dailyQuestions },
      });
    } else {
      // Regular user stats
      const [userQuestions, userBookmarks, totalCourses, userQuestionsRaw, bookmarksRaw] =
        await Promise.all([
          prisma.question.count({ where: { createdById: user.id } }),
          prisma.question.count({ where: { bookmarkedBy: { some: { id: user.id } } } }),
          prisma.course.count(),
          prisma.question.findMany({ where: { createdById: user.id, createdAt: { gte: startDate } }, select: { createdAt: true } }),
          prisma.question.findMany({ where: { bookmarkedBy: { some: { id: user.id } }, createdAt: { gte: startDate } }, select: { createdAt: true } }),
        ]);

      const dailyUserQuestions = aggregatePerDay(userQuestionsRaw);
      const dailyBookmarks = aggregatePerDay(bookmarksRaw);

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
