import { Router } from "express";
import {
  submitFeedback,
  getRecentFeedbacks,
} from "../controllers/feedback.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// POST /api/feedback (Logged-in users submit feedback)
router.post("/", protect, submitFeedback);

// GET /api/feedback (List recent feedbacks/reviews)
router.get("/", getRecentFeedbacks);

export default router;
