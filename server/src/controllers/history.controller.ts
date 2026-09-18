import { Request, Response } from "express";
import ActivityLog from "../models/ActivityLog";
import Document from "../models/Document";
import Quiz from "../models/Quiz";
import Note from "../models/Note";
import Chat from "../models/Chat";
import { createLogger } from "../utils/logger";

const logger = createLogger("HistoryController");

export class HistoryController {

  /**
   * Get unified activity and study history
   */
  static async getActivityHistory(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { activityType, limit = 50 } = req.query;

    try {
      const filter: any = { userId };
      if (activityType) filter.activityType = activityType;

      const history = await ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .populate("documentId", "title fileUrl");

      return res.status(200).json({
        success: true,
        count: history.length,
        history,
      });
    } catch (error: any) {
      logger.error(`Get history error: ${error.message}`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch activity history",
      });
    }
  }

  /**
   * Log an activity directly from client
   */
  static async logActivity(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { documentId, activityType, title, metadata } = req.body;

    try {
      const log = await ActivityLog.create({
        userId,
        documentId,
        activityType,
        title,
        metadata: metadata || {},
      });

      return res.status(201).json({
        success: true,
        log,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to record activity",
      });
    }
  }

  /**
   * Get comprehensive aggregated learning telemetry for Analytics page
   */
  static async getAnalyticsTelemetry(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;

    try {
      const userFilter = { $or: [{ user: userId }, { userId }] };
      const [totalDocs, totalQuizzes, totalNotes, totalChats, activityLogs, completedQuizzes] =
        await Promise.all([
          Document.countDocuments(userFilter),
          Quiz.countDocuments(userFilter),
          Note.countDocuments(userFilter),
          Chat.countDocuments(userFilter),
          ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(100),
          Quiz.find({ ...userFilter, completed: true }).select("score totalQuestions createdAt"),
        ]);

      // Calculate streak & study distribution
      const uniqueDays = new Set(
        activityLogs.map((log) =>
          new Date(log.createdAt).toISOString().split("T")[0]
        )
      );

      const streakDays = Math.max(1, uniqueDays.size);

      // Average Quiz Score
      const averageQuizScore = completedQuizzes.length > 0
        ? Math.round(
            completedQuizzes.reduce(
              (acc, q) => acc + (q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0),
              0
            ) / completedQuizzes.length
          )
        : 0;

      // Last 7 days dynamic activity breakdown
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const last7Days: Array<{ day: string; date: string; count: number; hours: number }> = [];
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const dayName = days[d.getDay()];

        const dayLogs = activityLogs.filter(
          (log) => new Date(log.createdAt).toISOString().split("T")[0] === dateStr
        );
        const count = dayLogs.length;
        const hours = count > 0 ? +(count * 0.4).toFixed(1) : 0;

        last7Days.push({
          day: dayName,
          date: dateStr,
          count,
          hours,
        });
      }

      return res.status(200).json({
        success: true,
        telemetry: {
          documentsCount: totalDocs,
          quizzesCount: totalQuizzes,
          averageQuizScore,
          notesCount: totalNotes,
          questionsAsked: totalChats,
          learningStreak: streakDays,
          recentActivities: activityLogs.slice(0, 10),
          weeklyActivity: last7Days,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch telemetry",
      });
    }
  }

}
