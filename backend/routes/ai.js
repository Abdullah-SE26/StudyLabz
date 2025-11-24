import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// Initialize client with API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Model name - change this if you want to use a different model
const MODEL_NAME = "gemini-2.5-flash";

// Helper function to extract image URL from question text
function extractImageUrl(questionText) {
  const imageMatch = questionText.match(/\[Image:\s*(https?:\/\/[^\]]+)\]/);
  return imageMatch ? imageMatch[1] : null;
}

// Helper function to fetch image and convert to base64
async function fetchImageAsBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = response.headers.get("content-type") || "image/jpeg";
    return { base64, mimeType };
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

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

    // Extract image URL if present
    const imageUrl = extractImageUrl(question);
    let imageData = null;
    
    // Fetch and process image if URL exists
    if (imageUrl) {
      console.log("Found image URL:", imageUrl);
      imageData = await fetchImageAsBase64(imageUrl);
    }

    // Remove image placeholder from question text
    const questionText = question.replace(/\[Image:\s*https?:\/\/[^\]]+\]/g, "").trim();

    const prompt = imageData 
      ? `Look at the image provided and solve the problem shown in it. The image contains code, diagrams, or question details that you need to analyze.

For code trace problems: Execute/trace the code step-by-step and show the EXACT output as it would print (e.g., "output 1: 0", "output 2: 5", etc.).
For calculations: Show work briefly, then give the result.
For MCQ: Give the correct option.

Question text (if any):
${questionText}

Analyze the image carefully and solve the problem. Provide the solution/answer directly.`
      : `Solve this problem. Provide only the solution and answer - skip explanations.

For code trace problems: Show the EXACT output line by line as it would print (e.g., "output 1: 0", "output 2: 5", etc.).
For calculations: Show work briefly, then give the result.
For MCQ: Give the correct option.

PROBLEM:
${questionText}

Provide the solution/answer directly.`;

    let response;
    
    // If image exists, use vision API
    if (imageData) {
      console.log("Using vision API with image");
      // Use vision-capable API with image
      response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          { text: prompt },
          {
            inlineData: {
              data: imageData.base64,
              mimeType: imageData.mimeType,
            },
          },
        ],
      });
    } else {
      // Regular text-only generation
      response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
    }

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
