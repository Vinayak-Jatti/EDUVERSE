import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import AppSidebar from "../components/layout/AppSidebar.jsx";
import { Bell, MessageSquare, Plus, Search, Users, Menu, X, LogOut, GraduationCap, Home, User, BookOpen, Settings } from "lucide-react";
import Noise from "../components/common/Noise.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import CreatePostModal from "../features/feed/components/CreatePostModal.jsx";

const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGlobalCreateOpen, setIsGlobalCreateOpen] = useState(false);
  const [globalCreationMode, setGlobalCreationMode] = useState("post");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Noise />
      
      {/* --- APP NAVBAR --- */}
      <nav className="fixed top-0 left-0 w-full h-20 md:h-24 bg-white/80 backdrop-blur-xl border-b border-black/5 flex items-center justify-center p-3 md:p-6 lg:px-12 z-[50]">
        <div className="w-full max-w-[1600px] flex items-center justify-between mx-auto">
          {/* LOGO */}
          <Link to="/feed" className="flex items-center gap-3 text-lg md:text-xl font-black tracking-tighter text-black group shrink-0">
            <div className="skeuo-node w-10 h-10 bg-white flex items-center justify-center border-2 border-white transition-all duration-500 shadow-md">
              <GraduationCap size={20} strokeWidth={2.5} />
            </div>
            <span className="hidden sm:inline uppercase">EDUVERSE</span>
          </Link>

          {/* SEARCH (Hidden on mobile) */}
          <div className="max-w-md w-full mx-4 lg:mx-10 hidden md:block">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH..." 
                className="w-full bg-gray-50 border border-black/5 rounded-full py-2.5 pl-11 pr-6 text-[9px] font-black uppercase tracking-widest focus:outline-none focus:border-black transition-all"
              />
            </form>
          </div>

          {/* NAV ACTIONS */}
          <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <div className="hidden xs:flex items-center gap-1.5 md:gap-2">
                <NavIcon icon={Bell} />
              </div>
              
              {/* MESSAGES BUTTON */}
              <Link to="/chats" className="hidden sm:flex items-center gap-2 bg-white border border-black/5 text-black px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-gray-50 shadow-sm active:scale-95 transition-all relative">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden lg:block">Inbox</span>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white animate-bounce" />
              </Link>

              {/* CREATE BUTTON */}
              <button 
                 onClick={() => { setGlobalCreationMode('post'); setIsGlobalCreateOpen(true); }}
                 className="hidden sm:flex items-center gap-2 bg-black text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-gray-800 shadow-lg shadow-black/10 active:scale-95 transition-all"
               >
                <Plus className="w-4 h-4" />
                <span className="hidden lg:block">Create</span>
              </button>
              
              <Link to={`/profile/${user?.username}`} className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gray-100 border border-black/5 overflow-hidden cursor-pointer hover:border-black transition-colors shrink-0 block">
                 <img 
                   src={user?.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${user?.username || 'Felix'}`} 
                   alt={user?.display_name || "User"} 
                   className="w-full h-full object-cover"
                 />
              </Link>

              {/* LOGOUT BUTTON */}
              <button 
                onClick={logout}
                className="hidden sm:flex p-2.5 rounded-lg md:rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-rose-500"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {/* MOBILE MENU TOGGLE */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg md:rounded-xl hover:bg-gray-100 transition-colors text-black"
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
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
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-4 mb-4">Search</h3>
                <form onSubmit={handleSearch} className="relative px-4">
                  <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Profiles or Feed..." 
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl py-4 pl-12 pr-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-black transition-all"
                  />
                </form>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-4 mb-4">Navigation</h3>
                <MobileLink to="/feed" onClick={() => setIsMobileMenuOpen(false)} icon={Home}>Home Feed</MobileLink>
                {user && (
                  <MobileLink to={`/profile/${user.username}`} onClick={() => setIsMobileMenuOpen(false)} icon={User}>My Profile</MobileLink>
                )}
                <MobileLink to="/chats" onClick={() => setIsMobileMenuOpen(false)} icon={MessageSquare}>Messages</MobileLink>
                <MobileLink to="/connections" onClick={() => setIsMobileMenuOpen(false)} icon={Users}>My Network</MobileLink>
                <MobileLink to="/resources" onClick={() => setIsMobileMenuOpen(false)} icon={BookOpen}>Resources</MobileLink>
                <MobileLink to="/squads" onClick={() => setIsMobileMenuOpen(false)} icon={Users}>Study Groups</MobileLink>
                <MobileLink to="/settings" onClick={() => setIsMobileMenuOpen(false)} icon={Settings}>Settings</MobileLink>
              </div>
              <div className="space-y-4 pt-8 border-t border-black/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-4 mb-4">Quick Actions</h3>
                <button 
                   onClick={() => { setIsMobileMenuOpen(false); setGlobalCreationMode('post'); setIsGlobalCreateOpen(true); }}
                   className="w-full flex items-center justify-between p-4 bg-indigo-50 rounded-2xl text-indigo-600 font-black uppercase tracking-widest text-[10px]"
                >
                  <span>Create New Post</span>
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-4 pt-8 border-t border-black/5 mt-10">
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-between p-4 bg-rose-50 rounded-2xl text-rose-600 font-black uppercase tracking-widest text-[10px]"
                >
                  <span>Sign Out</span>
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SIDEBAR (DESKTOP) --- */}
      <AppSidebar />

      {/* --- MAIN CONTENT --- */}
      <main className="lg:ml-64 pt-24 pb-20 px-4 md:px-6 lg:px-10 max-w-[1600px] mx-auto min-h-screen">
        <div className="w-full h-full">
            <Outlet />
        </div>
      </main>

      {/* FAB FOR MOBILE */}
      {!isMobileMenuOpen && (
        <button 
           onClick={() => { setGlobalCreationMode('post'); setIsGlobalCreateOpen(true); }}
           className="lg:hidden fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center z-[100] active:scale-90 transition-transform"
        >
            <Plus className="w-8 h-8" />
        </button>
      )}

      {/* Global Post Creation Modal */}
      <CreatePostModal 
         isOpen={isGlobalCreateOpen} 
         creationMode={globalCreationMode}
         onClose={() => setIsGlobalCreateOpen(false)} 
         onPostCreated={(newPost) => {
            // Dispatch a generic DOM event so FeedPage or anyone can react natively
            window.dispatchEvent(new CustomEvent('eduverse:postCreated', { detail: { newPost } }));
         }} 
      />
    </div>
  );
};

const NavIcon = ({ icon: Icon }) => (
  <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-black">
    <Icon className="w-5 h-5" />
  </button>
);

const MobileLink = ({ to, children, onClick, icon: Icon }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="flex items-center gap-4 p-4 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-50 rounded-2xl transition-all"
  >
    {Icon && <Icon className="w-5 h-5" />}
    <span>{children}</span>
  </Link>
);

export default AppLayout;
