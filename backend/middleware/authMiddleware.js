import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";

/**
 * Auth Middleware
 * Verifies JWT token, fetches user from Postgres, and attaches user to req.user
 */
export const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from Postgres using Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        studentId: true,
        avatar: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    req.user = user; // attach user to request
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Not authorized. Invalid token." });
  }
};

/**
 * isAdmin Middleware
 * Checks if the authenticated user has role 'admin'
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authorized." });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }

  next();
};
