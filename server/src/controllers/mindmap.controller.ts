import { Request, Response } from "express";
import Document from "../models/Document";
import ActivityLog from "../models/ActivityLog";
import { AIService } from "../services/ai.service";
import { createLogger } from "../utils/logger";

const logger = createLogger("MindMapController");

export class MindMapController {

  static async generateMindMap(req: Request, res: Response) {
    const startTime = Date.now();
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { documentId } = req.body;

    try {
      if (!documentId) {
        return res.status(400).json({
          success: false,
          message: "documentId is required",
        });
      }

      logger.info(`Generating Mind Map for doc: ${documentId}`);
      const aiResponse = await AIService.mindmap(documentId);

      await ActivityLog.create({
        userId,
        documentId,
        activityType: "mindmap",
        title: `Generated Concept Mind Map`,
        metadata: { documentId },
      });

      const elapsed = Date.now() - startTime;
      logger.info(`Mind Map generated in ${elapsed}ms for doc ${documentId}`);

      return res.status(200).json({
        success: true,
        mindmap: aiResponse.mindmap,
      });
    } catch (error: any) {
      logger.error(`Mind map generation error: ${error.message}`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to generate mind map",
      });
    }
  }

}
