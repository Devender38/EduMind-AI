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

router.post(
  "/transcribe-voice",
  protect,
  ChatController.transcribeVoice
);

router.post(
  "/voice-tutor",
  protect,
  ChatController.voiceTutor
);

// High-reliability MP3 audio TTS stream
router.get(
  "/tts",
  ChatController.tts
);

export default router;