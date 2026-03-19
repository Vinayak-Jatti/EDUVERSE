import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import AppSidebar from "../components/layout/AppSidebar.jsx";
import { Bell, MessageSquare, Plus, Search, Users, Menu, X, LogOut } from "lucide-react";
import Noise from "../components/common/Noise.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Noise />
      
      {/* --- APP NAVBAR --- */}
      <nav className="fixed top-0 left-0 w-full h-24 bg-white/80 backdrop-blur-xl border-b border-black/5 flex items-center justify-center p-4 md:p-6 lg:px-12 z-[50]">
        <div className="w-full max-w-[1600px] flex items-center justify-between mx-auto">
          {/* LOGO */}
          <Link to="/feed" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl">
              <div className="w-5 h-5 bg-white rounded-sm" />
            </div>
            <span className="text-xl font-black uppercase tracking-tighter hidden xs:block sm:block">EduVerse</span>
          </Link>

          {/* SEARCH (Hidden on mobile) */}
          <div className="max-w-md w-full mx-6 lg:mx-10 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
              <input 
                type="text" 
                placeholder="SEARCH..." 
                className="w-full bg-gray-50 border border-black/5 rounded-full py-3 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-black transition-all"
              />
            </div>
          </div>

          {/* NAV ACTIONS */}
          <div className="flex items-center gap-2 md:gap-4 lg:gap-8">
            <div className="flex items-center gap-4 lg:gap-8 mr-2 md:mr-4 hidden md:flex border-r border-black/5 pr-4 md:pr-8">
               <Link to="/explore" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 shrink-0">Explore</Link>
               <Link to="/learning" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors shrink-0">My Learning</Link>
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-2">
                <NavIcon icon={Bell} />
                <NavIcon icon={MessageSquare} />
              </div>
              
              <button className="hidden lg:flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </button>
              
              <button 
                onClick={logout}
                title="Logout"
                className="hidden sm:flex items-center justify-center p-2.5 text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-xl transition-colors border border-red-100/50 shrink-0"
              >
                <LogOut className="w-5 h-5" />
              </button>
              
              <Link to={`/profile/${user?.username}`} className="w-10 h-10 rounded-xl bg-gray-100 border border-black/5 overflow-hidden cursor-pointer hover:border-black transition-colors shrink-0 block">
                 <img 
                   src={user?.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${user?.username || 'Felix'}`} 
                   alt={user?.display_name || "User"} 
                   className="w-full h-full object-cover"
                 />
              </Link>

              {/* MOBILE MENU TOGGLE */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-black"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-[45] lg:hidden bg-white pt-24"
          >
            <div className="p-6 overflow-y-auto h-full">
              <div className="space-y-4 mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-4 mb-4">Navigation</h3>
                <MobileLink to="/feed" onClick={() => setIsMobileMenuOpen(false)}>Home Feed</MobileLink>
                <MobileLink to="/explore" onClick={() => setIsMobileMenuOpen(false)}>Explore</MobileLink>
                <MobileLink to="/learning" onClick={() => setIsMobileMenuOpen(false)}>My Learning</MobileLink>
                <MobileLink to="/groups" onClick={() => setIsMobileMenuOpen(false)}>Study Groups</MobileLink>
              </div>
              <div className="space-y-4 pt-8 border-t border-black/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-4 mb-4">Quick Actions</h3>
                <button className="w-full flex items-center justify-between p-4 bg-indigo-50 rounded-2xl text-indigo-600 font-black uppercase tracking-widest text-[10px]">
                  <span>Create New Post</span>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SIDEBAR (DESKTOP) --- */}
      <AppSidebar />

      {/* --- MAIN CONTENT --- */}
      <main className="lg:ml-64 pt-32 pb-20 px-4 md:px-6 lg:px-12 max-w-[1600px] mx-auto min-h-screen">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            <div className="xl:col-span-8">
                <Outlet />
            </div>
            
            {/* RIGHT SIDEBAR GUTS (Trending/Squads) */}
            <div className="hidden xl:block xl:col-span-4 sticky top-32 h-[calc(100vh-160px)] space-y-8">
                <Widget title="What's Hot">
                   <TrendingItem tag="QuantumComputing" students="12.4k" />
                   <TrendingItem tag="FigmaWorkshop" students="8.2k" />
                   <TrendingItem tag="Web3Ethics" students="5.1k" />
                </Widget>
                
                <Widget title="Squad Goals">
                   <SquadItem name="Code Masters" members="42k" id="code" />
                   <SquadItem name="Creative Lab" members="18k" id="design" />
                   <SquadItem name="BioHacking" members="9k" id="bio" />
                   <Link to="/squads" className="block text-center mt-6 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">Explore All Squads</Link>
                </Widget>
            </div>
        </div>
      </main>

      {/* FAB FOR MOBILE */}
      <button className="lg:hidden fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center z-[100] active:scale-90 transition-transform">
          <Plus className="w-8 h-8" />
      </button>
    </div>
  );
};

const NavIcon = ({ icon: Icon }) => (
  <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-black">
    <Icon className="w-5 h-5" />
  </button>
);

const MobileLink = ({ to, children, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="block p-4 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-50 rounded-2xl transition-all"
  >
    {children}
  </Link>
);

const Widget = ({ title, children }) => (
    <div className="bg-white border border-black/5 rounded-[2.5rem] p-8">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">{title}</h3>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const TrendingItem = ({ tag, students }) => (
    <div className="group cursor-pointer">
        <h4 className="text-sm font-black text-indigo-600 mb-1 group-hover:translate-x-1 transition-transform">#{tag}</h4>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{students} STUDENTS STUDYING</p>
    </div>
);

const SquadItem = ({ name, members, id }) => (
    <div className="flex items-center justify-between group cursor-pointer">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-black/5 group-hover:bg-black group-hover:text-white transition-all">
                <Users className="w-4 h-4" />
            </div>
            <div>
                <h4 className="text-xs font-black uppercase">{name}</h4>
                <p className="text-[9px] font-black text-gray-400 tracking-widest">{members} MEMBERS</p>
            </div>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-100 group-hover:bg-indigo-500 transition-colors" />
    </div>
);

export default AppLayout;
