import * as profileService from "./profile.service.js";
import { sendSuccess } from "../../utils/response.js";
import asyncHandler from "../../utils/asyncHandler.js";

/**
 * Handle get profile request
 */
export const getProfile = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const currentUserId = req.user?.id; // Defined if user is logged in
  const profile = await profileService.getProfile(identifier, currentUserId);
  return sendSuccess(res, req, { data: profile });
});

/**
 * Handle update profile request
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateData = { ...req.body };

  // If new files were uploaded to cloudinary, the paths are here
  if (req.files?.avatar) updateData.avatar_url = req.files.avatar[0].path;
  if (req.files?.cover) updateData.cover_url = req.files.cover[0].path;

  const updatedProfile = await profileService.updateProfile(userId, updateData);
  return sendSuccess(res, req, { message: "Profile updated successfully", data: updatedProfile });
});

/**
 * Handle follow actions
 */
export const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await profileService.followUser(req.user.id, userId);
  return sendSuccess(res, req, { message: result.message });
});

export const unfollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await profileService.unfollowUser(req.user.id, userId);
  return sendSuccess(res, req, { message: result.message });
});

export const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const followers = await profileService.getFollowers(userId);
  return sendSuccess(res, req, { data: followers });
});

export const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const following = await profileService.getFollowing(userId);
  return sendSuccess(res, req, { data: following });
});
