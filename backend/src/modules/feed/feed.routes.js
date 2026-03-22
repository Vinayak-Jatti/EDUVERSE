import { Router } from "express";
import * as feedController from "./feed.controller.js";
import { protect, optional } from "../../middlewares/auth.middleware.js";
import { uploadImage, uploadVideo } from "../../middlewares/upload.middleware.js";

const router = Router();

// ─── Post Retrieval ─────────────────────────────────
/** 
 * GET /api/v1/feed
 * Optional auth: see following/likes if logged in, else see public feed
 */
router.get("/", optional, feedController.getHomeFeed);
router.get("/user/:userId", optional, feedController.getUserPosts);

// ─── Post Creation ───────────────────────────────────
/**
 * POST /api/v1/feed
 * Protected: required for creating content
 * Multer handles: 'images' (max 4) and 'videos' (max 1)
 */
router.post(
  "/", 
  protect, 
  uploadImage.fields([
    { name: "images", maxCount: 4 },
    { name: "videos", maxCount: 1 }
  ]), 
  feedController.createPost
);

// ─── Post Interactions ─────────────────────────────
/**
 * POST /api/v1/feed/:postId/like
 * DELETE /api/v1/feed/:postId/like
 */
router.post("/:postId/like", protect, feedController.likePost);
router.delete("/:postId/like", protect, feedController.unlikePost);

/**
 * POST /api/v1/feed/:postId/comments
 * GET /api/v1/feed/:postId/comments
 */
router.post("/:postId/comments", protect, feedController.addComment);
router.get("/:postId/comments", optional, feedController.getPostComments);

/**
 * DELETE /api/v1/feed/comments/:commentId
 */
router.delete("/comments/:commentId", protect, feedController.deleteComment);

/**
 * POST /api/v1/feed/:postId/save
 */
router.post("/:postId/save", protect, feedController.toggleSave);

/**
 * POST /api/v1/feed/:targetId/report
 */
router.post("/:targetId/report", protect, feedController.reportContent);

// ─── Post Management ────────────────────────────────
/**
 * DELETE /api/v1/feed/:postId
 */
router.delete("/:postId", protect, feedController.deletePost);

export default router;
