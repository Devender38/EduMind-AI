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
      serverSelectionTimeoutMS: 8000,
    });

    logger.info(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error: any) {
    logger.error(`MongoDB Connection Error: ${error?.message || error}`);

    if (retryCount < 5) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 15000);
      logger.info(`Retrying MongoDB connection in ${delay / 1000}s (Attempt ${retryCount + 1}/5)...`);
      setTimeout(() => connectDB(retryCount + 1), delay);
    } else {
      logger.warn("Max MongoDB connection retries reached. Database features will be unavailable until connection is restored.");
    }
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected. Attempting reconnection...");
});

mongoose.connection.on("error", (err) => {
  logger.error(`MongoDB runtime error: ${err.message}`);
});

export default connectDB;