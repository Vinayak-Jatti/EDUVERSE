import React, { useState, useRef, useEffect } from "react";
import { Plus, Image as ImageIcon, Video, Send, Sparkles, Zap } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const CreateInsightBox = ({ onModalOpen, onInsightCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post("/insights", { content, visibility: 'public' });
      onInsightCreated(data.data);
      setContent("");
      toast.success("Intelligence Logged");
    } catch (err) {
      toast.error("Sync Fault");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-[1.5rem] md:rounded-[2rem] p-3.5 md:p-5 mb-6 md:mb-8 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 md:gap-4"
    >
      <div className="flex gap-3 md:gap-4 items-center">
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-[1.2rem] overflow-hidden border border-gray-100 shadow-sm shrink-0">
          <img 
            src={user?.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${user?.username}`} 
            alt={user?.display_name}
            className="w-full h-full object-cover" 
          />
        </div>
        
        <div className="flex-1 flex items-center bg-gray-50/50 rounded-xl md:rounded-2xl px-3.5 md:px-5 py-2.5 md:py-3 border border-transparent focus-within:border-black/5 focus-within:bg-white transition-all">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your Thoughts..."
            className="w-full bg-transparent resize-none outline-none text-[13px] md:text-sm font-medium text-gray-900 placeholder:text-gray-400 no-scrollbar max-h-32"
            rows={1}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center gap-2">
           {content.trim() ? (
             <button 
               onClick={handleSubmit}
               disabled={isSubmitting}
               className="w-9 h-9 md:w-10 md:h-10 bg-black text-white rounded-lg md:rounded-xl hover:bg-gray-900 transition-all flex items-center justify-center shrink-0"
             >
               {isSubmitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Send size={15} />}
             </button>
           ) : (
             <button 
               onClick={onModalOpen}
               className="w-9 h-9 md:w-10 md:h-10 bg-gray-50 text-gray-400 rounded-lg md:rounded-xl hover:bg-black hover:text-white transition-all flex items-center justify-center shrink-0 border border-gray-100"
             >
               <Plus size={16} />
             </button>
           )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-50 pt-3 md:pt-4 px-1">
          <div className="flex items-center gap-1 md:gap-2">
            <MinimalTool onClick={onModalOpen} icon={<ImageIcon size={13} />} color="text-indigo-500" label="share Knowledge" />
            <MinimalTool onClick={onModalOpen} icon={<Video size={13} />} color="text-rose-500" label="share your solution" />
            <MinimalTool onClick={onModalOpen} icon={<Zap size={13} />} color="text-emerald-500" label="insights" />
          </div>
          {/* <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-full border border-gray-100">
            <Sparkles size={8} className="text-amber-500" />
            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-gray-400">Elite</span>
          </div> */}
      </div>
    </motion.div>
  );
};

const MinimalTool = ({ icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 hover:bg-gray-50 rounded-lg transition-all group border border-transparent hover:border-gray-100"
  >
    <div className={`${color} opacity-60 group-hover:opacity-100`}>{icon}</div>
    <span className="hidden sm:block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black">
        {label}
    </span>
  </button>
);

export default CreateInsightBox;
