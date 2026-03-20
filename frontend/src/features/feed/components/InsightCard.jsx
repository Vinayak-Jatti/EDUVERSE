import React, { useState } from "react";
import { Heart, MessageSquare, Share2, Quote, Clock, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
    if (!window.confirm("Are you sure you want to delete this insight?")) return;
    
    // Optimistic Delete
    setIsDeleted(true);

    try {
      await apiClient.delete(`/insights/${post.id}`);
      toast.success("Insight deleted successfully");
    } catch (err) {
      toast.error("Could not delete insight");
      setIsDeleted(false); // Revert
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    
    // Optimistic Update
    const liked = !post.has_liked;
    setPost({
      ...post,
      has_liked: liked,
      like_count: liked ? post.like_count + 1 : Math.max(0, post.like_count - 1)
    });

    try {
      if (liked) {
        await apiClient.post(`/insights/${post.id}/like`);
      } else {
        await apiClient.delete(`/insights/${post.id}/like`);
      }
    } catch (err) {
      // Revert if error
      setPost(initialPost);
    } finally {
      setIsLiking(false);
    }
  };

  if (isDeleted) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-white border-2 border-black/5 rounded-[2.5rem] p-6 mb-6 hover:shadow-xl hover:shadow-black/5 hover:border-black/10 transition-all group relative overflow-hidden"
    >
      {/* Background Quote Icon for Insight feel */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-black">
        <Quote size={120} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <Link to={`/profile/${post.username}`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-black/5">
            <img 
              src={post.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${post.username}`} 
              alt={post.display_name} 
              onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=fallback`; }}
            />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-tight text-black">{post.display_name}</h4>
            <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              <span>@{post.username}</span>
              <span>•</span>
              <Clock size={10} />
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </Link>
        {isOwnPost && (
          <button 
            onClick={handleDelete}
            className="p-2 text-gray-300 hover:text-red-500 hover:bg-gray-50 rounded-xl transition-all"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 my-6">
        <p className="text-xl font-medium leading-relaxed text-black whitespace-pre-wrap">
          {post.body}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-black/5 relative z-10">
        <ActionBtn 
          icon={<Heart size={18} className={post.has_liked ? "fill-current" : ""} />} 
          count={post.like_count || 0}
          active={post.has_liked}
          onClick={handleLike}
          activeClass="text-red-500"
        />
        <ActionBtn icon={<MessageSquare size={18} />} count={post.comment_count || 0} onClick={() => {}} />
        <ActionBtn icon={<Share2 size={18} />} count={post.share_count || 0} onClick={() => {}} />
      </div>
    </motion.div>
  );
};

const ActionBtn = ({ icon, count, active, activeClass = "text-black", onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 text-xs font-bold transition-all group ${
      active ? activeClass : "text-gray-400 hover:text-black"
    }`}
  >
    <div className={`p-2 rounded-xl group-hover:bg-gray-50 transition-colors ${active ? 'bg-red-50' : ''}`}>
      {icon}
    </div>
    <span className="group-hover:translate-x-0.5 transition-transform">{count > 0 ? count : ""}</span>
  </button>
);

export default InsightCard;
