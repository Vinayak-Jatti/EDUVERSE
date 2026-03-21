import React from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Repeat2, Share2, MoreHorizontal, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";

const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user } = useAuth();
  const isOwnPost = user?.id === post.user_id;

  const handleLike = async () => {
    try {
      if (post.has_liked) {
        await apiClient.delete(`/feed/${post.id}/like`);
      } else {
        await apiClient.post(`/feed/${post.id}/like`);
      }
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      toast.error("Handshake Fault");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Neutralize this intelligence log?")) return;
    try {
      await apiClient.delete(`/feed/${post.id}`);
      if (onPostDeleted) onPostDeleted(post.id);
      toast.info("Log Neutralized");
    } catch (err) {
      toast.error("Cleanup Fault");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-[1.5rem] md:rounded-2xl overflow-hidden mb-4 md:mb-5 shadow-sm hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="p-3.5 md:p-4 flex items-center justify-between bg-gray-50/40 border-b border-gray-50">
        <Link to={`/profile/${post.username}`} className="flex items-center gap-2.5 md:gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
            <img 
              src={post.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${post.username}`} 
              alt={post.username} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-[12px] md:text-[13px] font-bold text-gray-900 leading-none mb-0.5">{post.display_name}</h4>
            <p className="text-[9px] md:text-[10px] font-medium text-gray-400 uppercase tracking-tight">@{post.username} • {formatDistanceToNow(new Date(post.created_at))} ago</p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          {isOwnPost && (
            <button onClick={handleDelete} className="p-2 text-gray-200 hover:text-rose-500 transition-colors">
              <Trash2 size={14} />
            </button>
          )}
          <button className="p-2 text-gray-200 hover:text-black transition-colors">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 md:p-5">
        <p className="text-[13px] md:text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-wrap mb-4">
          {post.body}
        </p>

        {post.media && post.media.length > 0 && (
          <div className={`grid gap-2 rounded-xl overflow-hidden border border-gray-100 ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {post.media.map((item, idx) => (
              <div key={idx} className="relative aspect-square md:aspect-video bg-gray-50 overflow-hidden">
                <img 
                  src={item.url} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                  alt="Post content" 
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <Action 
              icon={<Heart size={15} className={post.has_liked ? "fill-rose-500 text-rose-500" : ""} />} 
              count={post.like_count} 
              active={post.has_liked} 
              onClick={handleLike} 
              activeColor="text-rose-500" 
            />
            <Action icon={<MessageSquare size={15} />} count={post.comment_count} />
            <Action icon={<Repeat2 size={15} />} count={post.reposts_count || 0} />
          </div>
          <button className="p-2 text-gray-300 hover:text-black hover:bg-gray-50 rounded-lg transition-all">
            <Share2 size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Action = ({ icon, count, active, onClick, activeColor = "text-indigo-600" }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1.5 transition-all group ${active ? activeColor : 'text-gray-400 hover:text-gray-900'}`}
  >
    <div className={`transition-transform group-active:scale-125 ${active ? 'animate-pulse' : ''}`}>
      {icon}
    </div>
    <span className="text-[10px] md:text-[11px] font-black tracking-tighter">{count}</span>
  </button>
);

export default PostCard;
