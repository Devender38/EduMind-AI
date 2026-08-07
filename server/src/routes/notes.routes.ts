import { Router } from "express";
import { NotesController } from "../controllers/notes.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.post("/generate", NotesController.generateNotes);
router.get("/", NotesController.getNotes);
router.get("/:id", NotesController.getNoteById);
router.put("/:id", NotesController.updateNote);
router.delete("/:id", NotesController.deleteNote);

export default router;
