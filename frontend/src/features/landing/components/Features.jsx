import React from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, Shield, FolderOpen, Award, Globe } from 'lucide-react';

const features = [
  { 
    title: "SQUAD_ENGINE", 
    desc: "A unified workspace for high-performance study circles. Coordinate insights and collaborate with peers in real-time.", 
    icon: <Users /> 
  },
  { 
    title: "RESOURCE_NODE", 
    desc: "Access a decentralized repository of notes and academic materials shared across the global student network.", 
    icon: <FolderOpen /> 
  },
  { 
    title: "MASTERY_STREAM", 
    desc: "Track your evolving technical skill-set and share verified projects with a network of peers and mentors.", 
    icon: <Award /> 
  },
  { 
    title: "GLOBAL_NETWORK", 
    desc: "Connect with student communities across the globe. Exchange academic experiences and build universal connections.", 
    icon: <Globe /> 
  },
  { 
    title: "COMMUNITY_HUB", 
    desc: "Explore diverse educational content. Access specialized insights, academic posts, and academic videos curated for your growth.", 
    icon: <Zap /> 
  },
  { 
    title: "SECURE_SYNC", 
    desc: "Experience professional-grade encryption across all data exchanges, ensuring your academic legacy is always protected.", 
    icon: <Shield /> 
  }
];

const FeatureCard = ({ title, desc, icon, index }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95, y: 30 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    viewport={{ once: true, amount: 0.1 }}
    className="clay-card p-8 md:p-10 flex flex-col items-center text-center h-full group border-4 border-white transition-all duration-500 hover:-translate-y-4 shadow-xl"
  >
    <div className="skeuo-node w-12 h-12 md:w-16 md:h-16 bg-white flex items-center justify-center mb-6 md:mb-8 border-2 border-white group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-md">
       {icon && React.isValidElement(icon) ? React.cloneElement(icon, { size: 24, strokeWidth: 2.5 }) : null}
    </div>
    <h4 className="text-xl md:text-2xl font-black tracking-tighter mb-4 uppercase text-black">{title}</h4>
    <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed font-manrope">
      {desc}
    </p>
  </motion.div>
);

const Features = () => {
  return (
    <section id="features" className="py-24 md:py-48 px-4 md:px-6 lg:px-20 bg-[#F8FAFC] relative">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 md:mb-32 flex flex-col items-center">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-indigo-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mb-4 md:mb-6"
          >
            Core Infrastructure
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="text-3xl md:text-8xl font-black tracking-tighter text-center leading-[0.9] uppercase text-black"
          >
             Built for how <br />
             <span className="text-3d italic font-light text-gray-300">students actually</span> work.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} index={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
