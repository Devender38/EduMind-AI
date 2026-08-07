import { Response } from "express";
import Document from "../models/Document";
import { uploadPDF } from "../services/cloudinary.service";
import { AIService } from "../services/ai.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createLogger } from "../utils/logger";

const logger = createLogger("DocumentController");

// ======================================
// Upload Document
// ======================================

export const uploadDocument = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const startTime = Date.now();

  try {
    if (!req.user) {
      logger.warn("Document upload rejected: Unauthorized user");
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!req.file) {
      logger.warn("Document upload rejected: No file provided");
      res.status(400).json({
        success: false,
        message: "Please upload a PDF file",
      });
      return;
    }

    logger.info(
      `Starting document upload for user '${req.user.id}': ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`
    );

    // Upload to Cloudinary
    const result = await uploadPDF(
      req.file.buffer,
      req.file.originalname
    );

    // Save in MongoDB
    const document = await Document.create({
      user: req.user.id,
      title: req.file.originalname.replace(/\.pdf$/i, ""),
      fileName: req.file.originalname,
      fileUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      extractedText: "",
      status: "processing",
    });

    logger.info(`MongoDB document record created with ID: ${document._id}`);

    // ======================================
    // Send PDF to Python AI Service
    // ======================================
    try {
      logger.info(`Forwarding document ${document._id} to AI microservice for indexing...`);
      const aiResult = await AIService.uploadPDF(
        document.fileUrl,
        document._id.toString()
      );

      document.status = "completed";
      document.summary = aiResult.summary || "";
      document.keywords = aiResult.keywords || [];
      document.pageCount = aiResult.pageCount || 0;
      document.chunkCount = aiResult.chunkCount || 0;
      document.readingTime = aiResult.readingTime || 0;

      await document.save();
      const elapsed = Date.now() - startTime;
      logger.info(`Document ${document._id} fully indexed & processed in ${elapsed}ms`);
    } catch (err: any) {
      logger.error(`AI indexing failed for doc ${document._id}: ${err.message}`, err);
      document.status = "failed";
      await document.save();
    }

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      document,
    });
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    logger.error(`Document upload flow failed after ${elapsed}ms: ${error.message}`, error);

    res.status(500).json({
      success: false,
      message: error.message || "Document upload failed",
    });
  }
};

// ======================================
// Get Documents
// ======================================

export const getDocuments = async (
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

    logger.info(`Fetching documents list for user: ${req.user.id}`);
    const documents = await Document.find({
      user: req.user.id,
    })
      .select("-__v")
      .sort({
        createdAt: -1,
      });

    logger.info(`Found ${documents.length} documents for user ${req.user.id}`);

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error: any) {
    logger.error(`Failed to fetch documents for user: ${error.message}`, error);

    res.status(500).json({
      success: false,
      message: error.message || "Unable to fetch documents",
    });
  }
};

// ======================================
// Delete Document
// ======================================

export const deleteDocument = async (
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

    const documentId = req.params.id;
    logger.info(`User ${req.user.id} requested deletion of document: ${documentId}`);

    const document = await Document.findOne({
      _id: documentId,
      user: req.user.id,
    });

    if (!document) {
      logger.warn(`Document ${documentId} not found for deletion`);
      res.status(404).json({
        success: false,
        message: "Document not found",
      });
      return;
    }

    await document.deleteOne();
    logger.info(`Document ${documentId} deleted successfully from database`);

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error: any) {
    logger.error(`Error deleting document: ${error.message}`, error);

    res.status(500).json({
      success: false,
      message: error.message || "Unable to delete document",
    });
  }
};