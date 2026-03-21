import React, { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Video, MoreVertical, Hash, Sparkles, Smile } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../../../context/SocketContext";

/**
 * Active Chat View inspired by WhatsApp's clean messaging UI
 */
const ChatView = ({ conversation, messages, onSendMessage, user, loadingMessages }) => {
  const [content, setContent] = useState("");
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const scrollRef = useRef(null);
  const socket = useSocket();

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loadingMessages]);

  // ─── Typing Sync ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !conversation) return;

    socket.on("typing", ({ userId, isTyping }) => {
      if (userId !== user.id) {
        setIsOtherTyping(isTyping);
      }
    });

    return () => socket.off("typing");
  }, [socket, conversation, user.id]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setContent(val);
    
    if (socket && conversation) {
      socket.emit("typing", { 
        conversationId: conversation.id, 
        userId: user.id, 
        isTyping: val.length > 0 
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    // Stop typing indicator on submit
    if (socket && conversation) {
      socket.emit("typing", { conversationId: conversation.id, userId: user.id, isTyping: false });
    }

    onSendMessage(content);
    setContent("");
  };

  if (!conversation) return <WelcomePlaceholder />;

  return (
    <div className="flex flex-col h-full bg-[#FBFBFE] overflow-hidden lg:rounded-r-[3rem] relative">
      {/* Header */}
      <div className="h-16 md:h-20 bg-white/80 backdrop-blur-xl border-b border-black/5 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-20">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-11 md:h-11 rounded-lg md:rounded-xl overflow-hidden border border-black/5 shadow-sm bg-gray-50 flex-shrink-0">
            <img 
               src={conversation.other_user_avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${conversation.other_user_username}`} 
               className="w-full h-full object-cover" 
               alt={conversation.other_user_display_name} 
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs md:text-[14px] font-black uppercase tracking-tight truncate leading-none mb-1">
                {conversation.other_user_display_name}
            </h3>
            {isOtherTyping ? (
                <p className="text-[8px] md:text-[9px] font-black text-indigo-600 uppercase tracking-[0.15em] animate-pulse">
                    Synchronizing...
                </p>
            ) : (
                <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    Channel Active
                </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
            <button className="p-2 md:p-3 text-gray-300 hover:text-black hover:bg-gray-50 rounded-xl transition-all hidden sm:block"><Video size={18} /></button>
            <button className="p-2 md:p-3 text-gray-300 hover:text-black hover:bg-gray-50 rounded-xl transition-all"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-4 md:p-8 space-y-4 md:space-y-6 bg-texture-dots bg-[length:24px_24px] bg-no-repeat"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg, idx) => {
            const isMe = msg.sender_id === user.id;
            return (
              <motion.div 
                key={msg.id || idx}
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"} group relative`}
              >
                  {!isMe && (
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl overflow-hidden border border-black/5 mt-auto mr-2 md:mr-3 shadow-sm shrink-0 hidden xs:block">
                         <img src={msg.sender_avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${msg.sender_id}`} className="w-full h-full object-cover" alt="Sender" />
                      </div>
                  )}

                  <div className={`max-w-[85%] md:max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
                      <div className={`p-4 md:p-5 text-[12px] md:text-sm font-semibold leading-relaxed transition-all shadow-sm ${
                        isMe 
                          ? "bg-black text-white rounded-[1.5rem] md:rounded-[2rem] rounded-tr-none hover:shadow-black/20" 
                          : "bg-white text-gray-800 border border-black/5 rounded-[1.5rem] md:rounded-[2rem] rounded-tl-none hover:border-black/10"
                      }`}>
                          {msg.content}
                      </div>
                      <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isMe ? "text-gray-300 mr-2" : "text-gray-300 ml-2"}`}>
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </span>
                  </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer Area with Input */}
      <div className="p-3 md:p-6 bg-white/80 backdrop-blur-xl border-t border-black/5 flex items-center gap-2 md:gap-4 relative z-20">
        <button className="p-2 md:p-3 text-gray-300 hover:text-black transition-all hover:bg-gray-50 rounded-xl shrink-0 hidden xs:block"><ImageIcon size={20} /></button>
        
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 md:gap-4">
            <div className="flex-1 relative group">
                <input 
                    type="text" 
                    value={content}
                    onChange={handleInputChange}
                    placeholder="Document a breakthrough..." 
                    className="w-full bg-gray-50 border border-black/5 rounded-[1.2rem] md:rounded-2xl py-3 md:py-4 px-4 md:px-6 text-[11px] md:text-[13px] font-bold tracking-tight focus:outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                />
            </div>
            <button 
                type="submit" 
                disabled={!content.trim()}
                className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 shrink-0 ${
                    content.trim() ? "bg-black text-white shadow-black/20" : "bg-gray-100 text-gray-300"
                }`}
            >
                <Send size={18} className="md:w-5 md:h-5" />
            </button>
        </form>
      </div>
    </div>
  );
};

const WelcomePlaceholder = () => (
    <div className="h-full flex flex-col items-center justify-center p-20 text-center bg-gray-50/20 backdrop-blur-3xl animate-pulse-slow">
        <div className="w-24 h-24 bg-white border border-black/5 rounded-[3rem] shadow-2xl flex items-center justify-center mb-10 transition-transform hover:rotate-12 duration-1000">
            <Sparkles className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">Connect with <br/> Excellence</h2>
        <p className="max-w-xs text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
            Select a peer from your breakthrough network to begin end-to-end encrypted intelligence exchange.
        </p>
        
        <div className="mt-16 flex items-center gap-3 px-6 py-3 bg-white border border-black/5 shadow-xl rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Secure EDUVERSE Protocol Active</span>
        </div>
    </div>
);

export default ChatView;
