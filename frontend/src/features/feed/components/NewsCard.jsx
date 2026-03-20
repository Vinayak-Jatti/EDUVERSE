import React from "react";
import { ExternalLink, Globe, Calendar, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const NewsCard = ({ article }) => {
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric'
      });
    } catch (e) { return dateStr; }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border border-black/5 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-black/5 transition-all group mb-10"
    >
      <div className="flex flex-col">
        {/* Visual Content Block */}
        <div className="relative aspect-[16/9] w-full bg-gray-50 overflow-hidden">
           <img 
             src={article.image_url || `https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80`} 
             alt={article.title}
             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
           
           <div className="absolute top-6 left-6 flex gap-2">
              <span className="px-4 py-2 bg-black text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl backdrop-blur-md">
                Master Intelligence
              </span>
           </div>

           <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <ArrowUpRight size={20} className="text-indigo-600" />
             </div>
           </div>
        </div>

        {/* Intelligence Data Section */}
        <div className="p-10">
          <div className="flex items-center gap-5 mb-6">
             <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Globe size={12} strokeWidth={3} />
                <span className="text-[9px] font-black uppercase tracking-widest">{article.source || 'GLOBAL HUB'}</span>
             </div>
             <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">{formatDate(article.pubDate)}</span>
             </div>
          </div>

          <a 
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group-hover:text-indigo-600 transition-colors"
          >
            <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 leading-[1.1] mb-5">
              {article.title}
            </h2>
          </a>

          <p className="text-sm text-gray-400 font-medium leading-[1.6] mb-8 line-clamp-3">
            {article.description || "Detailed enterprise intelligence on global technology and education trends. This article provides deep insights into the current market evolution."}
          </p>

          <div className="flex items-center justify-between pt-8 border-t border-black/5">
             <div className="flex -space-x-3">
                {['Education', 'Tech'].map((tag, i) => (
                   <div key={i} className="px-4 py-2 bg-gray-50 text-gray-400 text-[8px] font-black uppercase tracking-widest rounded-xl border-2 border-white">
                      {tag}
                   </div>
                ))}
             </div>

             <a 
               href={article.link} 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-900 hover:text-indigo-600 transition-all group/btn"
             >
               Full Analysis
               <div className="p-2 group-hover/btn:translate-x-1 transition-transform">
                 <ExternalLink size={16} />
               </div>
             </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsCard;
