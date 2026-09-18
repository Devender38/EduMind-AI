import { Router } from "express";
import { QuizController } from "../controllers/quiz.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/:documentId",
  QuizController.getQuiz
);

router.post(
  "/:documentId/regenerate",
  QuizController.regenerateQuiz
);

router.post(
  "/:documentId/submit",
  protect,
  QuizController.submitQuiz
);

export default router;
