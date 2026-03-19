import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Globe, Eye, EyeOff } from "lucide-react";

const AuthForm = ({ title, subtitle, footerText, footerLink, footerLinkText, children, onSubmit, showSocials = true }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white border border-black/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-black/5">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">
            {title}
          </h2>
          <p className="text-gray-400 font-medium text-xs md:text-sm">
            {subtitle}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {children}
        </form>

        {showSocials && (
          <div className="mt-8 space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 border-t border-black/5" />
              <span className="relative bg-white px-4 text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">
                Or Continue With
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SocialButton 
                onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/github`}
                icon={<Github className="w-4 h-4" />}
              >
                GitHub
              </SocialButton>
              <SocialButton 
                onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`}
                icon={<img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" alt="G" />}
              >
                Google
              </SocialButton>
            </div>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-black/5 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
            {footerText}{" "}
            <Link to={footerLink} className="text-black hover:text-indigo-600 transition-colors">
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
    className="group flex items-center justify-center gap-2 py-4 border border-black/5 rounded-2xl bg-gray-50 hover:bg-black hover:text-white transition-all duration-300 active:scale-95 text-[10px] font-black uppercase tracking-widest"
  >
    {icon}
    {children}
  </button>
);

export const AuthInput = ({ label, type = "text", ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-2 relative">
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input 
          type={isPassword ? (showPassword ? "text" : "password") : type}
          {...props} 
          className="w-full p-4 bg-gray-50 border border-black/5 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-black transition-colors placeholder:text-gray-200" 
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
    className={`w-full py-5 bg-black text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
  >
    {loading ? (
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    ) : children}
  </button>
);

export default AuthForm;
