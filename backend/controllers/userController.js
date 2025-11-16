import prisma from '../prismaClient.js';

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        include: {
          _count: {
            select: {
              createdQuestions: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count(),
    ]);

    res.status(200).json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

export const blockUser = async (req, res) => {
  const { userId } = req.params;
  const { blockUntil } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        blockedUntil: blockUntil ? new Date(blockUntil) : null,
        sessionVersion: { increment: 1 }, 
      },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error: error.message });
  }
};


export const logoutUser = async (req, res) => {
    const { userId } = req.params;
  
    try {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          sessionVersion: {
            increment: 1,
          },
        },
      });
      res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error logging out user', error: error.message });
    }
  };