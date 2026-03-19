import React, { useState } from "react";
import { X, Camera, MapPin, BookOpen, GraduationCap, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../services/apiClient";
import ErrorMessage from "../../../components/shared/ErrorMessage";

const EditProfileModal = ({ profile, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    display_name: profile.display_name || "",
    bio: profile.bio || "",
    institution_name: profile.institution_name || "",
    city: profile.city || "",
    edu_sector: profile.edu_sector || "college",
    avatar_url: profile.avatar_url || ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await apiClient.patch("/profile/me", formData);
      onUpdate(data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-black/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Edit Profile</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Personalise your EDUVERSE identity</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh] no-scrollbar">
              <div className="p-8 space-y-8">
                {error && <ErrorMessage message={error} />}

                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-200 p-1 group-hover:border-black transition-all">
                      <img 
                        src={formData.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.username}`} 
                        className="w-full h-full object-cover rounded-[1.7rem]" 
                        alt="Avatar" 
                      />
                    </div>
                    <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-black text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Profile Image URL</p>
                    <input 
                      type="text" 
                      name="avatar_url"
                      value={formData.avatar_url}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full p-4 bg-gray-50 border border-black/5 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                {/* Info Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Input 
                    label="Display Name" 
                    name="display_name" 
                    value={formData.display_name} 
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Education Sector</label>
                    <select 
                      name="edu_sector"
                      value={formData.edu_sector}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-50 border border-black/5 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-black transition-colors appearance-none"
                    >
                      <option value="school text-black font-sans">School</option>
                      <option value="college">College</option>
                      <option value="university">University</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                  <Input 
                    label="Institution/Campus" 
                    name="institution_name" 
                    icon={<GraduationCap size={16} />}
                    value={formData.institution_name} 
                    onChange={handleChange}
                    placeholder="Your campus name"
                  />
                  <Input 
                    label="City / Location" 
                    name="city" 
                    icon={<MapPin size={16} />}
                    value={formData.city} 
                    onChange={handleChange}
                    placeholder="E.g. New York"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">About Bio</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Briefly tell your story..."
                    className="w-full p-5 bg-gray-50 border border-black/5 rounded-[2rem] text-sm font-medium focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-black/5 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-6 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`px-10 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-70' : ''}`}
                >
                  {loading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Input = ({ label, icon, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">{icon}</div>}
      <input 
        {...props} 
        className={`w-full p-4 ${icon ? 'pl-11' : ''} bg-gray-50 border border-black/5 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-black transition-colors placeholder:text-gray-200`} 
      />
    </div>
  </div>
);

export default EditProfileModal;
