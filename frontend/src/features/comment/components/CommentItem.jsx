import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, MoreHorizontal } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const CommentItem = ({ comment, onDelete }) => {
  const { user } = useAuth();
  const isOwnComment = user?.id === comment.user_id;

  return (
    <div className="flex gap-3 group">
      <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
        <img 
          src={comment.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${comment.username}`} 
          alt={comment.username} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50/80 rounded-2xl rounded-tl-none p-3 relative">
          <div className="flex items-center justify-between mb-0.5">
            <h5 className="text-[12px] font-bold text-gray-900 truncate">
              {comment.display_name} 
              <span className="text-[10px] font-medium text-gray-400 ml-2 uppercase tracking-tighter">
                @{comment.username}
              </span>
            </h5>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isOwnComment && (
                <button 
                  onClick={() => onDelete(comment.id)} 
                  className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              )}
              <button className="p-1 text-gray-400 hover:text-black">
                <MoreHorizontal size={12} />
              </button>
            </div>
          </div>
          <p className="text-[13px] text-gray-700 leading-relaxed font-medium break-words">
            {comment.body}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1 ml-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            {comment.created_at ? formatDistanceToNow(new Date(comment.created_at)) : 'Just now'} ago
          </span>
          <button className="text-[10px] font-bold text-gray-500 hover:text-black uppercase tracking-tighter">
            Reply
          </button>
          <button className="text-[10px] font-bold text-gray-500 hover:text-black uppercase tracking-tighter">
            Like
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
