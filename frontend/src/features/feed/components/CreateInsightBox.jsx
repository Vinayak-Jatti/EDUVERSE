import React, { useState } from "react";
import { Plus, Image as ImageIcon, Video, Send, Zap, X, ShieldCheck, PenTool } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const CreateInsightBox = ({ onModalOpen, onInsightCreated }) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [insightMode, setInsightMode] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitInsight = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post("/insights", { content, visibility: 'public' });
      onInsightCreated(data.data);
      setContent("");
      setInsightMode(false);
      setExpanded(false);
      toast.success("Update published successfully!");
    } catch (err) {
      toast.error("Failed to publish update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6 md:mb-8">
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.button 
            key="closed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => setExpanded(true)}
            className="w-full bg-white border border-black/5 rounded-[2rem] p-4 flex items-center justify-between shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group"
          >
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-[1.2rem] overflow-hidden bg-gray-50 border border-black/5 flex items-center justify-center text-indigo-500 shadow-inner group-hover:bg-indigo-50 transition-colors">
                 <Plus className="group-hover:rotate-90 transition-transform duration-500" />
               </div>
               <span className="text-sm font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                  Create Content
               </span>
            </div>
            <div className="flex gap-3 text-gray-300 px-2">
               <Zap size={16} />
               <ImageIcon size={16} />
               <Video size={16} />
            </div>
          </motion.button>
        ) : (
          <motion.div 
            key="opened"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-black/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
          >
             <button 
                onClick={() => { setExpanded(false); setInsightMode(false); }} 
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-white hover:bg-black rounded-full transition-all"
             >
                 <X size={16} />
             </button>

             <div className="mb-6">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 mb-1 flex items-center gap-2">
                   <PenTool size={16} className="text-indigo-500" /> 
                   Create New
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">What do you want to share?</p>
             </div>

             <AnimatePresence mode="wait">
                 {!insightMode ? (
                     <motion.div 
                        key="menu"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                     >
                         <button 
                           onClick={() => setInsightMode(true)}
                           className="flex flex-col items-start p-5 rounded-[1.5rem] bg-[#FAFAFA] border border-black/5 hover:bg-emerald-500 hover:border-emerald-500 hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all group text-left"
                         >
                            <Zap size={24} className="text-emerald-500 group-hover:text-white mb-4" />
                            <h3 className="font-black uppercase tracking-wider text-[11px] text-gray-900 group-hover:text-white mb-1.5 leading-tight">Quick<br/>Update</h3>
                            <p className="text-[10px] font-bold text-gray-400 group-hover:text-emerald-50 leading-relaxed">Share brief thoughts and fast updates.</p>
                         </button>

                         <button 
                           onClick={() => onModalOpen('post')}
                           className="flex flex-col items-start p-5 rounded-[1.5rem] bg-[#FAFAFA] border border-black/5 hover:bg-black hover:border-black hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all group text-left"
                         >
                            <ImageIcon size={24} className="text-gray-900 group-hover:text-white mb-4" />
                            <h3 className="font-black uppercase tracking-wider text-[11px] text-gray-900 group-hover:text-white mb-1.5 leading-tight">Standard<br/>Post</h3>
                            <p className="text-[10px] font-bold text-gray-400 group-hover:text-gray-300 leading-relaxed">Articles, images, or attached links.</p>
                         </button>

                         <button 
                           onClick={() => onModalOpen('mastery')}
                           className="flex flex-col items-start p-5 rounded-[1.5rem] bg-[#FAFAFA] border border-black/5 hover:bg-indigo-600 hover:border-indigo-600 hover:shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] hover:-translate-y-1 transition-all group text-left"
                         >
                            <ShieldCheck size={24} className="text-indigo-500 group-hover:text-white mb-4" />
                            <h3 className="font-black uppercase tracking-wider text-[11px] text-gray-900 group-hover:text-white mb-1.5 leading-tight">Video<br/>Lesson</h3>
                            <p className="text-[10px] font-bold text-gray-400 group-hover:text-indigo-50 leading-relaxed">Upload detailed video instruction.</p>
                         </button>
                     </motion.div>
                 ) : (
                     <motion.div
                        key="insight-form"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex flex-col gap-4"
                     >
                        <div className="flex items-start gap-4 p-4 rounded-[1.5rem] bg-emerald-50/50 border border-emerald-100">
                           <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm border border-emerald-100">
                               <img 
                                 src={user?.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${user?.username}`} 
                                 alt={user?.display_name}
                                 className="w-full h-full object-cover" 
                               />
                           </div>
                           <textarea
                               value={content}
                               autoFocus
                               onChange={(e) => setContent(e.target.value)}
                               placeholder="Share your thoughts with the community..."
                               className="w-full bg-transparent resize-none outline-none text-[13px] md:text-sm font-semibold text-emerald-950 placeholder:text-emerald-300 min-h-[80px]"
                               disabled={isSubmitting}
                           />
                        </div>
                        <div className="flex justify-end gap-3">
                           <button 
                             onClick={() => setInsightMode(false)}
                             className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                           >
                              Cancel
                           </button>
                           <button 
                             onClick={handleSubmitInsight}
                             disabled={isSubmitting || !content.trim()}
                             className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center gap-2"
                           >
                              {isSubmitting ? "Publishing..." : "Publish Update"}
                              {!isSubmitting && <Send size={12} />}
                           </button>
                        </div>
                     </motion.div>
                 )}
             </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateInsightBox;
