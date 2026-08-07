import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import { createLogger } from "../utils/logger";

const logger = createLogger("AuthMiddleware");

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: "student" | "admin" | "premium" | "guest" | string;
    avatar?: string;
    isVerified?: boolean;
  };
}

interface TokenPayload extends JwtPayload {
  id: string;
  type?: string;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authorization token missing or session expired",
      });
      return;
    }

    const secret = process.env.JWT_SECRET || "edumind_jwt_secret_dev_key_2026";

    const decoded = jwt.verify(token, secret) as TokenPayload;

    if (decoded.type && decoded.type !== "access") {
      res.status(401).json({
        success: false,
        message: "Invalid token type",
      });
      return;
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User account no longer exists",
      });
      return;
    }

    if (user.isLocked()) {
      const remainingMinutes = Math.ceil(
        (user.lockUntil!.getTime() - Date.now()) / (60 * 1000)
      );
      res.status(403).json({
        success: false,
        message: `Account is temporarily locked due to multiple failed login attempts. Try again in ${remainingMinutes} minutes.`,
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
    };

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
      return;
    }

    if (error.name === "JsonWebTokenError") {
      res.status(401).json({
        success: false,
        message: "Invalid authorization token",
      });
      return;
    }

    logger.error(`Protect Middleware Error: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Authentication error",
    });
  }
};

// Role-Based Access Control (RBAC) Guard
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Access denied for user '${req.user.id}' with role '${req.user.role}'. Required roles: ${roles.join(", ")}`
      );
      res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: ${roles.join(", ")}`,
      });
      return;
    }

    next();
  };
};

// Email Verification Guard
export const requireVerified = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  if (!req.user.isVerified) {
    res.status(403).json({
      success: false,
      message: "Please verify your email address to access this resource.",
      requiresVerification: true,
    });
    return;
  }

  next();
};