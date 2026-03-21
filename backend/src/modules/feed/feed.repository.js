import pool from "../../config/db.js";
import { TABLES } from "../auth/auth.constants.js";
import { 
  GET_FEED_QUERY, 
  GET_USER_FEED_QUERY, 
  GET_SINGLE_FEED_ITEM_QUERY 
} from "../../database/queries/feed.queries.js";

const feedRepository = {
  /**
   * Create a new post
   */
  create: async (postData) => {
    const { id, user_id, post_type, body, visibility, link_url } = postData;
    const [result] = await pool.execute(
      `INSERT INTO posts (id, user_id, post_type, body, visibility, link_url) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, user_id, post_type, body, visibility, link_url || null]
    );
    return result;
  },

  /**
   * Add media to a post
   */
  addMedia: async (mediaData) => {
    const { post_id, media_type, url, mime_type, display_order } = mediaData;
    const [result] = await pool.execute(
      `INSERT INTO post_media (post_id, media_type, url, mime_type, display_order) VALUES (?, ?, ?, ?, ?)`,
      [post_id, media_type, url, mime_type, display_order]
    );
    return result;
  },

  /**
   * Get fresh feed posts
   */
  getFeed: async ({ currentUserId, limit = 10, offset = 0 }) => {
    const [rows] = await pool.execute(GET_FEED_QUERY(limit, offset), [
      currentUserId || null,
      currentUserId || null,
      currentUserId || null,
      currentUserId || null
    ]);
    return rows;
  },

  /**
   * Get posts for a specific user (profile)
   */
  getUserPosts: async ({ targetUserId, currentUserId, limit = 54, offset = 0 }) => {
    const [rows] = await pool.execute(GET_USER_FEED_QUERY(limit, offset), [
      currentUserId || null,
      targetUserId,
      currentUserId || null,
      targetUserId
    ]);
    return rows;
  },

  /**
   * Get media for a list of posts
   */
  getMediaForPosts: async (postIds) => {
    if (!postIds || postIds.length === 0) return [];
    
    // Using placeholders (?, ?, ...) for IN clause
    const placeholders = postIds.map(() => "?").join(",");
    const [rows] = await pool.execute(
      `SELECT * FROM post_media WHERE post_id IN (${placeholders}) ORDER BY display_order ASC`,
      postIds
    );
    return rows;
  },

  /**
   * Get single post by ID
   */
  findById: async (id, currentUserId) => {
    const [rows] = await pool.execute(GET_SINGLE_FEED_ITEM_QUERY, [
      currentUserId || null,
      id
    ]);
    return rows[0] || null;
  },

  /**
   * soft delete a post
   */
  delete: async (id, userId) => {
    const [result] = await pool.execute(
      `UPDATE posts SET is_deleted = 1 WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return result;
  }
};

export default feedRepository;
