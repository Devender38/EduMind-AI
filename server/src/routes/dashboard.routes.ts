import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

/**
 * GET /api/dashboard/stats
 * Dashboard Statistics
 */
router.get(
  "/stats",
  protect,
  getDashboardStats
);

export default router;