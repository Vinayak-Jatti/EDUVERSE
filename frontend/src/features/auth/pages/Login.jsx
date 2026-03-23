import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import AuthForm, { AuthInput, AuthButton } from "../components/AuthForm";
import apiClient from "../../../services/apiClient";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/auth/login", formData);
      const { accessToken, user } = response.data.data;
      
      await login(accessToken);
      navigate("/feed");
    } catch (err) {
      // Layer 8 — Reliability: Specific Failover Messaging
      let errorMessage = "Login failed. Please try again.";
      
      if (!err.response) {
        errorMessage = "Server is currently unreachable. Please check your network connection.";
      } else {
        errorMessage = err.response.data?.message || errorMessage;
        const errorCode = err.response.data?.errorCode;

        // Handle unverified email redirection
        if (errorCode === "EMAIL_NOT_VERIFIED") {
          navigate("/verify-otp", { state: { email: formData.email } });
          return;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] pt-28 pb-12">
      <AuthForm
        title="Welcome back"
        subtitle="Sign in to your Eduverse account to continue your journey."
        footerText="Don't have an account?"
        footerLink="/register"
        footerLinkText="Create one"
        onSubmit={handleSubmit}
      >
        <AuthInput 
          label="Email Address" 
          name="email"
          type="email" 
          placeholder="name@campus.edu" 
          required 
          value={formData.email}
          onChange={handleChange}
        />
        <AuthInput 
          label="Password" 
          name="password"
          type="password" 
          placeholder="••••••••" 
          required 
          value={formData.password}
          onChange={handleChange}
        />
        
        {error && (
          <p 
            role="alert"
            className="text-[10px] text-red-500 font-bold uppercase tracking-wider text-center"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end pr-1">
          <Link 
            to="/forgot-password" 
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-black transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <AuthButton loading={loading}>Sign In</AuthButton>
      </AuthForm>
    </div>
  );
};

export default Login;
