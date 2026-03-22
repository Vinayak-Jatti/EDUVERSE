import React, { useState } from "react";
import { Send, Image as ImageIcon } from "lucide-react";

/**
 * 17. Create MessageInput component — text input with send button
 */
const MessageInput = ({ onSendMessage, onTyping }) => {
  const [content, setContent] = useState("");

  const handleInputChange = (e) => {
    const val = e.target.value;
    setContent(val);
    
    if (onTyping) {
      onTyping(val.length > 0);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    // Stop typing indicator on submit
    if (onTyping) {
      onTyping(false);
    }

    onSendMessage(content);
    setContent("");
  };

  return (
    <div className="p-3 md:p-6 bg-white/80 backdrop-blur-xl border-t border-black/5 flex items-center gap-2 md:gap-4 relative z-20 shrink-0">
      <button 
        type="button"
        className="p-2 md:p-3 text-gray-300 hover:text-black transition-all hover:bg-gray-50 rounded-xl shrink-0 hidden xs:block"
        title="File/Media sharing (Phase 2)"
      >
        <ImageIcon size={20} />
      </button>
      
      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 md:gap-4">
          <div className="flex-1 relative group">
              <input 
                  type="text" 
                  value={content}
                  onChange={handleInputChange}
                  placeholder="Transmit message..." 
                  className="w-full bg-gray-50 border border-black/5 rounded-[1.2rem] md:rounded-2xl py-3 md:py-4 px-4 md:px-6 text-[11px] md:text-[13px] font-bold tracking-tight focus:outline-none focus:border-black focus:bg-white transition-all shadow-inner"
              />
          </div>
          <button 
              type="submit" 
              disabled={!content.trim()}
              className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 shrink-0 ${
                  content.trim() ? "bg-black text-white shadow-black/20" : "bg-gray-100 text-gray-300"
              }`}
          >
              <Send size={18} className="md:w-5 md:h-5" />
          </button>
      </form>
    </div>
  );
};

export default MessageInput;
