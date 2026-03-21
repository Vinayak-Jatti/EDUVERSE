import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Settings, 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  Users, 
  BookOpen, 
  MoreHorizontal,
  Mail,
  Github,
  Linkedin,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";
import ErrorMessage from "../../../components/shared/ErrorMessage";
import EditProfileModal from "../components/EditProfileModal";
import PostCard from "../../feed/components/PostCard";
import InsightCard from "../../feed/components/InsightCard";
import ConnectButton from "../../connections/components/ConnectButton";

const ProfilePage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, refreshMe } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  useEffect(() => {
    fetchProfile();
  }, [identifier]);

  useEffect(() => {
    if (profile?.user_id) {
        fetchUserPosts();
    }
  }, [profile?.user_id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/profile/${identifier}`);
      setProfile(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    setLoadingPosts(true);
    try {
      const { data } = await apiClient.get(`/feed/user/${profile.user_id}`);
      setPosts(data.data);
    } catch (err) {
      console.error("Could not load user posts", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return <div className="p-10"><ErrorMessage message={error} /></div>;
  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Cover Image */}
      <div className="h-40 md:h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden rounded-b-[2rem] md:rounded-b-[3rem]">
        {profile.cover_url && (
          <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Profile Header */}
      <div className="px-4 md:px-6 -mt-14 md:-mt-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-6 text-center md:text-left">
            {/* Avatar */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-28 h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-[2rem] md:rounded-[2.5rem] bg-white p-1.5 md:p-2 shadow-2xl overflow-hidden border border-black/5"
            >
              <img 
                src={profile.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.username}`} 
                alt={profile.display_name} 
                className="w-full h-full object-cover rounded-[1.6rem] md:rounded-[2rem]"
              />
            </motion.div>

            <div className="mb-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none mb-1">
                {profile.display_name}
              </h1>
              <p className="text-gray-400 font-bold text-[10px] md:text-sm tracking-widest uppercase mb-4">
                @{profile.username}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-[9px] md:text-xs font-black uppercase tracking-widest text-gray-400">
                {profile.institution_name && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{profile.institution_name}</span>
                  </div>
                )}
                {profile.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{profile.city}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {new Date(profile.created_at).toLocaleYear ? new Date(profile.created_at).getFullYear() : '2024'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-2.5">
            {profile.isMe ? (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-5 md:px-6 py-3.5 md:py-4 bg-black text-white rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-xl"
              >
                <Settings className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <ConnectButton targetUserId={profile.user_id} initialStatus={profile.connectionStatus || 'none'} />
                  
                  {/* MESSAGE INITIATOR */}
                  <button 
                    onClick={async () => {
                      try {
                        const { data } = await apiClient.post(`/chats/start/${profile.user_id}`);
                        navigate("/chats"); // SPA Navigation
                      } catch (err) {
                        toast.error("Handshake Fault");
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-black/5 text-black rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all shadow-lg active:scale-95"
                  >
                    <Mail size={14} />
                    Message
                  </button>
                </div>
                
                <button className="p-3.5 md:p-4 bg-white border border-black/5 rounded-xl md:rounded-2xl hover:bg-gray-50 transition-all active:scale-95 shadow-lg">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-8 max-w-2xl px-1">
            <p className="text-[14px] md:text-base text-gray-600 font-medium leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 flex items-center gap-6 md:gap-8 border-y border-black/5 py-6 overflow-x-auto no-scrollbar px-1">
          <Stat label="Academic Posts" value={profile.post_count} />
          <Stat label="Mutual Connections" value={profile.connection_count || 0} />
          
          <div className="flex items-center gap-2 ml-auto">
            {profile.website_url && <SocialLink icon={<LinkIcon />} href={profile.website_url} />}
            {profile.github_url && <SocialLink icon={<Github />} href={profile.github_url} />}
            {profile.linkedin_url && <SocialLink icon={<Linkedin />} href={profile.linkedin_url} />}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="mt-6 md:mt-8">
          <div className="flex border-b border-black/5 mb-6 md:mb-8 overflow-x-auto no-scrollbar">
            <Tab label="Posts" active={activeTab === "posts"} onClick={() => setActiveTab("posts")} />
            <Tab label="Media" active={activeTab === "media"} onClick={() => setActiveTab("media")} />
            <Tab label="Interests" active={activeTab === "interests"} onClick={() => setActiveTab("interests")} />
          </div>

          <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
               className="min-h-[300px]"
             >
                {activeTab === "posts" && (
                   <div className="flex flex-col gap-6">
                      {loadingPosts ? (
                        <div className="flex justify-center p-12">
                           <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
                        </div>
                      ) : posts.length > 0 ? (
                        posts.map(post => {
                           if (post.post_type === 'insight' || post.post_type === 'text') {
                               return <InsightCard key={post.id} post={post} />;
                           }
                           return <PostCard key={post.id} post={post} />;
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center mb-4 text-gray-300">
                            <BookOpen className="w-8 h-8" />
                          </div>
                          <h3 className="font-black uppercase tracking-widest text-[11px] mb-2 text-gray-400">No Posts Yet</h3>
                          <p className="text-gray-300 text-xs font-bold font-black">Shared thoughts will appear here.</p>
                        </div>
                      )}
                   </div>
                )}
                
                {activeTab === "interests" && (
                  <div className="flex flex-wrap gap-3">
                    {profile.interests && profile.interests.length > 0 ? (
                      profile.interests.map(interest => (
                        <span key={interest.id} className="px-5 py-3 bg-gray-50 border border-black/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500">
                          #{interest.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No interests listed</p>
                    )}
                  </div>
                )}

                 {activeTab === "media" && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
                       {posts.flatMap(p => p.media || []).length > 0 ? (
                         posts.flatMap(p => p.media || []).map((m, idx) => (
                           <a key={idx} href={m.url} target="_blank" rel="noopener noreferrer" className="aspect-square relative group overflow-hidden rounded-[2.5rem] border border-black/5 bg-gray-50 shadow-lg hover:shadow-xl transition-all">
                              {m.media_type === 'image' ? (
                                <img src={m.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Gallery" />
                              ) : m.media_type === 'video' ? (
                                <div className="w-full h-full bg-black/10 flex items-center justify-center">
                                   <ImageIcon size={32} className="text-gray-400" />
                                </div>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50/50 text-indigo-500 p-4 text-center">
                                   <FileText size={40} className="mb-2 group-hover:scale-110 transition-transform" />
                                   <span className="text-[9px] font-black uppercase tracking-widest truncate w-full">{m.url.split('/').pop()}</span>
                                </div>
                              )}
                           </a>
                         ))
                       ) : (
                         <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-gray-300">
                               <ImageIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">No Media Yet</h3>
                         </div>
                       )}
                    </div>
                 )}
             </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <EditProfileModal 
        profile={profile} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onUpdate={(updatedData) => {
          setProfile(updatedData);
          if (profile.isMe) refreshMe();
        }}
      />
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="text-center md:text-left">
    <div className="text-xl font-black tracking-tighter leading-none">{value}</div>
    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 mt-1">{label}</div>
  </div>
);

const Tab = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${active ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
  >
    {label}
    {active && (
      <motion.div 
        layoutId="activeTab" 
        className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-full" 
      />
    )}
  </button>
);

const SocialLink = ({ icon, href }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-10 h-10 flex items-center justify-center bg-white border border-black/5 rounded-xl text-gray-400 hover:bg-black hover:text-white transition-all shadow-sm"
  >
    {React.cloneElement(icon, { size: 16 })}
  </a>
);

export default ProfilePage;
