import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";

const REASONS = [
  { id: 'spam', label: 'Spam' },
  { id: 'harassment', label: 'Harassment' },
  { id: 'hate_speech', label: 'Hate Speech' },
  { id: 'misinformation', label: 'Misinformation' },
  { id: 'inappropriate_content', label: 'Inappropriate Content' },
  { id: 'copyright', label: 'Copyright Violation' },
  { id: 'impersonation', label: 'Impersonation' },
  { id: 'other', label: 'Other' }
];

const ReportModal = ({ isOpen, onClose, targetId, targetType }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || submitting) return;

    setSubmitting(true);
    try {
      await apiClient.post(`/feed/${targetId}/report`, {
        targetType,
        reason,
        description
      });
      toast.success("Report submitted successfully");
      onClose();
    } catch (err) {
      toast.error("Could not submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Report Content</h3>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tighter">Help us keep EduVerse safe</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-50 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Reason for report</label>
                <div className="grid grid-cols-2 gap-2">
                  {REASONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setReason(r.id)}
                      className={`px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all text-left border ${
                        reason === r.id 
                          ? "bg-black text-white border-black" 
                          : "bg-gray-50 text-gray-600 border-gray-50 hover:border-gray-200"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Details (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide more context..."
                  className="w-full bg-gray-50 border border-gray-50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all resize-none min-h-[100px]"
                />
              </div>

              <button
                type="submit"
                disabled={!reason || submitting}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                  !reason || submitting
                    ? "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                    : "bg-black text-white hover:scale-[1.02] active:scale-[0.98] shadow-black/10"
                }`}
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
