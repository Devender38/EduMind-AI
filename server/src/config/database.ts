import mongoose from "mongoose";
import { createLogger } from "../utils/logger";

const logger = createLogger("Database");

const connectDB = async (retryCount = 0): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    logger.error("MONGO_URI environment variable is not defined! Please set MONGO_URI in your environment settings.");
    return;
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    logger.info(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error: any) {
    logger.error(`MongoDB Connection Error: ${error?.message || error}`);

    const delay = Math.min(2000 * (retryCount + 1), 10000);
    logger.info(`Retrying MongoDB connection in ${delay / 1000}s (Attempt ${retryCount + 1})...`);
    setTimeout(() => connectDB(retryCount + 1), delay);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected. Attempting reconnection...");
});

mongoose.connection.on("error", (err) => {
  logger.error(`MongoDB runtime error: ${err.message}`);
});

export default connectDB;