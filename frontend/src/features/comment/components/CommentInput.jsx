import React, { useState } from "react";
import { Send } from "lucide-react";

const CommentInput = ({ onSend, loading }) => {
  const [body, setBody] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!body.trim() || loading) return;
    onSend(body);
    setBody("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3">
      <div className="flex-1 relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment..."
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-[13px] md:text-sm focus:outline-none focus:ring-1 focus:ring-black/5 focus:bg-white transition-all resize-none min-h-[42px] max-h-[120px]"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!body.trim() || loading}
        className={`p-2.5 rounded-xl transition-all ${
          !body.trim() || loading 
            ? "text-gray-200 bg-gray-50" 
            : "text-white bg-black hover:scale-105 active:scale-95 shadow-sm"
        }`}
      >
        <Send size={16} />
      </button>
    </form>
  );
};

export default CommentInput;
