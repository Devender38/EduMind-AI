import { Request, Response } from "express";
import Document from "../models/Document";
import { AIService } from "../services/ai.service";
import { createLogger } from "../utils/logger";

const logger = createLogger("QuizController");

export class QuizController {

  static async getQuiz(
    req: Request,
    res: Response
  ) {
    const startTime = Date.now();
    const { documentId } = req.params;

    try {
      if (!documentId) {
        logger.warn("Quiz request rejected: Missing documentId");
        return res.status(400).json({
          success: false,
          message: "Document ID is required",
        });
      }

      logger.info(`Fetching quiz for document: ${documentId}`);
      const document = await Document.findById(documentId);

      if (!document) {
        logger.warn(`Document ${documentId} not found`);
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      // Return cached quiz if exists
      if (
        Array.isArray(document.quiz) &&
        document.quiz.length > 0
      ) {
        logger.info(`Returning ${document.quiz.length} cached quiz questions for document: ${documentId}`);
        return res.status(200).json({
          success: true,
          quiz: document.quiz,
        });
      }

      // Generate from AI
      logger.info(`Generating fresh AI quiz for document: ${documentId}...`);
      const ai = await AIService.quiz(documentId);
      const generatedQuiz = Array.isArray(ai.quiz) ? ai.quiz : [];

      // Atomic update to avoid Mongoose VersionError / optimistic concurrency conflict
      const updatedDoc = await Document.findByIdAndUpdate(
        documentId,
        { $set: { quiz: generatedQuiz } },
        { new: true }
      );

      const elapsed = Date.now() - startTime;
      logger.info(`Saved ${generatedQuiz.length} quiz questions for doc ${documentId} in ${elapsed}ms`);

      return res.status(200).json({
        success: true,
        quiz: updatedDoc?.quiz || generatedQuiz,
      });

    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      logger.error(`Quiz error for doc ${documentId} after ${elapsed}ms: ${error.message}`, error);

      return res.status(500).json({
        success: false,
        message: error.message || "Quiz generation failed",
      });
    }
  }

  static async regenerateQuiz(
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

      logger.info(`Force regenerating quiz for document: ${documentId}`);
      const document = await Document.findById(documentId);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      const ai = await AIService.quiz(documentId);
      const generatedQuiz = Array.isArray(ai.quiz) ? ai.quiz : [];

      const updatedDoc = await Document.findByIdAndUpdate(
        documentId,
        { $set: { quiz: generatedQuiz } },
        { new: true }
      );

      const elapsed = Date.now() - startTime;
      logger.info(`Regenerated ${generatedQuiz.length} quiz questions in ${elapsed}ms`);

      return res.status(200).json({
        success: true,
        quiz: updatedDoc?.quiz || generatedQuiz,
      });
    } catch (error: any) {
      logger.error(`Regenerate quiz error: ${error.message}`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Quiz regeneration failed",
      });
    }
  }

}