import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useSocket } from "../../../context/SocketContext";
import apiClient from "../../../services/apiClient";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Chats Page - Phase 1 Final Integration
 */
const ChatsPage = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  
  // Typing State
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  let typingTimeout = null;

  // Initial Data Load
  useEffect(() => {
    fetchRooms();
  }, []);

  // 18. Listen for incoming messages and real-time events
  useEffect(() => {
    if (!socket) return;

    // 21. Append to chat window in real time
    socket.on("receiveMessage", (message) => {
      // Add message if it matches active room, preventing duplicates
      if (activeRoom && message.room_id === activeRoom.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          // Only snap-to-bottom automatically natively handeled by ChatWindow thanks to lastMessageId tracking
          return [...prev, message];
        });
      }
      // Re-fetch rooms to update the sidebar previews instantly
      fetchRooms();
    });

    // Handle background notification triggers (from other browsers)
    socket.on("refreshRooms", () => {
       fetchRooms();
       // Note: If activeRoom is set but they missed a message because they were on another tab,
       // we might want to refetch messages if we missed it. For Phase 1, the user will see it in the sidebar.
       if (activeRoom) {
          fetchMessages(activeRoom.id, 0, false);
       }
    });

    // 22. Show typing indicator
    socket.on("typing", ({ userId, isTyping }) => {
      if (userId !== user.id) {
        setIsOtherTyping(isTyping);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("refreshRooms");
      socket.off("typing");
    };
  }, [socket, activeRoom, user.id]);


  // Handle Room Selection -> Mount/Unmount logic
  useEffect(() => {
    if (activeRoom && socket) {
      // 19. Emit joinRoom on room selection
      socket.emit("joinRoom", { roomId: activeRoom.id, userId: user.id }, (response) => {
        if (response?.error) {
          console.error("Join Room Denied:", response.error);
        }
      });
      
      fetchMessages(activeRoom.id, 0, true);
    }
  }, [activeRoom, socket, user.id]);

  const fetchRooms = async () => {
    try {
      const { data } = await apiClient.get("/chat/rooms");
      setRooms(data.data);
    } catch (err) {
      console.error("Room Sync Fault", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId, offset = 0, initial = false) => {
    if (initial) setLoadingMessages(true);
    else setIsLoadingOlder(true);

    try {
      const limit = 50;
      const { data } = await apiClient.get(`/chat/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`);
      
      const fetchedMessages = data.data;
      if (fetchedMessages.length < limit) {
        setHasMoreMessages(false);
      } else {
        setHasMoreMessages(true);
      }

      if (initial) {
        setMessages(fetchedMessages);
      } else {
        // 23. Paginate vertically
        setMessages(prev => [...fetchedMessages, ...prev]);
      }
    } catch (err) {
      console.error("Message Sync Fault", err);
    } finally {
      setLoadingMessages(false);
      setIsLoadingOlder(false);
    }
  };

  const handleLoadOlderMessages = useCallback(() => {
    if (activeRoom && hasMoreMessages && !isLoadingOlder) {
      fetchMessages(activeRoom.id, messages.length, false);
    }
  }, [activeRoom, hasMoreMessages, isLoadingOlder, messages.length]);

  // 20. Emit sendMessage on input submit
  const handleSendMessage = (content) => {
    if (!activeRoom || !socket) return;
    
    // Construct local optimistic payload
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
        id: tempId,
        room_id: activeRoom.id,
        sender_id: user.id,
        content,
        created_at: new Date().toISOString(),
        message_type: 'text'
    };
    
    setMessages(prev => [...prev, optimisticMsg]);

    socket.emit("sendMessage", {
      roomId: activeRoom.id,
      senderId: user.id,
      content,
      messageType: 'text'
    }, (response) => {
      if (response?.success) {
        // Swap temp ID with official UUID from DB
        setMessages(prev => prev.map(m => m.id === tempId ? response.data : m));
        fetchRooms();
      } else {
        console.error("Message Dispatch Denied:", response?.error);
        setMessages(prev => prev.filter(m => m.id !== tempId)); // Rollback optimistic on error
      }
    });
  };

  const handleTyping = (isTyping) => {
    if (!activeRoom || !socket) return;
    socket.emit("typing", { roomId: activeRoom.id, userId: user.id, isTyping });
  };

  if (loading && !rooms.length) {
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
      {/* List Sidebar */}
      <div className={`w-full md:w-[350px] lg:w-[450px] shrink-0 border-r border-black/5 ${activeRoom ? "hidden md:block" : "block"}`}>
        <ChatSidebar 
          rooms={rooms} 
          activeRoomId={activeRoom?.id} 
          onSelectRoom={setActiveRoom}
          user={user}
        />
      </div>

      {/* Primary Communication Channel */}
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
                  />
                )}
             </motion.div>
           ) : (
             <div className="hidden md:block h-full">
                <ChatWindow 
                    room={null} 
                    messages={[]} 
                    user={user} 
                />
             </div>
           )}
         </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ChatsPage;
