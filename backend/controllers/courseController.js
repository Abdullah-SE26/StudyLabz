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

    const baseWhere = {};
    if (tags) {
      const tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (tagsArray.length) {
        baseWhere.AND = tagsArray.map((tag) => ({ tags: { has: tag } }));
      }
    }

    let orderBy;
    if (sort === "latest") orderBy = { createdAt: "desc" };
    else if (sort === "oldest") orderBy = { createdAt: "asc" };
    else if (sort === "name_asc") orderBy = { name: "asc" };
    else if (sort === "name_desc") orderBy = { name: "desc" };

    const candidates = await prisma.course.findMany({
      where: baseWhere,
      orderBy,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    const filtered = (() => {
      if (!search) return candidates;
      const lower = search.toLowerCase();
      return candidates.filter((course) => {
        const nameMatch = course.name && course.name.toLowerCase().includes(lower);
        const tagsMatch =
          Array.isArray(course.tags) &&
          course.tags.some((t) => t && t.toLowerCase().includes(lower));
        return nameMatch || tagsMatch;
      });
    })();

    const totalCount = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    res.json({ courses: paginated, totalCount });
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

    if (role !== "admin") return res.status(403).json({ error: "Only admins can create courses" });
    if (!name) return res.status(400).json({ error: "Name is required" });

    // Generate code from title
    let code = frontendCode || name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    let uniqueCode = code;
    let suffix = 1;
    while (await prisma.course.findUnique({ where: { code: uniqueCode } })) {
      uniqueCode = `${code}-${suffix}`;
      suffix++;
    }
    code = uniqueCode;

    const existingName = await prisma.course.findUnique({ where: { name } });
    if (existingName) return res.status(400).json({ error: "Course name already exists" });

    // Parse tags
    let tagsArray = [];
    if (Array.isArray(tags)) tagsArray = tags;
    else if (typeof tags === "string") tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean);

    // Create course + default exams in **one atomic query**
    const course = await prisma.course.create({
      data: {
        name,
        code,
        description,
        tags: tagsArray,
        createdById: userId,
        exams: {
          create: [
            { title: "Quiz 1", type: "quiz" },
            { title: "Quiz 2", type: "quiz" },
            { title: "Additional Quiz", type: "quiz" },
            { title: "Midterm", type: "midterm" },
            { title: "Final", type: "final" },
          ],
        },
      },
      include: { exams: true },
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

    if (role !== "admin") return res.status(403).json({ error: "Only admins can delete courses" });

    const existing = await prisma.course.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ error: "Course not found" });

    await prisma.course.delete({ where: { id: Number(id) } });

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
};
