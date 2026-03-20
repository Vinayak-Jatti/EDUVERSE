import React, { useState } from "react";
import { PlayCircle, MessageSquare, Repeat2, Heart, Share2, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const MasteryStreamCard = ({ post }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border border-black/5 rounded-[3rem] overflow-hidden hover:shadow-2xl hover:shadow-black/5 transition-all mb-8 shadow-xl shadow-black/5"
    >
      {/* Header Branding */}
      <div className="p-8 flex items-center justify-between border-b border-black/5 bg-gray-50/50">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-xl">
               <img 
                 src={post.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`} 
                 alt={post.username} 
                 className="w-full h-full object-cover"
               />
            </div>
            <div>
               <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 leading-none mb-1">{post.display_name}</h4>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">@{post.username} • {formatDistanceToNow(new Date(post.created_at || Date.now()))} ago</p>
            </div>
         </div>
         <div className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/20">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Mastery Stream</span>
         </div>
      </div>

      {/* Hero Video Section */}
      <div className="relative aspect-video bg-black group overflow-hidden">
         <video 
           src={post.video_url || post.media?.[0]?.url} 
           controls 
           className="w-full h-full object-contain"
           poster={post.thumbnail_url || post.media?.[0]?.thumbnail_url}
         />
         <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Stream Content Section */}
      <div className="p-8">
         <div className={`relative ${!isExpanded && post.body.length > 200 ? 'max-h-32 overflow-hidden' : ''}`}>
            <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
              {post.body}
            </p>
            {!isExpanded && post.body.length > 200 && (
               <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            )}
         </div>

         {post.body.length > 200 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:text-indigo-700 transition-colors"
            >
              {isExpanded ? (
                <>HIDE ANALYSIS <ChevronUp size={14} /></>
              ) : (
                <>SHOW FULL ANALYSIS <ChevronDown size={14} /></>
              )}
            </button>
         )}

         {/* Interactions */}
         <div className="mt-8 pt-8 border-t border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-8">
               <ActionIcon 
                  active={isLiked} 
                  onClick={() => setIsLiked(!isLiked)} 
                  icon={<Heart size={20} fill={isLiked ? "currentColor" : "none"} />} 
                  count={post.likes_count || 0} 
                  activeColor="text-rose-500" 
               />
               <ActionIcon icon={<MessageSquare size={20} />} count={post.comments_count || 0} activeColor="text-indigo-600" />
               <ActionIcon icon={<Repeat2 size={20} />} count={post.reposts_count || 0} activeColor="text-emerald-500" />
            </div>
            <button className="p-4 bg-gray-50 text-gray-400 hover:bg-black hover:text-white rounded-[1.5rem] transition-all active:scale-95">
               <Share2 size={18} />
            </button>
         </div>
      </div>
    </motion.div>
  );
};

const ActionIcon = ({ icon, count, active, activeColor, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 transition-all active:scale-90 group ${active ? activeColor : 'text-gray-400 hover:text-black'}`}
  >
    <div className={`p-3 rounded-2xl bg-gray-50 transition-colors ${active ? 'bg-current/10' : 'group-hover:bg-gray-100'}`}>
       {icon}
    </div>
    <span className="text-xs font-black tracking-widest leading-none">{count}</span>
  </button>
);

export default MasteryStreamCard;
