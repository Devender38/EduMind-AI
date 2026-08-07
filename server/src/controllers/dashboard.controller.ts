import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Document from "../models/Document";
import Conversation from "../models/Conversation";
import Chat from "../models/Chat";
import Quiz from "../models/Quiz";
import { createLogger } from "../utils/logger";

const logger = createLogger("DashboardController");

export const getDashboardStats = async (
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

    const userId = req.user.id;
    logger.info(`Fetching live dashboard stats for user: ${userId}`);

    // 1. Documents stats
    const documents = await Document.find({ user: userId });
    const totalDocuments = documents.length;

    const storageBytes = documents.reduce(
      (total, doc) => total + (doc.fileSize || 0),
      0
    );

    const storageUsed = `${(storageBytes / (1024 * 1024)).toFixed(2)} MB`;

    // 2. Real-time Questions & Answers stats
    const conversations = await Conversation.find({ user: userId }).select("_id document title");
    const convIds = conversations.map((c) => c._id);

    const [totalQuestions, totalResponses, recentChats] = await Promise.all([
      Chat.countDocuments({
        conversation: { $in: convIds },
        role: "user",
      }),
      Chat.countDocuments({
        conversation: { $in: convIds },
        role: "assistant",
      }),
      Chat.find({
        conversation: { $in: convIds },
        role: "user",
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate<{ conversation: { title: string; document: string } }>("conversation", "title document")
        .lean(),
    ]);

    // 3. Quizzes stats
    const quizzes = await Quiz.find({ user: userId });
    const quizzesTaken = quizzes.length;
    const completedQuizzes = quizzes.filter((q) => q.completed);
    const avgScore = completedQuizzes.length > 0
      ? Math.round(
          completedQuizzes.reduce((acc, q) => acc + (q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0), 0) /
            completedQuizzes.length
        )
      : 0;

    // 4. Formatted Recent Activity Feed
    const recentActivity = recentChats.map((c: any) => ({
      _id: c._id,
      question: c.message,
      title: c.conversation?.title || "Study Session",
      createdAt: c.createdAt,
    }));

    logger.info(
      `Live stats computed for user ${userId}: docs=${totalDocuments}, questions=${totalQuestions}, responses=${totalResponses}, quizzes=${quizzesTaken}`
    );

    res.status(200).json({
      success: true,
      totalDocuments,
      totalQuestions,
      totalResponses,
      storageUsed,
      quizzesTaken,
      averageScore: avgScore,
      recentActivity,
    });
  } catch (error: any) {
    logger.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to load dashboard",
    });
  }
};