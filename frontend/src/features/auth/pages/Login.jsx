import React, { useState } from "react";
import AuthForm, { AuthInput, AuthButton } from "../components/AuthForm";

const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Logic will be added in Step 3/4
    setTimeout(() => setLoading(false), 2000);
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
        <AuthInput label="Email Address" type="email" placeholder="name@campus.edu" required />
        <AuthInput label="Password" type="password" placeholder="••••••••" required />
        
        <div className="flex justify-end pr-1">
          <button type="button" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
            Forgot Password?
          </button>
        </div>

        <AuthButton loading={loading}>Sign In</AuthButton>
      </AuthForm>
    </div>
  );
};

export default Login;
