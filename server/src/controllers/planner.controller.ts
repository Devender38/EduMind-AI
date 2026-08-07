import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Document from "../models/Document";
import { AIService } from "../services/ai.service";
import { createLogger } from "../utils/logger";

const logger = createLogger("PlannerController");

export const generatePlan = async (
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

    const { documentId } = req.params;
    const { planType = "weekly", force = false } = req.body;

    logger.info(`Study plan request for doc ${documentId} (type=${planType}, force=${force})`);

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

    // Check if plan of this type already exists and not forced to regenerate
    const existingPlan = (document.studyPlan as any)?.[planType];
    if (existingPlan && !force) {
      logger.info(`Returning cached ${planType} plan for doc ${documentId}`);
      res.status(200).json({
        success: true,
        plan: existingPlan,
        planType,
        cached: true,
      });
      return;
    }

    // Call Python AI Service
    const aiResponse = await AIService.studyPlan(documentId, planType);

    // Atomic update to avoid Mongoose version conflicts / DocumentNotFoundError
    await Document.findByIdAndUpdate(
      documentId,
      {
        $set: {
          [`studyPlan.${planType}`]: aiResponse.plan,
        },
      },
      { new: true }
    );

    logger.info(`Generated and saved ${planType} plan for doc ${documentId}`);

    res.status(200).json({
      success: true,
      plan: aiResponse.plan,
      planType,
      cached: false,
    });
  } catch (error: any) {
    logger.error("Planner Generation Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate study plan",
    });
  }
};

export const getPlan = async (
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

    const { documentId } = req.params;
    const planType = (req.query.planType as string) || "weekly";

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

    const existingPlan = (document.studyPlan as any)?.[planType] || "";

    res.status(200).json({
      success: true,
      plan: existingPlan,
      planType,
    });
  } catch (error: any) {
    logger.error("Planner Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch study plan",
    });
  }
};
