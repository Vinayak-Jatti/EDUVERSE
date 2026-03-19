import pool from "../../config/db.js";
import { TABLES } from "../auth/auth.constants.js";

const postRepository = {
  /**
   * Create a new post
   */
  create: async (postData) => {
    const { id, user_id, post_type, body, visibility } = postData;
    const [result] = await pool.execute(
      `INSERT INTO posts (id, user_id, post_type, body, visibility) VALUES (?, ?, ?, ?, ?)`,
      [id, user_id, post_type, body, visibility]
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
   * Get fresh feed posts (global or following based)
   */
  getFeed: async ({ currentUserId, limit = 20, offset = 0 }) => {
    // Basic feed: Latest public posts + my posts
    // We can also filter by following list later
    const [rows] = await pool.execute(
      `SELECT 
        p.*, 
        u.email, 
        up.username, 
        up.display_name, 
        up.avatar_url,
        (SELECT COUNT(*) FROM likes WHERE user_id = ? AND target_type = 'post' AND target_id = p.id) as has_liked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       JOIN user_profiles up ON u.id = up.user_id
       WHERE p.is_deleted = 0 AND (p.visibility = 'public' OR p.user_id = ?)
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [currentUserId, currentUserId, limit, offset]
    );
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
    const [rows] = await pool.execute(
      `SELECT 
        p.*, 
        up.username, 
        up.display_name, 
        up.avatar_url,
        (SELECT COUNT(*) FROM likes WHERE user_id = ? AND target_type = 'post' AND target_id = p.id) as has_liked
       FROM posts p
       JOIN user_profiles up ON p.user_id = up.user_id
       WHERE p.id = ? AND p.is_deleted = 0`,
      [currentUserId, id]
    );
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

export default postRepository;
