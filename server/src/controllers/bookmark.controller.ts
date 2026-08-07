import { Request, Response } from "express";
import Bookmark from "../models/Bookmark";
import ActivityLog from "../models/ActivityLog";
import { createLogger } from "../utils/logger";

const logger = createLogger("BookmarkController");

export class BookmarkController {

  /**
   * Create or toggle bookmark
   */
  static async createBookmark(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { documentId, type, title, content, pageNumber, metadata } = req.body;

    try {
      if (!type || !title || !content) {
        return res.status(400).json({
          success: false,
          message: "type, title, and content are required",
        });
      }

      const bookmark = await Bookmark.create({
        userId,
        documentId,
        type,
        title,
        content,
        pageNumber,
        metadata: metadata || {},
      });

      await ActivityLog.create({
        userId,
        documentId,
        activityType: "search",
        title: `Bookmarked ${type}: ${title}`,
        metadata: { bookmarkId: bookmark._id, type },
      });

      return res.status(201).json({
        success: true,
        bookmark,
      });
    } catch (error: any) {
      logger.error(`Create bookmark failed: ${error.message}`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to save bookmark",
      });
    }
  }

  /**
   * Get all user bookmarks
   */
  static async getBookmarks(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { type, documentId } = req.query;

    try {
      const filter: any = { userId };
      if (type) filter.type = type;
      if (documentId) filter.documentId = documentId;

      const bookmarks = await Bookmark.find(filter)
        .sort({ createdAt: -1 })
        .populate("documentId", "title fileUrl");

      return res.status(200).json({
        success: true,
        count: bookmarks.length,
        bookmarks,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to load bookmarks",
      });
    }
  }

  /**
   * Delete a bookmark
   */
  static async deleteBookmark(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { id } = req.params;

    try {
      const bookmark = await Bookmark.findOneAndDelete({ _id: id, userId });
      if (!bookmark) {
        return res.status(404).json({
          success: false,
          message: "Bookmark not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Bookmark removed",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to remove bookmark",
      });
    }
  }

}
