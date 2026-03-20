import React, { useState, useEffect } from "react";
import apiClient from "../../../services/apiClient";
import PostCard from "../components/PostCard";
import ErrorMessage from "../../../components/shared/ErrorMessage";
import { Plus, Image as ImageIcon, Video, Smile } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import CreatePostModal from "../components/CreatePostModal";
import FeedRibbon from "../components/FeedRibbon";
import CreateInsightBox from "../components/CreateInsightBox";
import InsightCard from "../components/InsightCard";
import NewsCard from "../components/NewsCard";
import MasteryStreamCard from "../components/MasteryStreamCard";

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [techNews, setTechNews] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [nextNewsPage, setNextNewsPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (activeFilter === "news" && techNews.length === 0) {
      handleFetchTechNews();
    }
  }, [activeFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/feed");
      setPosts(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTechNews = async (page = null) => {
    // Check Frontend Cache for first page
    if (!page) {
      const cached = localStorage.getItem("eduverse_news_cache");
      if (cached) {
          const { data, expiry } = JSON.parse(cached);
          if (Date.now() < expiry) {
              console.log("Serving Tech Intel from Local Storage ⚡");
              setTechNews(data.results);
              setNextNewsPage(data.nextPage);
              return;
          }
      }
    }

    setNewsLoading(true);
    try {
      const { data } = await apiClient.get(`/news${page ? `?page=${page}` : ''}`);
      if (page) {
        setTechNews(prev => [...prev, ...data.data.results]);
      } else {
        setTechNews(data.data.results);
        // Save to Local Cache (60 mins)
        localStorage.setItem("eduverse_news_cache", JSON.stringify({
           data: { results: data.data.results, nextPage: data.data.nextPage },
           expiry: Date.now() + 60 * 60 * 1000
        }));
      }
      setNextNewsPage(data.data.nextPage);
    } catch (err) {
      console.error("News catch:", err);
    } finally {
      setNewsLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const filteredPosts = posts.filter(p => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'videos') return p.post_type === 'video';
    if (activeFilter === 'insights') return p.post_type === 'insight' || p.post_type === 'text';
    if (activeFilter === 'posts') return p.post_type === 'image' || p.post_type === 'document';
    return true;
  });

  const isLoading = activeFilter === 'news' ? newsLoading && techNews.length === 0 : loading;
  const showNewsFeed = activeFilter === 'news';

  return (
    <div className="max-w-xl mx-auto pb-20">
      <FeedRibbon activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Create Insight / Post Entry (Hide when in News tab) */}
      {!showNewsFeed && (
        <>
          <CreateInsightBox 
            onModalOpen={() => setIsModalOpen(true)} 
            onInsightCreated={handlePostCreated} 
          />
          <CreatePostModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onPostCreated={handlePostCreated} 
          />
        </>
      )}

      {/* Feed List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            <SkeletonLoader />
            <SkeletonLoader />
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (showNewsFeed ? techNews : filteredPosts).length === 0 ? (
          <div className="p-20 text-center bg-white border border-black/5 rounded-[2.5rem]">
             <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">{activeFilter.toUpperCase()} EMPTY</h3>
             <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mt-2 px-8">No content found in this category.</p>
          </div>
        ) : (
          <>
            {(showNewsFeed ? techNews : filteredPosts).map((item, idx) => {
               if (showNewsFeed) {
                 return <NewsCard key={item.id || idx} article={item} />;
               }
               if (item.post_type === 'video') {
                 return <MasteryStreamCard key={item.id} post={item} />;
               }
               if (item.post_type === 'insight' || item.post_type === 'text') {
                 return <InsightCard key={item.id} post={item} />;
               }
               return <PostCard key={item.id} post={item} />;
            })}

            {/* Load More for News */}
            {showNewsFeed && nextNewsPage && (
              <button 
                onClick={() => handleFetchTechNews(nextNewsPage)}
                disabled={newsLoading}
                className="w-full py-5 bg-gray-50 text-gray-400 hover:text-black border border-black/5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 disabled:opacity-50"
              >
                {newsLoading ? 'DISCOVERING INTEL...' : 'LOAD MORE INTELLIGENCE'}
              </button>
            )}
          </>
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
