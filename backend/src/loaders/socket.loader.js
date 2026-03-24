import { Server } from "socket.io";
import config from "../config/env.js";
import chatsRepository from "../modules/chats/chats.repository.js";
import logger from "../utils/logger.js";

// Basic XSS sanitizer
const sanitizeInput = (text) => {
  if (typeof text !== 'string') return text;
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// Rate limiting state
const rateLimits = new Map();
const RATE_LIMIT_MS = 1000; // Limit to 1 message per second per user ID

const socketLoader = (server) => {
  const io = new Server(server, {
    cors: {
      origin: config.cors.origin || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.debug(`[Socket] Established: ${socket.id}`);

    // 8. Global User Notification Room
    socket.on("joinPersonal", (userId) => {
      if (!userId) return;
      socket.join(`user_${userId}`);
      logger.debug(`[Socket] User ${userId} joined personal notification channel.`);
    });

    // 8. joinRoom — user joins a room channel
    socket.on("joinRoom", async (data, callback) => {
      try {
        const { roomId, userId } = data;
        if (!roomId || !userId) return;

        // 33. Validate room membership server-side
        const isParticipant = await chatsRepository.isParticipant(roomId, userId);
        if (!isParticipant) {
          if (callback) callback({ error: "Security Protocol: Access denied to this room." });
          return;
        }

        socket.join(roomId);
        logger.debug(`[Socket] User ${userId} joined room ${roomId}`);
        if (callback) callback({ success: true });
      } catch (err) {
        logger.error(`[Socket] joinRoom Error: ${err.message}`);
        if (callback) callback({ error: "Server sync failure" });
      }
    });

    // 9. sendMessage — broadcast message
    socket.on("sendMessage", async (data, callback) => {
      try {
        const { roomId, senderId, content, messageType } = data;
        
        // 13. Apply rate limiting
        const lastMessageTime = rateLimits.get(senderId) || 0;
        if (Date.now() - lastMessageTime < RATE_LIMIT_MS) {
          if (callback) callback({ error: "Rate limit exceeded. Please wait." });
          return;
        }
        rateLimits.set(senderId, Date.now());

        // 34. Prevent sending if not a participant
        const isParticipant = await chatsRepository.isParticipant(roomId, senderId);
        if (!isParticipant) {
          if (callback) callback({ error: "Security Protocol: Unauthorized to send." });
          return;
        }

        // 35. Sanitize message to prevent XSS
        const sanitizedContent = sanitizeInput(content);

        // Store the persistent data
        const msgId = await chatsRepository.createMessage(roomId, senderId, sanitizedContent, messageType || 'text');

        const broadcastPayload = {
          id: msgId,
          room_id: roomId,
          sender_id: senderId,
          content: sanitizedContent,
          message_type: messageType || 'text',
          created_at: new Date().toISOString()
        };

        // Broadcast to everyone currently viewing the room
        socket.to(roomId).emit("receiveMessage", broadcastPayload);

        // ALERT the target user regardless of what room they are viewing
        // For phase 1, we pull participants directly to whisper the sidebar update
        const participants = await chatsRepository.getRoomParticipants(roomId);
        participants.forEach(p => {
           if (p.user_id !== senderId) {
             socket.to(`user_${p.user_id}`).emit("refreshRooms");
           }
        });

        if (callback) callback({ success: true, data: broadcastPayload });
      } catch (err) {
        logger.error(`[Socket] sendMessage Error: ${err.message}`);
        if (callback) callback({ error: "Failed to dispatch message." });
      }
    });

    // 10. typing — emit typing indicator
    socket.on("typing", async (data) => {
      try {
        const { roomId, userId, isTyping } = data;
        if (!roomId || !userId) return;

        // Ensure authorization to broadcast typing
        const isParticipant = await chatsRepository.isParticipant(roomId, userId);
        if (isParticipant) {
          socket.to(roomId).emit("typing", { userId, isTyping });
        }
      } catch (err) {
        logger.error(`[Socket] typing Error: ${err.message}`);
      }
    });

    // 11. disconnect — handle offline state
    socket.on("disconnect", () => {
      logger.debug(`[Socket] Lost Signal: ${socket.id}`);
    });
  });

  return io;
};

export default socketLoader;
