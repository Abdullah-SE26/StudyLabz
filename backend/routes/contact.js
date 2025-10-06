import express from "express";
import { sendContactForm } from "../controllers/contactController.js";

const router = express.Router();

// POST /api/contact
router.post("/", sendContactForm);

export default router;
