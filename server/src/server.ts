import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import connectDB from "./config/database";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import documentRoutes from "./routes/document.routes";

dotenv.config();

const app = express();

// ================================
// Connect Database
// ================================
connectDB();

// ================================
// Middlewares
// ================================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// ================================
// Health Check
// ================================
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 EduMind AI Backend Running",
  });
});

// ================================
// API Routes
// ================================
app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/documents", documentRoutes);

// ================================
// 404 Handler
// ================================
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ================================
// Global Error Handler
// ================================
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
);

// ================================
// Start Server
// ================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});