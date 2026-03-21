import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, ExternalLink, Cpu, Code } from 'lucide-react';

const About = () => {
  // Premium Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2, 
        delayChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section id="about" className="py-24 md:py-48 px-4 md:px-6 lg:px-20 bg-white relative overflow-hidden">
      
      {/* Background Soft Depth */}
      <div className="absolute top-1/2 -left-20 w-[20rem] md:w-[40rem] h-[20rem] md:h-[40rem] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center"
      >
        
        {/* TOP/LEFT SIDE: TEXTUAL INFORMATION */}
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-8 md:gap-10">
           <div className="flex flex-col">
              <motion.span 
                 variants={itemVariants}
                 className="text-indigo-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mb-4 md:mb-6 block"
              >
                The Architecture of Growth
              </motion.span>
              <motion.h2 
                 variants={itemVariants}
                 className="text-3xl md:text-7xl font-black tracking-tighter uppercase text-black leading-[0.9] mb-6 md:mb-8"
              >
                 Unified by Vision. <br />
                 <span className="text-3d italic font-light text-gray-300">Driven by</span> Impact.
              </motion.h2>
           </div>

           <motion.div 
              variants={itemVariants}
              className="clay-card p-6 md:p-14 border-l-[6px] md:border-l-8 border-black shadow-xl"
           >
              <div className="space-y-6 md:space-y-8">
                 <p className="text-lg md:text-2xl font-medium leading-relaxed text-gray-500 font-manrope">
                    EDUVERSE was born from a singular challenge: the academic world is fragmented. Communication is scattered across a dozen silos, and the student's academic legacy is lost in the noise.
                 </p>
                 <p className="text-base md:text-xl font-medium leading-relaxed text-gray-400 font-manrope">
                    We've engineered a **Universal Student Engine** that harmonizes study circles, resource sharing, and professional growth into one high-performance, distraction-free sync. Our mission is to amplify every student mind through clinical technology.
                 </p>
                 
                 <div className="grid grid-cols-2 gap-4 md:gap-8 pt-6 md:pt-8 border-t border-black/5">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2 md:gap-3 text-black font-black uppercase tracking-widest text-[8px] md:text-[10px]">
                          <Cpu size={12} className="text-indigo-600 md:w-[14px]" /> Neural Sync
                       </div>
                       <div className="text-gray-400 text-[8px] md:text-[10px] uppercase tracking-widest font-bold">Encrypted Nodes</div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2 md:gap-3 text-black font-black uppercase tracking-widest text-[8px] md:text-[10px]">
                          <Code size={12} className="text-indigo-600 md:w-[14px]" /> Modular Base
                       </div>
                       <div className="text-gray-400 text-[8px] md:text-[10px] uppercase tracking-widest font-bold">Universal Core</div>
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>

        {/* BOTTOM/RIGHT SIDE: FOUNDER CARD */}
        <div className="col-span-1 lg:col-span-5 flex justify-center">
           <motion.div 
              variants={cardVariants}
              className="relative group w-full max-w-sm"
           >
              {/* IMAGE CLAY CARD */}
              <div className="clay-card p-4 md:p-6 border-[8px] md:border-[12px] border-white shadow-2xl relative overflow-hidden aspect-[4/5] flex items-center justify-center bg-gray-50">
                 <div className="w-full h-full bg-gradient-to-br from-black to-white rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center relative overflow-hidden cursor-pointer">
                    <img 
                      src="https://media.licdn.com/dms/image/v2/D5603AQEU5t5i0YmD7g/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1725516723235?e=1747872000&v=beta&t=M8-9G6E6uQxI3H1S6U-yP6I3U2U-YyP6I3U2U-YyP6I" 
                      alt="Vinayak Jatti" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                    />
                    
                    {/* SKEUOMORPHIC HOVER/TAP OVERLAY */}
                    <motion.div 
                       initial={{ opacity: 0 }}
                       whileHover={{ opacity: 1 }}
                       whileTap={{ opacity: 1 }}
                       className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 md:p-10 text-center transition-all duration-500"
                    >
                       <div className="skeuo-node w-12 h-12 md:w-16 md:h-16 bg-white flex items-center justify-center mb-4 md:mb-6 shadow-xl border-2 border-white">
                          <Cpu className="text-indigo-600" size={24} />
                       </div>
                       <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white mb-2">Vinayak Jatti</h3>
                       <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-indigo-400 mb-4 md:mb-6">Founder & Developer</p>
                       <p className="text-xs md:text-sm text-gray-400 font-medium leading-relaxed font-manrope mb-6 md:mb-8">
                          "Engineering the high-fidelity future of academic synchronization."
                       </p>
                       
                       <a 
                          href="https://linkedin.com/in/vinayakjatti" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="skeuo-node px-6 py-3 md:px-8 md:py-4 bg-white text-black flex items-center gap-2 md:gap-3 hover:scale-105 active:scale-95 transition-all group/btn shadow-xl border-none"
                       >
                          <Linkedin size={14} fill="currentColor" />
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Connect</span>
                          <ExternalLink size={10} className="opacity-0 lg:group-hover/btn:opacity-100 transition-opacity" />
                       </a>
                    </motion.div>
                 </div>
              </div>
           </motion.div>
        </div>

      </motion.div>
    </section>
  );
};

export default About;
