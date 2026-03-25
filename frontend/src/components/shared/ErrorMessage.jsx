import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Enterprise-grade Error Message component following the EduVerse design system.
 * Features bold typography, uppercase labels, and modular responsive layout.
 */
const ErrorMessage = ({ message = "Something went wrong.", onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-8 px-6 bg-red-50/50 border border-red-500/10 rounded-[2rem] text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="w-12 h-12 bg-red-100 rounded-[1.2rem] flex items-center justify-center text-red-500 mb-2">
      <AlertCircle className="w-6 h-6" />
    </div>
    
    <div>
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-1">Execution Fault</h4>
      <p className="text-xs font-bold text-red-900/60 uppercase tracking-widest leading-relaxed max-w-xs">{message}</p>
    </div>

    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 mt-2 px-6 py-2.5 bg-white border border-red-100 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-50 transition-all active:scale-95 shadow-sm"
      >
        <RefreshCw className="w-3 h-3" />
        Retry Sync
      </button>
    )}
  </div>
);

export default ErrorMessage;

