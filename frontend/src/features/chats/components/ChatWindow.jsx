import React, { useRef, useEffect } from "react";
import { MoreVertical, Video, Sparkles, Bot, Check, CheckCheck, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import MessageInput from "./MessageInput";

/**
 * ChatWindow — Renders the active chat conversation with messages,
 * input bar, tick indicators, and typing status.
 */
const ChatWindow = ({
  room,
  messages,
  onSendMessage,
  onTyping,
  isOtherTyping,
  user,
  onLoadOlderMessages,
  isLoadingOlder,
  onUnsendMessage,
}) => {
  const scrollRef = useRef(null);

  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

  /** Auto-scroll to bottom only when a new message arrives at the tail. */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lastMessageId]);

  /** Trigger older-message loading when user scrolls to the top. */
  const handleScroll = (scrollEvent) => {
    if (scrollEvent.target.scrollTop === 0 && onLoadOlderMessages && !isLoadingOlder) {
      onLoadOlderMessages();
    }
  };

  if (!room) return <WelcomePlaceholder />;

  const isCommunity = room.type === "community";
  const roomName = isCommunity
    ? room.community_name || "Community"
    : room.other_user_display_name;
  const roomAvatar = isCommunity
    ? `https://api.dicebear.com/7.x/shapes/svg?seed=${room.id}`
    : room.other_user_avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${room.other_user_username}`;

  return (
    <div className="flex flex-col h-full bg-[#FBFBFE] overflow-hidden lg:rounded-r-[3rem] relative">
      {/* Header */}
      <div className="h-16 md:h-20 bg-white/80 backdrop-blur-xl border-b border-black/5 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-20">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-11 md:h-11 rounded-lg md:rounded-xl overflow-hidden border border-black/5 shadow-sm bg-gray-50 flex-shrink-0">
            <img
              src={roomAvatar}
              className="w-full h-full object-cover"
              alt={roomName}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs md:text-[14px] font-black uppercase tracking-tight truncate leading-none mb-1 flex items-center gap-2">
              {roomName}
              {isCommunity && (
                <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                  Community
                </span>
              )}
            </h3>
            {isOtherTyping ? (
              <p className="text-[8px] md:text-[9px] font-black text-indigo-600 uppercase tracking-[0.15em] animate-pulse">
                Typing...
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
          <button
            className="p-2 md:p-3 text-gray-300 hover:text-black hover:bg-gray-50 rounded-xl transition-all hidden sm:block"
            title="Video call (Phase 3)"
          >
            <Video size={18} />
          </button>
          <button className="p-2 md:p-3 text-gray-300 hover:text-black hover:bg-gray-50 rounded-xl transition-all">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-4 md:p-8 space-y-4 md:space-y-6 bg-texture-dots bg-[length:24px_24px] bg-no-repeat relative"
      >
        {isLoadingOlder && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-full px-4 py-1.5 text-[10px] font-bold text-indigo-600 tracking-widest uppercase z-10 animate-bounce cursor-default border border-black/5">
            Loading History...
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg, idx) => {
            const isMe = msg.sender_id === user.id;
            const isAI = msg.is_ai || msg.sender_id === "ai_system" || msg.message_type === "ai";

            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"} group relative`}
              >
                {/* Other user's avatar */}
                {!isMe && (
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl overflow-hidden border border-black/5 mt-auto mr-2 md:mr-3 shadow-sm shrink-0 hidden xs:block bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    {isAI ? (
                      <Bot className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <img
                        src={msg.sender_avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${msg.sender_id}`}
                        className="w-full h-full object-cover"
                        alt={msg.sender_name}
                      />
                    )}
                  </div>
                )}

                  <div className={`max-w-[85%] md:max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1.5 relative`}>
                    {/* Community sender name badge */}
                    {isCommunity && !isMe && !isAI && (
                      <span className="text-[10px] font-bold text-gray-500 ml-1">
                        {msg.sender_name}
                      </span>
                    )}

                    {/* Bubble Wrapper with Actions */}
                    <div className="relative group/msg flex items-center gap-2">
                      {/* Unsend button (OWN MESSAGES ONLY) — Repositioned for full responsiveness */}
                      {isMe && !isAI && typeof msg.id === "string" && !msg.id.startsWith("temp_") && (
                        <button
                          onClick={() => onUnsendMessage?.(msg.id)}
                          className="absolute right-[calc(100%+8px)] md:right-[calc(100%+12px)] top-1/2 -translate-y-1/2 p-1.5 md:p-2 bg-white text-gray-400 hover:text-rose-500 rounded-full border border-black/5 shadow-sm transition-all md:opacity-0 md:group-hover/msg:opacity-100 scale-90 md:scale-100 flex-shrink-0 z-10"
                          title="Unsend for everyone"
                        >
                          <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </button>
                      )}

                      {/* Message bubble */}
                      <div
                        className={`p-4 md:p-5 text-[12px] md:text-sm font-semibold leading-relaxed transition-all shadow-sm ${
                          isMe
                            ? "bg-black text-white rounded-[1.5rem] md:rounded-[2rem] rounded-tr-none hover:shadow-black/20"
                            : isAI
                              ? "bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-[1.5rem] md:rounded-[2rem] rounded-tl-none border-l-4 border-l-indigo-500"
                              : "bg-white text-gray-800 border border-black/5 rounded-[1.5rem] md:rounded-[2rem] rounded-tl-none hover:border-black/10"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>

                    {/* Timestamp + Tick indicators */}
                    <div className={`flex items-center gap-2 ${isMe ? "mr-2" : "ml-2"}`}>
                      {isAI && <Sparkles className="w-3 h-3 text-indigo-400" />}
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-300">
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </span>

                      {/* WhatsApp-style ticks */}
                      {isMe && !isAI && (
                        <span className="flex items-center ml-0.5">
                          {msg.status === "sent" && (
                            <Check className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          {msg.status === "delivered" && (
                            <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          {msg.status === "seen" && (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <MessageInput onSendMessage={onSendMessage} onTyping={onTyping} />
    </div>
  );
};

/**
 * Welcome placeholder shown when no room is selected.
 */
const WelcomePlaceholder = () => (
  <div className="h-full flex flex-col items-center justify-center p-20 text-center bg-gray-50/20 backdrop-blur-3xl">
    <div className="w-24 h-24 bg-white border border-black/5 rounded-[3rem] shadow-2xl flex items-center justify-center mb-10 transition-transform hover:rotate-12 duration-1000">
      <Sparkles className="w-10 h-10 text-indigo-600" />
    </div>
    <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">
      EduVerse <br /> Secure Comms
    </h2>
    <p className="max-w-xs text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed mt-2">
      Select a room from the sidebar to establish a secure intelligence exchange.
    </p>
  </div>
);

export default ChatWindow;
