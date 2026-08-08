import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/database";
import { createLogger } from "./utils/logger";
import { apiLimiter } from "./middlewares/rateLimiter";

const logger = createLogger("Server");

// ==============================
// Route Imports
// ==============================

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import documentRoutes from "./routes/document.routes";
import chatRoutes from "./routes/chat.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import conversationRoutes from "./routes/conversation.routes";
import summaryRoutes from "./routes/summary.routes";
import flashcardRoutes from "./routes/flashcard.routes";
import quizRoutes from "./routes/quiz.routes";
import plannerRoutes from "./routes/planner.routes";
import notesRoutes from "./routes/notes.routes";
import bookmarkRoutes from "./routes/bookmark.routes";
import historyRoutes from "./routes/history.routes";
import mindmapRoutes from "./routes/mindmap.routes";

// ==============================
// Load Environment Variables
// ==============================

dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 5000;
const httpLogger = createLogger("HTTP");

// ==============================
// Connect MongoDB
// ==============================

connectDB();

// ==============================
// Security & Utility Middlewares
// ==============================

// Secure HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Cookie Parser
app.use(cookieParser());

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, render health checks)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        process.env.CLIENT_URL,
      ].filter(Boolean);

      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com")
      ) {
        return callback(null, true);
      }

      // Allow anyway in development/permissive mode without throwing fatal error
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// General Rate Limiter
app.use("/api", apiLimiter);

// ==============================
// HTTP Request Logging Middleware
// ==============================

app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;

  httpLogger.info(`--> [INCOMING] ${method} ${originalUrl} | Client IP: ${ip || "unknown"}`);

  res.on("finish", () => {
    const elapsed = Date.now() - startTime;
    const { statusCode } = res;
    const logLevel = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

    httpLogger[logLevel](
      `<-- [COMPLETED] ${method} ${originalUrl} | Status: ${statusCode} | Time: ${elapsed}ms`
    );
  });

  next();
});

// ==============================
// Health Check Endpoint
// ==============================

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "EduMind AI Server Running 🚀",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  const readyState = mongoose.connection.readyState;
  const states: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(readyState === 1 ? 200 : 503).json({
    success: readyState === 1,
    status: readyState === 1 ? "Healthy" : "Degraded",
    uptime: process.uptime(),
    database: {
      status: states[readyState] || "unknown",
      readyState,
      isConfigured: Boolean(process.env.MONGO_URI),
      host: mongoose.connection.host || null,
    },
    timestamp: new Date().toISOString(),
  });
});

// ==============================
// API Routes
// ==============================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/mindmap", mindmapRoutes);

// ==============================
// 404 Handler
// ==============================

app.use((req: Request, res: Response) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// ==============================
// Global Error Handler
// ==============================

app.use(
  (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    logger.error(`Global Error Caught: ${err.message}`, { stack: err.stack });

    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
);

// ==============================
// Process Error Guards
// ==============================

process.on("unhandledRejection", (reason: any) => {
  logger.error(`Unhandled Promise Rejection: ${reason?.stack || reason}`);
});

process.on("uncaughtException", (error: Error) => {
  logger.error(`Uncaught Exception: ${error?.stack || error?.message}`);
});

// ==============================
// Start Server
// ==============================

app.listen(PORT, () => {
  logger.info(`EduMind AI Server running on port ${PORT} [http://localhost:${PORT}]`);
});