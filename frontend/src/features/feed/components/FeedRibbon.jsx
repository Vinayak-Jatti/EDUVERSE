import React from 'react';
import { 
  LayoutGrid, 
  Sparkles, 
  FileText, 
  PlayCircle, 
  Zap 
} from 'lucide-react';
import { motion } from 'framer-motion';

const FeedRibbon = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All', icon: <LayoutGrid size={16} /> },
    { id: 'insights', label: 'Insights', icon: <Sparkles size={16} /> },
    { id: 'posts', label: 'Posts', icon: <FileText size={16} /> },
    { id: 'videos', label: 'Mastery Streams', icon: <PlayCircle size={16} /> },
    { id: 'news', label: 'Tech News', icon: <Zap size={16} /> },
  ];

  return (
    <div className="mb-8 overflow-hidden rounded-[2.5rem] border border-black/5 bg-white shadow-sm">
      <div className="p-1 flex items-center gap-1 overflow-x-auto no-scrollbar pb-10 -mb-10">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                relative flex items-center gap-2 px-6 py-4 rounded-[2rem] transition-all duration-300 whitespace-nowrap
                font-black uppercase text-[10px] tracking-widest
                ${isActive ? 'text-white' : 'text-gray-400 hover:text-black hover:bg-gray-50'}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="ribbonActive"
                  className="absolute inset-0 bg-black rounded-[2rem] shadow-xl shadow-black/10 -z-0"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{filter.icon}</span>
              <span className="relative z-10">{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FeedRibbon;
