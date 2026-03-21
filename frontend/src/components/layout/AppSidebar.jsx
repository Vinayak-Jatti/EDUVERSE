import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Users, Trophy, Settings, User, MessageSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const SidebarItem = ({ icon: Icon, label, href, active }) => (
  <Link
    to={href}
    className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 group ${
      active 
        ? "text-indigo-600 border-r-4 border-indigo-600 bg-indigo-50/50" 
        : "text-gray-400 hover:text-black hover:bg-gray-50"
    }`}
  >
    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? "fill-indigo-50" : ""}`} />
    <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
  </Link>
);

const AppSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-24 w-64 h-full bg-white border-r border-black/5 z-40 hidden lg:block">
      <div className="flex flex-col h-full py-8 text-black font-sans">
        <SidebarItem 
          icon={Home} 
          label="Home Feed" 
          href="/feed" 
          active={location.pathname === "/feed"} 
        />
        {user && (
          <SidebarItem 
            icon={User} 
            label="My Profile" 
            href={`/profile/${user.username}`} 
            active={location.pathname === `/profile/${user.username}`} 
          />
        )}
        <SidebarItem 
          icon={MessageSquare} 
          label="Messages" 
          href="/chats" 
          active={location.pathname === "/chats"} 
        />
        <SidebarItem 
          icon={Users} 
          label="My Network" 
          href="/connections" 
          active={location.pathname === "/connections"} 
        />
        <SidebarItem 
          icon={BookOpen} 
          label="Resources" 
          href="/resources" 
        />
        <SidebarItem 
          icon={Users} 
          label="Study Groups" 
          href="/squads" 
          active={location.pathname === "/squads"} 
        />

        
        <div className="mt-auto pb-32">
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            href="/settings" 
          />
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
