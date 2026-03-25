import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

/**
 * A ultra-premium confirmation modal for the EduVerse ecosystem.
 * Features bold brutalist design, glassmorphism, and smooth animations.
 */
const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action might be irreversible.", 
  confirmText = "Yes, Proceed", 
  cancelText = "Cancel",
  type = "danger" 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-black/5"
          >
            <div className="p-8 pb-4 flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 ${
                type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
              }`}>
                <AlertTriangle size={32} />
              </div>

              <h3 className="text-xl font-black uppercase tracking-tighter text-black mb-2">{title}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">{message}</p>
            </div>

            <div className="p-8 pt-6 grid grid-cols-2 gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 hover:text-black transition-all active:scale-95"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-xl transition-all active:scale-95 ${
                  type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-black hover:bg-gray-800 shadow-black/20'
                }`}
              >
                {confirmText}
              </button>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-300 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
