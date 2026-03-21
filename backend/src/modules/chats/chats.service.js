import chatsRepository from "./chats.repository.js";
import createError from "../../utils/ApiError.js";

const chatsService = {
  /**
   * Get all conversations for a user
   */
  async getMyChats(userId) {
    return await chatsRepository.getConversations(userId);
  },

  /**
   * Start a 1:1 conversation with another user
   */
  async startConversation(currentUserId, targetUserId) {
    if (currentUserId === targetUserId) {
      throw createError("BAD_REQUEST", "Self-Interaction Protocol Breach: You cannot chat with yourself.");
    }

    const existing = await chatsRepository.findDirectConversation(currentUserId, targetUserId);
    if (existing) {
      return existing.id;
    }

    // Create new direct conversation
    return await chatsRepository.createConversation(currentUserId, 'direct', [currentUserId, targetUserId]);
  },

  /**
   * Send a message in a conversation
   */
  async sendMessage(userId, conversationId, content, type = 'text', mediaUrl = null) {
    // 1. Check if user is participant
    const isParticipant = await chatsRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw createError("FORBIDDEN", "Sync Protocol Access Denied: You are not authorized for this conversation.");
    }

    // 2. Store message
    const messageId = await chatsRepository.createMessage(conversationId, userId, content, type, mediaUrl);
    
    // 3. Mark as read for the sender
    await chatsRepository.markAsRead(conversationId, userId);

    return messageId;
  },

  /**
   * Get messages for a specific conversation
   */
  async getMessages(userId, conversationId, limit = 50, offset = 0) {
    // 1. Check if user is participant
    const isParticipant = await chatsRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw createError("FORBIDDEN", "Sync Protocol Access Denied: You are not authorized for this conversation.");
    }

    // 2. Fetch messages
    const messages = await chatsRepository.getMessages(conversationId, limit, offset);

    // 3. Mark as read for the user
    await chatsRepository.markAsRead(conversationId, userId);

    return messages;
  }
};

export default chatsService;
