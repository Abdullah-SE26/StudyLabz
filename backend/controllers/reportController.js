import prisma from "../prismaClient.js";

// -----------------------------
// Create a new report
// -----------------------------
export const createReport = async (req, res) => {
  const { reason, description, questionId, commentId } = req.body;
  const reportedById = req.user.id;

  if (!reason) {
    return res.status(400).json({ success: false, message: "Reason for report is required." });
  }

  if (!questionId && !commentId) {
    return res.status(400).json({ success: false, message: "Either questionId or commentId must be provided." });
  }

  if (questionId && commentId) {
    return res.status(400).json({ success: false, message: "Cannot report both a question and a comment simultaneously." });
  }

  try {
    // Validate that the referenced item exists
    if (questionId) {
      const questionExists = await prisma.question.findUnique({ where: { id: parseInt(questionId) } });
      if (!questionExists) return res.status(404).json({ success: false, message: "Question not found." });
    }

    if (commentId) {
      const commentExists = await prisma.comment.findUnique({ where: { id: parseInt(commentId) } });
      if (!commentExists) return res.status(404).json({ success: false, message: "Comment not found." });
    }

    const report = await prisma.report.create({
      data: {
        reportedById,
        reason,
        description,
        questionId: questionId ? parseInt(questionId, 10) : null,
        commentId: commentId ? parseInt(commentId, 10) : null,
      },
    });

    return res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error("Error creating report:", error);
    return res.status(500).json({ success: false, message: "Failed to create report.", error: error.message });
  }
};

// -----------------------------
// Get all reports (Admin only) with pagination + filtering
// -----------------------------
export const getAllReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reportedBy: { select: { id: true, name: true, email: true } },
          question: { select: { id: true, text: true, courseId: true } },
          comment: { select: { id: true, text: true, questionId: true } },
          resolvedBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.report.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch reports.", error: error.message });
  }
};

// -----------------------------
// Update report status (Admin only)
// -----------------------------
export const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status, actionTaken } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: "Status is required." });
  }

  const validStatuses = ["PENDING", "REVIEWED", "RESOLVED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  try {
    const updatedReport = await prisma.report.update({
      where: { id: parseInt(id, 10) },
      data: {
        status,
        actionTaken,
        resolvedAt: ["RESOLVED", "REJECTED"].includes(status) ? new Date() : null,
        resolvedById: ["RESOLVED", "REJECTED"].includes(status) ? req.user.id : null,
      },
      include: {
        reportedBy: true,
        resolvedBy: true,
      },
    });

    return res.status(200).json({ success: true, data: updatedReport });
  } catch (error) {
    console.error(`Error updating report ${id}:`, error);
    return res.status(500).json({ success: false, message: "Failed to update report status.", error: error.message });
  }
};

// -----------------------------
// Delete a report (Admin only)
// -----------------------------
export const deleteReport = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.report.delete({
      where: { id: parseInt(id, 10) },
    });

    return res.status(200).json({ success: true, message: "Report deleted successfully." });
  } catch (error) {
    console.error(`Error deleting report ${id}:`, error);
    return res.status(500).json({ success: false, message: "Failed to delete report.", error: error.message });
  }
};
