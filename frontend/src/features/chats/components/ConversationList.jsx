import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Search, MoreVertical } from "lucide-react";

/**
 * WhatsApp inspired Sidebar for Conversations
 */
const ConversationList = ({ conversations, activeId, onSelect, user }) => {
  return (
    <div className="flex flex-col h-full bg-white border-r border-black/5 overflow-hidden">
      {/* Search Header */}
      <div className="p-6 border-b border-black/5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tighter">Messages</h2>
            <button className="p-2 text-gray-400 hover:text-black">
                <MoreVertical size={20} />
            </button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
          <input 
            type="text" 
            placeholder="Search breakthrough partners..." 
            className="w-full bg-gray-50 border border-black/5 rounded-2xl py-3 pl-11 pr-4 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-black transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-4 space-y-3">
        {conversations.length > 0 ? (
          conversations.map((conv) => {
            const isActive = activeId === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`w-full flex items-center gap-4 p-4 rounded-[2.2rem] transition-all relative group ${
                  isActive 
                    ? "bg-black text-white shadow-2xl shadow-black/20 scale-[1.02]" 
                    : "hover:bg-gray-50 bg-white border border-black/[0.03]"
                }`}
              >
                {/* Avatar with Status */}
                <div className="relative shrink-0">
                  <div className={`w-14 h-14 rounded-[1.4rem] overflow-hidden border-2 ${isActive ? "border-white/20" : "border-black/5"} shadow-sm transition-transform group-hover:scale-105`}>
                    <img 
                      src={conv.other_user_avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${conv.other_user_username}`} 
                      alt={conv.other_user_display_name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${isActive ? "border-black" : "border-white"} bg-emerald-500 shadow-sm`} />
                </div>

                {/* Info preview */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-[13px] font-black uppercase truncate tracking-tight ${isActive ? "text-white" : "text-gray-900"}`}>
                      {conv.other_user_display_name}
                    </h4>
                    {conv.last_message_at && (
                      <span className={`text-[8px] font-black uppercase tracking-[0.1em] ${isActive ? "text-white/40" : "text-gray-300"}`}>
                        {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                     <p className={`text-[11px] font-bold truncate flex-1 ${isActive ? "text-white/60" : "text-gray-400"}`}>
                        {conv.last_message_content || "Commence sync protocol..."}
                     </p>
                     {conv.unread_count > 0 && !isActive && (
                        <div className="px-2 py-0.5 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30">
                            <span className="text-[8px] text-white font-black">{conv.unread_count}</span>
                        </div>
                     )}
                  </div>
                </div>

                {/* Active Indicator Bar */}
                {isActive && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-full" />
                )}
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center opacity-40 grayscale pointer-events-none mt-10">
             <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
               <Search className="w-10 h-10 text-gray-300" />
             </div>
             <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-2">No Active Streams</h3>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                Connect with peers to start<br/>secure intelligence exchange
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
