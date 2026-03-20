import { Router } from "express";
import * as postController from "./post.controller.js";
import { protect, optional } from "../../middlewares/auth.middleware.js";
import { uploadImage, uploadVideo } from "../../middlewares/upload.middleware.js";

const router = Router();

// ─── Post Retrieval ─────────────────────────────────
/** 
 * GET /api/v1/feed
 * Optional auth: see following/likes if logged in, else see public feed
 */
router.get("/", optional, postController.getHomeFeed);
router.get("/user/:userId", optional, postController.getUserPosts);

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
  postController.createPost
);

// ─── Post Interactions ─────────────────────────────
/**
 * POST /api/v1/feed/:postId/like
 * DELETE /api/v1/feed/:postId/like
 */
router.post("/:postId/like", protect, postController.likePost);
router.delete("/:postId/like", protect, postController.unlikePost);

// ─── Post Management ────────────────────────────────
/**
 * DELETE /api/v1/feed/:postId
 */
router.delete("/:postId", protect, postController.deletePost);

export default router;
