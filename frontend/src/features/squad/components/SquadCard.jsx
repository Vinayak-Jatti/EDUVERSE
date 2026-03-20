import React from "react";
import { Users, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const SquadCard = ({ squad, onJoin }) => {
  return (
    <motion.div 
       initial={{ opacity: 0, scale: 0.95 }}
       animate={{ opacity: 1, scale: 1 }}
       whileHover={{ y: -5 }}
       className="bg-white border border-black/5 rounded-[2.5rem] p-6 flex flex-col hover:shadow-2xl hover:shadow-black/5 transition-all group"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden border-2 border-indigo-50 bg-indigo-50/20 group-hover:border-indigo-100 transition-colors">
          <img 
            src={squad.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${squad.name}`} 
            alt={squad.name}
            className="w-full h-full object-cover"
          />
        </div>
        {squad.visibility === 'private' && (
          <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
            <ShieldCheck size={16} />
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
          {squad.name}
        </h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 mb-4">
          By {squad.creator_name || 'Enterprise Admin'}
        </p>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {squad.description || "A high-performance study circle for enterprise excellence."}
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-black/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600">
          <Users size={16} />
          <span className="text-xs font-black tracking-widest">{squad.member_count} MEMBERS</span>
        </div>
        
        <Link 
          to={`/squads/${squad.id}`}
          className="p-3 bg-black text-white rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-lg group-hover:shadow-indigo-600/20"
        >
          <ArrowRight size={18} />
        </Link>
      </div>
    </motion.div>
  );
};

export default SquadCard;
