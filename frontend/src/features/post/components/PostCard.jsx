import React from "react";
import { MoreHorizontal, MessageSquare, Repeat2, Heart, Share } from "lucide-react";
import { motion } from "framer-motion";

const PostCard = ({ user, time, content, image, tags, department }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border border-black/5 rounded-[2.5rem] p-8 mb-6 hover:shadow-xl hover:shadow-black/5 transition-all duration-500 group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl overflow-hidden border border-black/5">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`} alt={user} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black uppercase tracking-tight">{user}</h4>
              <span className="text-[9px] font-black tracking-widest bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded italic">POST</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {time} • <span className="text-gray-500">{department}</span>
            </p>
          </div>
        </div>
        <button className="text-gray-300 hover:text-black transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <p className="text-gray-600 leading-relaxed mb-6 font-medium">
        {content}
      </p>

      {/* Image if exists */}
      {image && (
        <div className="rounded-[2rem] overflow-hidden border border-black/5 mb-6 bg-gray-50 grayscale hover:grayscale-0 transition-all duration-700">
          <img src={image} alt="Post content" className="w-full h-auto object-cover max-h-[400px]" />
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tags.map(tag => (
          <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 cursor-pointer">
            #{tag}
          </span>
        ))}
      </div>

      {/* Interactions */}
      <div className="flex items-center gap-8 pt-6 border-t border-black/5">
        <Interaction icon={MessageSquare} count="24" />
        <Interaction icon={Repeat2} count="12" />
        <Interaction icon={Heart} count="156" color="text-red-500" />
        <button className="ml-auto text-gray-300 hover:text-black transition-colors">
          <Share className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const Interaction = ({ icon: Icon, count, color = "text-gray-400" }) => (
  <button className={`flex items-center gap-2 group transition-colors ${color} hover:text-black text-xs font-black uppercase tracking-widest`}>
    <div className="p-2 rounded-xl group-hover:bg-gray-50 transition-colors">
      <Icon className="w-4 h-4" />
    </div>
    {count}
  </button>
);

export default PostCard;
