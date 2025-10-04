// server.js
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import prisma from "./prismaClient.js"; 

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to Postgres database 🔒");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ DB connection error:", error);
  }
}

startServer();
