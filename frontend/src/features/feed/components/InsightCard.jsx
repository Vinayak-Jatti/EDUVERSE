import React, { useState } from "react";
import { Heart, MessageSquare, Share2, Quote, Clock, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import apiClient from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";

const InsightCard = ({ post: initialPost }) => {
  const { user: currentUser } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const isOwnPost = currentUser?.id === post.user_id;

  const handleDelete = async () => {
    if (!window.confirm("Simple Check: Purge this insight?")) return;
    setIsDeleted(true);
    try {
      await apiClient.delete(`/insights/${post.id}`);
      toast.success("Insight Purged");
    } catch (err) {
      toast.error("Purge Fault");
      setIsDeleted(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    const liked = !post.has_liked;
    setPost({
      ...post,
      has_liked: liked,
      like_count: liked ? post.like_count + 1 : Math.max(0, post.like_count - 1)
    });

    try {
      if (liked) await apiClient.post(`/insights/${post.id}/like`);
      else await apiClient.delete(`/insights/${post.id}/like`);
    } catch (err) {
      setPost(initialPost);
    } finally {
      setIsLiking(false);
    }
  };

  if (isDeleted) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-[1.5rem] md:rounded-2xl p-4 md:p-6 mb-4 md:mb-5 hover:shadow-sm transition-all relative overflow-hidden group shadow-sm"
    >
      {/* Subtle Quote Mark */}
      <div className="absolute top-0 right-0 p-4 md:p-6 opacity-[0.02] text-black">
        <Quote size={60} className="md:size-[80px]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-4 relative z-10">
        <Link to={`/profile/${post.username}`} className="flex items-center gap-2.5 md:gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
            <img 
              src={post.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${post.username}`} 
              alt={post.display_name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-[12px] md:text-[13px] font-bold text-gray-900 leading-none mb-0.5">{post.display_name}</h4>
            <p className="text-[9px] md:text-[10px] font-medium text-gray-400 uppercase tracking-tight">@{post.username} • {formatDistanceToNow(new Date(post.created_at))} ago</p>
          </div>
        </Link>
        {isOwnPost && (
          <button onClick={handleDelete} className="p-2 text-gray-200 hover:text-rose-500 transition-colors">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 my-3 md:my-4">
        <p className="text-[14px] md:text-base font-semibold leading-relaxed text-gray-800 whitespace-pre-wrap">
          {post.body}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-5 md:gap-6 mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-50 relative z-10">
        <MiniAction icon={<Heart size={15} className={post.has_liked ? "fill-rose-500" : ""} />} count={post.like_count} active={post.has_liked} onClick={handleLike} activeColor="text-rose-500" />
        <MiniAction icon={<MessageSquare size={15} />} count={post.comment_count} />
        <MiniAction icon={<Share2 size={15} />} count={post.share_count} />
      </div>
    </motion.div>
  );
};

const MiniAction = ({ icon, count, active, onClick, activeColor }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 transition-all active:scale-95 ${active ? activeColor : 'text-gray-400 hover:text-black'}`}
  >
    {icon}
    <span className="text-[11px] font-bold">{count || 0}</span>
  </button>
);

export default InsightCard;
