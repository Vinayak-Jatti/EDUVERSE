import pool from "../../config/db.js";

const interactionRepository = {
  /**
   * Like a post/comment
   */
  addLike: async (userId, targetType, targetId) => {
    // IGNORE on duplicate (to be idempotent)
    const [result] = await pool.execute(
      `INSERT IGNORE INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)`,
      [userId, targetType, targetId]
    );
    return result;
  },

  /**
   * Unlike a post/comment
   */
  removeLike: async (userId, targetType, targetId) => {
    const [result] = await pool.execute(
      `DELETE FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?`,
      [userId, targetType, targetId]
    );
    return result;
  }
};

export default interactionRepository;
