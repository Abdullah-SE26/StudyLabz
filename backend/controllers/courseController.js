import prisma from "../prismaClient.js";

// ===== Utility: Parse tags from string or array =====
const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags.map((t) => t.trim()).filter(Boolean);
  if (typeof tags === "string")
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  return [];
};

// ===== GET /courses =====
export const getCourses = async (req, res, next) => {
  try {
    const search = (req.query.search || "").trim();
    const tags = parseTags(req.query.tags || "");
    const sort = req.query.sort || "latest";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }
    if (tags.length) {
      where.AND = tags.map((tag) => ({ tags: { has: tag } }));
    }

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

    const [totalCount, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      courses,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    next(err);
  }
};

// ===== GET /courses/:id =====
export const getCourseById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid course ID" });

    // Fetch course
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!course) return res.status(404).json({ error: "Course not found" });

    // Fetch distinct exam types from questions belonging to this course
    const examTypesData = await prisma.question.findMany({
      where: { courseId: id },
      select: { examType: true },
      distinct: ["examType"],
    });

    const examTypes = examTypesData.map((q) => q.examType).filter(Boolean);

    res.json({ success: true, course, examTypes });
  } catch (err) {
    next(err);
  }
};


// ===== POST /courses =====
export const createCourse = async (req, res, next) => {
  try {
    const { name, code: frontendCode, description, tags } = req.body;
    const { id: userId, role } = req.user;

    if (role !== "admin") return res.status(403).json({ error: "Only admins can create courses" });
    if (!name || !name.trim()) return res.status(400).json({ error: "Name is required" });

    let code =
      frontendCode ||
      name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    // Ensure code is unique
    let uniqueCode = code;
    let suffix = 1;
    while (await prisma.course.findUnique({ where: { code: uniqueCode } })) {
      uniqueCode = `${code}-${suffix}`;
      suffix++;
    }
    code = uniqueCode;

    if (await prisma.course.findUnique({ where: { name } }))
      return res.status(400).json({ error: "Course name already exists" });

    const course = await prisma.course.create({
      data: {
        name: name.trim(),
        code,
        description: description?.trim() || null,
        tags: parseTags(tags),
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

// ===== PATCH /courses/:id =====
export const updateCourse = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.user;
    const { name, description, tags } = req.body;

    if (role !== "admin") return res.status(403).json({ error: "Only admins can update courses" });
    if (isNaN(id)) return res.status(400).json({ error: "Invalid course ID" });

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Course not found" });

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description && { description: description.trim() }),
        ...(tags && parseTags(tags).length && { tags: parseTags(tags) }),
      },
    });

    res.json({ success: true, course: updated });
  } catch (err) {
    next(err);
  }
};

// ===== DELETE /courses/:id =====
export const deleteCourse = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.user;

    if (role !== "admin") return res.status(403).json({ error: "Only admins can delete courses" });
    if (isNaN(id)) return res.status(400).json({ error: "Invalid course ID" });

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Course not found" });

    await prisma.course.delete({ where: { id } });
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ===== GET /courses/tags =====
export const getCourseTags = async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({ select: { tags: true } });
    const tagsSet = new Set();
    courses.forEach((course) => course.tags?.forEach((tag) => tagsSet.add(tag)));

    res.json({ success: true, tags: [...tagsSet].sort() });
  } catch (err) {
    next(err);
  }
};
