import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess, sendCreated } from "../../utils/response.js";
import * as feedService from "./feed.service.js";
import * as interactionService from "./interaction.service.js";
import * as reportService from "./report.service.js";
import interactionRepository from "./interaction.repository.js";

// ... previous code ...

/**
 * Handle liking a post
 */
export const likePost = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;
  const { targetType } = req.body;
  
  await interactionRepository.addLike(userId, targetType || "post", postId);
  
  sendSuccess(res, req, { message: "Content liked" });
});

/**
 * Handle unliking a post
 */
export const unlikePost = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;
  const { targetType } = req.body;
  
  await interactionRepository.removeLike(userId, targetType || "post", postId);
  
  sendSuccess(res, req, { message: "Content unliked" });
});

/**
 * Handle adding a comment to a post
 */
export const addComment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;
  const { body, parentId, targetType } = req.body;

  const result = await interactionService.addComment({ postId, targetType, userId, body, parentId });
  sendCreated(res, req, { message: result.message, data: result });
});

/**
 * Handle fetching comments for a post
 */
export const getPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const comments = await interactionService.getPostComments(postId);
  sendSuccess(res, req, { message: "Comments fetched", data: comments });
});

/**
 * Handle deleting a comment
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { commentId } = req.params;

  await interactionService.deleteComment(commentId, userId);
  sendSuccess(res, req, { message: "Comment deleted" });
});

/**
 * Handle toggling save for a post
 */
export const toggleSave = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;

  const result = await interactionService.toggleSave(userId, postId);
  sendSuccess(res, req, { message: `Post ${result.action}` });
});

/**
 * Handle content reporting
 */
export const reportContent = asyncHandler(async (req, res) => {
    const reporterId = req.user.id;
    const { targetId } = req.params;
    const { targetType, reason, description } = req.body;
  
    const result = await reportService.submitReport({ 
      reporterId, 
      targetType, 
      targetId, 
      reason, 
      description 
    });
  
    sendSuccess(res, req, { message: result.message });
  });

/**
 * Handle fetching home feed
 */
export const getHomeFeed = asyncHandler(async (req, res) => {
  const currentUserId = req.user?.id;
  const { limit, offset } = req.query;
  
  const posts = await feedService.getHomeFeed({ 
    currentUserId, 
    limit: parseInt(limit) || 54, 
    offset: parseInt(offset) || 0 
  });
  
  sendSuccess(res, req, { message: "Home feed fetched successfully", data: posts });
});

/**
 * Handle fetching posts for a specific user profile
 */
export const getUserPosts = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user?.id;
    const { limit, offset } = req.query;
    
    const posts = await feedService.getUserPosts({ 
      targetUserId: userId, 
      currentUserId, 
      limit: parseInt(limit) || 54, 
      offset: parseInt(offset) || 0 
    });
    
    sendSuccess(res, req, { message: "User posts fetched successfully", data: posts });
  });

/**
 * Handle creating a new post
 */
export const createPost = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const { body, visibility, link_url } = req.body;
  
  // Prepare media files if uploaded
  const media = [];
  req.files?.images?.forEach(file => {
    media.push({ url: file.path, media_type: "image", mime_type: file.mimetype });
  });
  req.files?.videos?.forEach(file => {
    media.push({ url: file.path, media_type: "video", mime_type: file.mimetype });
  });

  const post = await feedService.createPost(currentUserId, { body, visibility, media, link_url });
  
  sendCreated(res, req, { message: "Post created successfully", data: post });
});

/**
 * Handle post deletion
 */
export const deletePost = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const { postId } = req.params;
  
  const result = await feedService.deletePost(currentUserId, postId);
  sendSuccess(res, req, { message: result.message });
});
