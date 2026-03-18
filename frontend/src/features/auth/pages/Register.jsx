import React, { useState } from "react";
import AuthForm, { AuthInput, AuthButton } from "../components/AuthForm";

const Register = () => {
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
        title="Create Account"
        subtitle="Join thousands of students and educators building the future."
        footerText="Already have an account?"
        footerLink="/login"
        footerLinkText="Sign In"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-2 gap-4">
          <AuthInput label="First Name" placeholder="Jane" required />
          <AuthInput label="Last Name" placeholder="Doe" required />
        </div>
        <AuthInput label="Email Address" type="email" placeholder="jane@campus.edu" required />
        <AuthInput label="Select Campus" placeholder="Type university name..." required />
        <AuthInput label="Password" type="password" placeholder="••••••••" required />
        
        <p className="text-[9px] text-gray-400 text-center leading-relaxed px-4">
          By clicking sign up, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>

        <AuthButton loading={loading}>Sign Up Now</AuthButton>
      </AuthForm>
    </div>
  );
};

export default Register;
