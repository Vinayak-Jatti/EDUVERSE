import { v4 as uuidv4 } from "uuid";
import postRepository from "./post.repository.js";
import createError from "../../utils/ApiError.js";

/**
 * Logic to get the home feed
 */
export const getHomeFeed = async ({ currentUserId, limit = 10, offset = 0 }) => {
  const posts = await postRepository.getFeed({ currentUserId, limit, offset });
  
  if (posts.length === 0) return [];

  // Fetch media for all these posts efficiently
  const postIds = posts.map(p => p.id);
  const allMedia = await postRepository.getMediaForPosts(postIds);

  // Group media by post_id
  const mediaMap = allMedia.reduce((acc, current) => {
    if (!acc[current.post_id]) acc[current.post_id] = [];
    acc[current.post_id].push(current);
    return acc;
  }, {});

  // Append media arrays to posts
  return posts.map(p => ({
    ...p,
    media: mediaMap[p.id] || [],
    has_liked: !!p.has_liked
  }));
};

/**
 * Create a new post with optional media
 */
export const createPost = async (userId, { body, visibility, media = [] }) => {
  const postId = uuidv4();
  
  // Decide post type based on media presence
  let postType = "text";
  if (media.length > 0) {
    postType = media[0].media_type === "video" ? "video" : "image";
  }

  // 1. Save core post record
  await postRepository.create({
    id: postId,
    user_id: userId,
    post_type: postType,
    body: body || null,
    visibility: visibility || "public"
  });

  // 2. Save media child records
  if (media.length > 0) {
    for (let i = 0; i < media.length; i++) {
        await postRepository.addMedia({
            post_id: postId,
            media_type: media[i].media_type,
            url: media[i].url,
            mime_type: media[i].mime_type,
            display_order: i
        });
    }
  }

  // 3. Re-fetch full post object to return
  return await postRepository.findById(postId, userId);
};

/**
 * Delete post logic
 */
export const deletePost = async (userId, postId) => {
  const result = await postRepository.delete(postId, userId);
  if (result.affectedRows === 0) {
    throw createError("NOT_FOUND", "Post not found or unauthorized to delete");
  }
  return { message: "Post deleted successfully" };
};
