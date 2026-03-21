import React, { useEffect } from 'react';
import Hero from '../features/landing/components/Hero';
import About from '../features/landing/components/About';
import Features from '../features/landing/components/Features';
import Apply from '../features/landing/components/Apply';
import Footer from '../features/landing/components/Footer';

const LandingPage = () => {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white text-black font-sans selection:bg-indigo-500/10 overflow-x-hidden min-h-screen relative">
      {/* Grid system is now localized within the components, not global */}
      
      {/* Main Content Node */}
      <div className="relative z-10 w-full">
        <Hero />
        <About />
        <Features />
        <Apply />
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
