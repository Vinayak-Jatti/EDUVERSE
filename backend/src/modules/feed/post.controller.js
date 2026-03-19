import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess, sendCreated } from "../../utils/response.js";
import * as postService from "./post.service.js";
import interactionRepository from "./interaction.repository.js";

// ... previous code ...

/**
 * Handle liking a post
 */
export const likePost = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;
  
  await interactionRepository.addLike(userId, "post", postId);
  
  // Triggers in MySQL will auto-update the like_count
  sendSuccess(res, req, { message: "Post liked" });
});

/**
 * Handle unliking a post
 */
export const unlikePost = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;
  
  await interactionRepository.removeLike(userId, "post", postId);
  
  sendSuccess(res, req, { message: "Post unliked" });
});

/**
 * Handle fetching home feed
 */
export const getHomeFeed = asyncHandler(async (req, res) => {
  const currentUserId = req.user?.id;
  const { limit, offset } = req.query;
  
  const posts = await postService.getHomeFeed({ 
    currentUserId, 
    limit: parseInt(limit) || 10, 
    offset: parseInt(offset) || 0 
  });
  
  sendSuccess(res, req, { message: "Home feed fetched successfully", data: posts });
});

/**
 * Handle creating a new post
 */
export const createPost = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const { body, visibility } = req.body;
  
  // Prepare media files if uploaded
  const media = [];
  if (req.files?.images) {
    req.files.images.forEach(file => {
      media.push({ url: file.path, media_type: "image", mime_type: file.mimetype });
    });
  }
  if (req.files?.videos) {
    req.files.videos.forEach(file => {
      media.push({ url: file.path, media_type: "video", mime_type: file.mimetype });
    });
  }

  const post = await postService.createPost(currentUserId, { body, visibility, media });
  
  sendCreated(res, req, { message: "Post created successfully", data: post });
});

/**
 * Handle post deletion
 */
export const deletePost = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const { postId } = req.params;
  
  const result = await postService.deletePost(currentUserId, postId);
  sendSuccess(res, req, { message: result.message });
});
