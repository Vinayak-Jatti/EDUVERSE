import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Users, FolderOpen, MessageSquare, Award } from 'lucide-react';

const FloatingClayCard = ({ icon, title, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8, y: 30 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -10, rotateZ: 2 }}
    className="clay-card p-4 md:p-8 flex flex-col items-center justify-center gap-3 md:gap-4 text-center group cursor-pointer"
  >
     <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-50 border-4 border-white rounded-[1rem] md:rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
        {icon && React.isValidElement(icon) ? React.cloneElement(icon, { size: 18, strokeWidth: 2.5 }) : null}
     </div>
     <div>
       <h4 className="font-black text-[8px] md:text-[10px] uppercase tracking-widest text-black">{title}</h4>
       <div className="w-6 h-1 bg-indigo-600/20 mx-auto mt-1 md:mt-2 rounded-full" />
     </div>
  </motion.div>
);

const Hero = () => {
  // Motion Presets
  const containerVariants = {
     hidden: { opacity: 0 },
     visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 } 
     }
  };

  const itemVariants = {
     hidden: { opacity: 0, y: 40 },
     visible: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } 
     }
  };

  return (
    <section className="min-h-screen pt-40 md:pt-32 pb-24 md:pb-40 px-4 md:px-6 lg:px-20 bg-[#F8FAFC] relative overflow-hidden flex items-center">
      
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 -left-20 w-[20rem] md:w-[40rem] h-[20rem] md:h-[40rem] bg-indigo-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-[20rem] md:w-[40rem] h-[20rem] md:h-[40rem] bg-emerald-500/5 blur-[120px] rounded-full" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center"
      >
        
        {/* TOP/LEFT COLUMN: TACTILE CONTENT & UNIVERSAL NARRATIVE */}
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-8 md:gap-10">
           <div className="flex flex-col">
              <motion.div 
                 variants={itemVariants}
                 className="flex items-center gap-3 text-emerald-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mb-4 md:mb-6 font-manrope"
              >
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Where Minds Meet. Ideas Amplified.
              </motion.div>
              <motion.h1 
                variants={itemVariants}
                className="text-4xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter uppercase text-black leading-[0.85] mb-4"
              >
                Your World, <br />
                <span className="text-3d italic font-light text-indigo-600">Connected.</span>
              </motion.h1>
           </div>
           
           <motion.div 
              variants={itemVariants}
              className="clay-card p-6 md:p-12 max-w-2xl border-l-[6px] md:border-l-8 border-black shadow-xl"
           >
              <p className="text-lg md:text-2xl font-medium leading-relaxed text-gray-500 font-manrope">
                 The unified platform for student communication. Study groups, class discussions, and student life — all in one distraction-free space.
              </p>
              
              <div className="mt-8 md:mt-10 flex flex-wrap gap-4 md:gap-6">
                 <Link to="/register" 
                    className="skeuo-node w-full md:w-auto px-10 md:px-14 py-5 md:py-6 font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 border-none"
                    style={{ background: '#000000', color: '#FFFFFF', boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)' }}
                 >
                   Get Started For Free <Sparkles size={16} />
                 </Link>
              </div>
           </motion.div>
        </div>

        {/* BOTTOM/RIGHT COLUMN: CLAY INTERACTIVE FRAGMENTS */}
        <div className="col-span-1 lg:col-span-5 grid grid-cols-2 gap-4 md:gap-8">
           <div className="flex flex-col gap-4 md:gap-8 translate-y-8 md:translate-y-12">
              <FloatingClayCard icon={<Users />} title="Squads" delay={0.6} />
              <FloatingClayCard icon={<FolderOpen />} title="Resources" delay={0.8} />
           </div>
           <div className="flex flex-col gap-4 md:gap-8">
              <FloatingClayCard icon={<MessageSquare />} title="Channels" delay={0.7} />
              <FloatingClayCard icon={<Award />} title="Mastery" delay={0.9} />
              
              {/* Skeuomorphic Quick Hub Card */}
              <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 1.2, duration: 1 }}
                 className="skeuo-node p-4 md:p-6 flex flex-col items-center justify-center text-center mt-2 md:mt-4 bg-white shadow-xl"
              >
                 <div className="text-2xl md:text-3xl font-black text-indigo-600 tracking-tighter">HUB</div>
                 <div className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Sync</div>
              </motion.div>
           </div>
        </div>
      </motion.div>

    </section>
  );
};

export default Hero;
