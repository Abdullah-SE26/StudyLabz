// utils/sanitize.js

export const stripEmbeddedAnswers = (text = "") => {
  if (!text) return text;
  const regex =
    /(\(|\[)?\s*(Answer|Ans|Correct\s+answer|Correct|Solution)\s*[:\-]\s*[^)\]\n]+(\)|\])?/gi;
  return text.replace(regex, "").trim();
};

export const sanitizeOptions = (options) => {
  if (!options || typeof options !== "object") return null;

  const sanitized = { ...options };

  delete sanitized.correctAnswer;
  delete sanitized.correct;
  delete sanitized.answer;
  delete sanitized.solution;

  if (sanitized.choices && !Array.isArray(sanitized.choices)) {
    if (typeof sanitized.choices === "string") {
      sanitized.choices = sanitized.choices
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      sanitized.choices = null;
    }
  }

  return sanitized;
};

// ✅ NEW unified helper
export const sanitize = (input) => {
  if (typeof input === "string") {
    return stripEmbeddedAnswers(input.trim());
  }
  if (Array.isArray(input)) {
    return input.map((i) => sanitize(i));
  }
  if (typeof input === "object" && input !== null) {
    return sanitizeOptions(input);
  }
  return input;
};
