import pool from "../../config/db.js";
import { TABLES } from "../auth/auth.constants.js";

const postRepository = {
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
    const uid = currentUserId || null;
    const lmt = Number(limit);
    const ost = Number(offset);

    const query = `
      SELECT * FROM (
        SELECT 
          p.id, p.user_id, p.post_type, p.body, p.link_url, p.visibility, 
          p.like_count, p.comment_count, p.share_count, p.created_at, p.updated_at,
          u.email, up.username, up.display_name, up.avatar_url,
          (SELECT COUNT(*) FROM likes WHERE user_id = ? AND target_type = 'post' AND target_id = p.id) as has_liked
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN user_profiles up ON u.id = up.user_id
        WHERE p.is_deleted = 0 AND (p.visibility = 'public' OR p.user_id = ?)

        UNION ALL

        SELECT 
          i.id, i.user_id, 'insight' as post_type, i.content as body, NULL as link_url, i.visibility, 
          i.like_count, i.comment_count, i.share_count, i.created_at, i.updated_at,
          u.email, up.username, up.display_name, up.avatar_url,
          (SELECT COUNT(*) FROM likes WHERE user_id = ? AND target_type = 'insight' AND target_id = i.id) as has_liked
        FROM insights i
        JOIN users u ON i.user_id = u.id
        JOIN user_profiles up ON u.id = up.user_id
        WHERE i.is_deleted = 0 AND (i.visibility = 'public' OR i.user_id = ?)
      ) combined_feed
      ORDER BY created_at DESC
      LIMIT ${lmt} OFFSET ${ost}
    `;

    const [rows] = await pool.execute(query, [uid, uid, uid, uid]);
    return rows;
  },

  /**
   * Get posts for a specific user (profile)
   */
  getUserPosts: async ({ targetUserId, currentUserId, limit = 54, offset = 0 }) => {
    const uid = currentUserId || null;
    const lmt = Number(limit);
    const ost = Number(offset);

    const query = `
      SELECT * FROM (
        SELECT 
          p.id, p.user_id, p.post_type, p.body, p.link_url, p.visibility, 
          p.like_count, p.comment_count, p.share_count, p.created_at, p.updated_at,
          up.username, up.display_name, up.avatar_url,
          (SELECT COUNT(*) FROM likes WHERE user_id = ? AND target_type = 'post' AND target_id = p.id) as has_liked
        FROM posts p
        JOIN user_profiles up ON p.user_id = up.user_id
        WHERE p.user_id = ? AND p.is_deleted = 0

        UNION ALL

        SELECT 
          i.id, i.user_id, 'insight' as post_type, i.content as body, NULL as link_url, i.visibility, 
          i.like_count, i.comment_count, i.share_count, i.created_at, i.updated_at,
          up.username, up.display_name, up.avatar_url,
          (SELECT COUNT(*) FROM likes WHERE user_id = ? AND target_type = 'insight' AND target_id = i.id) as has_liked
        FROM insights i
        JOIN user_profiles up ON i.user_id = up.user_id
        WHERE i.user_id = ? AND i.is_deleted = 0
      ) combined_feed
      ORDER BY created_at DESC
      LIMIT ${lmt} OFFSET ${ost}
    `;

    const [rows] = await pool.execute(query, [uid, targetUserId, uid, targetUserId]);
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
    const uid = currentUserId || null;
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
      [uid, id]
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
