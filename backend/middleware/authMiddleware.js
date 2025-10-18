// authMiddleware.js
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";

/**
 * Auth Middleware
 * Verifies JWT token, fetches user from Postgres (Prisma), attaches user to req.user
 */
export const authMiddleware = async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized. Token missing." });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB
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

    req.user = user; // Attach user to request
    next();

  } catch (err) {
    console.error("Auth middleware error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token", code: "INVALID_TOKEN" });
    }

    return res.status(401).json({ error: "Authorization failed", code: "AUTH_ERROR" });
  }
};

/**
 * Admin-only Middleware
 * Protects routes that require admin access
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
