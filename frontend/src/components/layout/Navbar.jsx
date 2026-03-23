import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Menu, X, Users, MessageSquare, Award, FolderOpen } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "About", href: "/#about", icon: <Users size={18} /> },
    { name: "Features", href: "/#features", icon: <Award size={18} /> },
    { name: "Join Us", href: "/#apply", icon: <MessageSquare size={18} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 py-6 md:px-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LOGO NODE */}
        <Link 
          to="/" 
          aria-label="EduVerse Home"
          className="flex items-center gap-3 text-2xl font-black tracking-tighter text-black group"
        >
           <div className="skeuo-node w-10 h-10 bg-white flex items-center justify-center border-2 border-white group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-md">
              <GraduationCap size={20} strokeWidth={2.5} />
           </div>
           <span className="hidden sm:inline">EDUVERSE</span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-10">
           {navLinks.map((link, idx) => (
             <a key={idx} href={link.href} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-black transition-colors">
               {link.name}
             </a>
           ))}
           <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-black transition-colors">
             Sign In
           </Link>
           <Link to="/register" 
              className="skeuo-node px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg border-none"
              style={{ background: '#000000', color: '#FFFFFF', boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)' }}
           >
             Join the Network
           </Link>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button 
           onClick={() => setIsOpen(!isOpen)}
           aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
           className="md:hidden skeuo-node w-12 h-12 flex items-center justify-center bg-white shadow-md border-none active:scale-90 transition-all z-[60]"
        >
           {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* MOBILE OVERLAY */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="fixed inset-x-0 top-0 pt-28 pb-12 px-6 bg-white shadow-2xl z-50 border-b-8 border-indigo-600 rounded-b-[3rem]"
            >
              <div className="flex flex-col gap-6">
                 {navLinks.map((link, idx) => (
                   <a 
                     key={idx} 
                     href={link.href} 
                     onClick={() => setIsOpen(false)}
                     className="clay-card p-6 flex items-center justify-between group shadow-none"
                   >
                      <div className="flex items-center gap-4">
                         <div className="skeuo-node w-10 h-10 flex items-center justify-center bg-gray-50 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                           {link.icon}
                         </div>
                         <h4 className="text-[10px] font-black uppercase tracking-[0.4em]">{link.name}</h4>
                      </div>
                      <Award size={14} className="text-indigo-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                   </a>
                 ))}
                 
                 <div className="grid grid-cols-2 gap-4 mt-6">
                    <Link to="/login" 
                       onClick={() => setIsOpen(false)}
                       className="skeuo-node p-5 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-black/50 hover:text-black shadow-sm"
                    >
                       Sign In
                    </Link>
                    <Link to="/register" 
                       onClick={() => setIsOpen(false)}
                       className="skeuo-node p-5 flex items-center justify-center text-[10px] font-black uppercase tracking-widest bg-black text-white shadow-xl"
                       style={{ background: '#000000', boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)' }}
                    >
                       Join Us
                    </Link>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
