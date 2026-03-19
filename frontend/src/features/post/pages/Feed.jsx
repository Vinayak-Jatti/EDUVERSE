import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import { motion } from "framer-motion";

const Feed = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("accessToken", token);
      // Remove token from URL for security/cleanliness
      searchParams.delete("token");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  const tabs = ["All", "Posts", "Twits", "Squads", "Videos", "Tech News"];
  
  const posts = [
    {
      id: 1,
      user: "Alex Rivera",
      time: "2 hours ago",
      department: "Computer Science",
      content: "Just finished the advanced module on System Architecture. The transition from monolithic to microservices is fascinating. Who's working with Kubernetes lately? 🚀",
      tags: ["architecture", "engineering", "devops"],
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80"
    },
    {
        id: 2,
        user: "Sarah Chen",
        time: "5 hours ago",
        department: "Design Systems",
        content: "Drafting the new EDUVERSE design tokens. We're moving towards a more kinetic minimalist approach. What do you think about the high-contrast light mode?",
        tags: ["design", "uiux", "tokens"],
        image: null
      }
  ];

  return (
    <div className="animate-in fade-in duration-700">
      {/* TABS HEADER */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
        {tabs.map((tab, idx) => (
          <button 
            key={tab} 
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${
                idx === 0 
                ? "bg-black text-white border-black shadow-xl" 
                : "bg-white text-gray-400 border-black/5 hover:border-black/20 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* FEED CONTENT */}
      <div className="space-y-8">
        {posts.map(post => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
      
      {/* LOADING INDICATOR */}
      <div className="py-20 text-center">
         <div className="inline-block w-8 h-8 border-2 border-black/5 border-t-indigo-600 rounded-full animate-spin" />
         <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-300">Fetching more stories...</p>
      </div>
    </div>
  );
};

export default Feed;
