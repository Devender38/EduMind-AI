import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  getSessions,
  revokeSession,
  deleteAccount,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";
import { authLimiter, passwordResetLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

// Registration & Signup (both paths supported for compatibility)
router.post("/register", authLimiter, register);
router.post("/signup", authLimiter, register);

// Authentication & Token Management
router.post("/login", authLimiter, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/logout-all", protect, logoutAll);

// Password Management
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPassword);

// Email Verification
router.get("/verify-email", verifyEmail);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", authLimiter, resendVerification);

// Session & Device Management
router.get("/sessions", protect, getSessions);
router.delete("/sessions/:sessionId", protect, revokeSession);

// Account Deletion
router.delete("/account", protect, deleteAccount);

export default router;