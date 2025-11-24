import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/* ---------- SOFT GUARD CHECK ---------- */
async function isMessageRelevant(originalQuestion, userMessage) {
  const classifierPrompt = `
You are a relevance classifier.
Your job is to check if a user follow-up question is related to the original problem.

Original Problem:
"${originalQuestion}"

User Follow-up:
"${userMessage}"

Reply with ONLY "yes" or "no".
If the follow-up is about math steps, explaining steps, alternative solutions, or clarifications → "yes".
If it asks about unrelated things like weather, jokes, news, personal topics, or anything unrelated → "no".
`;

  const result = await model.generateContent(classifierPrompt);
  const text = result.response.text().trim().toLowerCase();

  return text.startsWith("y"); // yes/no
}

/* ---------- INITIAL SOLVE ---------- */
router.post("/solve", async (req, res) => {
  try {
    const { question } = req.body;

    const prompt = `
You are a clear and concise tutor.
Solve the following question step-by-step and explain your reasoning simply.

Question:
${question}
    `;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI solve failed" });
  }
});

/* ---------- FOLLOW-UP CHAT ---------- */
router.post("/followup", async (req, res) => {
  try {
    const { originalQuestion, message, context } = req.body;

    // 1. Soft guard check
    const relevant = await isMessageRelevant(originalQuestion, message);

    if (!relevant) {
      return res.json({
        blocked: true,
        answer:
          "Your question doesn’t seem related to this problem. Please keep the conversation focused on the original question.",
      });
    }

    // 2. Build conversation thread
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

    const result = await model.generateContent(chatPrompt);
    const answer = result.response.text();

    res.json({ blocked: false, answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI follow-up failed" });
  }
});

export default router;
