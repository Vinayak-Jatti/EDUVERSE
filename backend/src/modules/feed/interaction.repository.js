import pool from "../../config/db.js";

const interactionRepository = {
  /**
   * Like a post, insight, or comment
   */
  addLike: async (userId, targetType, targetId) => {
    const [result] = await pool.execute(
      `INSERT IGNORE INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)`,
      [userId, targetType, targetId]
    );
    return result;
  },

  /**
   * Unlike a post, insight, or comment
   */
  removeLike: async (userId, targetType, targetId) => {
    const [result] = await pool.execute(
      `DELETE FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?`,
      [userId, targetType, targetId]
    );
    return result;
  },

  /**
   * Add a new comment (Polymorphic)
   */
  addComment: async (userId, targetType, targetId, body, parentId) => {
    const [result] = await pool.execute(
      `INSERT INTO comments (id, user_id, target_type, post_id, body, parent_id) 
       VALUES (UUID(), ?, ?, ?, ?, ?)`,
      [userId, targetType, targetId, body, parentId || null]
    );
    return result;
  },

  /**
   * Get all comments for a target (post or insight)
   */
  getCommentsByTarget: async (targetId) => {
    const [rows] = await pool.execute(
      `SELECT c.*, up.display_name, up.username, up.avatar_url 
       FROM comments c
       JOIN user_profiles up ON c.user_id = up.user_id
       WHERE c.post_id = ? AND c.is_deleted = 0
       ORDER BY c.created_at ASC`,
      [targetId]
    );
    return rows;
  },

  /**
   * Soft delete a comment
   */
  deleteComment: async (commentId, userId) => {
    const [result] = await pool.execute(
      `UPDATE comments SET is_deleted = 1 WHERE id = ? AND user_id = ?`,
      [commentId, userId]
    );
    return result;
  },

  /**
   * Toggle save (bookmark) for a post
   */
  toggleSave: async (userId, postId) => {
    const [existing] = await pool.execute(
      `SELECT id FROM saves WHERE user_id = ? AND post_id = ?`,
      [userId, postId]
    );

    if (existing.length > 0) {
      await pool.execute(
        `DELETE FROM saves WHERE user_id = ? AND post_id = ?`,
        [userId, postId]
      );
      return { action: "unsaved" };
    } else {
      await pool.execute(
        `INSERT INTO saves (user_id, post_id) VALUES (?, ?)`,
        [userId, postId]
      );
      return { action: "saved" };
    }
  }
};

export default interactionRepository;
