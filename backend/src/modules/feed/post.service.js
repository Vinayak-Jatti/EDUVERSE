import { v4 as uuidv4 } from "uuid";
import postRepository from "./post.repository.js";
import createError from "../../utils/ApiError.js";

/**
 * Logic to get the home feed
 */
export const getHomeFeed = async ({ currentUserId, limit = 54, offset = 0 }) => {
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
 * Logic to get a specific user's posts (profile)
 */
export const getUserPosts = async ({ targetUserId, currentUserId, limit = 54, offset = 0 }) => {
    const posts = await postRepository.getUserPosts({ targetUserId, currentUserId, limit, offset });
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
export const createPost = async (userId, { body, visibility, media = [], link_url = null }) => {
  const postId = uuidv4();
  
  // 1. Unify Media: If there's an external link, add it to the media array
  if (link_url) {
    const isPDF = link_url.toLowerCase().endsWith('.pdf');
    media.push({
        url: link_url,
        media_type: isPDF ? 'document' : 'image', // Assume image for other links, or we could add more detection
        mime_type: isPDF ? 'application/pdf' : 'image/jpeg'
    });
  }

  // 2. Decide overall post type based on first media element
  let postType = "text";
  if (media.length > 0) {
    postType = media[0].media_type;
  }

  // 3. Save core post record
  await postRepository.create({
    id: postId,
    user_id: userId,
    post_type: postType,
    body: body || null,
    visibility: visibility || "public",
    link_url: null // We now store it in post_media for unified management!
  });

  // 4. Save unified media child records
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
