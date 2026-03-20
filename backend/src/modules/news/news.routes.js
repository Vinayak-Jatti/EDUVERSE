import { Router } from "express";
import * as newsController from "./news.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

// Tech News Discovery (Protected for enterprise users)
router.get("/", protect, newsController.getTechNewsList);

export default router;
