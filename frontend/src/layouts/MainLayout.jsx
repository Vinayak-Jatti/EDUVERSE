import { Outlet } from "react-router-dom";
import Noise from "../components/common/Noise.jsx";
import Navbar from "../components/layout/Navbar.jsx";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-indigo-500/30">
      <Noise />
      <Navbar />
      <main className="relative z-10">
        <Outlet /> 
      </main>
      
      <footer className="py-20 px-6 lg:px-20 border-t border-black/5 opacity-40 text-[10px] font-bold uppercase tracking-[0.4em] text-center">
        © 2024 EDUVERSE. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
