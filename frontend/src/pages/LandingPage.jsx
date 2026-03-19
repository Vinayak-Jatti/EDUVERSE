import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Zap, Calendar, Globe, Shield, Sparkles } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-[#FFFFFF] text-[#000000] font-sans selection:bg-indigo-100 overflow-x-hidden">
      
      {/* 🚀 HERO SECTION */}
      <section className="pt-32 md:pt-48 pb-20 md:pb-32 px-4 md:px-6 lg:px-20 text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto z-10 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full border border-black/5 bg-gray-50 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-8 md:mb-12 shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            Empowering the next generation
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 md:mb-8 leading-[0.95] md:leading-[0.9] uppercase"
          >
            Digital <span className="italic font-light text-gray-400">Mastery</span> for <br className="hidden sm:block" /> Modern Students.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base md:text-xl lg:text-2xl text-gray-500 max-w-2xl mx-auto mb-10 md:mb-16 leading-relaxed font-medium"
          >
            The unified platform for social learning, class discussions, and campus life — 
            all in one professional, distraction-free environment.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
          >
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-black text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] shadow-2xl hover:bg-gray-800 transition-all hover:scale-105 active:scale-95"
            >
              Get Started Now
            </Link>
            <button className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 border border-black/10 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] hover:bg-gray-50 transition-all active:scale-95">
              Watch Process
            </button>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mt-24 md:mt-40 pt-12 md:pt-16 border-t border-black/5 max-w-4xl mx-auto"
          >
            <HeroStat label="Active Users" val="50K+" />
            <HeroStat label="Universities" val="120+" />
            <HeroStat label="Resources" val="200K+" />
            <HeroStat label="NPS Score" val="9.8/10" />
          </motion.div>
        </div>
      </section>

      {/* 🧩 FEATURES SECTION */}
      <section id="features" className="py-20 md:py-32 px-4 md:px-6 lg:px-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:mb-24 flex flex-col items-center">
            <span className="text-indigo-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-4">Core Capabilities</span>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-center leading-[1] md:leading-[0.95] uppercase">
              Built with <span className="italic font-light text-gray-400">Precision</span>. <br />
              Delivered with Care.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            <FeatureCard title="Study Circles" desc="Create focused study groups for any course. Share notes and schedule sessions." icon={<Users />} />
            <FeatureCard title="Smart Threads" desc="Conversations that stay organized. Tag topics and pin important local messages." icon={<Zap />} />
            <FeatureCard title="Campus Events" desc="Never miss what's happening. From club meetings to career fairs." icon={<Calendar />} />
            <FeatureCard title="Cross-Campus" desc="Connect with students across universities. Join communities that span networks." icon={<Globe />} />
            <FeatureCard title="Focus Mode" desc="Built-in tools to minimize distractions. Set study timers and mute notifications." icon={<Shield />} />
            <FeatureCard title="Progress Hub" desc="Visualize your academic journey. Track study hours and celebrate milestones." icon={<ArrowRight />} />
          </div>
        </div>
      </section>

      {/* 🖼️ SHOWCASE SECTION */}
      <section id="about" className="py-20 md:py-32 px-4 md:px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 md:mb-20 gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <span className="text-indigo-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Showcase</span>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[1] md:leading-[0.9] uppercase">
                Digital <span className="italic font-light text-gray-400">Masterpieces</span>.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 h-auto md:h-[600px]">
            <div className="h-[300px] md:h-full bg-gray-100 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 relative group cursor-pointer border border-black/5">
               <div className="absolute inset-x-8 bottom-8 text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <h4 className="text-2xl font-black italic tracking-tighter">Campus Connect v2.0</h4>
               </div>
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="w-full h-full flex items-center justify-center text-2xl md:text-4xl font-black text-black/10 text-center px-4">UI PREVIEW</div>
            </div>
            <div className="grid grid-rows-2 gap-6 md:gap-8 h-[400px] md:h-full">
               <div className="bg-gray-100 rounded-[2rem] md:rounded-[2.5rem] border border-black/5 grayscale transition-all hover:grayscale-0 flex items-center justify-center text-xl md:text-2xl font-black text-black/10">DASHBOARD</div>
               <div className="bg-black rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-xl md:text-2xl font-black text-white/20">DARK OPTION</div>
            </div>
          </div>
        </div>
      </section>

      {/* ✉️ APPLY SECTION */}
      <section id="contact" className="py-20 md:py-32 px-4 md:px-6 lg:px-20 bg-gray-50 border-y border-black/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 md:gap-20">
          <div className="flex-1 text-center md:text-left">
             <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase mb-6 md:mb-8 leading-none">
              Define your <br className="hidden sm:block" /> career with <br className="hidden sm:block" /> <span className="italic font-light text-indigo-600">Eduverse</span>.
             </h2>
             <p className="text-gray-500 font-medium text-base md:text-lg leading-relaxed mb-8 md:mb-10">
              Join thousands of students and educators building the most sophisticated learning network on the digital frontier.
             </p>
             <div className="flex justify-center md:justify-start gap-4">
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-black/10 flex items-center justify-center text-lg md:text-xl grayscale cursor-pointer hover:grayscale-0 transition-all">🍎</div>
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-black/10 flex items-center justify-center text-lg md:text-xl grayscale cursor-pointer hover:grayscale-0 transition-all">🤖</div>
             </div>
          </div>
          <div className="flex-1 bg-white border border-black/5 p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-xl">
             <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest mb-8 md:mb-10 text-center">Apply Now</h3>
             <form className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                   <Input placeholder="First Name" />
                   <Input placeholder="Last Name" />
                </div>
                <Input placeholder="Email Address" type="email" />
                <Input placeholder="Select Campus" />
                <button className="w-full py-4 md:py-5 bg-black text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-gray-800 transition-all">
                   Submit Application
                </button>
             </form>
          </div>
        </div>
      </section>

    </div>
  );
};

const HeroStat = ({ label, val }) => (
  <div className="text-center md:text-left group">
    <div className="text-2xl md:text-3xl font-black tracking-tighter mb-1 transition-transform group-hover:-translate-y-1">{val}</div>
    <div className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-[0.3em]">{label}</div>
  </div>
);

const FeatureCard = ({ title, desc, icon }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="p-8 md:p-12 bg-white border border-black/5 rounded-[2rem] md:rounded-[2.5rem] hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 group"
  >
    <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-8 md:mb-10 border border-black/5 group-hover:bg-black group-hover:text-white transition-colors duration-500">
      {React.cloneElement(icon, { size: 20, strokeWidth: 2.5 })}
    </div>
    <h4 className="text-xl md:text-2xl font-black tracking-tighter mb-4 uppercase">{title}</h4>
    <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed">{desc}</p>
  </motion.div>
);

const Input = (props) => (
  <input 
    {...props} 
    className="w-full p-4 bg-gray-50 border border-black/5 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-indigo-600 transition-colors" 
  />
);

export default LandingPage;
