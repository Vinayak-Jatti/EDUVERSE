import * as profileService from "./profile.service.js";
import { sendSuccess } from "../../utils/response.js";
import asyncHandler from "../../utils/asyncHandler.js";

/**
 * Handle get profile request
 */
export const getProfile = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const profile = await profileService.getProfile(identifier);
  return sendSuccess(res, req, { data: profile });
});

/**
 * Handle update profile request
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id; // From auth middleware
  const updatedProfile = await profileService.updateProfile(userId, req.body);
  return sendSuccess(res, req, { message: "Profile updated", data: updatedProfile });
});
