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

  let connectionCount = 0;

  io.on("connection", (socket) => {
    connectionCount++;
    logger.debug(`[Socket] Established: ${socket.id} (Total Active: ${connectionCount})`);

    // Global User Notification Room
    socket.on("joinPersonal", (userId) => {
      if (!userId) return;
      socket.join(`user_${userId}`);
      logger.debug(`[Socket] User ${userId} joined personal notification channel.`);
    });

    // joinRoom — user joins a room channel
    socket.on("joinRoom", async (data, callback) => {
      try {
        const { roomId, userId } = data;
        if (!roomId || !userId) return;

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

    // sendMessage — broadcast message
    socket.on("sendMessage", async (data, callback) => {
      try {
        const { roomId, senderId, content, messageType } = data;
        
        const lastMessageTime = rateLimits.get(senderId) || 0;
        if (Date.now() - lastMessageTime < RATE_LIMIT_MS) {
          if (callback) callback({ error: "Rate limit exceeded. Please wait." });
          return;
        }
        rateLimits.set(senderId, Date.now());

        const isParticipant = await chatsRepository.isParticipant(roomId, senderId);
        if (!isParticipant) {
          if (callback) callback({ error: "Security Protocol: Unauthorized to send." });
          return;
        }

        const sanitizedContent = sanitizeInput(content);
        const msgId = await chatsRepository.createMessage(roomId, senderId, sanitizedContent, messageType || 'text');

        const broadcastPayload = {
          id: msgId,
          room_id: roomId,
          sender_id: senderId,
          content: sanitizedContent,
          message_type: messageType || 'text',
          created_at: new Date().toISOString()
        };

        socket.to(roomId).emit("receiveMessage", broadcastPayload);

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

    // typing — emit typing indicator
    socket.on("typing", async (data) => {
      try {
        const { roomId, userId, isTyping } = data;
        if (!roomId || !userId) return;

        const isParticipant = await chatsRepository.isParticipant(roomId, userId);
        if (isParticipant) {
          socket.to(roomId).emit("typing", { userId, isTyping });
        }
      } catch (err) {
        logger.error(`[Socket] typing Error: ${err.message}`);
      }
    });

    socket.on("error", (err) => {
      logger.error(`[Socket] Error for ${socket.id}: ${err.message}`);
    });

    socket.on("disconnect", () => {
      logger.debug(`[Socket] Signal Lost: ${socket.id}`);
    });
  });

  return io;
};

export default socketLoader;

