import { Router } from "express";
import { MindMapController } from "../controllers/mindmap.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.post("/generate", MindMapController.generateMindMap);

export default router;
