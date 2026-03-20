import React, { useState, useRef, useEffect } from "react";
import { Plus, Image as ImageIcon, Video, Smile, Send } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";

const CreateInsightBox = ({ onModalOpen, onInsightCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const MAX_CHARS = 500;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (content.length > MAX_CHARS) {
      toast.error(`Insight exceeds ${MAX_CHARS} characters`);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post("/insights", { content, visibility: 'public' });
      onInsightCreated(data.data);
      setContent("");
      toast.success("Insight shared!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to share insight");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingChars = MAX_CHARS - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="bg-white border border-black/5 rounded-[2.5rem] p-6 mb-8 hover:shadow-xl hover:shadow-black/5 transition-all">
      <div className="flex gap-4 mb-4">
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-black/5 shrink-0">
          <img src={user?.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${user?.username}`} alt={user?.display_name} />
        </div>
        
        <div className="flex-1 bg-gray-50 rounded-2xl p-4 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an academic insight..."
            className="w-full bg-transparent resize-none outline-none text-sm text-gray-800 placeholder:text-gray-400 font-medium min-h-[20px] overflow-hidden"
            rows={1}
            disabled={isSubmitting}
          />
          
          {content.length > 0 && (
            <div className={`text-[10px] font-black tracking-widest uppercase mt-4 text-right transition-colors ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
              {remainingChars} chars remaining
            </div>
          )}
        </div>

        {content.trim().length > 0 ? (
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || isOverLimit}
            className="p-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed shrink-0 h-14"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        ) : (
          <button 
            onClick={onModalOpen}
            className="p-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl shrink-0 h-14"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 md:gap-4 border-t border-black/5 pt-4 px-1">
          <FeedTool onClick={onModalOpen} icon={<ImageIcon size={18} color="#6366f1" />} label="IMAGE" />
          <FeedTool onClick={onModalOpen} icon={<Video size={18} color="#ec4899" />} label="VIDEO" />
          <FeedTool onClick={onModalOpen} icon={<Smile size={18} color="#f59e0b" />} label="MOOD" />
      </div>
    </div>
  );
};

const FeedTool = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all group flex-1 justify-center md:justify-start"
  >
    {icon}
    <span className="hidden sm:block text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black">
        {label}
    </span>
  </button>
);

export default CreateInsightBox;
