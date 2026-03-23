import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm, { AuthInput, AuthButton } from "../components/AuthForm";
import apiClient from "../../../services/apiClient";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    campus: "",
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
      await apiClient.post("/auth/register", formData);
      // Success: navigate to OTP verification
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] pt-28 pb-12">
      <AuthForm
        title="Create Account"
        subtitle="Join thousands of students and educators building the future."
        footerText="Already have an account?"
        footerLink="/login"
        footerLinkText="Sign In"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-2 gap-4">
          <AuthInput 
            label="First Name" 
            name="firstName"
            placeholder="Jane" 
            required 
            value={formData.firstName}
            onChange={handleChange}
          />
          <AuthInput 
            label="Last Name" 
            name="lastName"
            placeholder="Doe" 
            required 
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <AuthInput 
          label="Email Address" 
          name="email"
          type="email" 
          placeholder="jane@campus.edu" 
          required 
          value={formData.email}
          onChange={handleChange}
        />
        <AuthInput 
          label="Select Campus" 
          name="campus"
          placeholder="Type university name..." 
          required 
          value={formData.campus}
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

        <p className="text-[9px] text-slate-500 text-center leading-relaxed px-4">
          By clicking sign up, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>

        <AuthButton loading={loading}>Sign Up Now</AuthButton>
      </AuthForm>
    </div>
  );
};

export default Register;
