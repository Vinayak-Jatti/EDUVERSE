import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";
import { InlineAlert } from "../../../components/shared";

const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your email";

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== "" && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) return;

    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/auth/verify-otp", {
        email,
        otp: otpCode,
      });

      setSuccess(true);
      localStorage.setItem("accessToken", response.data.data.accessToken);

      setTimeout(() => {
        navigate("/feed");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      await apiClient.post("/auth/resend-otp", { email });
      toast.info("A new OTP has been sent to " + email);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-sm border border-slate-100"
      >
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 p-2 hover:bg-slate-50 rounded-full transition-colors inline-flex items-center text-slate-400 hover:text-slate-900"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2 uppercase italic">
          Verify <span className="text-indigo-600">Identity</span>
        </h1>
        <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">
          We've sent a 6-digit code to <span className="text-slate-900 font-bold">{email}</span>. 
          Enter it below to unlock your account.
        </p>

        <div className="flex justify-between gap-2 mb-8">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              ref={(el) => (inputs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-16 text-center text-2xl font-black rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
            />
          ))}
        </div>

        {error && (
          <div className="mb-6">
            <InlineAlert message={error} />
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={loading || otp.join("").length < 6 || success}
          className={`w-full py-5 rounded-2xl font-black uppercase tracking-[2px] text-xs transition-all flex items-center justify-center gap-2 ${
            success 
            ? "bg-green-500 text-white" 
            : "bg-slate-900 text-white hover:bg-black active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          {loading ? (
            <RefreshCw className="animate-spin" size={18} />
          ) : success ? (
            <>
              <CheckCircle2 size={18} /> Verified
            </>
          ) : (
            "Complete Verification"
          )}
        </button>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Didn't receive a code?{" "}
            <button 
              onClick={handleResend}
              className="text-indigo-600 hover:underline cursor-pointer"
            >
              Resend OTP
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
