import express from "express";
import { solveQuestion, followupChat } from "../controllers/aiController.js";

const router = express.Router();

router.post("/solve", solveQuestion);
router.post("/followup", followupChat);

export default router;
