import { Router } from "express";
import { QuizController } from "../controllers/quiz.controller";

const router = Router();

router.get(
  "/:documentId",
  QuizController.getQuiz
);

router.post(
  "/:documentId/regenerate",
  QuizController.regenerateQuiz
);

export default router;
