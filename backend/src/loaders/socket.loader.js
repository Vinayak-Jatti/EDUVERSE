import { Server } from "socket.io";
import config from "../config/env.js";

const socketLoader = (server) => {
  const io = new Server(server, {
    cors: {
      origin: config.cors.origin || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Signal Established: ${socket.id}`);

    /**
     * Join User Room (For private messages)
     */
    socket.on("join_user", (userId) => {
      socket.join(userId);
      console.log(`📡 User ${userId} joined their personal signal room`);
    });

    /**
     * Join Conversation Room
     */
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`🗯️ Socket ${socket.id} joined conversation ${conversationId}`);
    });

    /**
     * Typing Indicator
     */
    socket.on("typing", ({ conversationId, userId, isTyping }) => {
      socket.to(conversationId).emit("typing", { userId, isTyping });
    });

    /**
     * Handshake (Message Dispatched)
     */
    socket.on("send_message", (data) => {
      // data contains: conversation_id, sender_id, receiver_id, content, etc.
      // Broadcast to specific conversation room
      socket.to(data.conversation_id).emit("receive_message", data);
      
      // Also notify the active conversations lists of both users if needed for unread count
      // This is a "WhatsApp-style" signal
      if (data.receiver_id) {
        socket.to(data.receiver_id).emit("refresh_chats");
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔕 Signal Lost: ${socket.id}`);
    });
  });

  // Attach io to app globally for use in controllers if needed
  // app.set("io", io); 
  
  return io;
};

export default socketLoader;
