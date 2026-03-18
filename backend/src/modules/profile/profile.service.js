import profileRepository from "./profile.repository.js";
import createError from "../../utils/ApiError.js";

/**
 * Get profile by user ID or username
 */
export const getProfile = async (identifier) => {
  let profile;
  if (identifier.length === 36) { // Assume UUID
    profile = await profileRepository.findByUserId(identifier);
  } else {
    profile = await profileRepository.findByUsername(identifier);
  }

  if (!profile) {
    throw createError("USER_NOT_FOUND", "Profile not found");
  }

  const interests = await profileRepository.getInterests(profile.user_id);
  return { ...profile, interests };
};

/**
 * Update profile data
 */
export const updateProfile = async (userId, updateData) => {
  // Basic validation could happen here or in middleware
  await profileRepository.update(userId, updateData);
  return await getProfile(userId);
};
