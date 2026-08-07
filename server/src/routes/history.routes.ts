import { Router } from "express";
import { HistoryController } from "../controllers/history.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.get("/", HistoryController.getActivityHistory);
router.post("/log", HistoryController.logActivity);
router.get("/telemetry", HistoryController.getAnalyticsTelemetry);

export default router;
