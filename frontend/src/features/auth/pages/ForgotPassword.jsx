import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import apiClient from "../../../services/apiClient.js";
import ErrorMessage from "../../../components/shared/ErrorMessage.jsx";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      await apiClient.post("/auth/forgot-password", { email });
      // Regardless of whether email exists, we navigate to the next step
      // to avoid email enumeration. The user will check their inbox.
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] text-[#000000] font-sans min-h-screen py-20 px-4 md:px-0 selection:bg-indigo-100 flex items-center justify-center relative overflow-hidden">
      <Link to="/" className="fixed top-8 left-8 p-4 bg-white border border-black/5 rounded-full hover:bg-black hover:text-white transition-all z-50">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-white border border-black/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-black/5">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-black/5">
              <Mail className="w-8 h-8 text-black" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none text-black">
              Forgot Password
            </h2>
            <p className="text-gray-400 font-medium text-xs md:text-sm">
              Enter your email address and we'll send you a 6-digit code to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorMessage message={error} />}

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                Email Address
              </label>
              <input 
                type="email"
                placeholder="YOUR EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-black/5 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-black transition-colors placeholder:text-gray-200" 
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-5 bg-black text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Send Reset Code"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-black/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
              Remember your password?{" "}
              <Link to="/login" className="text-black hover:text-indigo-600 transition-colors">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
