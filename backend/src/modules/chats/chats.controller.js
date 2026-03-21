import chatsService from "./chats.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";

/**
 * List all conversations (My Chats)
 */
export const getMyChats = asyncHandler(async (req, res) => {
  const conversations = await chatsService.getMyChats(req.user.id);
  return sendSuccess(res, req, { data: conversations });
});

/**
 * Get messages for a conversation
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { limit, offset } = req.query;
  const messages = await chatsService.getMessages(req.user.id, conversationId, limit, offset);
  return sendSuccess(res, req, { data: messages });
});

/**
 * Send a message
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content, type, mediaUrl, receiverId } = req.body;
  
  const messageId = await chatsService.sendMessage(req.user.id, conversationId, content, type, mediaUrl);
  
  // ─── Real-time Trigger (Socket) ─────────────────────────────────────────
  const io = req.app.get("io");
  if (io) {
    const messagePayload = {
      id: messageId,
      conversation_id: conversationId,
      sender_id: req.user.id,
      content,
      message_type: type || 'text',
      created_at: new Date().toISOString()
    };

    // Emit to conversation room (Other user)
    io.to(conversationId).emit("receive_message", messagePayload);
    
    // Notify receiver's main chat list for unread count
    if (receiverId) {
      io.to(receiverId).emit("refresh_chats");
    }
  }

  return sendSuccess(res, req, { message: "Message Dispatched", data: { messageId } });
});

/**
 * Initialise a direct chat with a peer
 */
export const initialiseChat = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const conversationId = await chatsService.startConversation(req.user.id, userId);
  return sendSuccess(res, req, { message: "Chat Sync Ready", data: { conversationId } });
});
