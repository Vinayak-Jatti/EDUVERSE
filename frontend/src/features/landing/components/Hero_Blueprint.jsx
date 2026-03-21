import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Target, BookOpen } from 'lucide-react';

const Hero = () => {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [colorIdx, setColorIdx] = useState(0);

  const colors = ['#E0115F', '#007FFF', '#50C878', '#000000'];

  // Global Dynamic Mask for the entire grid system
  const mask = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(circle 300px at ${x}px ${y}px, black 0%, transparent 100%)`
  );

  useEffect(() => {
    const colorTimer = setInterval(() => {
        setColorIdx((prev) => (prev + 1) % colors.length);
    }, 2000);
    return () => clearInterval(colorTimer);
  }, []);

  const handleMouseMove = (e) => {
    if(!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    mouseX.set(-1000);
    mouseY.set(-1000);
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen pt-32 pb-40 px-4 md:px-6 lg:px-20 relative overflow-hidden bg-white text-black flex items-center"
      style={{ '--dynamic-color': colors[colorIdx] }}
    >
      {/* ─── GRID ILLUMINATION OVERLAY ─── */}
      <motion.div 
        className="absolute inset-0 z-0 bg-transparent pointer-events-none"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
         <div className="absolute inset-0 bg-grid-base opacity-40" />
         <div className="absolute inset-0 bg-grid-spotlight opacity-100" />
      </motion.div>

      {/* ─── BLUEPRINT LAYOUT ─── */}
      <div className="max-w-[1400px] w-full mx-auto z-10 relative h-full grid grid-cols-12 gap-y-12 lg:gap-0">
        
        {/* TOP-LEFT: CORE IDENTIFIER */}
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-start">
           <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] mb-12 w-fit rounded-sm shadow-2xl"
           >
              <Zap size={14} className="fill-yellow-400 text-yellow-400" />
              <span>Eduverse 2026.Protocol</span>
           </motion.div>

           <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl sm:text-8xl md:text-[8rem] xl:text-[10rem] font-black leading-[0.8] tracking-[-0.04em] uppercase"
           >
              Digital <br />
              <span className="text-transparent border-black" style={{ WebkitTextStroke: '1px black' }}>Mastery</span>
           </motion.h1>
        </div>

        {/* TOP-RIGHT: FUNCTIONAL OVERVIEW */}
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-end lg:items-end lg:text-right pb-4">
           <div className="max-w-md bg-white/90 backdrop-blur-xl p-8 border-l-4 border-black border-y border-r border-black/5 rounded-tr-[3rem] shadow-xl">
              <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
              >
                 <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-4 flex items-center lg:justify-end gap-2">
                    <Target size={14} /> SYSTEM_ACCESS_POINT
                 </div>
                 <p className="text-lg md:text-xl font-medium leading-relaxed text-gray-700">
                    The first unified Student OS designed for high-performance virtual learning, campus networking, and professional asset management.
                 </p>
              </motion.div>
           </div>
        </div>

        {/* BOTTOM-LEFT: ENGAGEMENT */}
        <div className="col-span-12 lg:col-span-12 mt-20 md:mt-40 flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="flex flex-col gap-8 w-full md:w-auto">
               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-6"
               >
                  <Link 
                    to="/register" 
                    className="group px-14 py-6 bg-black text-white rounded-sm font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gray-800 transition-all flex items-center justify-center gap-4 hover:scale-105"
                  >
                    Initialize Access
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <button className="px-14 py-6 border-b-4 border-black bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gray-50 transition-all active:scale-95 text-center">
                    Explore Schematic
                  </button>
               </motion.div>
            </div>

            {/* BOTTOM-RIGHT: METRIC BLOCKS */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 w-full md:w-auto">
               <BlueprintStat label="Latency" val="12ms" />
               <BlueprintStat label="Throughput" val="850MB" />
               <BlueprintStat label="Nodes" val="45+" />
            </div>
        </div>
      </div>

      {/* Decorative Frame Elements */}
      <div className="absolute top-10 left-10 hidden xl:block border-l-2 border-t-2 border-black w-20 h-20 opacity-10" />
      <div className="absolute bottom-10 right-10 hidden xl:block border-r-2 border-b-2 border-black w-20 h-20 opacity-10" />
    </section>
  );
};

const BlueprintStat = ({ label, val }) => (
  <div className="relative pl-6 border-l-2 border-black/5 group cursor-help">
    <div className="absolute left-0 top-0 w-1 h-3 bg-black transition-all group-hover:h-full" />
    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">{label}</div>
    <div className="text-2xl md:text-3xl font-black italic tracking-tighter transition-colors group-hover:text-indigo-600">{val}</div>
  </div>
);

export default Hero;
