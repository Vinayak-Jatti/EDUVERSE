import { Router } from "express";
import * as insightController from "./insight.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

// ─── Insight Creation ───────────────────────────────────
router.post("/", protect, insightController.createInsight);

// ─── Insight Interactions ─────────────────────────────
router.post("/:insightId/like", protect, insightController.likeInsight);
router.delete("/:insightId/like", protect, insightController.unlikeInsight);

// ─── Insight Management ────────────────────────────────
router.delete("/:insightId", protect, insightController.deleteInsight);

export default router;
