import React from "react";

const ProfileBio = ({ profile }) => {
  if (!profile.bio && (!profile.interests || profile.interests.length === 0)) {
    return null;
  }

  return (
    <div className="mt-8 max-w-2xl px-1 space-y-6">
      {profile.bio && (
        <p className="text-[14px] md:text-base text-gray-600 font-medium leading-relaxed">
          {profile.bio}
        </p>
      )}
      
      {profile.interests && profile.interests.length > 0 && (
        <div className="pt-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-black mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map(interest => (
              <span 
                key={interest.id} 
                className="px-4 py-2 bg-gray-50 border border-black/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 hover:bg-black hover:text-white transition-all cursor-default"
              >
                #{interest.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileBio;
