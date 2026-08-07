import { Request, Response } from "express";
import Document from "../models/Document";
import { AIService } from "../services/ai.service";
import { createLogger } from "../utils/logger";

const logger = createLogger("SummaryController");

export class SummaryController {

  static async getSummary(
    req: Request,
    res: Response
  ) {
    const startTime = Date.now();
    const { documentId } = req.params;

    try {
      if (!documentId) {
        logger.warn("Summary request rejected: Missing documentId");
        return res.status(400).json({
          success: false,
          message: "Document ID is required",
        });
      }

      logger.info(`Fetching summary for document: ${documentId}`);
      const document = await Document.findById(documentId);

      if (!document) {
        logger.warn(`Document ${documentId} not found`);
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      // Return cached summary if detailed enough (> 100 chars)
      if (document.summary && document.summary.trim().length > 100) {
        logger.info(`Returning cached summary for document: ${documentId}`);
        return res.status(200).json({
          success: true,
          summary: document.summary,
          keywords: document.keywords || [],
          reading_time: document.readingTime || Math.max(1, Math.ceil(document.summary.split(/\s+/).length / 200)),
          page_count: document.pageCount || 0,
          chunk_count: document.chunkCount || 0,
        });
      }

      // Generate AI Summary
      logger.info(`Generating fresh detailed AI summary for document: ${documentId}...`);
      const ai = await AIService.summary(documentId);

      const updatedDoc = await Document.findByIdAndUpdate(
        documentId,
        {
          $set: {
            summary: ai.summary,
            keywords: ai.keywords || [],
            pageCount: ai.page_count || document.pageCount || 0,
            chunkCount: ai.chunk_count || document.chunkCount || 0,
            readingTime: ai.reading_time || document.readingTime || 0,
          },
        },
        { new: true }
      );

      const elapsed = Date.now() - startTime;
      logger.info(`Summary generated and persisted for doc ${documentId} in ${elapsed}ms`);

      return res.status(200).json({
        success: true,
        summary: updatedDoc?.summary || ai.summary,
        keywords: updatedDoc?.keywords || ai.keywords || [],
        reading_time: updatedDoc?.readingTime || ai.reading_time,
        page_count: updatedDoc?.pageCount || document.pageCount || 0,
        chunk_count: updatedDoc?.chunkCount || ai.chunk_count,
      });

    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      logger.error(`Summary error for doc ${documentId} after ${elapsed}ms: ${error.message}`, error);

      return res.status(500).json({
        success: false,
        message: error.message || "Summary generation failed",
      });
    }
  }

  static async regenerateSummary(
    req: Request,
    res: Response
  ) {
    const startTime = Date.now();
    const { documentId } = req.params;

    try {
      if (!documentId) {
        return res.status(400).json({
          success: false,
          message: "Document ID is required",
        });
      }

      logger.info(`Force regenerating detailed summary for document: ${documentId}`);
      const document = await Document.findById(documentId);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      const ai = await AIService.summary(documentId);

      const updatedDoc = await Document.findByIdAndUpdate(
        documentId,
        {
          $set: {
            summary: ai.summary,
            keywords: ai.keywords || [],
            pageCount: ai.page_count || document.pageCount || 0,
            chunkCount: ai.chunk_count || document.chunkCount || 0,
            readingTime: ai.reading_time || document.readingTime || 0,
          },
        },
        { new: true }
      );

      const elapsed = Date.now() - startTime;
      logger.info(`Regenerated detailed summary for doc ${documentId} in ${elapsed}ms`);

      return res.status(200).json({
        success: true,
        summary: updatedDoc?.summary || ai.summary,
        keywords: updatedDoc?.keywords || ai.keywords || [],
        reading_time: updatedDoc?.readingTime || ai.reading_time,
        page_count: updatedDoc?.pageCount || document.pageCount || 0,
        chunk_count: updatedDoc?.chunkCount || ai.chunk_count,
      });
    } catch (error: any) {
      logger.error(`Regenerate summary error: ${error.message}`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Summary regeneration failed",
      });
    }
  }

}