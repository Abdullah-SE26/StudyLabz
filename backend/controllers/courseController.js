import prisma from "../prismaClient.js";

//GET /courses
export const getCourses = async (req, res, next) => {
  try {
    const search = req.query.search?.trim() || "";
    const tags = req.query.tags?.trim() || "";
    const sort = req.query.sort || "latest";

    const where = {};

    // Search by name OR tags if search exists
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { tags: { has: search } }, // check if tags array contains the search term
      ];
    }

    // Filter by selected tags (if any)
    if (tags) {
      const tagsArray = tags.split(",").filter(Boolean);
      if (tagsArray.length > 0) {
        where.AND = tagsArray.map(tag => ({ tags: { has: tag } }));
      }
    }

    let orderBy;
    if (sort === "latest") orderBy = { createdAt: "desc" };
    else if (sort === "oldest") orderBy = { createdAt: "asc" };
    else if (sort === "name_asc") orderBy = { name: "asc" };
    else if (sort === "name_desc") orderBy = { name: "desc" };

    const courses = await prisma.course.findMany({
      where,
      orderBy,
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });

    res.json(courses);
  } catch (err) {
    next(err);
  }
};


// POST /courses - create a course (admin only)
export const createCourse = async (req, res, next) => {
  try {
    const { name, code, description, tags } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== "admin") {
      return res.status(403).json({ error: "Only admins can create courses" });
    }

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Check if course with same name or code exists
    const existing = await prisma.course.findFirst({
      where: { OR: [{ name }, { code }] },
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Course name or code already exists" });
    }

    // Convert tags to array if it's a string
    let tagsArray = [];
    if (Array.isArray(tags)) {
      tagsArray = tags;
    } else if (typeof tags === "string") {
      // Split comma-separated string, trim spaces
      tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    const course = await prisma.course.create({
      data: {
        name,
        code,
        description,
        tags: tagsArray, // save as array
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

    const existing = await prisma.course.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      return res.status(404).json({ error: "Course not found" });
    }

    await prisma.course.delete({ where: { id: Number(id) } });

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
};
