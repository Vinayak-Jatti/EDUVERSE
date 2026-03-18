import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="fixed top-0 left-0 w-full z-[100] p-4 lg:p-8 flex items-center justify-center pointer-events-none"
      >
        <div className="w-full max-w-7xl flex items-center justify-between mx-auto pointer-events-auto bg-white/50 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none p-4 md:p-0 rounded-3xl md:rounded-none border border-black/5 md:border-none">
          {/* LOGO */}
          <Link to="/" className="text-xl lg:text-2xl font-black tracking-tighter flex items-center gap-2 text-black">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-black rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 lg:w-5 lg:h-5 bg-white rounded-sm" />
            </div>
            <span>EDUVERSE</span>
          </Link>
          
          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-10 bg-white/50 backdrop-blur-xl px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-black/5 shadow-sm">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.href} className="hover:text-indigo-600 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* DESKTOP CTA */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity text-black">
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-8 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-gray-800 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>

          {/* MOBILE HAMBURGER TOGGLE */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 text-black transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-20 left-4 right-4 z-[90] md:hidden bg-white border border-black/5 rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.label} 
                  to={link.href} 
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 hover:text-black transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-6 border-t border-black/5 flex flex-col gap-4">
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-black uppercase tracking-[0.2em] text-black"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 bg-black text-white rounded-full text-center text-[10px] font-black uppercase tracking-[0.2em] shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
