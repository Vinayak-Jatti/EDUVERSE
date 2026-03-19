import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft } from "lucide-react";
import apiClient from "../../../services/apiClient.js";
import ErrorMessage from "../../../components/shared/ErrorMessage.jsx";
import { AuthInput } from "../components/AuthForm.jsx";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Read email passed from ForgotPassword
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !otp || !newPassword) {
      setError("Please fill in all fields.");
      return;
    }
    
    if (otp.length !== 6) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await apiClient.post("/auth/reset-password", { email, otp, newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] text-[#000000] font-sans min-h-screen py-20 px-4 md:px-0 selection:bg-indigo-100 flex items-center justify-center relative overflow-hidden">
      <Link to="/forgot-password" className="fixed top-8 left-8 p-4 bg-white border border-black/5 rounded-full hover:bg-black hover:text-white transition-all z-50">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-white border border-black/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-black/5 relative overflow-hidden">
          
          {success ? (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
               className="text-center py-10"
             >
                <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-black/5">
                  <span className="text-3xl">🎉</span>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-black">
                  Password Reset!
                </h2>
                <p className="text-gray-500 max-w-sm mx-auto mb-8">
                  Your password has been successfully updated. Redirecting you to login...
                </p>
                <Link to="/login" className="w-full py-5 bg-black text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center">
                  Go to Login
                </Link>
             </motion.div>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-black/5">
                  <Lock className="w-8 h-8 text-black" strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none text-black">
                  Set New Password
                </h2>
                <p className="text-gray-400 font-medium text-xs md:text-sm">
                  We've sent a 6-digit code to your email. Enter it below along with your new password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <ErrorMessage message={error} />}

                <div className="space-y-4">
                  <AuthInput 
                    type="email"
                    placeholder="YOUR EMAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <AuthInput 
                    type="text"
                    placeholder="6-DIGIT OTP"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={{ textAlign: 'center', letterSpacing: '0.5em' }}
                  />
                  <AuthInput 
                    type="password"
                    placeholder="NEW PASSWORD"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <AuthInput 
                    type="password"
                    placeholder="CONFIRM NEW PASSWORD"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className={`w-full py-5 bg-black text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Reset Password"}
                </button>
              </form>
            </>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
