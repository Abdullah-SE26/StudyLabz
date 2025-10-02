import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import questionRoutes from "./routes/questions.js";
import commentRoutes from "./routes/comments.js"; 
import contactRoutes from "./routes/contactRoutes.js";  

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

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


export default app;
