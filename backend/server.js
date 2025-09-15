// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js"; 

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});
app.use("/api/auth", authRoutes);

// DB + Server
const PORT = process.env.PORT || 5000;
const DB = process.env.MONGODB_URI; 

mongoose
  .connect(DB)
  .then(() => {
    console.log("App connected to database 🔒");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("DB connection error:", error);
  });
