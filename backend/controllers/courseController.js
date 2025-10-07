import prisma from "../prismaClient.js";

//GET /courses
// Assumes `prisma` is available in this module (same as you used before)
export const getCourses = async (req, res, next) => {
  try {
    const search = (req.query.search || "").trim();
    const tags = (req.query.tags || "").trim(); // comma-separated selected tags
    const sort = req.query.sort || "latest";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const offset = (page - 1) * limit;

    // Build base filter for selected tags (exact match on array elements)
    const baseWhere = {};
    if (tags) {
      const tagsArray = tags.split(",").map(t => t.trim()).filter(Boolean);
      if (tagsArray.length) {
        // require each selected tag to be present
        baseWhere.AND = tagsArray.map(tag => ({ tags: { has: tag } }));
      }
    }

    // Sorting
    let orderBy;
    if (sort === "latest") orderBy = { createdAt: "desc" };
    else if (sort === "oldest") orderBy = { createdAt: "asc" };
    else if (sort === "name_asc") orderBy = { name: "asc" };
    else if (sort === "name_desc") orderBy = { name: "desc" };

    // 1) Fetch candidate courses from DB (filtered by selectedTags only).
    //    We don't try partial tag matching here (Prisma can't do that for String[]),
    //    we do that in JS below.
    const candidates = await prisma.course.findMany({
      where: baseWhere,
      orderBy,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    // 2) Apply partial search matching in JS (name OR any tag contains the search string)
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

    // 3) Pagination applied after filtering
    const totalCount = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    // return consistent shape for frontend
    res.json({ courses: paginated, totalCount });
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
