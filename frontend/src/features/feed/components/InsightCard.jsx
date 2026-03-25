import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Quote, Trash2, Flag, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import apiClient from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import CommentSection from "../../comment/components/CommentSection";
import ReportModal from "./ReportModal";
import { ConfirmModal } from "../../../components/shared";

/**
 * Premium Insight Card for micro-content
 */
const InsightCard = ({ post: initialPost, onPostDeleted, onPostUpdated }) => {
  const { user: currentUser } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isOwnPost = currentUser?.id === post?.user_id;

  const handleLike = async () => {
    if (isLiking || !post) return;
    setIsLiking(true);
    const liked = !post.has_liked;
    
    setPost({
      ...post,
      has_liked: liked,
      like_count: liked ? (post.like_count + 1) : Math.max(0, post.like_count - 1)
    });

    try {
      if (liked) {
        await apiClient.post(`/feed/${post.id}/like`, { targetType: "insight" });
      } else {
        await apiClient.delete(`/feed/${post.id}/like`, { data: { targetType: "insight" } });
      }
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      setPost(initialPost);
      toast.error("Could not process like");
    } finally {
      setIsLiking(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await apiClient.delete(`/insights/${post.id}`);
      toast.info("Insight deleted");
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (err) {
      toast.error("Could not delete insight");
    }
  };

  if (!post) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-[2rem] p-6 mb-5 hover:shadow-md transition-all relative overflow-hidden group shadow-sm"
    >
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-black">
        <Quote size={80} />
      </div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <Link to={`/profile/${post.username}`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            <img 
              src={post.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${post.username}`} 
              alt={post.display_name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-[13px] font-black uppercase tracking-tight text-gray-900 leading-none mb-1">{post.display_name}</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
              @{post.username} • {post.created_at ? formatDistanceToNow(new Date(post.created_at)) : 'Just now'}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-300 hover:text-black transition-colors rounded-xl">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="relative z-10 my-4">
        <p className="text-[15px] font-bold leading-relaxed text-gray-800 whitespace-pre-wrap">
          {post.body}
        </p>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50 relative z-10">
        <div className="flex items-center gap-8">
          <Action 
            icon={<Heart size={18} className={post.has_liked ? "fill-rose-500 text-rose-500" : "text-gray-300"} />} 
            count={post.like_count || 0} 
            active={post.has_liked} 
            onClick={handleLike} 
            activeColor="text-rose-500" 
          />
          <Action 
            icon={<MessageSquare size={18} className={showComments ? "fill-black text-black" : "text-gray-300"} />} 
            count={post.comment_count || 0} 
            active={showComments}
            onClick={() => setShowComments(!showComments)}
            activeColor="text-black"
          />
        </div>
        <div className="flex items-center gap-2">
          {!isOwnPost ? (
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-black uppercase text-[9px] tracking-widest"
            >
              <Flag size={14} /> Report
            </button>
          ) : (
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-black uppercase text-[9px] tracking-widest"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-6"
          >
            <CommentSection postId={post.id} targetType="insight" />
          </motion.div>
        )}
      </AnimatePresence>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        targetId={post.id} 
        targetType="insight" 
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={confirmDelete}
        title="Neutralize Insight?"
        message="This action will remove the insight permanently from the EDUVERSE stream."
        confirmText="Confirm Delete"
      />
    </motion.div>
  );
};

const Action = ({ icon, count, active, onClick, activeColor }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 transition-all group ${active ? activeColor : 'text-gray-300 hover:text-black'}`}
  >
    <div className={`transition-transform group-active:scale-125`}>
      {icon}
    </div>
    <span className="text-[11px] font-black uppercase tracking-tighter">{count || 0}</span>
  </button>
);

export default InsightCard;
