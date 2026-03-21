/**
 * Feed Module - SQL Query Registry (Source of Truth)
 */

export const GET_FEED_QUERY = (limit, offset) => `
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
    JOIN user_profiles up ON i.user_id = up.user_id
    WHERE i.is_deleted = 0 AND (i.visibility = 'public' OR i.user_id = ?)
  ) combined_feed
  ORDER BY created_at DESC
  LIMIT ${Number(limit)} OFFSET ${Number(offset)}
`;

export const GET_USER_FEED_QUERY = (limit, offset) => `
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
  LIMIT ${Number(limit)} OFFSET ${Number(offset)}
`;

export const GET_SINGLE_FEED_ITEM_QUERY = `
  SELECT 
    p.*, 
    up.username, 
    up.display_name, 
    up.avatar_url,
    (SELECT COUNT(*) FROM likes WHERE user_id = ? AND target_type = 'post' AND target_id = p.id) as has_liked
  FROM posts p
  JOIN user_profiles up ON p.user_id = up.user_id
  WHERE p.id = ? AND p.is_deleted = 0
`;
