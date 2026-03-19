import React from "react";
import { motion } from "framer-motion";

const PlaceholderPage = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white min-h-[50vh] rounded-3xl border border-black/5 shadow-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🚧</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter text-black mb-4">
          {title}
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          We are currently working hard behind the scenes building this section for you.
          Check back soon!
        </p>
      </motion.div>
    </div>
  );
};

export default PlaceholderPage;
