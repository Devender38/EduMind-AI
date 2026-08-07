import { Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { AuthRequest } from "../middlewares/auth.middleware";
import { uploadImage, deleteImage } from "../services/cloudinary.service";
import { sendPasswordChangedConfirmation } from "../services/email.service";
import { createLogger } from "../utils/logger";

const logger = createLogger("UserController");

// ======================================
// Get Current User Profile
// ======================================
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const user = await User.findById(req.user.id).select(
      "-password -emailVerificationToken -emailVerificationExpire -resetPasswordToken -resetPasswordExpire"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username || "",
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        bio: user.bio || "",
        phone: user.phone || "",
        country: user.country || "",
        timezone: user.timezone || "UTC",
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    logger.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch profile",
    });
  }
};

// ======================================
// Update User Profile
// ======================================
export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { name, username, bio, phone, country, timezone, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (name) user.name = name.trim();
    if (username !== undefined) {
      const trimmedUser = username.trim().toLowerCase();
      if (trimmedUser && trimmedUser !== user.username) {
        const existing = await User.findOne({ username: trimmedUser });
        if (existing && existing._id.toString() !== user._id.toString()) {
          res.status(400).json({
            success: false,
            message: "Username is already taken by another student.",
          });
          return;
        }
        user.username = trimmedUser;
      } else if (!trimmedUser) {
        user.username = undefined;
      }
    }
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (country !== undefined) user.country = country;
    if (timezone !== undefined) user.timezone = timezone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    logger.info(`Profile updated for user: ${user._id}`);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username || "",
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
    logger.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

// ======================================
// Upload Profile Avatar Photo (Auto-Deletes Old Avatar)
// ======================================
export const uploadAvatar = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Please select an image file to upload",
      });
      return;
    }

    logger.info(
      `Uploading profile photo for user '${req.user.id}': ${req.file.originalname} (${(
        req.file.size / 1024
      ).toFixed(1)} KB)`
    );

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // If an existing Cloudinary avatar exists, delete it first to conserve storage
    if (user.avatarPublicId) {
      deleteImage(user.avatarPublicId).catch((e) =>
        logger.warn(`Could not delete previous avatar ${user.avatarPublicId}: ${e.message}`)
      );
    }

    // Upload to Cloudinary
    const result = await uploadImage(
      req.file.buffer,
      `avatar_${req.user.id}_${Date.now()}`
    );

    user.avatar = result.secure_url;
    user.avatarPublicId = result.public_id;
    await user.save();

    logger.info(`Avatar updated for user '${req.user.id}': ${result.secure_url}`);

    res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      avatar: result.secure_url,
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username || "",
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
    logger.error("Upload Avatar Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload avatar",
    });
  }
};

// ======================================
// Remove Avatar Photo
// ======================================
export const removeAvatar = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user.avatarPublicId) {
      deleteImage(user.avatarPublicId).catch((e) => logger.warn(e.message));
    }

    user.avatar = "";
    user.avatarPublicId = "";
    await user.save();

    logger.info(`Avatar removed for user: ${user._id}`);

    res.status(200).json({
      success: true,
      message: "Profile photo removed.",
      avatar: "",
    });
  } catch (error: any) {
    logger.error("Remove Avatar Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove avatar.",
    });
  }
};

// ======================================
// Update User Password (Change Password)
// ======================================
export const updatePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
      return;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Send security notification
    sendPasswordChangedConfirmation(user.email, user.name).catch((e) =>
      logger.error("Password notification error:", e)
    );

    logger.info(`Password successfully changed for user: ${user._id}`);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    logger.error("Update Password Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update password",
    });
  }
};