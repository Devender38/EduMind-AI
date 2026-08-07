import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  generatePlan,
  getPlan,
} from "../controllers/planner.controller";

const router = Router();

router.use(protect);

router.get("/:documentId", getPlan);
router.post("/:documentId", generatePlan);

export default router;
