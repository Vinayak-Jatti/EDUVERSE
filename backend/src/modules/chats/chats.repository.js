import pool from "../../config/db.js";
import { v4 as uuidv4 } from "uuid";

const chatsRepository = {
  // 5. POST /chat/rooms — create or fetch a chat room
  async createOrFetchRoom(currentUserId, targetUserId, type, communityId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (type === 'direct') {
        // Find existing direct room between the two
        const query = `
          SELECT r.id 
          FROM chat_rooms r
          JOIN chat_participants cp1 ON r.id = cp1.room_id
          JOIN chat_participants cp2 ON r.id = cp2.room_id
          WHERE r.type = 'direct'
            AND cp1.user_id = ?
            AND cp2.user_id = ?
          LIMIT 1
        `;
        const [rows] = await connection.execute(query, [currentUserId, targetUserId]);
        
        if (rows.length > 0) {
            await connection.commit();
            return rows[0].id; // Return existing room
        }
      }

      // Create new room
      const roomId = uuidv4();
      const insertRoom = `INSERT INTO chat_rooms (id, type, community_id) VALUES (?, ?, ?)`;
      await connection.execute(insertRoom, [roomId, type, communityId || null]);

      // Add participants
      const insertParticipant = `INSERT INTO chat_participants (room_id, user_id) VALUES (?, ?)`;
      await connection.execute(insertParticipant, [roomId, currentUserId]);
      if (targetUserId && type === 'direct') {
        await connection.execute(insertParticipant, [roomId, targetUserId]);
      }

      await connection.commit();
      return roomId;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  // 7. GET /chat/rooms — list all rooms for logged-in user
  async getMyRooms(userId) {
    const query = `
      SELECT 
        r.id as id,
        r.type,
        r.community_id,
        r.created_at,
        target_up.display_name as other_user_display_name,
        target_up.avatar_url as other_user_avatar_url,
        target_up.username as other_user_username,
        (SELECT content FROM messages m WHERE m.room_id = r.id AND m.is_deleted = 0 ORDER BY m.created_at DESC LIMIT 1) as last_message_content,
        (SELECT created_at FROM messages m WHERE m.room_id = r.id AND m.is_deleted = 0 ORDER BY m.created_at DESC LIMIT 1) as last_message_at
      FROM chat_rooms r
      JOIN chat_participants cp ON r.id = cp.room_id AND cp.user_id = ?
      LEFT JOIN chat_participants target_cp ON r.id = target_cp.room_id AND target_cp.user_id != ? AND r.type = 'direct'
      LEFT JOIN user_profiles target_up ON target_cp.user_id = target_up.user_id
      ORDER BY last_message_at DESC, r.created_at DESC
    `;
    const [rows] = await pool.execute(query, [userId, userId]);
    return rows;
  },

  // 33. Validate all incoming events server-side (room membership check)
  async isParticipant(roomId, userId) {
    const query = `SELECT 1 FROM chat_participants WHERE room_id = ? AND user_id = ? LIMIT 1`;
    const [rows] = await pool.execute(query, [roomId, userId]);
    return rows.length > 0;
  },

  // 6. GET /chat/rooms/:roomId/messages — fetch paginated message history
  async getRoomMessages(roomId, limit, offset) {
    const query = `
      SELECT 
        m.id,
        m.room_id as conversation_id,
        m.sender_id,
        m.content,
        m.message_type,
        m.created_at,
        up.display_name as sender_name,
        up.avatar_url as sender_avatar
      FROM messages m
      JOIN user_profiles up ON m.sender_id = up.user_id
      WHERE m.room_id = ? AND m.is_deleted = 0
      ORDER BY m.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;
    const [rows] = await pool.execute(query, [roomId]);
    return rows.reverse();
  },

  // Store a new message (Used by Socket.io)
  async createMessage(roomId, senderId, content, type = 'text') {
    const msgId = uuidv4();
    const query = `
      INSERT INTO messages (id, room_id, sender_id, content, message_type)
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.execute(query, [msgId, roomId, senderId, content, type]);
    return msgId;
  }
};

export default chatsRepository;
