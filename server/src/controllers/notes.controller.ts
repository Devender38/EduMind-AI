import { Request, Response } from "express";
import Note from "../models/Note";
import Document from "../models/Document";
import ActivityLog from "../models/ActivityLog";
import { AIService } from "../services/ai.service";
import { createLogger } from "../utils/logger";

const logger = createLogger("NotesController");

export class NotesController {

  /**
   * Generate new AI study notes
   */
  static async generateNotes(req: Request, res: Response) {
    const startTime = Date.now();
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { documentId, noteType = "detailed", title } = req.body;

    try {
      if (!documentId) {
        return res.status(400).json({
          success: false,
          message: "documentId is required",
        });
      }

      logger.info(`Generating ${noteType} notes for doc: ${documentId} (user: ${userId})`);

      const doc = await Document.findById(documentId);
      const docTitle = doc?.title || "Document";

      const aiResponse = await AIService.notes(documentId, noteType);

      const generatedTitle =
        title ||
        `${docTitle} - ${noteType.charAt(0).toUpperCase() + noteType.slice(1)} Notes`;

      const newNote = await Note.create({
        userId,
        documentId,
        title: generatedTitle,
        noteType,
        content: aiResponse.notes,
        tags: [noteType, docTitle],
      });

      // Log activity
      await ActivityLog.create({
        userId,
        documentId,
        activityType: "notes",
        title: `Generated ${noteType} notes: ${generatedTitle}`,
        metadata: { noteId: newNote._id, noteType },
      });

      const elapsed = Date.now() - startTime;
      logger.info(`Notes created successfully in ${elapsed}ms: ${newNote._id}`);

      return res.status(201).json({
        success: true,
        note: newNote,
      });
    } catch (error: any) {
      logger.error(`Generate notes failed: ${error.message}`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to generate study notes",
      });
    }
  }

  /**
   * Get all notes for user
   */
  static async getNotes(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { documentId, noteType } = req.query;

    try {
      const filter: any = { userId };
      if (documentId) filter.documentId = documentId;
      if (noteType) filter.noteType = noteType;

      const notes = await Note.find(filter)
        .sort({ updatedAt: -1 })
        .populate("documentId", "title fileUrl");

      return res.status(200).json({
        success: true,
        count: notes.length,
        notes,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to load notes",
      });
    }
  }

  /**
   * Get single note by ID
   */
  static async getNoteById(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { id } = req.params;

    try {
      const note = await Note.findOne({ _id: id, userId }).populate(
        "documentId",
        "title fileUrl"
      );

      if (!note) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }

      return res.status(200).json({
        success: true,
        note,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch note",
      });
    }
  }

  /**
   * Update note content or title
   */
  static async updateNote(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { id } = req.params;
    const { title, content, isBookmarked, tags } = req.body;

    try {
      const note = await Note.findOne({ _id: id, userId });
      if (!note) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }

      if (title !== undefined) note.title = title;
      if (content !== undefined) note.content = content;
      if (isBookmarked !== undefined) note.isBookmarked = isBookmarked;
      if (tags !== undefined) note.tags = tags;

      await note.save();

      return res.status(200).json({
        success: true,
        note,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update note",
      });
    }
  }

  /**
   * Delete note
   */
  static async deleteNote(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { id } = req.params;

    try {
      const note = await Note.findOneAndDelete({ _id: id, userId });
      if (!note) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Note deleted successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete note",
      });
    }
  }

}
