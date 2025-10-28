import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import questionRoutes from "./routes/questions.js";
import commentRoutes from "./routes/comments.js";
import contactRoutes from "./routes/contact.js";
import courseRoutes from "./routes/courses.js";
import examRoutes from "./routes/exams.js";
import dashboardRoutes from "./routes/dashboard.js";

import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./routes/uploadthing.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-UploadThing-Package",
      "X-UploadThing-Version",
      "traceparent",
      "b3",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/dashboard", dashboardRoutes);

// UploadThing route
app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config: {
      callbackUrl: `${process.env.BACKEND_URL}/api/uploadthing/callback`,
    },
  })
);
export default app;
