import { Router } from "express";

import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "../controllers/document.controller";

import upload from "../middlewares/upload.middleware";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

/**
 * Upload PDF
 * POST /api/documents/upload
 */
router.post(
  "/upload",
  protect,
  upload.single("pdf"),
  uploadDocument
);

/**
 * Get My Documents
 * GET /api/documents
 */
router.get(
  "/",
  protect,
  getDocuments
);

/**
 * Delete Document
 * DELETE /api/documents/:id
 */
router.delete(
  "/:id",
  protect,
  deleteDocument
);

export default router;