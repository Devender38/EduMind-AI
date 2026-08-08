import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../models/User";
import RefreshToken from "../models/RefreshToken";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createLogger } from "../utils/logger";
import { parseDeviceInfo } from "../utils/userAgent";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedConfirmation,
  sendSecurityAlertEmail,
} from "../services/email.service";

const logger = createLogger("AuthController");

// ===============================
// REGISTER / SIGNUP
// ===============================
export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  const startTime = Date.now();
  try {
    const { name, username, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      logger.warn("Registration rejected: Missing required fields");
      res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      logger.warn("Registration rejected: Database not connected (readyState=" + mongoose.connection.readyState + ")");
      res.status(503).json({
        success: false,
        message: "Database is currently connecting to MongoDB Atlas. Please ensure MONGO_URI is configured and wait a few moments.",
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    logger.info(`Processing registration request for: ${normalizedEmail}`);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      logger.warn(`Registration rejected: Email already registered (${normalizedEmail})`);
      res.status(400).json({
        success: false,
        message: "An account with this email address already exists.",
      });
      return;
    }

    if (username) {
      const existingUsername = await User.findOne({
        username: username.toLowerCase().trim(),
      });
      if (existingUsername) {
        res.status(400).json({
          success: false,
          message: "Username is already taken. Please choose another.",
        });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.trim(),
      username: username ? username.toLowerCase().trim() : undefined,
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
      isVerified: false,
    });

    // Generate Email Verification Token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(
      user.email
    )}`;

    sendVerificationEmail(user.email, user.name, verificationUrl).catch((err) =>
      logger.error(`Async email send error: ${err.message}`)
    );

    // Generate initial tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    const deviceInfo = parseDeviceInfo(req);

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      userAgent: req.headers["user-agent"] || "",
      ipAddress: deviceInfo.ip,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      device: deviceInfo.device,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const elapsed = Date.now() - startTime;
    logger.info(`User registered successfully: ${normalizedEmail} (ID: ${user._id}) in ${elapsed}ms`);

    res.status(201).json({
      success: true,
      message: "Account created successfully! Please check your email for verification.",
      accessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    logger.error(`Registration error after ${elapsed}ms: ${error.message}`, error);

    res.status(500).json({
      success: false,
      message: error?.message || "Registration failed. Please check server connection.",
    });
  }
};

// ===============================
// LOGIN
// ===============================
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  const startTime = Date.now();
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      logger.warn("Login rejected: Missing email or password");
      res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      logger.warn("Login rejected: Database not connected (readyState=" + mongoose.connection.readyState + ")");
      res.status(503).json({
        success: false,
        message: "Database is currently connecting to MongoDB Atlas. Please ensure MONGO_URI is configured and wait a few moments.",
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    logger.info(`Login attempt for: ${normalizedEmail}`);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      logger.warn(`Login failed: User not found (${normalizedEmail})`);
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    // Check Account Lockout
    if (user.isLocked()) {
      const remainingMinutes = Math.ceil(
        (user.lockUntil!.getTime() - Date.now()) / (60 * 1000)
      );
      logger.warn(
        `Login blocked: Account locked for ${normalizedEmail}. ${remainingMinutes} mins remaining.`
      );
      res.status(423).json({
        success: false,
        message: `Account is locked due to 5 consecutive failed login attempts. Please try again in ${remainingMinutes} minutes.`,
      });
      return;
    }

    const deviceInfo = parseDeviceInfo(req);
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      logger.warn(
        `Login failed: Password mismatch for ${normalizedEmail} (Attempt ${user.failedLoginAttempts}/5)`
      );

      let isNowLocked = false;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lock
        isNowLocked = true;
        logger.warn(`Account locked for ${normalizedEmail} for 15 minutes`);
      }

      // Record failed attempt in login history
      user.loginHistory.unshift({
        ip: deviceInfo.ip,
        userAgent: req.headers["user-agent"] || "",
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        device: deviceInfo.device,
        loginAt: new Date(),
        status: isNowLocked ? "locked" : "failed",
      });

      if (user.loginHistory.length > 20) {
        user.loginHistory = user.loginHistory.slice(0, 20);
      }

      await user.save();

      if (isNowLocked) {
        res.status(423).json({
          success: false,
          message:
            "Too many failed login attempts. Your account has been temporarily locked for 15 minutes.",
        });
        return;
      }

      const remainingAttempts = 5 - user.failedLoginAttempts;
      res.status(401).json({
        success: false,
        message: `Invalid email or password. ${remainingAttempts} attempts remaining before account lock.`,
      });
      return;
    }

    // Check for previous device logins to trigger security alerts on new device
    const isKnownDevice = user.loginHistory.some(
      (h) => h.status === "success" && (h.ip === deviceInfo.ip || h.browser === deviceInfo.browser)
    );

    // Reset lockout counters & update login history
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();

    user.loginHistory.unshift({
      ip: deviceInfo.ip,
      userAgent: req.headers["user-agent"] || "",
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      device: deviceInfo.device,
      loginAt: new Date(),
      status: "success",
    });

    if (user.loginHistory.length > 20) {
      user.loginHistory = user.loginHistory.slice(0, 20);
    }

    await user.save();

    // Send new device login alert if appropriate
    if (!isKnownDevice && user.loginHistory.length > 1) {
      sendSecurityAlertEmail(user.email, user.name, {
        ip: deviceInfo.ip,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        device: deviceInfo.device,
        time: new Date().toUTCString(),
      }).catch((e) => logger.error("Alert email error:", e));
    }

    // Token Generation
    const tokenDurationDays = rememberMe ? 30 : 7;
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString(), Boolean(rememberMe));

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      userAgent: req.headers["user-agent"] || "",
      ipAddress: deviceInfo.ip,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      device: deviceInfo.device,
      expiresAt: new Date(Date.now() + tokenDurationDays * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: tokenDurationDays * 24 * 60 * 60 * 1000,
    });

    const elapsed = Date.now() - startTime;
    logger.info(
      `User logged in successfully: ${normalizedEmail} (ID: ${user._id}) in ${elapsed}ms`
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        country: user.country,
        timezone: user.timezone,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    logger.error(`Login error after ${elapsed}ms: ${error.message}`, error);

    res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error during login.",
    });
  }
};

// ===============================
// REFRESH TOKEN
// ===============================
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      logger.warn("Token refresh rejected: Token missing");
      res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
      return;
    }

    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken) {
      logger.warn("Token refresh rejected: Token not found in database");
      res.status(401).json({
        success: false,
        message: "Invalid or revoked refresh token",
      });
      return;
    }

    if (storedToken.expiresAt.getTime() < Date.now()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
      return;
    }

    const secret =
      process.env.JWT_REFRESH_SECRET || "edumind_jwt_refresh_dev_key_2026";
    jwt.verify(token, secret);

    // Update lastUsedAt
    storedToken.lastUsedAt = new Date();
    await storedToken.save();

    const accessToken = generateAccessToken(storedToken.user.toString());
    logger.info(`Access token refreshed for user: ${storedToken.user}`);

    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error: any) {
    logger.warn(`Token refresh failed: ${error.message}`);
    res.status(401).json({
      success: false,
      message: "Refresh token verification failed",
    });
  }
};

// ===============================
// LOGOUT CURRENT DEVICE
// ===============================
export const logout = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (token) {
      await RefreshToken.deleteOne({ token });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    logger.info("User logged out and cookie cleared");

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error: any) {
    logger.error(`Logout error: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ===============================
// LOGOUT ALL DEVICES
// ===============================
export const logoutAll = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    await RefreshToken.deleteMany({ user: req.user.id });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    logger.info(`All active sessions revoked for user: ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: "Successfully logged out from all devices.",
    });
  } catch (error: any) {
    logger.error(`Logout All Error: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: "Failed to logout from all devices.",
    });
  }
};

// ===============================
// FORGOT PASSWORD
// ===============================
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Always respond with success to prevent user enumeration
    if (!user) {
      logger.info(`Forgot password requested for non-existent email: ${normalizedEmail}`);
      res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
      return;
    }

    const resetToken = user.generateResetPasswordToken();
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      user.email
    )}`;

    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    logger.info(`Password reset link sent to: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error: any) {
    logger.error(`Forgot Password Error: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: "Failed to process password reset request.",
    });
  }
};

// ===============================
// RESET PASSWORD
// ===============================
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        message: "Reset token and new password are required.",
      });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
      return;
    }

    // Hash the plain reset token to match stored SHA-256 hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired (15-minute limit).",
      });
      return;
    }

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    // Revoke all existing sessions
    await RefreshToken.deleteMany({ user: user._id });

    // Send confirmation email
    sendPasswordChangedConfirmation(user.email, user.name).catch((e) =>
      logger.error("Confirmation email failed:", e)
    );

    logger.info(`Password successfully reset for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Password has been successfully reset! You can now log in with your new password.",
    });
  } catch (error: any) {
    logger.error(`Reset Password Error: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password.",
    });
  }
};

// ===============================
// VERIFY EMAIL
// ===============================
export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = (req.query.token as string) || req.body.token;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
      return;
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Verification token is invalid or has expired.",
      });
      return;
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();

    logger.info(`Email successfully verified for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Email address verified successfully! You now have full access to EduMind AI.",
    });
  } catch (error: any) {
    logger.error(`Email Verification Error: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: "Failed to verify email address.",
    });
  }
};

// ===============================
// RESEND EMAIL VERIFICATION
// ===============================
export const resendVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({
        success: false,
        message: "This email address is already verified.",
      });
      return;
    }

    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(
      user.email
    )}`;

    await sendVerificationEmail(user.email, user.name, verificationUrl);

    logger.info(`Resent verification email to: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "A fresh verification link has been sent to your email.",
    });
  } catch (error: any) {
    logger.error(`Resend Verification Error: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: "Failed to resend verification email.",
    });
  }
};

// ===============================
// GET ACTIVE SESSIONS
// ===============================
export const getSessions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const currentToken = req.cookies?.refreshToken;
    const tokens = await RefreshToken.find({ user: req.user.id }).sort({
      lastUsedAt: -1,
    });

    const user = await User.findById(req.user.id).select("loginHistory");

    const sessions = tokens.map((t) => ({
      id: t._id.toString(),
      browser: t.browser || "Unknown Browser",
      os: t.os || "Unknown OS",
      device: t.device || "Desktop",
      ipAddress: t.ipAddress || "127.0.0.1",
      lastUsedAt: t.lastUsedAt || t.createdAt,
      createdAt: t.createdAt,
      isCurrentSession: t.token === currentToken,
    }));

    res.status(200).json({
      success: true,
      sessions,
      loginHistory: user?.loginHistory?.slice(0, 10) || [],
    });
  } catch (error: any) {
    logger.error(`Get Sessions Error: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve active sessions.",
    });
  }
};

// ===============================
// REVOKE SPECIFIC SESSION
// ===============================
export const revokeSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { sessionId } = req.params;

    const token = await RefreshToken.findOne({
      _id: sessionId,
      user: req.user.id,
    });

    if (!token) {
      res.status(404).json({
        success: false,
        message: "Session not found or already terminated.",
      });
      return;
    }

    await RefreshToken.deleteOne({ _id: sessionId });

    logger.info(`Session ${sessionId} revoked by user ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: "Session revoked successfully.",
    });
  } catch (error: any) {
    logger.error(`Revoke Session Error: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: "Failed to revoke session.",
    });
  }
};

// ===============================
// DELETE ACCOUNT
// ===============================
export const deleteAccount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    if (password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(400).json({
          success: false,
          message: "Incorrect password. Account deletion aborted.",
        });
        return;
      }
    }

    // Clean up refresh tokens
    await RefreshToken.deleteMany({ user: user._id });

    // Delete user document
    await User.findByIdAndDelete(user._id);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    logger.info(`User account deleted: ${user.email} (ID: ${user._id})`);

    res.status(200).json({
      success: true,
      message: "Your account and associated data have been permanently deleted.",
    });
  } catch (error: any) {
    logger.error(`Delete Account Error: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account.",
    });
  }
};