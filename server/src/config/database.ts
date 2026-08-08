import mongoose from "mongoose";
import { createLogger } from "../utils/logger";

const logger = createLogger("Database");

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;

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