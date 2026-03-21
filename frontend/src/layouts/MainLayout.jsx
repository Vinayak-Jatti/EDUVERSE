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
    </div>
  );
};

export default MainLayout;
