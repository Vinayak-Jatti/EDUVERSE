import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PlayCircle, MessageSquare, Heart, ChevronDown, ChevronUp, Flag, Trash2, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import apiClient from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import CommentSection from "../../comment/components/CommentSection";
import ReportModal from "./ReportModal";
import { ConfirmModal } from "../../../components/shared";

/**
 * Premium MasteryStreamCard for video content
 */
const MasteryStreamCard = ({ post: initialPost, onPostDeleted, onPostUpdated }) => {
  const { user: currentUser } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [isLiking, setIsLiking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef(null);

  const isOwnPost = currentUser?.id === post?.user_id;

  const confirmDelete = async () => {
    try {
      await apiClient.delete(`/feed/${post.id}`);
      if (onPostDeleted) onPostDeleted(post.id);
      toast.info("Stream deleted");
    } catch (err) {
      toast.error("Could not delete stream");
    }
  };

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
        await apiClient.post(`/feed/${post.id}/like`, { targetType: "post" });
      } else {
        await apiClient.delete(`/feed/${post.id}/like`, { data: { targetType: "post" } });
      }
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      setPost(initialPost);
      toast.error("Could not process like");
    } finally {
      setIsLiking(false);
    }
  };

  const handlePlayClick = () => {
    setIsPlaying(true);
    setTimeout(() => {
       if (videoRef.current) videoRef.current.play();
    }, 150);
  };

  if (!post) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden mb-6 shadow-sm hover:shadow-xl transition-all group"
    >
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {!isPlaying ? (
          <>
            {post.media?.[0]?.url ? (
              <video 
                src={post.media[0].url} 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                muted
                playsInline
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
            )}
            
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button 
                onClick={handlePlayClick}
                whileHover={{ scale: 1.1 }}
                whileActive={{ scale: 0.9 }}
                className="bg-white/20 backdrop-blur-md p-5 rounded-full text-white shadow-2xl border border-white/30"
              >
                <PlayCircle size={40} className="fill-white" />
              </motion.button>
            </div>

            <div className="absolute bottom-4 left-4 p-2 pl-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2 z-10">
                <Link to={`/profile/${post.username}`} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/20">
                        <img 
                            src={post.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${post.username}`} 
                            alt={post.username} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-[11px] font-bold text-white pr-2 tracking-tight">@{post.username}</span>
                </Link>
            </div>
          </>
        ) : (
           <video 
              ref={videoRef}
              src={post.media?.[0]?.url} 
              className="w-full h-full object-contain bg-black"
              controls
              autoPlay
              playsInline
           />
        )}
      </div>

      <div className="p-6">
          <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 leading-tight mb-1">{post.title || "Elite Mastery Session"}</h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                    {post.created_at ? formatDistanceToNow(new Date(post.created_at)) : 'Just now'}
                </p>
              </div>
              <div className="flex gap-1">
                <button className="p-2 text-gray-300 hover:text-black transition-colors rounded-xl">
                    <MoreHorizontal size={14} />
                </button>
              </div>
          </div>

          <p className={`text-[13px] font-bold text-gray-600 leading-relaxed mb-4 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {post.body}
          </p>

          <button 
             onClick={() => setIsExpanded(!isExpanded)}
             className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all mb-4 flex items-center gap-1"
          >
             {isExpanded ? <>CLOSE <ChevronUp size={12}/></> : <>READ MORE <ChevronDown size={12}/></>}
          </button>

          <div className="pt-5 border-t border-gray-50 flex items-center justify-between">
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
                <CommentSection postId={post.id} targetType="post" />
              </motion.div>
            )}
          </AnimatePresence>
      </div>

      <ReportModal 
         isOpen={isReportModalOpen} 
         onClose={() => setIsReportModalOpen(false)} 
         targetId={post.id} 
         targetType="post" 
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={confirmDelete}
        title="Delete Mastery Stream?"
        message="Neutralizing this session will remove it permanently from the EDUVERSE Mastery Registry."
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

export default MasteryStreamCard;
