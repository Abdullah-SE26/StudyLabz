// utils/sanitize.js
export const stripEmbeddedAnswers = (text = "") => {
  if (!text) return text;
  // Remove common explicit answer patterns like "Answer: x", "Ans: x", "(Answer: x)" etc.
  // This is intentionally conservative — it removes obvious explicit answer labels.
  const regex = /(\(|\[)?\s*(Answer|Ans|Correct\s+answer|Correct|Solution)\s*[:\-]\s*[^)\]\n]+(\)|\])?/ig;
  return text.replace(regex, "").trim();
};

export const sanitizeOptions = (options) => {
  if (!options || typeof options !== "object") return null;

  // Ensure choices is an array if present
  const sanitized = { ...options };

  // Remove any fields that indicate correct answer
  delete sanitized.correctAnswer;
  delete sanitized.correct;
  delete sanitized.answer;
  delete sanitized.solution;

  // Normalize choices array if exists
  if (sanitized.choices && !Array.isArray(sanitized.choices)) {
    // attempt to coerce from comma-separated string
    if (typeof sanitized.choices === "string") {
      sanitized.choices = sanitized.choices.split(",").map(s => s.trim()).filter(Boolean);
    } else {
      sanitized.choices = null;
    }
  }

  return sanitized;
};
