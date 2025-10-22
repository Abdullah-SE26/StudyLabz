import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  sendMagicLink,
  verifyMagicLink,
} from "../controllers/authController.js";

const router = express.Router();

// Magic link routes
router.post("/send-magic-link", sendMagicLink);
router.post("/verify-magic-link", verifyMagicLink);

// ✅ New route to verify JWT
router.get("/verify-token", authMiddleware, (req, res) => {
  // If authMiddleware passes, token is valid
  res.json({ ok: true, user: req.user });
});

export default router;
