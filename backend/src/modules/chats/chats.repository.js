import pool from "../../config/db.js";
import { v4 as uuidv4 } from "uuid";

const chatsRepository = {
  /**
   * Find an existing 1:1 conversation between two users
   */
  async findDirectConversation(userId1, userId2) {
    const query = `
      SELECT c.* 
      FROM conversations c
      JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
      JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
      WHERE c.type = 'direct'
        AND cp1.user_id = ?
        AND cp2.user_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [userId1, userId2]);
    return rows[0];
  },

  /**
   * Create a new conversation and add participants
   */
  async createConversation(creatorId, type, participantIds, name = null) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const convId = uuidv4();
      
      // 1. Create Conversation
      const convQuery = `
        INSERT INTO conversations (id, type, name, created_by)
        VALUES (?, ?, ?, ?)
      `;
      await connection.execute(convQuery, [convId, type, name, creatorId]);

      // 2. Add Participants
      const partQuery = `
        INSERT INTO conversation_participants (conversation_id, user_id, role)
        VALUES (?, ?, ?)
      `;
      
      for (const userId of participantIds) {
        const role = userId === creatorId ? 'admin' : 'member';
        await connection.execute(partQuery, [convId, userId, role]);
      }

      await connection.commit();
      return convId;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  /**
   * Get all conversations for a user with last message preview
   */
  async getConversations(userId) {
    const query = `
      SELECT 
        c.id,
        c.type,
        c.name as group_name,
        c.last_message_at,
        m.content as last_message_content,
        m.message_type as last_message_type,
        m.sender_id as last_message_sender_id,
        # For Direct Chats, get the other participant's info
        target_up.display_name as other_user_display_name,
        target_up.username as other_user_username,
        target_up.avatar_url as other_user_avatar_url,
        # Unread count
        (SELECT COUNT(*) FROM messages msg 
         WHERE msg.conversation_id = c.id 
           AND msg.created_at > cp.last_read_at 
           AND msg.sender_id != ?) as unread_count
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id AND cp.user_id = ?
      LEFT JOIN messages m ON c.id = m.conversation_id AND m.created_at = c.last_message_at
      LEFT JOIN conversation_participants target_cp ON c.id = target_cp.conversation_id AND target_cp.user_id != ? AND c.type = 'direct'
      LEFT JOIN user_profiles target_up ON target_cp.user_id = target_up.user_id
      WHERE cp.left_at IS NULL
      ORDER BY c.last_message_at DESC
    `;
    const [rows] = await pool.execute(query, [userId, userId, userId]);
    return rows;
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId, limit = 50, offset = 0) {
    const query = `
      SELECT 
        m.*,
        up.display_name as sender_name,
        up.avatar_url as sender_avatar
      FROM messages m
      JOIN user_profiles up ON m.sender_id = up.user_id
      WHERE m.conversation_id = ? AND m.is_deleted = 0
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.execute(query, [conversationId, limit, offset]);
    return rows.reverse(); // Return in chronological order
  },

  /**
   * Send a message
   */
  async createMessage(conversationId, senderId, content, type = 'text', mediaUrl = null) {
    const msgId = uuidv4();
    const query = `
      INSERT INTO messages (id, conversation_id, sender_id, content, message_type, media_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await pool.execute(query, [msgId, conversationId, senderId, content, type, mediaUrl]);
    
    // Trigger trg_message_update_conv will automatically update conversations.last_message_at
    
    return msgId;
  },

  /**
   * Update last read timestamp
   */
  async markAsRead(conversationId, userId) {
    const query = `
      UPDATE conversation_participants
      SET last_read_at = CURRENT_TIMESTAMP
      WHERE conversation_id = ? AND user_id = ?
    `;
    await pool.execute(query, [conversationId, userId]);
    return true;
  },

  /**
   * Check if user is participant
   */
  async isParticipant(conversationId, userId) {
    const query = `
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL
    `;
    const [rows] = await pool.execute(query, [conversationId, userId]);
    return rows.length > 0;
  }
};

export default chatsRepository;
