import { Request, Response } from "express";
import Document from "../models/Document";
import { AIService } from "../services/ai.service";
import { createLogger } from "../utils/logger";

const logger = createLogger("FlashcardController");

export class FlashcardController {

  static async getFlashcards(
    req: Request,
    res: Response
  ) {
    const startTime = Date.now();
    const { documentId } = req.params;

    try {
      if (!documentId) {
        logger.warn("Flashcard request rejected: Missing documentId");
        return res.status(400).json({
          success: false,
          message: "Document ID is required",
        });
      }

      logger.info(`Fetching flashcards for document: ${documentId}`);
      const document = await Document.findById(documentId);

      if (!document) {
        logger.warn(`Document ${documentId} not found`);
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      // Return cached flashcards if available
      if (
        Array.isArray(document.flashcards) &&
        document.flashcards.length > 0
      ) {
        logger.info(`Returning ${document.flashcards.length} cached flashcards for document: ${documentId}`);
        return res.status(200).json({
          success: true,
          flashcards: document.flashcards,
        });
      }

      // Generate fresh from AI
      logger.info(`Generating fresh AI flashcards for document: ${documentId}...`);
      const ai = await AIService.flashcards(documentId);
      const generatedCards = Array.isArray(ai.flashcards) ? ai.flashcards : [];

      const updatedDoc = await Document.findByIdAndUpdate(
        documentId,
        { $set: { flashcards: generatedCards } },
        { new: true }
      );

      const elapsed = Date.now() - startTime;
      logger.info(`Saved ${generatedCards.length} flashcards for doc ${documentId} in ${elapsed}ms`);

      return res.status(200).json({
        success: true,
        flashcards: updatedDoc?.flashcards || generatedCards,
      });

    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      logger.error(`Flashcard error for doc ${documentId} after ${elapsed}ms: ${error.message}`, error);

      return res.status(500).json({
        success: false,
        message: error.message || "Flashcard generation failed",
      });
    }
  }

  static async regenerateFlashcards(
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

      logger.info(`Force regenerating flashcards for document: ${documentId}`);
      const document = await Document.findById(documentId);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      const ai = await AIService.flashcards(documentId);
      const generatedCards = Array.isArray(ai.flashcards) ? ai.flashcards : [];

      const updatedDoc = await Document.findByIdAndUpdate(
        documentId,
        { $set: { flashcards: generatedCards } },
        { new: true }
      );

      const elapsed = Date.now() - startTime;
      logger.info(`Regenerated ${generatedCards.length} flashcards in ${elapsed}ms`);

      return res.status(200).json({
        success: true,
        flashcards: updatedDoc?.flashcards || generatedCards,
      });
    } catch (error: any) {
      logger.error(`Regenerate flashcards error: ${error.message}`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Flashcard regeneration failed",
      });
    }
  }

}