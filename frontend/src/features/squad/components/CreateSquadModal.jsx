import React, { useState } from "react";
import { X, Camera, Shield, Globe, Lock, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";

const CreateSquadModal = ({ isOpen, onClose, onSquadCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "public"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Squad name is required");

    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post("/squads", formData);
      onSquadCreated(data.data);
      toast.success("Enterprise Squad Created!");
      onClose();
      // Reset form
      setFormData({ name: "", description: "", visibility: "public" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create squad");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-8 border-b border-black/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Initialize <span className="text-indigo-600">Squad</span></h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Enterprise Collaboration Hub</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-50 rounded-2xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Avatar Placeholder (Future Cloudinary Integration) */}
          <div className="flex items-center gap-6 mb-8">
             <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-black/10 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 hover:border-indigo-600 hover:text-indigo-600 transition-all cursor-pointer group">
                <Camera size={24} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black mt-2">AVATAR</span>
             </div>
             <div className="flex-1">
                <h4 className="text-xs font-black uppercase tracking-widest mb-1">Squad Branding</h4>
                <p className="text-[10px] text-gray-400 font-medium">Upload a professional avatar for your study circle.</p>
             </div>
          </div>

          <div className="space-y-4">
            <div>
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Squad Name</label>
               <input 
                 type="text" 
                 required
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
                 placeholder="E.G., QUANTUM ANALYTICS"
                 className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5 text-sm font-bold uppercase tracking-widest"
               />
            </div>

            <div>
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">Description</label>
               <textarea 
                 rows={3}
                 value={formData.description}
                 onChange={(e) => setFormData({...formData, description: e.target.value})}
                 placeholder="DEFINE YOUR SQUAD'S MISSION..."
                 className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5 text-sm font-medium resize-none"
               />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
               <VisibilityBtn 
                  active={formData.visibility === 'public'} 
                  onClick={() => setFormData({...formData, visibility: 'public'})}
                  icon={<Globe size={18} />}
                  label="PUBLIC"
                  desc="Anyone can join"
               />
               <VisibilityBtn 
                  active={formData.visibility === 'private'} 
                  onClick={() => setFormData({...formData, visibility: 'private'})}
                  icon={<Lock size={18} />}
                  label="PRIVATE"
                  desc="Invite only"
               />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-black text-white rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-black/10 flex items-center justify-center gap-3 mt-8 disabled:opacity-50"
          >
            {isSubmitting ? (
               <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
               <>
                 <Users size={18} />
                 INITIALIZE SQUAD
               </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const VisibilityBtn = ({ active, onClick, icon, label, desc }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 ${
      active ? 'border-black bg-gray-50' : 'border-black/5 hover:border-black/10'
    }`}
  >
    <div className={active ? 'text-indigo-600' : 'text-gray-400'}>{icon}</div>
    <div>
       <span className="text-[10px] font-black uppercase tracking-widest block">{label}</span>
       <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{desc}</span>
    </div>
  </button>
);

export default CreateSquadModal;
