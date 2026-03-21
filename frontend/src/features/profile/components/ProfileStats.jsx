import React from "react";
import { Link as LinkIcon, Github, Linkedin } from "lucide-react";

export const Stat = ({ label, value }) => (
  <div className="text-center md:text-left">
    <div className="text-xl font-black tracking-tighter leading-none">{value}</div>
    <div className="text-[11px] font-black tracking-widest text-gray-500 mt-1">{label}</div>
  </div>
);

export const SocialLink = ({ icon, href }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-10 h-10 flex items-center justify-center bg-white border border-black/5 rounded-xl text-gray-400 hover:bg-black hover:text-white transition-all shadow-sm"
  >
    {React.cloneElement(icon, { size: 16 })}
  </a>
);

const ProfileStats = ({ profile, onConnectionsClick }) => (
  <div className="mt-8 flex items-center gap-6 md:gap-8 border-y border-black/5 py-6 overflow-x-auto no-scrollbar px-1">
    <Stat label="post" value={profile.post_count} />
    <div 
      onClick={onConnectionsClick}
      className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-xl transition-colors"
    >
      <Stat label="connections" value={profile.connection_count || 0} />
    </div>
    
    <div className="flex items-center gap-2 ml-auto">
      {profile.website_url && <SocialLink icon={<LinkIcon />} href={profile.website_url} />}
      {profile.github_url && <SocialLink icon={<Github />} href={profile.github_url} />}
      {profile.linkedin_url && <SocialLink icon={<Linkedin />} href={profile.linkedin_url} />}
    </div>
  </div>
);

export default ProfileStats;
