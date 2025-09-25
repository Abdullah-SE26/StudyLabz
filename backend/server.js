// server.js
import dotenv from "dotenv";
dotenv.config(); // ✅ load env first

import mongoose from "mongoose";
import app from "./app.js";

// Config
const PORT = process.env.PORT || 5000;
const DB = process.env.MONGODB_URI;

// DB + Server
mongoose
  .connect(DB)
  .then(() => {
    console.log("✅ Connected to database 🔒");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ DB connection error:", error);
  });
