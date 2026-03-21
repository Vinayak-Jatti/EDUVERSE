import React from 'react';
import { Github, Linkedin, Twitter, Instagram } from 'lucide-react';

const Footer = () => (
  <footer className="py-12 md:py-16 px-4 md:px-6 lg:px-20 bg-white text-black overflow-hidden relative">
    {/* Premium Symmetric Separator */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-black/40" />
    
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
       {/* Copyright & Branding */}
       <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity duration-500">
          <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">© 2026 EDUVERSE</span>
       </div>
       
       {/* Social Links */}
       <div className="flex items-center gap-8 md:gap-10">
          <SocialLink href="https://github.com/Vinayak-Jatti" icon={<Github size={20} />} />
          <SocialLink href="https://linkedin.com/in/vinayakjatti" icon={<Linkedin size={20} />} />
          <SocialLink href="https://twitter.com" icon={<Twitter size={20} />} />
          <SocialLink href="https://instagram.com" icon={<Instagram size={20} />} />
       </div>
    </div>
  </footer>
);

const SocialLink = ({ href, icon }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-black/30 hover:text-black transition-all hover:scale-110 active:scale-95 duration-300"
  >
    {icon}
  </a>
);

export default Footer;
