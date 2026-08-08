import mongoose from "mongoose";
import dns from "dns";
import { createLogger } from "../utils/logger";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {
  // fallback to system default
}

const logger = createLogger("Database");

const connectDB = async (retry = 0): Promise<void> => {
  const rawUri = process.env.MONGO_URI || "";
  const mongoUri = rawUri.replace(/^["']|["']$/g, "").trim();

  if (!mongoUri) {
    logger.error(
      "MONGO_URI environment variable is not defined! Please set MONGO_URI in your environment settings."
    );
    return;
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });

    logger.info(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error: any) {
    logger.error(`MongoDB Connection Error: ${error?.message || error}`);
    logger.info(`Retrying MongoDB connection in 3s (Attempt ${retry + 1})...`);
    setTimeout(() => connectDB(retry + 1), 3000);
  }
};

mongoose.connection.on("connected", () => {
  logger.info("MongoDB Connection Established");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  logger.error(`MongoDB error: ${err.message}`);
});

export default connectDB;