import { Router } from "express";

import {
  createConversation,
  getConversations,
  getMessages,
  deleteConversation,
} from "../controllers/conversation.controller";

import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", protect, createConversation);

router.get("/", protect, getConversations);

router.get("/:id/messages", protect, getMessages);

router.delete("/:id", protect, deleteConversation);

export default router;