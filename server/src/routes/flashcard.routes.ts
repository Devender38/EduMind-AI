import { Router } from "express";
import { FlashcardController } from "../controllers/flashcard.controller";

const router = Router();

router.get(
  "/:documentId",
  FlashcardController.getFlashcards
);

router.post(
  "/:documentId/regenerate",
  FlashcardController.regenerateFlashcards
);

export default router;