import React from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, MoreHorizontal, Trash2, Flag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";
import CommentSection from "../../comment/components/CommentSection";
import ReportModal from "./ReportModal";

/**
 * Integrated Post Card component with unified interactions
 */
const PostCard = ({ post: initialPost, onPostDeleted, onPostUpdated }) => {
  const { user } = useAuth();
  const [post, setPost] = React.useState(initialPost);
  const [showComments, setShowComments] = React.useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [isLiking, setIsLiking] = React.useState(false);
  const isOwnPost = user?.id === post.user_id;

  const handleLike = async () => {
    if (isLiking || !post) return;
    setIsLiking(true);
    
    const targetType = post.post_type === 'insight' ? 'insight' : 'post';
    const liked = !post.has_liked;

    // Optimistic Update
    setPost({
      ...post,
      has_liked: liked,
      like_count: liked ? (post.like_count + 1) : Math.max(0, post.like_count - 1)
    });

    try {
      if (liked) {
        await apiClient.post(`/feed/${post.id}/like`, { targetType });
      } else {
        await apiClient.delete(`/feed/${post.id}/like`, { data: { targetType } });
      }
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      setPost(initialPost);
      toast.error("Could not process like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await apiClient.delete(`/feed/${post.id}`);
      if (onPostDeleted) onPostDeleted(post.id);
      toast.info("Post deleted");
    } catch (err) {
      toast.error("Could not delete post");
    }
  };

  if (!post) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden mb-5 shadow-sm hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-gray-50/30 border-b border-gray-50">
        <Link to={`/profile/${post.username}`} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            <img 
              src={post.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${post.username}`} 
              alt={post.username} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-gray-900 leading-none mb-0.5">{post.display_name}</h4>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">
              @{post.username} • {post.created_at ? formatDistanceToNow(new Date(post.created_at)) : 'Just now'} ago
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-300 hover:text-black transition-colors">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <p className="text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-wrap mb-4">
          {post.body}
        </p>

        {post.media && post.media.length > 0 && (
          <div className={`grid gap-2 rounded-2xl overflow-hidden border border-gray-50 ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {post.media.map((item, idx) => (
              <div key={idx} className="relative aspect-video bg-gray-50 overflow-hidden">
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
          <div className="flex items-center gap-6">
            <Action 
              icon={<Heart size={16} className={post.has_liked ? "fill-rose-500 text-rose-500" : ""} />} 
              count={post.like_count || 0} 
              active={post.has_liked} 
              onClick={handleLike} 
              activeColor="text-rose-500" 
            />
            <Action 
              icon={<MessageSquare size={16} className={showComments ? "fill-black text-black" : ""} />} 
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
                className="flex items-center gap-1.5 p-2 text-gray-400 hover:text-rose-500 rounded-xl transition-all font-bold text-[11px]"
              >
                <Flag size={14} /> Report
              </button>
            ) : (
              <button 
                onClick={handleDelete}
                className="flex items-center gap-1.5 p-2 text-gray-400 hover:text-rose-500 rounded-xl transition-all font-bold text-[11px]"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <CommentSection 
                postId={post.id} 
                targetType={post.post_type === 'insight' ? 'insight' : 'post'} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        targetId={post.id} 
        targetType={post.post_type === 'insight' ? 'insight' : 'post'} 
      />
    </motion.div>
  );
};

const Action = ({ icon, count, active, onClick, activeColor = "text-indigo-600" }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 transition-all group ${active ? activeColor : 'text-gray-400 hover:text-gray-900'}`}
  >
    <div className={`transition-transform group-active:scale-125 ${active ? 'animate-pulse' : ''}`}>
      {icon}
    </div>
    <span className="text-[11px] font-bold">{count}</span>
  </button>
);

export default PostCard;
