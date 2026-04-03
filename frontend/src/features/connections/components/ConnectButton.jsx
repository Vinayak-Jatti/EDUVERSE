import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { UserPlus, UserCheck, Clock, X, Check } from "lucide-react";
import apiClient from "../../../services/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmModal } from "../../../components/shared";

const ConnectButton = ({ targetUserId, initialStatus = "none", onStatusChange }) => {
  const [status, setStatus] = useState(initialStatus); // none, pending_sent, pending_received, accepted
  const [loading, setLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleAction = async (action) => {
    setLoading(true);
    try {
      if (action === "request") {
        await apiClient.post(`/connections/request/${targetUserId}`);
        setStatus("pending_sent");
        toast.success("Connection request sent successfully.");
      } else if (action === "accept") {
        await apiClient.post(`/connections/accept/${targetUserId}`); 
        setStatus("accepted");
        toast.success("Connection successfully established.");
      } else if (action === "remove") {
        await apiClient.delete(`/connections/${targetUserId}`);
        setStatus("none");
        toast.info("Connection has been removed.");
      }
      if (onStatusChange) onStatusChange(status);
    } catch (err) {
      console.error("Unable to complete the connection request:", err);
      toast.error(err.response?.data?.message || "Unable to synchronize with the server. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {status === "none" && (
          <motion.button
            key="connect"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => handleAction("request")}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            <UserPlus size={14} />
            Connect
          </motion.button>
        )}

        {status === "pending_sent" && (
          <motion.button
            key="requested"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 rounded-xl font-bold uppercase text-[10px] tracking-widest cursor-default border border-gray-200"
          >
            <Clock size={14} />
            Requested
          </motion.button>
        )}

        {status === "accepted" && (
          <motion.button
            key="connected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsConfirmModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20 hover:bg-rose-600 transition-all group"
          >
            <UserCheck size={14} className="group-hover:hidden" />
            <X size={14} className="hidden group-hover:block" />
            <span className="group-hover:hidden">Connected</span>
            <span className="hidden group-hover:block">Remove</span>
          </motion.button>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => handleAction("remove")}
        title="Disconnect Connection?"
        message="This action will remove the user from your connections."
        confirmText="Confirm"
      />
    </div>
  );
};

export default ConnectButton;
