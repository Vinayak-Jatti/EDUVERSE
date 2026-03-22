import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Search, MoreVertical, MessageSquare } from "lucide-react";

/**
 * 15. Create ChatSidebar component — lists all user rooms (community + direct)
 */
const ChatSidebar = ({ rooms, activeRoomId, onSelectRoom, user }) => {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 overflow-hidden">
      {/* Header & Search */}
      <div className="p-5 border-b border-gray-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Rooms</h2>
            <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors">
                <MoreVertical size={20} />
            </button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search rooms..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        {rooms && rooms.length > 0 ? (
          rooms.map((room) => {
            const isActive = activeRoomId === room.id;
            const isCommunity = room.type === 'community';
            const roomName = isCommunity ? room.community_name || "Community" : room.other_user_display_name;
            const roomAvatar = isCommunity 
                ? `https://api.dicebear.com/7.x/shapes/svg?seed=${room.id}` 
                : (room.other_user_avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${room.other_user_username}`);

            return (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className={`w-full flex items-center gap-3.5 p-4 border-b border-gray-50 transition-colors relative text-left ${
                  isActive 
                    ? "bg-blue-50/50" 
                    : "hover:bg-gray-50 bg-white"
                }`}
              >
                {/* Avatar with Status */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
                    <img 
                      src={roomAvatar} 
                      alt={roomName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {!isCommunity && <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${isActive ? 'bg-blue-500' : 'bg-emerald-500'}`} />}
                </div>

                {/* Info Preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5 mt-1">
                    <h4 className={`text-sm font-semibold truncate flex items-center gap-2 ${isActive ? "text-blue-900" : "text-gray-900"}`}>
                      {roomName}
                      {isCommunity && <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Community</span>}
                    </h4>
                    {room.last_message_at && (
                      <span className={`text-[11px] whitespace-nowrap ml-2 ${isActive ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                        {formatDistanceToNow(new Date(room.last_message_at), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                     <p className={`text-sm truncate flex-1 ${isActive ? "text-blue-800/80" : "text-gray-500"}`}>
                        {room.last_message_content || "Say hello..."}
                     </p>
                  </div>
                </div>

                {/* Active Indicator Line */}
                {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                )}
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center mt-10">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
               <MessageSquare className="w-8 h-8 text-gray-300" />
             </div>
             <h3 className="text-sm font-semibold text-gray-900 mb-1">No Rooms Found</h3>
             <p className="text-xs text-gray-500">
                Join a community or message<br/>a peer to connect.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
