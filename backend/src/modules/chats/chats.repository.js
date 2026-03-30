import pool from "../../config/db.js";
import { v4 as uuidv4 } from "uuid";

/** Upper bound for pagination limit to prevent abuse */
const MAX_PAGE_SIZE = 100;

const chatsRepository = {
  /**
   * Creates a new chat room or returns the existing one for direct rooms.
   * Uses a transaction to prevent race conditions on room creation.
   * @param {string} currentUserId - Authenticated user ID
   * @param {string} targetUserId - Target peer user ID
   * @param {string} type - Room type ('direct' | 'community')
   * @param {string|null} communityId - Community ID for group rooms
   * @returns {Promise<string>} Room UUID
   */
  async createOrFetchRoom(currentUserId, targetUserId, type, communityId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (type === "direct") {
        const findQuery = `
          SELECT r.id 
          FROM chat_rooms r
          JOIN chat_participants cp1 ON r.id = cp1.room_id
          JOIN chat_participants cp2 ON r.id = cp2.room_id
          WHERE r.type = 'direct'
            AND cp1.user_id = ?
            AND cp2.user_id = ?
          LIMIT 1
        `;
        const [existing] = await connection.execute(findQuery, [currentUserId, targetUserId]);

        if (existing.length > 0) {
          await connection.commit();
          return existing[0].id;
        }
      }

      const roomId = uuidv4();
      await connection.execute(
        `INSERT INTO chat_rooms (id, type, community_id) VALUES (?, ?, ?)`,
        [roomId, type, communityId || null]
      );

      const insertParticipant = `INSERT INTO chat_participants (room_id, user_id) VALUES (?, ?)`;
      await connection.execute(insertParticipant, [roomId, currentUserId]);

      if (targetUserId && type === "direct") {
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

  /**
   * Lists all chat rooms for a user with last-message previews.
   * @param {string} userId - Authenticated user ID
   * @returns {Promise<Array>} Room list ordered by most recent activity
   */
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

  /**
   * Validates that a user is a participant of a given room.
   * @param {string} roomId - Room UUID
   * @param {string} userId - User UUID
   * @returns {Promise<boolean>} True if user is a participant
   */
  async isParticipant(roomId, userId) {
    const [rows] = await pool.execute(
      `SELECT 1 FROM chat_participants WHERE room_id = ? AND user_id = ? LIMIT 1`,
      [roomId, userId]
    );
    return rows.length > 0;
  },

  /**
   * Returns all participant user IDs for a given room.
   * @param {string} roomId - Room UUID
   * @returns {Promise<Array<{user_id: string}>>} Participant list
   */
  async getRoomParticipants(roomId) {
    const [rows] = await pool.execute(
      `SELECT user_id FROM chat_participants WHERE room_id = ?`,
      [roomId]
    );
    return rows;
  },

  /**
   * Fetches paginated message history for a room (newest first, then reversed for display).
   * @param {string} roomId - Room UUID
   * @param {number} limit - Number of messages to fetch (clamped to MAX_PAGE_SIZE)
   * @param {number} offset - Pagination offset
   * @returns {Promise<Array>} Messages in chronological order
   */
  async getRoomMessages(roomId, limit, offset) {
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), MAX_PAGE_SIZE);
    const safeOffset = Math.max(Number(offset) || 0, 0);

    const query = `
      SELECT 
        m.id,
        m.room_id as conversation_id,
        m.sender_id,
        m.content,
        m.message_type,
        m.created_at,
        m.status,
        up.display_name as sender_name,
        up.avatar_url as sender_avatar
      FROM messages m
      JOIN user_profiles up ON m.sender_id = up.user_id
      WHERE m.room_id = ? AND m.is_deleted = 0
      ORDER BY m.created_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;
    const [rows] = await pool.execute(query, [roomId]);
    return rows.reverse();
  },

  /**
   * Persists a new message to the database.
   * @param {string} roomId - Room UUID
   * @param {string} senderId - Sender user UUID
   * @param {string} content - Sanitized message content
   * @param {string} type - Message type (default: 'text')
   * @returns {Promise<string>} Generated message UUID
   */
  async createMessage(roomId, senderId, content, type = "text") {
    const msgId = uuidv4();
    await pool.execute(
      `INSERT INTO messages (id, room_id, sender_id, content, message_type) VALUES (?, ?, ?, ?, ?)`,
      [msgId, roomId, senderId, content, type]
    );
    return msgId;
  },

  /**
   * Updates the delivery/read status of a single message.
   * @param {string} messageId - Message UUID
   * @param {string} status - New status ('delivered' | 'seen')
   */
  async updateMessageStatus(messageId, status) {
    await pool.execute(
      `UPDATE messages SET status = ? WHERE id = ?`,
      [status, messageId]
    );
  },

  /**
   * Returns IDs of all messages in a room NOT sent by userId with status != 'seen'.
   * Used to determine which messages need bulk-seen marking.
   * @param {string} roomId - Room UUID
   * @param {string} userId - Viewer user UUID (not the sender)
   * @returns {Promise<string[]>} Array of unseen message IDs
   */
  async getUnseenMessageIds(roomId, userId) {
    const [rows] = await pool.execute(
      `SELECT id FROM messages 
       WHERE room_id = ? AND sender_id != ? AND status != 'seen' AND is_deleted = 0`,
      [roomId, userId]
    );
    return rows.map((row) => row.id);
  },

  /**
   * Bulk-marks all unread messages in a room as 'seen' for a given reader.
   * Only updates messages NOT sent by the reader.
   * @param {string} roomId - Room UUID
   * @param {string} userId - Reader user UUID
   */
  async markRoomMessagesAsSeen(roomId, userId) {
    await pool.execute(
      `UPDATE messages SET status = 'seen' 
       WHERE room_id = ? AND sender_id != ? AND status != 'seen' AND is_deleted = 0`,
      [roomId, userId]
    );
  },

  /**
   * Soft-deletes a message (only the original sender can do this).
   * @param {string} messageId - Message UUID
   * @param {string} senderId - Sender user UUID (ownership check)
   * @returns {Promise<boolean>} True if a row was updated
   */
  async softDeleteMessage(messageId, senderId) {
    const [result] = await pool.execute(
      `UPDATE messages SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND sender_id = ?`,
      [messageId, senderId]
    );
    return result.affectedRows > 0;
  },
};

export default chatsRepository;
