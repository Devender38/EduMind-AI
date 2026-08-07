import { Request, Response } from "express";
import mongoose from "mongoose";

import Conversation from "../models/Conversation";
import Chat from "../models/Chat";
import Document from "../models/Document";
import ActivityLog from "../models/ActivityLog";
import { AIService } from "../services/ai.service";
import { createLogger } from "../utils/logger";

const logger = createLogger("ChatController");

export class ChatController {
  static async chat(req: Request, res: Response) {
    const startTime = Date.now();

    try {
      const { conversationId, question, documentId } = req.body;
      const userId = (req as any).user?._id;

      if (!question || question.trim() === "") {
        logger.warn("Chat rejected: Empty question");
        return res.status(400).json({
          success: false,
          message: "Question is required",
        });
      }

      let conversation: any = null;

      // 1. If conversationId is provided and valid, look it up
      if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
        conversation = await Conversation.findById(conversationId);
      }

      // 2. If no valid conversation found by conversationId, check documentId
      if (!conversation && documentId && mongoose.Types.ObjectId.isValid(documentId)) {
        if (userId) {
          conversation = await Conversation.findOne({
            user: userId,
            document: documentId,
          }).sort({ updatedAt: -1 });

          if (!conversation) {
            const doc = await Document.findById(documentId);
            conversation = await Conversation.create({
              user: userId,
              document: documentId,
              title: doc?.title || "New Study Conversation",
            });
          }
        }
      }

      // 3. If still no conversation, find latest conversation for user
      if (!conversation && userId) {
        conversation = await Conversation.findOne({ user: userId }).sort({
          updatedAt: -1,
        });
      }

      const docId = conversation?.document
        ? conversation.document.toString()
        : documentId && mongoose.Types.ObjectId.isValid(documentId)
        ? documentId
        : undefined;

      logger.info(
        `Processing chat query: "${question.substring(0, 80)}" (doc: ${docId || "all"}, conv: ${conversation?._id || "none"})`
      );

      // Ask AI RAG service
      const aiResult = await AIService.ask(question, docId);

      let userMessage: any = null;
      let assistantMessage: any = null;

      // Save messages if conversation exists
      if (conversation) {
        userMessage = await Chat.create({
          conversation: conversation._id,
          role: "user",
          message: question,
        });

        assistantMessage = await Chat.create({
          conversation: conversation._id,
          role: "assistant",
          message: aiResult.answer,
          sources: aiResult.sources || [],
        });

        await Conversation.findByIdAndUpdate(conversation._id, {
          $set: { updatedAt: new Date() },
        });
      }

      // Log activity
      if (userId) {
        await ActivityLog.create({
          user: userId,
          activityType: "chat_query",
          title: `Asked: "${question.substring(0, 50)}${question.length > 50 ? "..." : ""}"`,
          documentId: docId && mongoose.Types.ObjectId.isValid(docId) ? docId : undefined,
          metadata: {
            sourcesCount: aiResult.sources?.length || 0,
            conversationId: conversation?._id,
          },
        }).catch((err) => logger.warn("Failed saving chat activity log:", err));
      }

      const elapsed = Date.now() - startTime;
      logger.info(`Chat flow completed in ${elapsed}ms`);

      return res.status(200).json({
        success: true,
        answer: aiResult.answer,
        sources: aiResult.sources || [],
        conversationId: conversation?._id,
        messages: {
          user: userMessage,
          assistant: assistantMessage,
        },
      });
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      logger.error(`Chat error after ${elapsed}ms: ${error.message}`, error);

      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}