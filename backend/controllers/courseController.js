import prisma from "../prismaClient.js";

// GET /courses - get all courses
export const getCourses = async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        questions: { select: { id: true, text: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(courses);
  } catch (err) {
    next(err);
  }
};

// POST /courses - create a course (admin only)
export const createCourse = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== "admin") {
      return res.status(403).json({ error: "Only admins can create courses" });
    }

    if (!name || !code) {
      return res.status(400).json({ error: "Name and code are required" });
    }

    const existing = await prisma.course.findFirst({
      where: { OR: [{ name }, { code }] },
    });
    if (existing) {
      return res.status(400).json({ error: "Course name or code already exists" });
    }

    const course = await prisma.course.create({
      data: {
        name,
        code,
        description,
        createdById: userId,
      },
    });

    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

// DELETE /courses/:id - admin only
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = req.user.role;

    if (role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete courses" });
    }

    const existing = await prisma.course.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Course not found" });
    }

    await prisma.course.delete({ where: { id: Number(id) } });

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
};
