// server.js
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import prisma from "./prismaClient.js";

const PORT = process.env.PORT || 5000;
const MAX_RETRIES = 5; // number of times to retry connecting
const RETRY_DELAY = 2000; // milliseconds

async function startServer() {
  let retries = MAX_RETRIES;
  while (retries > 0) {
    try {
      await prisma.$connect();
      console.log("✅ Connected to Postgres database 🔒");

      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });

      break; // stop retry loop if connected successfully
    } catch (error) {
      retries--;
      console.error(`⚠️ DB connection failed. Retries left: ${retries}`);
      console.error(error);

      if (retries === 0) {
        console.error("❌ Unable to connect to the database after multiple attempts. Exiting.");
        process.exit(1);
      }

      // wait before retrying
      await new Promise((res) => setTimeout(res, RETRY_DELAY));
    }
  }
}

startServer();
