import React, { useState, useEffect } from "react";
import { X, Trash2, User, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../../services/apiClient";
import ErrorMessage from "../../../components/shared/ErrorMessage";

const ConnectionsModal = ({ isOpen, onClose, userId, isMe }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchConnections();
    }
  }, [isOpen, userId]);

  const fetchConnections = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiClient.get(`/profile/${userId}/connections`);
      setConnections(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failure: Could not scan network.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (targetUserId) => {
    setRemovingId(targetUserId);
    try {
      await apiClient.delete(`/connections/${targetUserId}`);
      setConnections(prev => prev.filter(c => c.user_id !== targetUserId));
      toast.success("Connection Neutralized");
    } catch (err) {
      toast.error(err.response?.data?.message || "Manual Overload: Removal failed.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-black/5 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Network Connections</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Verified Peer Graph</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="overflow-y-auto w-full no-scrollbar flex-1 p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-8 h-8 border-[3px] border-black border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Scanning Nodes...</span>
                </div>
              ) : error ? (
                <div className="py-10">
                  <ErrorMessage message={error} />
                </div>
              ) : connections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <User size={48} className="mb-4 text-gray-300" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Isolated System</h3>
                  <p className="text-[10px] uppercase font-bold mt-1">No active peer bonds found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((conn) => (
                    <div 
                      key={conn.user_id}
                      className="group flex items-center gap-4 p-4 bg-gray-50/50 hover:bg-gray-50 rounded-[1.8rem] border border-transparent hover:border-black/5 transition-all"
                    >
                      <Link 
                        to={`/profile/${conn.username}`} 
                        onClick={onClose}
                        className="w-12 h-12 rounded-2xl overflow-hidden bg-white shadow-sm border border-black/5"
                      >
                        <img 
                          src={conn.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${conn.username}`} 
                          className="w-full h-full object-cover" 
                          alt="Peer" 
                        />
                      </Link>
                      
                      <div className="flex-1 min-w-0">
                         <Link 
                           to={`/profile/${conn.username}`} 
                           onClick={onClose}
                           className="text-sm font-black uppercase tracking-tight block truncate hover:text-indigo-600 transition-colors"
                         >
                           {conn.display_name}
                         </Link>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                           @{conn.username}
                         </p>
                         {conn.headline && (
                           <p className="text-[9px] font-medium text-gray-500 line-clamp-1 mt-0.5 italic">
                             {conn.headline}
                           </p>
                         )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isMe && (
                          <button 
                            disabled={removingId === conn.user_id}
                            onClick={() => handleRemove(conn.user_id)}
                            className={`p-3 bg-white text-red-500 border border-red-50 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm active:scale-95 ${removingId === conn.user_id ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                            title="Neutralize Connection"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <Link 
                          to={`/profile/${conn.username}`} 
                          onClick={onClose}
                          className="p-3 bg-white text-gray-400 hover:text-black rounded-2xl border border-black/5 hover:bg-gray-100 transition-all shadow-sm active:scale-95"
                        >
                          <ChevronRight size={18} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-black/5 bg-gray-50/30 flex justify-center">
               <button 
                 onClick={onClose}
                 className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
               >
                 Close Network Map
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionsModal;
