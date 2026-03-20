import pool from "../../config/db.js";

const insightRepository = {
  createInsight: async (insightData) => {
    const query = `
      INSERT INTO insights (id, user_id, content, visibility)
      VALUES (?, ?, ?, ?)
    `;
    const values = [
      insightData.id,
      insightData.user_id,
      insightData.content,
      insightData.visibility || 'public'
    ];
    await pool.execute(query, values);
    return insightRepository.getInsightById(insightData.id);
  },
  
  getInsightById: async (id) => {
    const query = `
      SELECT i.id, i.user_id, i.content as body, NULL as link_url, 'insight' as post_type, i.visibility,
             i.like_count, i.comment_count, i.share_count, i.created_at,
             up.username, up.display_name, up.avatar_url
      FROM insights i
      JOIN users u ON i.user_id = u.id
      JOIN user_profiles up ON u.id = up.user_id
      WHERE i.id = ? AND i.is_deleted = 0
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  },

  deleteInsight: async (insightId, userId) => {
      const query = `UPDATE insights SET is_deleted = 1 WHERE id = ? AND user_id = ?`;
      const [result] = await pool.execute(query, [insightId, userId]);
      return result.affectedRows > 0;
  }
};

export default insightRepository;
