import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useSocket } from "../../../context/SocketContext";
import apiClient from "../../../services/apiClient";
import ConversationList from "../components/ConversationList";
import ChatView from "../components/ChatView";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Chats Page - Business Logic for the Conversations module
 */
const ChatsPage = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  // ─── Socket Events ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (message) => {
      // If message belongs to active conversation, add it
      if (activeConversation && message.conversation_id === activeConversation.id) {
        setMessages(prev => [...prev, message]);
      }
      // Refresh list to show new preview even if not active
      fetchConversations();
    });

    socket.on("refresh_chats", () => {
      fetchConversations();
    });

    return () => {
      socket.off("receive_message");
      socket.off("refresh_chats");
    };
  }, [socket, activeConversation]);

  useEffect(() => {
    if (activeConversation && socket) {
      socket.emit("join_conversation", activeConversation.id);
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation, socket]);

  const fetchConversations = async () => {
    try {
      const { data } = await apiClient.get("/chats");
      setConversations(data.data);
      setLoading(false);
    } catch (err) {
      console.error("Chat Sync Fault", err);
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    setLoadingMessages(true);
    try {
      const { data } = await apiClient.get(`/chats/${convId}/messages`);
      setMessages(data.data);
    } catch (err) {
        console.error("Message Sync Fault", err);
    } finally {
        setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (content) => {
    if (!activeConversation) return;
    
    // Optimistic UI update
    const tempId = Date.now();
    const optimisticMsg = {
        id: tempId,
        sender_id: user.id,
        content,
        created_at: new Date().toISOString(),
        message_type: 'text'
    };
    setMessages([...messages, optimisticMsg]);

    try {
      await apiClient.post(`/chats/${activeConversation.id}/messages`, { content });
      fetchMessages(activeConversation.id); // Refresh for final server data
      fetchConversations(); // Update previews in list
    } catch (err) {
      console.error("Dispatch Fault", err);
      setMessages(messages.filter(m => m.id !== tempId)); // Rollback
    }
  };

  const selectConversation = (conv) => {
    setActiveConversation(conv);
  };

  if (loading && !conversations.length) {
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
      <div className={`w-full md:w-[350px] lg:w-[450px] shrink-0 border-r border-black/5 ${activeConversation ? "hidden md:block" : "block"}`}>
        <ConversationList 
          conversations={conversations} 
          activeId={activeConversation?.id} 
          onSelect={selectConversation}
          user={user}
        />
      </div>

      {/* Primary Communication Channel */}
      <div className={`flex-1 h-full min-w-0 bg-[#FBFBFE] ${!activeConversation ? "hidden md:block" : "block"}`}>
         <AnimatePresence mode="wait">
           {activeConversation ? (
             <motion.div 
               key={activeConversation.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="h-full flex flex-col"
             >
                <div className="md:hidden p-3 bg-white border-b border-black/5 flex items-center">
                    <button 
                        onClick={() => setActiveConversation(null)} 
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 rounded-xl active:scale-95 transition-all"
                    >
                        ← Sync Inbox
                    </button>
                </div>
                <ChatView 
                    conversation={activeConversation} 
                    messages={messages} 
                    user={user} 
                    onSendMessage={handleSendMessage}
                    loadingMessages={loadingMessages}
                />
             </motion.div>
           ) : (
             <div className="hidden md:block h-full">
                <ChatView 
                    conversation={null} 
                    messages={[]} 
                    user={user} 
                    onSendMessage={() => {}}
                    loadingMessages={false}
                />
             </div>
           )}
         </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ChatsPage;
