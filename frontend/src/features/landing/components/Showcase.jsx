import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, Zap, MessageCircle, ArrowUpRight } from 'lucide-react';

const ShowcaseSection = ({ icon, title, desc, index }) => {
  const isEven = index % 2 === 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 lg:gap-32 mb-40 lg:mb-64 last:mb-0`}
    >
      {/* CLAYMOBPHISM VISUAL FRAGMENT */}
      <div className="flex-1 w-full relative group">
        <div className="clay-card p-12 md:p-24 border-[16px] border-white/50 flex items-center justify-center relative overflow-hidden h-[350px] md:h-[550px] shadow-2xl">
           {/* Background glow node */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-500/5 blur-[150px] rounded-full group-hover:bg-indigo-500/10 transition-colors" />
           
           <div className="skeuo-node relative w-24 h-24 md:w-40 md:h-40 bg-white border-4 border-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-[8deg] transition-all duration-700">
              {React.cloneElement(icon, { size: 56, strokeWidth: 2.5, className: "text-black group-hover:text-indigo-600 transition-colors" })}
           </div>

           {/* Tactile Identity Tag */}
           <div className="absolute bottom-10 left-10 text-[10px] font-black uppercase tracking-[0.6em] text-gray-300 select-none">
              PROTOCOL // {title.toUpperCase().replace(" ", "_")}
           </div>
        </div>
      </div>

      {/* CONTENT FRAGMENT */}
      <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start group">
         <div className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.6em] mb-8 flex items-center gap-4">
            <div className="w-12 h-1 bg-indigo-600/20 rounded-full" /> 0{index + 1}
         </div>
         <h3 className="text-4xl md:text-7xl font-black tracking-tighter mb-10 uppercase text-black leading-[0.9] transition-all">
            {title}
         </h3>
         <p className="text-lg md:text-2xl text-gray-400 font-medium leading-relaxed mb-12 max-w-xl font-manrope group-hover:text-gray-600 transition-colors">
            {desc}
         </p>
         <button className="skeuo-node px-12 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
            Learn More <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
         </button>
      </div>
    </motion.div>
  );
};

const Showcase = () => {
  const products = [
    {
      icon: <Globe />,
      title: "Academic Networking",
      desc: "Connect with thousands of students across institutions. Share live insights, collaborate on academic projects, and build your universal profile."
    },
    {
      icon: <Shield />,
      title: "Verified Identity",
      desc: "Industry-standard encryption for your student data. Built for high-stake academic security and institutional trust."
    },
    {
      icon: <Zap />,
      title: "Real-Time Study Hub",
      desc: "Synchronize your study materials, notes, and squad communications instantly across all devices. Never lose a pulse."
    },
    {
      icon: <MessageCircle />,
      title: "Study Channels",
      desc: "Structured communication designed for how students actually talk. From squad circles to institutional announcements."
    }
  ];

  return (
    <section className="py-24 md:py-48 px-4 md:px-6 lg:px-20 bg-[#F8FAFC] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION HEADER */}
        <div className="mb-32 lg:mb-56 flex flex-col items-center text-center">
          <motion.span 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.6em] mb-10 block"
          >
            Engineering Excellence
          </motion.span>
          <motion.h2 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-4xl md:text-9xl font-black tracking-tighter leading-[0.8] uppercase text-black"
          >
             The Modern <br />
             <span className="italic font-light text-gray-300 italic">Student Platform</span>.
          </motion.h2>
        </div>

        {/* SHOWCASE SECTIONS */}
        <div className="flex flex-col">
          {products.map((product, idx) => (
            <ShowcaseSection key={idx} index={idx} {...product} />
          ))}
        </div>

      </div>

      {/* Background Decorative Physicality */}
      <div className="absolute top-[10%] -left-64 w-[50rem] h-[50rem] bg-indigo-500/5 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] -right-64 w-[50rem] h-[50rem] bg-emerald-500/5 blur-[180px] rounded-full pointer-events-none" />
    </section>
  );
};

export default Showcase;
