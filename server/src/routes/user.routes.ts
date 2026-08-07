import express from "express";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  updatePassword,
} from "../controllers/user.controller";
import { protect } from "../middlewares/auth.middleware";
import { uploadAvatarMiddleware } from "../middlewares/upload.middleware";

const router = express.Router();

// All user routes are protected
router.use(protect);

// GET /api/users/profile
router.get("/profile", getProfile);

// PUT /api/users/profile
router.put("/profile", updateProfile);

// POST /api/users/avatar
router.post("/avatar", uploadAvatarMiddleware.single("avatar"), uploadAvatar);

// DELETE /api/users/avatar
router.delete("/avatar", removeAvatar);

// PUT /api/users/password
router.put("/password", updatePassword);

export default router;