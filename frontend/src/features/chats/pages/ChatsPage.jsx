import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useSocket } from "../../../context/SocketContext";
import apiClient from "../../../services/apiClient";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import { motion, AnimatePresence } from "framer-motion";

/** Number of messages to fetch per page */
const PAGE_SIZE = 50;

/**
 * ChatsPage — Enterprise-grade real-time messaging interface.
 *
 * Handles room listing, message loading with pagination,
 * optimistic sends, tick lifecycle, typing indicators, and unsend.
 */
const ChatsPage = () => {
  const { user } = useAuth();
  const socket = useSocket();

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const activeRoomRef = useRef(null);

  /**
   * Keep a ref in sync with activeRoom so socket callbacks
   * always see the latest value without causing re-subscriptions.
   */
  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  /* ──────────────────────────────────────────────
   * Initial data load
   * ────────────────────────────────────────────── */
  useEffect(() => {
    fetchRooms();
  }, []);

  /* ──────────────────────────────────────────────
   * Socket event subscriptions
   * Stable dependency list: [socket, user.id]
   * Uses activeRoomRef to avoid re-subscribing on room change
   * ────────────────────────────────────────────── */
  useEffect(() => {
    if (!socket) return;

    /**
     * receiveMessage — Incoming message from another user.
     * - If the active room matches → append and emit seen.
     * - If different room → emit delivered.
     * - Always refresh sidebar for last-message preview.
     */
    const handleReceiveMessage = (message) => {
      const currentRoom = activeRoomRef.current;

      if (currentRoom && message.room_id === currentRoom.id) {
        socket.emit("messageSeen", {
          messageId: message.id,
          roomId: message.room_id,
          userId: user.id,
        });

        setMessages((prev) => {
          if (prev.some((existing) => existing.id === message.id)) return prev;
          return [...prev, message];
        });
      } else {
        socket.emit("messageDelivered", {
          messageId: message.id,
          roomId: message.room_id,
          userId: user.id,
        });
      }

      fetchRooms();
    };

    /**
     * refreshRooms — Triggered when another participant sends a message
     * in a room we're not currently viewing. Only refreshes the sidebar.
     */
    const handleRefreshRooms = () => {
      fetchRooms();
    };

    /**
     * typing — Scoped to the active room only.
     * Includes roomId validation to prevent cross-room bleed.
     */
    const handleTyping = ({ roomId, userId: typingUserId, isTyping }) => {
      const currentRoom = activeRoomRef.current;
      if (!currentRoom || roomId !== currentRoom.id) return;
      if (typingUserId === user.id) return;
      setIsOtherTyping(Boolean(isTyping));
    };

    /**
     * messageStatusUpdated — Tick progression (sent → delivered → seen).
     * Updates the local message array in-place.
     */
    const handleStatusUpdate = ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg))
      );
    };

    /**
     * messageDeleted — Remove unsent message from the view.
     */
    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      fetchRooms();
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("refreshRooms", handleRefreshRooms);
    socket.on("typing", handleTyping);
    socket.on("messageStatusUpdated", handleStatusUpdate);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("refreshRooms", handleRefreshRooms);
      socket.off("typing", handleTyping);
      socket.off("messageStatusUpdated", handleStatusUpdate);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [socket, user.id]);

  /* ──────────────────────────────────────────────
   * Room selection handler
   * Joins room via socket, fetches messages, bulk-marks seen
   * ────────────────────────────────────────────── */
  useEffect(() => {
    if (!activeRoom || !socket) return;

    setIsOtherTyping(false);

    socket.emit("joinRoom", { roomId: activeRoom.id, userId: user.id }, (response) => {
      if (response?.error) {
        return;
      }
    });

    fetchMessages(activeRoom.id, 0, true);
  }, [activeRoom?.id, socket, user.id]);

  /* ──────────────────────────────────────────────
   * Data fetchers
   * ────────────────────────────────────────────── */

  /**
   * Fetches the room list for the sidebar.
   */
  const fetchRooms = async () => {
    try {
      const { data } = await apiClient.get("/chat/rooms");
      setRooms(data.data);
    } catch {
      /* Silent — sidebar will show last known state */
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches paginated messages for a room.
   * On initial load, also bulk-marks all unseen messages as 'seen'.
   * @param {string} roomId - Target room
   * @param {number} offset - Pagination offset
   * @param {boolean} initial - True for first load (replaces messages)
   */
  const fetchMessages = async (roomId, offset = 0, initial = false) => {
    if (initial) setLoadingMessages(true);
    else setIsLoadingOlder(true);

    try {
      const { data } = await apiClient.get(
        `/chat/rooms/${roomId}/messages?limit=${PAGE_SIZE}&offset=${offset}`
      );

      const fetched = data.data;
      setHasMoreMessages(fetched.length >= PAGE_SIZE);

      if (initial) {
        setMessages(fetched);
        bulkMarkSeen(roomId);
      } else {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.id));
          const uniqueNew = fetched.filter((msg) => !existingIds.has(msg.id));
          return [...uniqueNew, ...prev];
        });
      }
    } catch {
      /* Silent — messages area will show last known state */
    } finally {
      setLoadingMessages(false);
      setIsLoadingOlder(false);
    }
  };

  /**
   * Emits a bulk markRoomSeen event to the server after opening a room.
   * This marks all messages from the other user as 'seen' in the database
   * and broadcasts tick updates to the sender.
   * @param {string} roomId - Room to mark as read
   */
  const bulkMarkSeen = (roomId) => {
    if (!socket) return;
    socket.emit("markRoomSeen", { roomId, userId: user.id });
  };

  /**
   * Loads older messages when the user scrolls to the top.
   */
  const handleLoadOlderMessages = useCallback(() => {
    if (activeRoom && hasMoreMessages && !isLoadingOlder) {
      fetchMessages(activeRoom.id, messages.length, false);
    }
  }, [activeRoom, hasMoreMessages, isLoadingOlder, messages.length]);

  /* ──────────────────────────────────────────────
   * Message actions
   * ────────────────────────────────────────────── */

  /**
   * Sends a message with optimistic UI update.
   * Swaps the temp ID with the real UUID on server confirmation.
   * @param {string} content - Message text
   */
  const handleSendMessage = (content) => {
    if (!activeRoom || !socket || !content.trim()) return;

    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      room_id: activeRoom.id,
      sender_id: user.id,
      content,
      created_at: new Date().toISOString(),
      message_type: "text",
      status: "sent",
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    socket.emit(
      "sendMessage",
      {
        roomId: activeRoom.id,
        senderId: user.id,
        content,
        messageType: "text",
      },
      (response) => {
        if (response?.success) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempId ? response.data : msg))
          );
          fetchRooms();
        } else {
          setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        }
      }
    );
  };

  /**
   * Emits typing indicator to the room.
   * @param {boolean} isTyping - Whether user is currently typing
   */
  const handleTyping = (isTyping) => {
    if (!activeRoom || !socket) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit("typing", { roomId: activeRoom.id, userId: user.id, isTyping });

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", { roomId: activeRoom.id, userId: user.id, isTyping: false });
      }, 3000);
    }
  };

  /**
   * Unsends a message (soft delete) with optimistic removal.
   * @param {string} messageId - Message UUID to unsend
   */
  const handleUnsendMessage = (messageId) => {
    if (!activeRoom || !socket) return;
    socket.emit("unsendMessage", { messageId, roomId: activeRoom.id, userId: user.id });
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  /* ──────────────────────────────────────────────
   * Render
   * ────────────────────────────────────────────── */
  if (loading && rooms.length === 0) {
    return (
      <div className="flex items-center justify-center p-20 min-h-screen">
        <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 max-w-[1400px] mx-auto h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] min-h-[500px] flex rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-black/5 shadow-2xl bg-white relative z-10"
    >
      {/* Sidebar */}
      <div className={`w-full md:w-[350px] lg:w-[450px] shrink-0 border-r border-black/5 ${activeRoom ? "hidden md:block" : "block"}`}>
        <ChatSidebar
          rooms={rooms}
          activeRoomId={activeRoom?.id}
          onSelectRoom={setActiveRoom}
          user={user}
        />
      </div>

      {/* Chat Window */}
      <div className={`flex-1 h-full min-w-0 bg-[#FBFBFE] ${!activeRoom ? "hidden md:block" : "block"}`}>
        <AnimatePresence mode="wait">
          {activeRoom ? (
            <motion.div
              key={activeRoom.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              <div className="md:hidden p-3 bg-white border-b border-black/5 flex items-center">
                <button
                  onClick={() => setActiveRoom(null)}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 rounded-xl active:scale-95 transition-all"
                >
                  ← Return to Rooms
                </button>
              </div>

              {loadingMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : (
                <ChatWindow
                  room={activeRoom}
                  messages={messages}
                  user={user}
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                  isOtherTyping={isOtherTyping}
                  onLoadOlderMessages={handleLoadOlderMessages}
                  isLoadingOlder={isLoadingOlder}
                  onUnsendMessage={handleUnsendMessage}
                />
              )}
            </motion.div>
          ) : (
            <div className="hidden md:block h-full">
              <ChatWindow room={null} messages={[]} user={user} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ChatsPage;
