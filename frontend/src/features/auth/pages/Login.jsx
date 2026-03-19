import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/auth/login", formData);
      
      // Success: store token and navigate to feed
      localStorage.setItem("accessToken", response.data.data.accessToken);
      navigate("/feed");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      const errorCode = err.response?.data?.errorCode;

      // Handle unverified email redirection
      if (errorCode === "EMAIL_NOT_VERIFIED") {
        navigate("/verify-otp", { state: { email: formData.email } });
        return;
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
          <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider text-center">
            {error}
          </p>
        )}

        <div className="flex justify-end pr-1">
          <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
            Forgot Password?
          </Link>
        </div>

        <AuthButton loading={loading}>Sign In</AuthButton>
      </AuthForm>
    </div>
  );
};

export default Login;
