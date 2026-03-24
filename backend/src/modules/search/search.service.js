import pool from "../../config/db.js";

/**
 * Perform cross-entity global search (Users, Posts/Insights)
 */
export const searchAcrossAll = async ({ query, userId, limit = 10, offset = 0 }) => {
  const searchQuery = `%${query}%`;
  
  // 1. Search Users
  const [users] = await pool.query(
    `SELECT user_id as id, username, display_name, avatar_url, institution_name, city
     FROM user_profiles 
     WHERE username LIKE ? OR display_name LIKE ?
     LIMIT ? OFFSET ?`,
    [searchQuery, searchQuery, Number(limit), Number(offset)]
  );

  // 2. Search Feed (Posts and Insights)
  const [feed] = await pool.query(
    `SELECT * FROM (
      SELECT 
        p.id, p.user_id, 'post' as post_type, p.body, p.visibility, 
        p.like_count, p.comment_count, p.share_count, p.created_at, p.updated_at,
        up.username, up.display_name, up.avatar_url,
        (SELECT COUNT(*) FROM likes WHERE user_id = ? AND target_type = 'post' AND target_id = p.id) as has_liked
      FROM posts p
      JOIN user_profiles up ON p.user_id = up.user_id
      WHERE p.is_deleted = 0 AND p.visibility = 'public' 
      AND p.body LIKE ?

      UNION ALL

      SELECT 
        i.id, i.user_id, 'insight' as post_type, i.content as body, i.visibility, 
        i.like_count, i.comment_count, i.share_count, i.created_at, i.updated_at,
        up.username, up.display_name, up.avatar_url,
        (SELECT COUNT(*) FROM likes WHERE user_id = ? AND target_type = 'insight' AND target_id = i.id) as has_liked
      FROM insights i
      JOIN user_profiles up ON i.user_id = up.user_id
      WHERE i.is_deleted = 0 AND i.visibility = 'public'
      AND i.content LIKE ?
    ) combined_results
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?`,
    [userId, searchQuery, userId, searchQuery, Number(limit), Number(offset)]
  );

  return {
    users,
    feed
  };
};
