import mongoose from "mongoose";

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
      sparse: true, // allows null for instructors or users without numeric ID
      match: /^[0-9]{9}$/, // only numeric IDs
    },
    name: {
      type: String, // for instructors or students with names
    },
  },
  { timestamps: true }
);


userSchema.pre("save", function (next) {
  // Extract studentId for students
  const studentMatch = this.email.match(/^([0-9]{9})@aau\.ac\.ae$/);
  if (studentMatch) {
    this.studentId = studentMatch[1];
  }

  // Extract name for instructors
  const instructorMatch = this.email.match(/^([a-z]+)\.([a-z]+)@aau\.ac\.ae$/i);
  if (instructorMatch) {
    const firstName = instructorMatch[1];
    const lastName = instructorMatch[2];
    this.name = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${
      lastName.charAt(0).toUpperCase() + lastName.slice(1)
    }`;
  }

  next();
});

export default mongoose.model("User", userSchema);
