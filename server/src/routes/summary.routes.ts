import { Router } from "express";
import { SummaryController } from "../controllers/summary.controller";

const router = Router();

router.get(
  "/:documentId",
  SummaryController.getSummary
);

router.post(
  "/:documentId/regenerate",
  SummaryController.regenerateSummary
);

export default router;