import React, { useState, useRef, useEffect } from "react";
import { X, Image as ImageIcon, Video, XCircle, Link as LinkIcon, Trash2, ShieldCheck, Sparkles, Globe, Lock, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";

const CreatePostModal = ({ isOpen, creationMode = "post", onClose, onPostCreated }) => {
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [mediaFiles, setMediaFiles] = useState([]); 
  const [assetLink, setAssetLink] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const imageInputRef = useRef();
  const videoInputRef = useRef();

  const isMastery = creationMode === "mastery" || mediaFiles.some(m => m.type === "video");
  const charLimit = 2000;

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    const maxSize = type === "video" ? 10 * 1024 * 1024 : 3 * 1024 * 1024;
    const oversized = files.find(f => f.size > maxSize);
    
    if (oversized) {
      toast.error(`"${oversized.name}" too large! Max ${maxSize / 1024 / 1024}MB.`);
      return;
    }

    if (type === "video" && (mediaFiles.some(m => m.type === "video") || files.length > 1)) {
        toast.warning("One Mastery Stream per publication.");
        return;
    }

    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type
    }));

    setMediaFiles(prev => [...prev, ...newMedia].slice(0, 5));
    setAssetLink(""); 
    setShowLinkInput(false);
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => {
        const updated = [...prev];
        URL.revokeObjectURL(updated[index].preview);
        updated.splice(index, 1);
        return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim() && mediaFiles.length === 0 && !assetLink) return;

    setLoading(true);
    try {
      const url = isMastery ? "/mastery-streams" : "/feed";
      const formData = new FormData();
      formData.append("body", body);
      formData.append("visibility", visibility);
      
      if (isMastery) {
         const masteryMedia = mediaFiles.find(m => m.type === "video");
         formData.append("media", masteryMedia.file);
      } else {
         if (assetLink) formData.append("link_url", assetLink);
         mediaFiles.forEach(m => {
           if (m.type === "image") formData.append("images", m.file);
         });
      }

      const { data } = await apiClient.post(url, formData);
      toast.success(isMastery ? "Video lesson uploaded! 🚀" : "Post published successfully! 🚀");
      onPostCreated(data.data);
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish post.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBody("");
    setMediaFiles([]);
    setAssetLink("");
    setShowLinkInput(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-2xl"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="relative w-full max-w-2xl bg-white/90 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh] border border-white/40 group"
          >
            {/* Header Area */}
            <div className="px-10 py-8 border-b border-black/[0.03] flex items-center justify-between shrink-0 bg-white/50">
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isMastery ? 'bg-indigo-600 text-white rotate-12' : 'bg-black text-white'}`}>
                    {isMastery ? <ShieldCheck size={22} /> : <Sparkles size={22} />}
                  </div>
                   <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-0.5">Create Post</h2>
                    <p className="text-xs font-bold text-gray-900 uppercase tracking-tight">
                        {isMastery ? 'Video Lesson Mode' : 'Standard Post'}
                    </p>
                  </div>
               </div>
               <button onClick={handleClose} className="p-4 hover:bg-black hover:text-white rounded-[1.8rem] transition-all group/close bg-gray-50/50">
                 <X className="w-5 h-5 text-gray-400 group-hover/close:text-white transition-colors" />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto w-full no-scrollbar flex-1 flex flex-col p-10">
               <div className="relative mb-8">
                  <textarea 
                    value={body}
                    onChange={(e) => setBody(e.target.value.slice(0, charLimit))}
                    placeholder="What do you want to share?"
                    className="w-full text-xl font-semibold text-gray-900 bg-transparent resize-none focus:outline-none min-h-[160px] placeholder:text-gray-300 leading-relaxed"
                  />
                  <div className="absolute -bottom-4 right-0 flex items-center gap-2">
                     <span className={`text-[9px] font-black tracking-widest ${body.length > charLimit * 0.9 ? 'text-rose-500' : 'text-gray-300'}`}>
                        {body.length} / {charLimit}
                     </span>
                  </div>
               </div>

               {/* Asset Link Input */}
               <AnimatePresence>
                 {showLinkInput && (
                   <motion.div 
                    initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginBottom: 32 }}
                    exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                   >
                     <div className="p-8 bg-black/[0.02] rounded-[2.5rem] border border-black/[0.05] flex flex-col gap-4 relative group/link">
                        <div className="absolute top-6 left-6 w-1 h-12 bg-indigo-500 rounded-full opacity-30" />
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500 pl-4">External Link or Document</label>
                        <div className="flex gap-3 pl-4">
                          <input 
                            type="url"
                            autoFocus
                            value={assetLink}
                            onChange={(e) => setAssetLink(e.target.value)}
                            placeholder="https://example.com/asset.pdf"
                            className="bg-white/80 border border-black/[0.05] rounded-[1.5rem] px-6 py-4 text-xs w-full focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/20 transition-all font-medium"
                          />
                          <button 
                            type="button"
                            onClick={() => { setAssetLink(""); setShowLinkInput(false); }}
                            className="p-4 bg-white border border-black/[0.05] text-gray-400 rounded-[1.5rem] hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               {/* Modern Media Previews */}
               {(mediaFiles.length > 0 || assetLink) && (
                 <div className={`grid gap-4 mb-8 ${mediaFiles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {mediaFiles.map((m, idx) => (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={idx} 
                        className="relative aspect-video rounded-[2.5rem] overflow-hidden group/media border border-black/[0.05] shadow-2xl shadow-black/5"
                      >
                         {m.type === "image" ? (
                           <img src={m.preview} className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110" alt="Preview" />
                         ) : (
                           <video src={m.preview} className="w-full h-full object-cover" />
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity" />
                         <button 
                           type="button"
                           onClick={() => removeMedia(idx)}
                           className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md text-gray-900 rounded-2xl opacity-0 group-hover/media:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-xl translate-y-2 group-hover/media:translate-y-0"
                         >
                           <X size={18} strokeWidth={3} />
                         </button>
                         {m.type === 'video' && (
                            <div className="absolute bottom-6 left-6 px-4 py-2 bg-indigo-600/90 backdrop-blur-md text-white rounded-xl flex items-center gap-2">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Video Lesson</span>
                            </div>
                         )}
                      </motion.div>
                    ))}
                 </div>
               )}

               {/* Bottom Controls */}
               <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 bg-gray-50/80 p-1.5 rounded-[1.5rem] border border-black/5">
                     <input type="file" hidden ref={imageInputRef} multiple accept="image/*" onChange={(e) => handleFileSelect(e, "image")} />
                     <input type="file" hidden ref={videoInputRef} accept="video/*" onChange={(e) => handleFileSelect(e, "video")} />
                     
                     <ToolAction onClick={() => imageInputRef.current.click()} active={mediaFiles.some(m => m.type === 'image')} icon={<ImageIcon size={18} />} activeColor="bg-blue-500" />
                     <ToolAction onClick={() => videoInputRef.current.click()} active={isMastery} icon={<Video size={18} />} activeColor="bg-indigo-600" />
                     <ToolAction 
                       onClick={() => {
                        if (mediaFiles.length > 0) {
                          toast.info("You can attach either media or a link, not both.");
                          return;
                        }
                        setShowLinkInput(!showLinkInput);
                       }} 
                       active={showLinkInput}
                       icon={<LinkIcon size={18} />} 
                       activeColor="bg-emerald-500"
                     />
                  </div>

                  <div className="flex items-center gap-3">
                     <div className="relative group/visibility">
                        <select 
                          value={visibility}
                          onChange={(e) => setVisibility(e.target.value)}
                          className="appearance-none bg-white border border-black/5 rounded-[1.2rem] pl-10 pr-8 py-3.5 text-[10px] font-black uppercase tracking-widest focus:outline-none hover:border-black/20 transition-all text-gray-500 cursor-pointer shadow-sm min-w-[130px]"
                        >
                          <option value="public">Public (Everyone)</option>
                          <option value="connections_only">Connections Only</option>
                          <option value="private">Private (Only Me)</option>
                        </select>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                           {visibility === 'public' ? <Globe size={14} /> : visibility === 'private' ? <Lock size={14} /> : <Users size={14} />}
                        </div>
                     </div>

                     <button 
                       type="submit"
                       disabled={loading || (!body.trim() && mediaFiles.length === 0 && !assetLink)}
                       className={`px-8 py-3.5 bg-black text-white rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed border border-black`}
                     >
                        {loading ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Sparkles size={14} />
                        )}
                        {loading ? 'PUBLISHING...' : 'PUBLISH'}
                     </button>
                  </div>
               </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ToolAction = ({ icon, active, activeColor, onClick }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`p-3.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center ${active ? `${activeColor} text-white shadow-lg` : 'bg-transparent text-gray-500 hover:text-black hover:bg-white'}`}
  >
    {icon}
  </button>
);

export default CreatePostModal;
