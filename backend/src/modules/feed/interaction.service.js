import { v4 as uuidv4 } from "uuid";
import interactionRepository from "./interaction.repository.js";
import createError from "../../utils/ApiError.js";

/**
 * Logic to add a comment
 */
export const addComment = async ({ postId, targetType, userId, body, parentId = null }) => {
  if (!body || body.trim().length === 0) {
    throw createError("BAD_REQUEST", "Comment body cannot be empty");
  }

  // targetType defaults to 'post' if not provided
  const actualTargetType = targetType || 'post';

  await interactionRepository.addComment(userId, actualTargetType, postId, body, parentId);
  return { message: "Comment added successfully" };
};

/**
 * Get comments for a target
 */
export const getPostComments = async (postId) => {
  return await interactionRepository.getCommentsByTarget(postId);
};

/**
 * Logic to delete a comment
 */
export const deleteComment = async (commentId, userId) => {
  const result = await interactionRepository.deleteComment(commentId, userId);
  if (result.affectedRows === 0) {
    throw createError("NOT_FOUND", "Comment not found or unauthorized");
  }
  return { message: "Comment deleted" };
};

/**
 * Logic to toggle save
 */
export const toggleSave = async (userId, postId) => {
  return await interactionRepository.toggleSave(userId, postId);
};
