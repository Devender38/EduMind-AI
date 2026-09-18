import { Response } from "express";
import Feedback from "../models/Feedback";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createLogger } from "../utils/logger";

const logger = createLogger("FeedbackController");

/**
 * Submit user website review / feedback
 * POST /api/feedback
 */
export const submitFeedback = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "You must be logged in to submit feedback.",
      });
      return;
    }

    const { rating, category, message, quickTags } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid star rating between 1 and 5.",
      });
      return;
    }

    if (!message || message.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: "Please write a brief feedback message (at least 3 characters).",
      });
      return;
    }

    const newFeedback = await Feedback.create({
      user: req.user.id,
      userName: req.user.name || "Student",
      userEmail: req.user.email,
      userAvatar: req.user.avatar || "",
      rating: Number(rating),
      category: category || "General Review",
      message: message.trim(),
      quickTags: Array.isArray(quickTags) ? quickTags : [],
    });

    logger.info(
      `Feedback received from ${req.user.email} (Rating: ${rating}★, Category: ${category})`
    );

    res.status(201).json({
      success: true,
      message: "Thank you for your valuable feedback! 🌟",
      feedback: newFeedback,
    });
  } catch (error: any) {
    logger.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit feedback.",
    });
  }
};

/**
 * Get recent feedbacks / public reviews
 * GET /api/feedback
 */
export const getRecentFeedbacks = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select("-userEmail");

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error: any) {
    logger.error("Error fetching feedbacks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback list.",
    });
  }
};
