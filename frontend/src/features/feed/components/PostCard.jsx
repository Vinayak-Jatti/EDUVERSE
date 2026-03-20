import React, { useState } from "react";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Clock,
  Link as LinkIcon,
  ExternalLink,
  FileText,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import apiClient from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";

const PostCard = ({ post: initialPost }) => {
  const { user: currentUser } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const isOwnPost = currentUser?.id === post.user_id;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    // Optimistic Delete
    setIsDeleted(true);

    try {
      await apiClient.delete(`/feed/${post.id}`);
      toast.success("Post deleted successfully");
    } catch (err) {
      toast.error("Could not delete post");
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
        await apiClient.post(`/feed/${post.id}/like`);
      } else {
        await apiClient.delete(`/feed/${post.id}/like`);
      }
    } catch (err) {
      setPost(post); // Revert
    } finally {
      setIsLiking(false);
    }
  };

  if (isDeleted) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border border-black/5 rounded-[2.5rem] p-6 mb-6 hover:shadow-xl hover:shadow-black/5 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link to={`/profile/${post.username}`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-black/5">
            <img 
              src={post.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${post.username}`} 
              alt={post.display_name} 
              onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=fallback`; }}
            />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-tight">{post.display_name}</h4>
            <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              <span>@{post.username}</span>
              <span>•</span>
              <Clock size={10} />
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          {isOwnPost && (
            <button 
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Delete Post"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="mb-6">
        {post.body && (
           <p className="text-sm font-medium leading-relaxed text-gray-600 mb-4 whitespace-pre-wrap">
             {post.body}
           </p>
        )}

        {/* Unified Media Gallery */}
        {post.media && post.media.length > 0 && (
          <div className={`grid gap-3 overflow-hidden rounded-[2.5rem] border border-black/5 mt-4 ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {post.media.map((item) => (
              <div key={item.id} className="relative group/media overflow-hidden bg-gray-50 aspect-video">
                {item.media_type === "image" ? (
                   <img 
                    src={item.url} 
                    alt="Post content" 
                    className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-500" 
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1544383335-243b3fdd15f1?q=100&w=2000&auto=format&fit=crop"; }}
                   />
                ) : item.media_type === "video" ? (
                   <video src={item.url} controls className="w-full h-full object-cover" />
                ) : (
                   <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full h-full flex flex-col items-center justify-center p-6 bg-indigo-50/50 text-indigo-500 group/doc transition-colors hover:bg-indigo-100/50"
                   >
                      <FileText size={40} className="mb-2 group-hover/doc:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Resource</span>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold text-gray-700 truncate max-w-[120px]">{item.url.split('/').pop()}</span>
                        <ExternalLink size={12} className="text-indigo-400" />
                      </div>
                   </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-black/5">
        <div className="flex items-center gap-2 md:gap-6">
          <ActionButton 
            onClick={handleLike}
            icon={<Heart className={post.has_liked ? "fill-red-500 text-red-500" : ""} size={18} />} 
            count={post.like_count} 
            color={post.has_liked ? "text-red-500" : "text-gray-400"}
          />
          <ActionButton 
            icon={<MessageSquare size={18} />} 
            count={post.comment_count} 
            color="text-gray-400"
          />
          <ActionButton 
            icon={<Share2 size={18} />} 
            count={post.share_count} 
            color="text-gray-400"
          />
        </div>
        <button className="p-2 text-gray-400 hover:text-black transition-colors">
          <Bookmark size={18} />
        </button>
      </div>
    </motion.div>
  );
};

const ActionButton = ({ icon, count, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 group transition-all active:scale-95 ${color} hover:text-black`}
  >
    <div className="p-2 rounded-xl group-hover:bg-gray-50">
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest">{count || 0}</span>
  </button>
);

export default PostCard;
