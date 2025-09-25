import express from "express";
import {
  sendMagicLink,
  verifyMagicLink,
  handleMagicLink,
} from "../controllers/authController.js";

const router = express.Router();

// Send magic link to user’s email
router.post("/send-magic-link", sendMagicLink);

// When user clicks the email link → backend redirects to frontend
router.get("/verify-magic-link", handleMagicLink);

// Frontend then calls this POST to actually verify + issue JWT
router.post("/verify-magic-link", verifyMagicLink);

export default router;
