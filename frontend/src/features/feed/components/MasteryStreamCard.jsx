import React, { useState } from "react";
import { PlayCircle, MessageSquare, Repeat2, Heart, Share2, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";

const MasteryStreamCard = ({ post: initialPost }) => {
  const { user: currentUser } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [isLiking, setIsLiking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
      if (liked) await apiClient.post(`/feed/${post.id}/like`);
      else await apiClient.delete(`/feed/${post.id}/like`);
    } catch (err) {
      setPost(post);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-5 shadow-sm hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-gray-50/40 border-b border-gray-50">
         <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
               <img 
                 src={post.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${post.username}`} 
                 alt={post.username} 
                 className="w-full h-full object-cover"
               />
            </div>
            <div>
               <h4 className="text-[13px] font-bold text-gray-900 leading-none mb-0.5">{post.display_name}</h4>
               <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">@{post.username} • {formatDistanceToNow(new Date(post.created_at))} ago</p>
            </div>
         </div>
         <div className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg flex items-center gap-1.5 border border-indigo-100">
            <ShieldCheck size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">Mastery</span>
         </div>
      </div>

      {/* Video Content */}
      <div className="relative aspect-video bg-black group overflow-hidden">
         <video 
           src={post.video_url || post.media?.[0]?.url} 
           controls 
           className="w-full h-full object-contain"
           poster={post.thumbnail_url || post.media?.[0]?.thumbnail_url}
         />
      </div>

      <div className="p-5">
         <div className={`relative ${!isExpanded && post.body.length > 200 ? 'max-h-24 overflow-hidden' : ''}`}>
            <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
              {post.body}
            </p>
            {!isExpanded && post.body.length > 200 && (
               <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent" />
            )}
         </div>

         {post.body.length > 200 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 flex items-center gap-2 text-indigo-600 text-[9px] font-bold uppercase tracking-widest hover:text-indigo-700 transition-colors"
            >
              {isExpanded ? (
                <>HIDE SUMMARY <ChevronUp size={12} /></>
              ) : (
                <>READ SUMMARY <ChevronDown size={12} /></>
              )}
            </button>
         )}

         <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <Action icon={<Heart size={16} className={post.has_liked ? "fill-rose-500 text-rose-500" : ""} />} count={post.like_count} active={post.has_liked} onClick={handleLike} activeColor="text-rose-500" />
               <Action icon={<MessageSquare size={16} />} count={post.comment_count} />
               <Action icon={<Repeat2 size={16} />} count={post.reposts_count || 0} />
            </div>
            <button className="p-2 text-gray-300 hover:text-black hover:bg-gray-50 rounded-lg transition-all">
               <Share2 size={16} />
            </button>
         </div>
      </div>
    </motion.div>
  );
};

const Action = ({ icon, count, active, onClick, activeColor }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 transition-all active:scale-90 ${active ? activeColor : 'text-gray-400 hover:text-black'}`}
  >
    {icon}
    <span className="text-[11px] font-bold">{count || 0}</span>
  </button>
);

export default MasteryStreamCard;
