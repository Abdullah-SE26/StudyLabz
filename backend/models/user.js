import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@aau\.ac\.ae$/, // allow only AAU email
    },
    role: {
      type: String,
      enum: ["user", "admin", "super-admin"],
      default: "user",
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
      match: /^[0-9]{9}$/,
    },
    name: {
      type: String,
    },
    magicToken: String,
    magicTokenExpiry: Date,
    lastMagicLinkSent: Date, // ⬅️ added for rate-limiting

    avatar: { type: String, default: "" },
    bio: { type: String, maxlength: 160 },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  },
  { timestamps: true }
);

// Pre-save hook: extract studentId or instructor name
userSchema.pre("save", function (next) {
  if (this.email) {
    // Students: numeric emails
    const studentMatch = this.email.match(/^([0-9]{9})@aau\.ac\.ae$/);
    if (studentMatch) {
      this.studentId = studentMatch[1];
    }

    // Instructors: firstname.lastname@aau.ac.ae
    const instructorMatch = this.email.match(
      /^([a-z]+)\.([a-z]+)@aau\.ac\.ae$/i
    );
    if (instructorMatch) {
      const [, firstName, lastName] = instructorMatch;
      this.name = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${
        lastName.charAt(0).toUpperCase() + lastName.slice(1)
      }`;
    }
  }
  next();
});

// Magic link helpers
userSchema.methods.setMagicToken = async function (token, expiryMinutes = 15) {
  const salt = await bcrypt.genSalt(10);
  this.magicToken = await bcrypt.hash(token, salt);
  this.magicTokenExpiry = Date.now() + expiryMinutes * 60 * 1000;
  this.lastMagicLinkSent = Date.now(); // ⬅️ update timestamp when sending a magic link
};

userSchema.methods.verifyMagicToken = async function (token) {
  if (!this.magicTokenExpiry || this.magicTokenExpiry < Date.now()) return false;
  return bcrypt.compare(token, this.magicToken);
};

export default mongoose.model("User", userSchema);
