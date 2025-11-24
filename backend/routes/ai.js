import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// Initialize client with API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Model name - change this if you want to use a different model
const MODEL_NAME = "gemini-2.5-flash"; 

// // -----------------------------
// // LIST AVAILABLE MODELS
// // -----------------------------
// async function listModels() {
//   try {
//     const models = await ai.models.list();
//     console.log("Available models:", models);
//     return models;
//   } catch (err) {
//     console.error("Error fetching model list:", err);
//     return [];
//   }
// }

// // Call it on server start for debugging
// listModels();

// -----------------------------
// SOFT GUARD CHECK FUNCTION
// -----------------------------
async function isMessageRelevant(originalQuestion, userMessage) {
  const classifierPrompt = `
You are a relevance classifier.
Your job is to check if a user follow-up question is related to the original problem.

Original Problem:
"${originalQuestion}"

User Follow-up:
"${userMessage}"

Reply with ONLY "yes" or "no".
If related → "yes", otherwise → "no".
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: classifierPrompt,
    });

    const text = response?.text?.trim().toLowerCase();
    return text?.startsWith("y");
  } catch (err) {
    console.error("Error in relevance check:", err);
    return false; // default to false if model call fails
  }
}

// -----------------------------
// INITIAL SOLVE
// -----------------------------
router.post("/solve", async (req, res) => {
  try {
    const { question } = req.body;

    const prompt = `You are a clear and concise tutor. Solve the following question step-by-step and explain your reasoning simply. Use clear formatting with numbered steps, bullet points, or code blocks where relevant.

Question:
${question}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const answer = response?.text || "No answer generated";
    res.json({ answer });
  } catch (err) {
    console.error("AI solve error:", err);
    res.status(500).json({ error: "AI solve failed" });
  }
});

// -----------------------------
// FOLLOW-UP CHAT
// -----------------------------
router.post("/followup", async (req, res) => {
  try {
    const { originalQuestion, message, context } = req.body;

    const relevant = await isMessageRelevant(originalQuestion, message);

    if (!relevant) {
      return res.json({
        blocked: true,
        answer:
          "Your question doesn’t seem related to this problem. Please keep the conversation focused on the original question.",
      });
    }

    const chatPrompt = `
You are a helpful tutor assisting with a problem.

Original Question:
${originalQuestion}

Conversation so far:
${context.map((m) => m.role + ": " + m.text).join("\n")}

User now asks:
${message}

Respond clearly and directly.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: chatPrompt,
    });

    const answer = response?.text || "No answer generated";
    res.json({ blocked: false, answer });
  } catch (err) {
    console.error("AI follow-up error:", err);
    res.status(500).json({ error: "AI follow-up failed" });
  }
});

export default router;
