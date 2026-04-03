import { Server } from "socket.io";
import config from "../config/env.js";
import chatsRepository from "../modules/chats/chats.repository.js";
import logger from "../utils/logger.js";

/** Maximum allowed message length in characters */
const MAX_MESSAGE_LENGTH = 5000;

/** Minimum interval between messages per user (ms) */
const RATE_LIMIT_MS = 1000;

/**
 * Sanitizes user-supplied text to prevent stored XSS.
 * @param {string} text - Raw input string
 * @returns {string} Sanitized string with angle brackets escaped
 */
const sanitizeInput = (text) => {
  if (typeof text !== "string") return "";
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

/**
 * Initializes Socket.IO on the HTTP server and registers all
 * real-time chat event handlers with full validation.
 * @param {import("http").Server} server - Node HTTP server instance
 * @returns {Server} Configured Socket.IO server
 */
const socketLoader = (server) => {
  const allowedOrigins = (config.cors.origin || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  let connectionCount = 0;
  const rateLimits = new Map();

  io.on("connection", (socket) => {
    connectionCount++;
    logger.debug(`[Socket] Established: ${socket.id} (Active: ${connectionCount})`);

    /* ──────────────────────────────────────────────
     * joinPersonal — Subscribe to user notification channel
     * ────────────────────────────────────────────── */
    socket.on("joinPersonal", (userId) => {
      if (!userId || typeof userId !== "string") return;
      socket.join(`user_${userId}`);
      socket.data.userId = userId;
      logger.debug(`[Socket] User ${userId} joined personal channel.`);
    });

    /* ──────────────────────────────────────────────
     * joinRoom — Verified room membership before joining
     * ────────────────────────────────────────────── */
    socket.on("joinRoom", async (data, callback) => {
      try {
        const { roomId, userId } = data || {};
        if (!roomId || !userId) {
          return callback?.({ error: "Missing roomId or userId." });
        }

        const isParticipant = await chatsRepository.isParticipant(roomId, userId);
        if (!isParticipant) {
          return callback?.({ error: "Access denied: not a participant." });
        }

        socket.join(roomId);
        logger.debug(`[Socket] User ${userId} joined room ${roomId}`);
        callback?.({ success: true });
      } catch (err) {
        logger.error(`[Socket] joinRoom Error: ${err.message}`);
        callback?.({ error: "Server sync failure." });
      }
    });

    /* ──────────────────────────────────────────────
     * sendMessage — Validated, rate-limited, persisted, broadcast
     * ────────────────────────────────────────────── */
    socket.on("sendMessage", async (data, callback) => {
      try {
        const { roomId, senderId, content, messageType } = data || {};

        if (!roomId || !senderId || !content) {
          return callback?.({ error: "Missing required fields." });
        }

        if (typeof content !== "string" || content.trim().length === 0) {
          return callback?.({ error: "Empty message content." });
        }

        if (content.length > MAX_MESSAGE_LENGTH) {
          return callback?.({ error: `Message exceeds ${MAX_MESSAGE_LENGTH} character limit.` });
        }

        const lastTime = rateLimits.get(senderId) || 0;
        if (Date.now() - lastTime < RATE_LIMIT_MS) {
          return callback?.({ error: "Rate limit: wait before sending again." });
        }
        rateLimits.set(senderId, Date.now());

        const isParticipant = await chatsRepository.isParticipant(roomId, senderId);
        if (!isParticipant) {
          return callback?.({ error: "Unauthorized: not a room participant." });
        }

        const sanitizedContent = sanitizeInput(content);
        const msgId = await chatsRepository.createMessage(roomId, senderId, sanitizedContent, messageType || "text");

        const broadcastPayload = {
          id: msgId,
          room_id: roomId,
          sender_id: senderId,
          content: sanitizedContent,
          message_type: messageType || "text",
          status: "sent",
          created_at: new Date().toISOString(),
        };

        socket.to(roomId).emit("receiveMessage", broadcastPayload);

        const participants = await chatsRepository.getRoomParticipants(roomId);
        participants.forEach((participant) => {
          if (participant.user_id !== senderId) {
            socket.to(`user_${participant.user_id}`).emit("refreshRooms");
          }
        });

        callback?.({ success: true, data: broadcastPayload });
      } catch (err) {
        logger.error(`[Socket] sendMessage Error: ${err.message}`);
        callback?.({ error: "Failed to dispatch message." });
      }
    });

    /* ──────────────────────────────────────────────
     * typing — Scoped to roomId, broadcast to others only
     * ────────────────────────────────────────────── */
    socket.on("typing", async (data) => {
      try {
        const { roomId, userId, isTyping } = data || {};
        if (!roomId || !userId) return;

        const isParticipant = await chatsRepository.isParticipant(roomId, userId);
        if (isParticipant) {
          socket.to(roomId).emit("typing", { roomId, userId, isTyping: Boolean(isTyping) });
        }
      } catch (err) {
        logger.error(`[Socket] typing Error: ${err.message}`);
      }
    });

    /* ──────────────────────────────────────────────
     * messageDelivered — Mark single message as delivered
     * ────────────────────────────────────────────── */
    socket.on("messageDelivered", async (data) => {
      try {
        const { messageId, roomId, userId } = data || {};
        if (!messageId || !roomId || !userId) return;

        const isParticipant = await chatsRepository.isParticipant(roomId, userId);
        if (!isParticipant) return;

        await chatsRepository.updateMessageStatus(messageId, "delivered");
        io.in(roomId).emit("messageStatusUpdated", { messageId, roomId, status: "delivered" });
      } catch (err) {
        logger.error(`[Socket] messageDelivered Error: ${err.message}`);
      }
    });

    /* ──────────────────────────────────────────────
     * messageSeen — Mark single message as seen
     * ────────────────────────────────────────────── */
    socket.on("messageSeen", async (data) => {
      try {
        const { messageId, roomId, userId } = data || {};
        if (!messageId || !roomId || !userId) return;

        const isParticipant = await chatsRepository.isParticipant(roomId, userId);
        if (!isParticipant) return;

        await chatsRepository.updateMessageStatus(messageId, "seen");
        io.in(roomId).emit("messageStatusUpdated", { messageId, roomId, status: "seen" });
      } catch (err) {
        logger.error(`[Socket] messageSeen Error: ${err.message}`);
      }
    });

    /* ──────────────────────────────────────────────
     * markRoomSeen — Bulk-mark all unread messages in a room as seen
     * Fired when user opens a conversation
     * ────────────────────────────────────────────── */
    socket.on("markRoomSeen", async (data, callback) => {
      try {
        const { roomId, userId } = data || {};
        if (!roomId || !userId) return callback?.({ error: "Missing fields." });

        const isParticipant = await chatsRepository.isParticipant(roomId, userId);
        if (!isParticipant) return callback?.({ error: "Access denied." });

        const unseenIds = await chatsRepository.getUnseenMessageIds(roomId, userId);
        if (unseenIds.length === 0) return callback?.({ success: true, updated: 0 });

        await chatsRepository.markRoomMessagesAsSeen(roomId, userId);

        unseenIds.forEach((msgId) => {
          io.in(roomId).emit("messageStatusUpdated", { messageId: msgId, roomId, status: "seen" });
        });

        callback?.({ success: true, updated: unseenIds.length });
      } catch (err) {
        logger.error(`[Socket] markRoomSeen Error: ${err.message}`);
        callback?.({ error: "Failed to mark messages as seen." });
      }
    });

    /* ──────────────────────────────────────────────
     * unsendMessage — Soft delete (sender only)
     * ────────────────────────────────────────────── */
    socket.on("unsendMessage", async (data, callback) => {
      try {
        const { messageId, roomId, userId } = data || {};
        if (!messageId || !roomId || !userId) {
          return callback?.({ error: "Missing required fields." });
        }

        const success = await chatsRepository.softDeleteMessage(messageId, userId);
        if (success) {
          io.in(roomId).emit("messageDeleted", { messageId, roomId });
          callback?.({ success: true });
        } else {
          callback?.({ error: "Unauthorized or message not found." });
        }
      } catch (err) {
        logger.error(`[Socket] unsendMessage Error: ${err.message}`);
        callback?.({ error: "Failed to unsend message." });
      }
    });

    /* ──────────────────────────────────────────────
     * Error & Disconnect handlers
     * ────────────────────────────────────────────── */
    socket.on("error", (err) => {
      logger.error(`[Socket] Error on ${socket.id}: ${err.message}`);
    });

    socket.on("disconnect", () => {
      connectionCount--;
      const userId = socket.data.userId;
      if (userId) {
        rateLimits.delete(userId);
      }
      logger.debug(`[Socket] Disconnected: ${socket.id} (Active: ${connectionCount})`);
    });
  });

  return io;
};

export default socketLoader;
