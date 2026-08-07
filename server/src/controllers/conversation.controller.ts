import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Conversation from "../models/Conversation";
import Chat from "../models/Chat";
import Document from "../models/Document";

// ======================================
// Create Conversation
// ======================================

export const createConversation = async (
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

    const { documentId, title } = req.body;

    if (!documentId) {
      res.status(400).json({
        success: false,
        message: "Document ID is required",
      });
      return;
    }

    // Check document ownership
    const document = await Document.findOne({
      _id: documentId,
      user: req.user.id,
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: "Document not found",
      });
      return;
    }

    // Return existing conversation if available
    let conversation = await Conversation.findOne({
      user: req.user.id,
      document: documentId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        user: req.user.id,
        document: documentId,
        title: title || document.title,
      });
    }
    console.log("Conversation Created:", conversation);

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ======================================
// Get All Conversations
// ======================================

export const getConversations = async (
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

    const conversations = await Conversation.find({
      user: req.user.id,
    })
      .populate("document", "title")
      .sort({
        updatedAt: -1,
      });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Messages
// ======================================

export const getMessages = async (
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

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
      return;
    }

    const messages = await Chat.find({
      conversation: conversation._id,
    }).sort({
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Conversation
// ======================================

export const deleteConversation = async (
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

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
      return;
    }

    // Delete all chat messages
    await Chat.deleteMany({
      conversation: conversation._id,
    });

    // Delete conversation
    await conversation.deleteOne();

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};