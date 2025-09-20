import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: String, required: true },
    type: { type: String, enum: ["mcq", "essay"], required: true },
    text: { type: String, required: true },

    options: [{ text: String, isCorrect: Boolean }],

    // Engagement
    likesCount: { type: Number, default: 0 },       // shown to users
    reportsCount: { type: Number, default: 0 },     // admin only
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],      // used internally to toggle likes
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],   // optional, prevent duplicate reports
  },
  { timestamps: true }
);

// Method to toggle like (click once = like, click again = unlike)
questionSchema.methods.toggleLike = async function (userId) {
  const userObjectId = mongoose.Types.ObjectId(userId);

  if (this.likedBy.includes(userObjectId)) {
    // User already liked → remove like
    this.likedBy.pull(userObjectId);
    this.likesCount = Math.max(this.likesCount - 1, 0);
  } else {
    // User hasn't liked → add like
    this.likedBy.push(userObjectId);
    this.likesCount += 1;
  }

  return this.save();
};

// Method to report a question (one report per user)
questionSchema.methods.report = async function (userId) {
  const userObjectId = mongoose.Types.ObjectId(userId);

  if (!this.reportedBy.includes(userObjectId)) {
    this.reportedBy.push(userObjectId);
    this.reportsCount += 1;
  }

  return this.save();
};

export default mongoose.model("Question", questionSchema);
