import prisma from '../prismaClient.js';

// Create a new report
export const createReport = async (req, res) => {
  const { reason, description, questionId, commentId } = req.body;
  const reportedById = req.user.id; // Assuming auth middleware populates req.user

  if (!reason) {
    return res.status(400).json({ message: 'Reason for report is required.' });
  }

  if (!questionId && !commentId) {
    return res.status(400).json({ message: 'Either questionId or commentId must be provided.' });
  }

  if (questionId && commentId) {
    return res.status(400).json({ message: 'Cannot report both a question and a comment simultaneously.' });
  }

  try {
    const report = await prisma.report.create({
      data: {
        reportedById,
        reason,
        description,
        questionId: questionId ? parseInt(questionId, 10) : null,
        commentId: commentId ? parseInt(commentId, 10) : null,
      },
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Failed to create report.', error: error.message });
  }
};

// Get all reports (Admin only)
export const getAllReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reportedBy: {
          select: { id: true, name: true, email: true },
        },
        question: {
          select: { id: true, text: true, courseId: true },
        },
        comment: {
          select: { id: true, text: true, questionId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Failed to fetch reports.', error: error.message });
  }
};

// Update report status (Admin only)
export const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status, actionTaken } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  const validStatuses = ['PENDING', 'REVIEWED', 'RESOLVED', 'REJECTED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const updatedReport = await prisma.report.update({
      where: { id: parseInt(id, 10) },
      data: {
        status,
        actionTaken,
        resolvedAt: ['RESOLVED', 'REJECTED'].includes(status) ? new Date() : null,
      },
    });

    res.status(200).json(updatedReport);
  } catch (error) {
    console.error(`Error updating report ${id}:`, error);
    res.status(500).json({ message: 'Failed to update report status.', error: error.message });
  }
};
