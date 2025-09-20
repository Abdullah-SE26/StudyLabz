import express from "express";
import { sendMagicLink, verifyMagicLink } from "../controllers/authController.js";

const router = express.Router();

router.post("/send-magic-link", sendMagicLink);
router.post("/verify-magic-link", verifyMagicLink);

export default router;
