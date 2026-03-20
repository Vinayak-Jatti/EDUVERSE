import React, { useState, useEffect } from "react";
import apiClient from "../../../services/apiClient";
import PostCard from "../components/PostCard";
import ErrorMessage from "../../../components/shared/ErrorMessage";
import { Plus, Image as ImageIcon, Video, Smile } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

import CreatePostModal from "../components/CreatePostModal";
import FeedRibbon from "../components/FeedRibbon";

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/feed");
      setPosts(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="max-w-xl mx-auto pb-20">
      <FeedRibbon activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Create Post Entry */}
      <div className="bg-white border border-black/5 rounded-[2.5rem] p-6 mb-8 hover:shadow-xl hover:shadow-black/5 transition-all">
         <div className="flex items-center gap-4 mb-6">
           <div className="w-10 h-10 rounded-xl overflow-hidden border border-black/5">
             <img src={user?.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${user?.username}`} alt={user?.display_name} />
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex-1 bg-gray-50 hover:bg-gray-100/50 rounded-2xl p-4 text-left transition-colors"
           >
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">What's on your mind?</span>
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="p-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl"
            >
             <Plus size={18} />
           </button>
         </div>

         <div className="flex items-center gap-1 md:gap-4 border-t border-black/5 pt-6 px-1">
             <FeedTool onClick={() => setIsModalOpen(true)} icon={<ImageIcon size={18} color="#6366f1" />} label="IMAGE" />
             <FeedTool onClick={() => setIsModalOpen(true)} icon={<Video size={18} color="#ec4899" />} label="VIDEO" />
             <FeedTool onClick={() => setIsModalOpen(true)} icon={<Smile size={18} color="#f59e0b" />} label="MOOD" />
         </div>
      </div>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPostCreated={handlePostCreated} 
      />

      {/* Feed List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            <SkeletonLoader />
            <SkeletonLoader />
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : posts.filter(p => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'videos') return p.post_type === 'video';
            if (activeFilter === 'news') return p.post_type === 'news_link';
            if (activeFilter === 'insights') return p.post_type === 'text';
            if (activeFilter === 'posts') return p.post_type === 'image' || p.post_type === 'document';
            return true;
        }).length === 0 ? (
          <div className="p-20 text-center bg-white border border-black/5 rounded-[2.5rem]">
             <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">{activeFilter.toUpperCase()} EMPTY</h3>
             <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mt-2">No content found in this category.</p>
          </div>
        ) : (
          posts.filter(p => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'videos') return p.post_type === 'video';
            if (activeFilter === 'news') return p.post_type === 'news_link';
            if (activeFilter === 'insights') return p.post_type === 'text';
            if (activeFilter === 'posts') return p.post_type === 'image' || p.post_type === 'document';
            return true;
        }).map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

const FeedTool = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all group flex-1 justify-center md:justify-start"
  >
    {icon}
    <span className="hidden sm:block text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black">
        {label}
    </span>
  </button>
);

const SkeletonLoader = () => (
  <div className="bg-white border border-black/5 rounded-[2.5rem] p-6 animate-pulse">
     <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
        <div className="space-y-2">
           <div className="w-24 h-3 bg-gray-100 rounded-full" />
           <div className="w-16 h-2 bg-gray-100 rounded-full" />
        </div>
     </div>
     <div className="space-y-3">
        <div className="w-full h-4 bg-gray-50 rounded-full" />
        <div className="w-5/6 h-4 bg-gray-50 rounded-full" />
        <div className="aspect-video bg-gray-50 rounded-[2rem] mt-6" />
     </div>
  </div>
);

export default FeedPage;
