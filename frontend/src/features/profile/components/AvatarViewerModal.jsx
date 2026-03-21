import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AvatarViewerModal = ({ isOpen, onClose, profile }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-4xl w-full aspect-square md:w-[700px] md:h-[700px] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10"
          >
            <img 
              src={profile?.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${profile?.username}`} 
              className="w-full h-full object-cover" 
              alt={profile?.display_name || "Avatar"} 
            />
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-3xl rounded-full text-white transition-all active:scale-95"
            >
              <X className="w-8 h-8" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AvatarViewerModal;
