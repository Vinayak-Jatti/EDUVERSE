import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Users, Layout, ArrowRight, ShieldCheck, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../services/apiClient";
import PostCard from "../features/feed/components/PostCard";
import InsightCard from "../features/feed/components/InsightCard";
import ErrorMessage from "../components/shared/ErrorMessage";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState({ users: [], feed: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, users, feed

  useEffect(() => {
    if (query) {
      handleSearch();
    }
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiClient.get(`/search?q=${encodeURIComponent(query)}`);
      setResults(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Search Protocol Failure");
    } finally {
      setLoading(false);
    }
  };

  const hasResults = results.users.length > 0 || results.feed.length > 0;

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-10 px-4">
      {/* Search Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl">
            <Search size={24} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Search Results</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] items-center flex gap-2">
              Showing Intel for: <span className="text-indigo-600">"{query}"</span>
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-[1.5rem] w-fit border border-black/5">
           <SearchTab active={activeTab === "all"} onClick={() => setActiveTab("all")} icon={<Layout size={14} />}>All Intel</SearchTab>
           <SearchTab active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users size={14} />} count={results.users.length}>Network</SearchTab>
           <SearchTab active={activeTab === "feed"} onClick={() => setActiveTab("feed")} icon={<ArrowRight size={14} />} count={results.feed.length}>Feed</SearchTab>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="py-20 flex flex-col items-center gap-6"
          >
            <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Scanning Digital Archives...</p>
          </motion.div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : !hasResults ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center bg-white border border-black/5 rounded-[3rem] shadow-sm"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-8 text-gray-300">
               <Search size={40} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 text-gray-400">Not Found. Stay Tuned..</h2>
            <p className="text-gray-300 font-bold uppercase tracking-widest text-[10px] max-w-xs leading-relaxed">
               We couldn't locate any relevant data nodes for your query. Try different keywords or expand your search.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            {/* User Results Section */}
            {(activeTab === "all" || activeTab === "users") && results.users.length > 0 && (
              <div>
                <SectionLabel title="Identified Profiles" count={results.users.length} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.users.map(user => (
                    <UserResultCard key={user.id} user={user} />
                  ))}
                </div>
              </div>
            )}

            {/* Feed Results Section */}
            {(activeTab === "all" || activeTab === "feed") && results.feed.length > 0 && (
              <div>
                <SectionLabel title="Relevant Feed Nodes" count={results.feed.length} />
                <div className="space-y-6">
                  {results.feed.map(post => {
                    if (post.post_type === 'insight' || post.post_type === 'text') {
                      return <InsightCard key={post.id} post={post} />;
                    }
                    return <PostCard key={post.id} post={post} />;
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SearchTab = ({ children, active, onClick, icon, count }) => (
  <button 
    onClick={onClick} 
    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 ${
        active 
        ? 'bg-white text-black shadow-lg border border-black/5' 
        : 'text-gray-400 hover:text-black hover:bg-white/50'
    }`}
  >
    {icon}
    {children}
    {count > 0 && <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[8px]">{count}</span>}
  </button>
);

const SectionLabel = ({ title, count }) => (
  <div className="flex items-center gap-4 mb-8">
    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black shrink-0">{title}</h3>
    <div className="h-px bg-black/5 flex-1" />
    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{count} Matches</span>
  </div>
);

const UserResultCard = ({ user }) => (
  <div className="bg-white border border-black/5 p-4 md:p-5 rounded-[2.2rem] flex items-center justify-between hover:shadow-xl hover:shadow-black/5 transition-all group">
    <div className="flex items-center gap-4">
      <Link to={`/profile/${user.username}`} className="w-14 h-14 md:w-16 md:h-16 rounded-[1.8rem] overflow-hidden border border-black/5 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
        <img src={user.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${user.username}`} className="w-full h-full object-cover" alt="" />
      </Link>
      <div className="min-w-0">
        <Link to={`/profile/${user.username}`}>
          <h4 className="text-sm md:text-base font-black uppercase tracking-tighter hover:text-indigo-600 transition-colors truncate">{user.display_name}</h4>
        </Link>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">@{user.username}</p>
        <div className="flex items-center gap-3 mt-2 text-[8px] font-black text-indigo-500 uppercase tracking-widest">
           <ShieldCheck size={10} /> {user.institution_name || "Independent Scholar"}
        </div>
      </div>
    </div>
    <div className="ml-4 shrink-0">
       <Link 
         to={`/profile/${user.username}`}
         className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-2xl hover:bg-black hover:text-white transition-all active:scale-95 border border-black/5 shadow-sm"
       >
          <UserPlus size={18} />
       </Link>
    </div>
  </div>
);

export default SearchPage;
