import prisma from "../prismaClient.js";

// GET /courses
export const getCourses = async (req, res, next) => {
  try {
    const search = (req.query.search || "").trim();
    const tags = (req.query.tags || "").trim();
    const sort = req.query.sort || "latest";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    if (tags) {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      if (tagsArray.length) {
        // All tags must exist (AND)
        where.AND = tagsArray.map((tag) => ({ tags: { has: tag } }));
      }
    }

    // Sorting
    let orderBy;
    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Get total count
    const totalCount = await prisma.course.count({ where });

    // Fetch paginated courses
    const courses = await prisma.course.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({
      courses,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    next(err);
  }
};

// GET /courses/:id - fetch single course by ID
export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: Number(id) },
      include: {
        exams: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(course);
  } catch (err) {
    next(err);
  }
};


// POST /courses - create a course (admin only)
export const createCourse = async (req, res, next) => {
  try {
    const { name, code: frontendCode, description, tags } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== "admin")
      return res.status(403).json({ error: "Only admins can create courses" });
    if (!name) return res.status(400).json({ error: "Name is required" });

    // Generate code from title
    let code =
      frontendCode ||
      name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    let uniqueCode = code;
    let suffix = 1;
    while (await prisma.course.findUnique({ where: { code: uniqueCode } })) {
      uniqueCode = `${code}-${suffix}`;
      suffix++;
    }
    code = uniqueCode;

    const existingName = await prisma.course.findUnique({ where: { name } });
    if (existingName)
      return res.status(400).json({ error: "Course name already exists" });

    // Parse tags
    let tagsArray = [];
    if (Array.isArray(tags)) tagsArray = tags;
    else if (typeof tags === "string")
      tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    // Create course + default exams in **one atomic query**
    const course = await prisma.course.create({
      data: {
        name,
        code,
        description,
        tags: tagsArray,
        createdById: userId,
      },
      include: { exams: true },
    });

    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

// PATCH /courses/:id - update course (admin only)
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = req.user.role;

    if (role !== "admin")
      return res.status(403).json({ error: "Only admins can update courses" });

    const { name, tags, description } = req.body;

    const existing = await prisma.course.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) return res.status(404).json({ error: "Course not found" });

    let tagsArray = [];
    if (Array.isArray(tags)) tagsArray = tags;
    else if (typeof tags === "string")
      tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    const updated = await prisma.course.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(tagsArray.length && { tags: tagsArray }),
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /courses/:id - admin only
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = req.user.role;

    if (role !== "admin")
      return res.status(403).json({ error: "Only admins can delete courses" });

    const existing = await prisma.course.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) return res.status(404).json({ error: "Course not found" });

    await prisma.course.delete({ where: { id: Number(id) } });

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
};
