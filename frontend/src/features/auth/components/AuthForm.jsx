import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Eye, EyeOff, Sparkles } from "lucide-react";

const AuthForm = ({ title, subtitle, footerText, footerLink, footerLinkText, children, onSubmit, showSocials = true }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="clay-card p-6 md:p-14 border-[8px] md:border-[12px] border-white shadow-2xl relative overflow-hidden">
        {/* Top Accent Node */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 md:w-24 h-1.5 md:h-2 bg-indigo-600 rounded-b-2xl shadow-lg shadow-indigo-600/20" />

        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-3 md:mb-4 leading-none text-black">
            {title}
          </h2>
          <p className="text-gray-400 font-bold text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em]">
            {subtitle}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 md:space-y-8">
          {children}
        </form>

        {showSocials && (
          <div className="mt-10 md:mt-12 space-y-6 md:space-y-8">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 border-t border-black/5" />
              <span className="relative bg-white px-4 md:px-6 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-300">
                Network Connect
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <SocialButton 
                onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/github`}
                icon={<Github className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              >
                GitHub
              </SocialButton>
              <SocialButton 
                onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`}
                icon={<img src="https://www.google.com/favicon.ico" className="w-3.5 h-3.5 md:w-4 md:h-4 grayscale group-hover:grayscale-0 transition-all" alt="G" />}
              >
                Google
              </SocialButton>
            </div>
          </div>
        )}

        <div className="mt-10 md:mt-12 pt-8 md:pt-10 border-t border-black/5 text-center">
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-400">
            {footerText}{" "}
            <Link to={footerLink} className="text-indigo-600 hover:text-black transition-colors font-black">
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const SocialButton = ({ icon, children, onClick }) => (
  <button 
    type="button"
    onClick={onClick}
    className="skeuo-node group flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 transition-all duration-500 active:scale-95 text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] border-none shadow-xl text-white"
    style={{ background: '#000000', boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.2)' }}
  >
    <div className="opacity-70 group-hover:opacity-100 transition-opacity">
       {icon}
    </div>
    {children}
  </button>
);

export const AuthInput = ({ label, type = "text", ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-3 md:space-y-4 relative">
      {label && (
        <label className="block text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-black/30 ml-1.5 md:ml-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input 
          type={isPassword ? (showPassword ? "text" : "password") : type}
          {...props} 
          className="skeuo-node w-full p-4 md:p-5 bg-white border-2 border-transparent focus:border-indigo-600 transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest placeholder:text-gray-200 focus:outline-none shadow-inner" 
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

export const AuthButton = ({ children, loading, ...props }) => (
  <button 
    {...props}
    disabled={loading}
    className={`skeuo-node w-full py-5 md:py-6 text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:scale-[1.02] active:scale-[0.95] transition-all flex items-center justify-center gap-3 md:gap-4 border-none shadow-xl ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    style={{ background: '#000000', color: '#FFFFFF', boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)' }}
  >
    {loading ? (
      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/10 border-t-white rounded-full animate-spin" />
    ) : (
      <>
        {children} <Sparkles size={14} className="group-hover:rotate-45 transition-transform" />
      </>
    )}
  </button>
);

export default AuthForm;
