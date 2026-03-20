import pool from "../../config/db.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Mastery Service - Database Level Operations
 */
export const createMasteryStream = async ({ userId, body, mediaUrl, mediaType, mimeType, visibility }) => {
    const id = uuidv4();
    
    // 1. Insert into core posts table
    const postQuery = `
      INSERT INTO posts (id, user_id, body, post_type, visibility)
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.execute(postQuery, [id, userId, body, mediaType, visibility]);

    // 2. Insert into post_media table
    const mediaQuery = `
      INSERT INTO post_media (post_id, media_type, url, mime_type)
      VALUES (?, ?, ?, ?)
    `;
    await pool.execute(mediaQuery, [id, mediaType, mediaUrl, mimeType]);

    return await getMasteryStreamById(id);
};

export const getMasteryStreamById = async (id) => {
    const query = `
      SELECT 
        p.*, 
        up.username, up.display_name, up.avatar_url,
        m.url as video_url, m.media_type as stream_type
      FROM posts p
      JOIN user_profiles up ON p.user_id = up.user_id
      JOIN post_media m ON p.id = m.post_id
      WHERE p.id = ? AND p.is_deleted = 0
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
};

export const getMasteryStreams = async (userId = null) => {
    let query = `
      SELECT 
        p.*, 
        up.username, up.display_name, up.avatar_url,
        m.url as video_url, m.media_type as stream_type
      FROM posts p
      JOIN user_profiles up ON p.user_id = up.user_id
      JOIN post_media m ON p.id = m.post_id
      WHERE p.post_type = 'video' AND p.is_deleted = 0
    `;
    
    const params = [];
    if (userId) {
        query += " AND p.user_id = ?";
        params.push(userId);
    } else {
        query += " AND p.visibility = 'public'";
    }

    query += " ORDER BY p.created_at DESC";
    
    const [rows] = await pool.execute(query, params);
    return rows;
};

export const getPublicMasteryStreams = async () => {
    return await getMasteryStreams(null);
};

export const getMasteryStreamsByUserId = async (userId) => {
    return await getMasteryStreams(userId);
};
