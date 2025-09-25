import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },

    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },

    likesCount: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    repliesCount: { type: Number, default: 0 },

    // ✅ Track which users reported the comment (admin visibility)
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Method to toggle like
commentSchema.methods.toggleLike = async function (userId) {
  const userObjectId = mongoose.Types.ObjectId(userId);

  if (this.likedBy.includes(userObjectId)) {
    this.likedBy.pull(userObjectId);
    this.likesCount = Math.max(this.likesCount - 1, 0);
  } else {
    this.likedBy.push(userObjectId);
    this.likesCount += 1;
  }

  return this.save();
};

// Indexes for faster lookups
commentSchema.index({ question: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ user: 1 });

export default mongoose.model("Comment", commentSchema);
