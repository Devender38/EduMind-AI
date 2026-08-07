import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

/**
 * POST /api/chat
 * Send question to AI
 */
router.post(
  "/",
  protect,
  ChatController.chat
);

export default router;