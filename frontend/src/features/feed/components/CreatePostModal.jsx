import React, { useState, useRef } from "react";
import { X, Image as ImageIcon, Video, XCircle, Link as LinkIcon, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [mediaFiles, setMediaFiles] = useState([]); // { file, preview, type }
  const [assetLink, setAssetLink] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const imageInputRef = useRef();
  const videoInputRef = useRef();

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    
    // Cloudinary Free Tier Limit Validation
    const maxSize = type === "video" ? 10 * 1024 * 1024 : 3 * 1024 * 1024;
    const oversized = files.find(f => f.size > maxSize);
    
    if (oversized) {
      toast.error(`"${oversized.name}" exceeds free-tier limit! Max for ${type === 'video' ? 'Mastery Stream' : 'Image'} is ${maxSize / 1024 / 1024}MB.`);
      return;
    }

    if (type === "video" && (mediaFiles.some(m => m.type === "video") || files.length > 1)) {
        toast.warning("Only one Mastery Stream allowed per publication");
        return;
    }

    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type
    }));

    setMediaFiles(prev => [...prev, ...newMedia].slice(0, 5)); // max 5 items
    setAssetLink(""); // Clear link if adding media
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
    if (!body.trim() && mediaFiles.length === 0 && !assetLink) {
        toast.info("Please add some content or an asset!");
        return;
    }

    setLoading(true);

    try {
      const isMastery = mediaFiles.some(m => m.type === "video");
      const url = isMastery ? "/mastery-streams" : "/feed";
      
      const formData = new FormData();
      formData.append("body", body);
      formData.append("visibility", visibility);
      
      if (isMastery) {
         // Dedicated Mastery Stream Protocol
         const masteryMedia = mediaFiles.find(m => m.type === "video");
         formData.append("media", masteryMedia.file);
      } else {
         // Generic Publication Protocol
         if (assetLink) formData.append("link_url", assetLink);
         mediaFiles.forEach(m => {
           if (m.type === "image") formData.append("images", m.file);
         });
      }

      const { data } = await apiClient.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success(isMastery ? "Mastery Stream LIVE! 🚀" : "Post live on EduVerse! 🚀");
      onPostCreated(data.data);
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Hub Error: Please try again.");
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
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-black/5"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-black/5 flex items-center justify-between shrink-0 bg-gray-50/50">
               <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">New Publication</h2>
               <button onClick={handleClose} className="p-3 hover:bg-black hover:text-white rounded-2xl transition-all group">
                 <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto w-full no-scrollbar flex-1 flex flex-col p-8 bg-white">
               <textarea 
                 value={body}
                 onChange={(e) => setBody(e.target.value)}
                 placeholder="Share your latest learning or achievement..."
                 className="w-full text-lg font-medium text-gray-900 bg-transparent resize-none focus:outline-none min-h-[140px] placeholder:text-gray-300"
               />

               {/* Asset Link Input Section */}
               <AnimatePresence>
                 {showLinkInput && (
                   <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-6 overflow-hidden"
                   >
                     <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Attach Asset URL (PDF, VDO, IMG)</label>
                        <div className="flex gap-2">
                          <input 
                            type="url"
                            value={assetLink}
                            onChange={(e) => setAssetLink(e.target.value)}
                            placeholder="https://example.com/asset.pdf"
                            className="bg-white border border-indigo-100 rounded-xl px-4 py-3 text-xs w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <button 
                            type="button"
                            onClick={() => { setAssetLink(""); setShowLinkInput(false); }}
                            className="p-3 bg-white border border-indigo-100 text-indigo-400 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-[9px] text-indigo-300 font-medium">This will appear as a linked asset in your post.</p>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               {/* Media & Link Previews */}
               {(mediaFiles.length > 0 || assetLink) && (
                 <div className="grid grid-cols-2 gap-4 mt-2">
                    {/* Raw Uploaded Files */}
                    {mediaFiles.map((m, idx) => (
                      <div key={idx} className="relative aspect-video rounded-[2rem] overflow-hidden group border border-black/5 shadow-lg">
                         {m.type === "image" ? (
                           <img src={m.preview} className="w-full h-full object-cover" alt="Preview" />
                         ) : (
                           <video src={m.preview} className="w-full h-full object-cover" />
                         )}
                         <button 
                           type="button"
                           onClick={() => removeMedia(idx)}
                           className="absolute top-3 right-3 p-2 bg-black/70 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl"
                         >
                           <XCircle size={20} />
                         </button>
                      </div>
                    ))}

                    {/* External Link Preview */}
                    {assetLink && (
                      <div className="relative aspect-video rounded-[2rem] overflow-hidden group border border-indigo-100 shadow-lg bg-indigo-50/20">
                         {assetLink.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                            <img src={assetLink} className="w-full h-full object-cover" alt="Remote Preview" />
                         ) : assetLink.match(/\.(pdf)$/i) ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                               <FileText size={32} className="text-indigo-500 mb-2" />
                               <span className="text-[9px] font-black uppercase text-indigo-400">PDF Document</span>
                            </div>
                         ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                               <LinkIcon size={32} className="text-indigo-500 mb-2" />
                               <span className="text-[9px] font-black uppercase text-indigo-400">External Asset</span>
                            </div>
                         )}
                         <button 
                           type="button"
                           onClick={() => setAssetLink("")}
                           className="absolute top-3 right-3 p-2 bg-black/70 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl"
                         >
                           <XCircle size={20} />
                         </button>
                      </div>
                    )}
                 </div>
               )}

               <div className="mt-8 pt-6 border-t border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <input type="file" hidden ref={imageInputRef} multiple accept="image/*" onChange={(e) => handleFileSelect(e, "image")} />
                     <input type="file" hidden ref={videoInputRef} accept="video/*" onChange={(e) => handleFileSelect(e, "video")} />
                     
                     <ToolButton onClick={() => imageInputRef.current.click()} icon={<ImageIcon size={18} />} label="IMAGE" color="text-indigo-500" />
                     <ToolButton onClick={() => videoInputRef.current.click()} icon={<Video size={18} />} label="VIDEO" color="text-pink-500" />
                     <ToolButton 
                       onClick={() => {
                        if (mediaFiles.length > 0) {
                          toast.info("Cannot add link while media is attached!");
                          return;
                        }
                        setShowLinkInput(!showLinkInput);
                       }} 
                       icon={<LinkIcon size={18} />} 
                       label="LINK" 
                       color={showLinkInput ? "text-white bg-black" : "text-emerald-500"} 
                     />
                  </div>

                  <div className="flex items-center gap-4">
                     <select 
                       value={visibility}
                       onChange={(e) => setVisibility(e.target.value)}
                       className="bg-gray-50 border border-black/5 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] focus:outline-none focus:ring-2 focus:ring-black/5"
                     >
                       <option value="public">🌐 Public</option>
                       <option value="connections_only">👥 Connections</option>
                       <option value="private">🔒 Private</option>
                     </select>

                     <button 
                       type="submit"
                       disabled={loading || (!body.trim() && mediaFiles.length === 0 && !assetLink)}
                       className={`px-10 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-gray-800 transition-all active:scale-95 shadow-2xl flex items-center gap-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                       {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                       Publish
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

const ToolButton = ({ icon, label, color, onClick }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`p-4 rounded-2xl bg-gray-50 border border-black/5 ${color} hover:bg-black hover:text-white transition-all hover:shadow-lg active:scale-90`}
  >
    {icon}
  </button>
);

export default CreatePostModal;
