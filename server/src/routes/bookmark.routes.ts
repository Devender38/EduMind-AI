import { Router } from "express";
import { BookmarkController } from "../controllers/bookmark.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.post("/", BookmarkController.createBookmark);
router.get("/", BookmarkController.getBookmarks);
router.delete("/:id", BookmarkController.deleteBookmark);

export default router;
