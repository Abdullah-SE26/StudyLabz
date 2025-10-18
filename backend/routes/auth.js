import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  sendMagicLink,
  verifyMagicLink,
  handleMagicLink,
} from "../controllers/authController.js"; // <--- THIS

const router = express.Router();

// Existing magic link routes
router.post("/send-magic-link", sendMagicLink);
router.get("/verify-magic-link", handleMagicLink);
router.post("/verify-magic-link", verifyMagicLink);

// ✅ New route to verify JWT
router.get("/verify-token", authMiddleware, (req, res) => {
  // If authMiddleware passes, token is valid
  res.json({ ok: true, user: req.user });
});

export default router;
