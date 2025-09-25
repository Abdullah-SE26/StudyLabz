import Question from "../models/Question.js";
import User from "../models/User.js";

// -----------------------------
// Get all questions
// -----------------------------
export const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate("createdBy", "name studentId avatar") // user info
      .sort({ createdAt: -1 });

    // Map likes to count only
    const result = questions.map(q => ({
      _id: q._id,
      course: q.course,
      type: q.type,
      text: q.text,
      options: q.options,
      createdBy: q.createdBy,
      likesCount: q.likes.length,
      reportedCount: q.reports.length, // admin can see
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------
// Create a new question
// -----------------------------
export const createQuestion = async (req, res) => {
  const { course, type, text, options } = req.body;

  if (!course || !type || !text)
    return res.status(400).json({ error: "Missing required fields" });

  if (type === "mcq" && (!options || !options.length))
    return res.status(400).json({ error: "MCQs must have options" });

  try {
    const question = new Question({
      createdBy: req.user._id,
      course,
      type,
      text,
      options: type === "mcq" ? options : [],
    });

    await question.save();
    res.status(201).json({ message: "Question created", question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------
// Toggle Like
// -----------------------------
export const toggleLikeQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const userId = req.user._id;
    const liked = question.likes.includes(userId);

    if (liked) {
      question.likes.pull(userId);
    } else {
      question.likes.push(userId);
    }

    await question.save();
    res.json({ likesCount: question.likes.length, liked: !liked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------
// Report Question
// -----------------------------
export const reportQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const userId = req.user._id;
    if (!question.reports.includes(userId)) {
      question.reports.push(userId);
      await question.save();
    }

    res.json({ message: "Question reported", reportsCount: question.reports.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------
// Delete Question
// -----------------------------
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: "Question not found" });

    // Only creator or admin can delete
    if (!req.user._id.equals(question.createdBy) && req.user.role !== "admin")
      return res.status(403).json({ error: "Not authorized" });

    await question.remove();
    res.json({ message: "Question deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
