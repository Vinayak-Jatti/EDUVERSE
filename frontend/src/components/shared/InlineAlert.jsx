import React from "react";
import { AlertCircle } from "lucide-react";

/**
 * A compact, consistent inline alert for forms and small UI areas.
 * Matches the EduVerse bold design language.
 */
const InlineAlert = ({ message, type = "error" }) => {
  if (!message) return null;

  const styles = {
    error: "bg-red-50 text-red-600 border-red-100",
    success: "bg-emerald-50 text-emerald-600 border-emerald-100",
    info: "bg-blue-50 text-blue-600 border-blue-100",
    warning: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div 
      role="alert" 
      className={`flex items-center gap-3 p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-1 duration-300 ${styles[type] || styles.error}`}
    >
      <AlertCircle size={14} className="shrink-0" />
      <span className="leading-tight truncate">{message}</span>
    </div>
  );
};


export default InlineAlert;
