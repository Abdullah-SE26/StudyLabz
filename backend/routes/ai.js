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

    const prompt = `You are an expert problem solver. Your task is to SOLVE the problem below completely.

CRITICAL: You are NOT explaining general concepts. You MUST SOLVE THIS SPECIFIC PROBLEM.

WHAT "SOLVING" MEANS:
- If it asks for a calculation: Do the math and give the number
- If it asks for code: Write working code that solves it
- If it asks which option is correct: Pick one and explain why with work
- If it asks for an answer: Provide the exact answer
- Show ALL your work/calculations/reasoning

YOUR RESPONSE MUST INCLUDE:
1. Brief understanding (1 sentence): "This question is asking me to..."
2. Solution approach (1-2 sentences): "I will solve this by..."
3. Detailed solution steps with actual work (use code blocks for code/formulas)
4. Final Answer: **Answer goes here in bold**

SPECIAL HANDLING:
- MCQ questions: Analyze each option and state "The correct answer is [X] because..."
- Programming: Provide complete, executable code
- Math problems: Show all steps and give the numerical answer
- Theory questions: Answer all parts directly with structured content

Format: Use markdown (code blocks for code, **bold** for final answer, numbered lists for steps).

PROBLEM TO SOLVE:
${question}

Now solve this problem step-by-step and provide the final answer.`;

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

    // Convert conversation context to TOON format for token efficiency
    const contextToon = context
      .map(
        (m, i) =>
          `${i + 1}.${
            m.role === "user" ? "user" : "assistant"
          }:${m.text.replace(/\n/g, "\\n")}`
      )
      .join("\n");

    const chatPrompt = `You are an expert tutor helping a student solve a specific problem. Always work through the actual problem, not just explain concepts.

Original Question to Solve:
${originalQuestion}

Previous conversation (TOON format):
${contextToon}

Student's current question:
${message}

INSTRUCTIONS:
- If they're asking about the solution, show the actual work/answer
- If they're asking for clarification, address their specific question while working through the problem
- Always reference the original question and provide concrete solutions
- Use markdown formatting (code blocks, lists, **bold** for answers)

Respond by solving or addressing their question directly.`;

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
