import profileRepository from "./profile.repository.js";
import createError from "../../utils/ApiError.js";

/**
 * Get profile by user ID or username
 */
export const getProfile = async (identifier, currentUserId = null) => {
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
  
  let isFollowing = false;
  if (currentUserId && currentUserId !== profile.user_id) {
    isFollowing = await profileRepository.isFollowing(currentUserId, profile.user_id);
  }

  return { 
    ...profile, 
    interests,
    isFollowing,
    isMe: currentUserId === profile.user_id
  };
};

/**
 * Update profile data
 */
export const updateProfile = async (userId, updateData) => {
  // Prevent direct update of counts or user_id
  const { post_count, follower_count, following_count, user_id, id, ...allowedUpdates } = updateData;
  
  await profileRepository.update(userId, allowedUpdates);
  return await getProfile(userId, userId);
};

/**
 * Following Logic
 */
export const followUser = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw createError("BAD_REQUEST", "You cannot follow yourself");
  }
  await profileRepository.follow(followerId, followingId);
  return { message: "Followed successfully" };
};

export const unfollowUser = async (followerId, followingId) => {
  await profileRepository.unfollow(followerId, followingId);
  return { message: "Unfollowed successfully" };
};

export const getFollowers = async (userId) => {
  return await profileRepository.getFollowers(userId);
};

export const getFollowing = async (userId) => {
  return await profileRepository.getFollowing(userId);
};
