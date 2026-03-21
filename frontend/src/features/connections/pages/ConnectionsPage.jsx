import React, { useState, useEffect } from "react";
import { Users, UserPlus, Clock, Check, X, ShieldCheck, Mail, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ConnectionsPage = () => {
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("network"); // network, requests

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [connRes, pendRes] = await Promise.all([
        apiClient.get("/connections"),
        apiClient.get("/connections/pending")
      ]);
      setConnections(connRes.data.data);
      setPending(pendRes.data.data);
    } catch (err) {
      toast.error("Network Sync Fault");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await apiClient.post(`/connections/accept/${requestId}`);
      toast.success("Bond Verified");
      fetchData();
    } catch (err) {
      toast.error("Handshake Fault");
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Neutralize this connection?")) return;
    try {
      await apiClient.delete(`/connections/${userId}`);
      toast.info("Connection Neutralized");
      fetchData();
    } catch (err) {
      toast.error("Protocol Error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header Hub */}
      <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2">My Professional Network</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">Manage your academic bonds and requests</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
          <TabBtn active={activeTab === "network"} onClick={() => setActiveTab("network")} count={connections.length}>Network</TabBtn>
          <TabBtn active={activeTab === "requests"} onClick={() => setActiveTab("requests")} count={pending.incoming.length}>Requests</TabBtn>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" className="flex justify-center p-20">
            <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
          </motion.div>
        ) : activeTab === "requests" ? (
          <motion.div key="requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 md:space-y-12">
            {/* Incoming */}
            <div>
              <SectionHeader title="Incoming Handshakes" icon={<UserPlus size={15} />} />
              {pending.incoming.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 px-2">
                  {pending.incoming.map(req => (
                    <ConnectionCard 
                      key={req.request_id} 
                      user={req} 
                      actions={
                        <div className="flex gap-2">
                           <button onClick={() => handleAccept(req.request_id)} className="p-2.5 md:p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all active:scale-95"><Check size={16} /></button>
                           <button onClick={() => handleRemove(req.requester_id)} className="p-2.5 md:p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200 transition-all active:scale-95"><X size={16} /></button>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Mail size={28} />} title="No pending invites" />
              )}
            </div>

            {/* Outgoing */}
            {pending.outgoing.length > 0 && (
              <div>
                <SectionHeader title="Sent Protocols" icon={<Clock size={15} />} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 px-2">
                  {pending.outgoing.map(req => (
                    <ConnectionCard 
                      key={req.request_id} 
                      user={req} 
                      actions={<span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-300">Sent</span>}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="network" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="px-2">
            {connections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                 {connections.map(conn => (
                   <ConnectionCard 
                     key={conn.connection_id}
                     user={conn}
                     connectedSince={conn.connected_since}
                     actions={
                       <button onClick={() => handleRemove(conn.user_id)} className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-300 hover:text-rose-500 transition-colors">Disconnect</button>
                     }
                   />
                 ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 md:p-20 bg-white border border-black/5 rounded-[2.5rem] md:rounded-[3rem]">
                 <Users size={50} className="text-gray-100 mb-6" />
                 <h2 className="text-lg md:text-xl font-black uppercase mb-3 md:mb-4">Your network is empty</h2>
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px] text-center max-w-xs md:max-w-sm leading-relaxed">Start exploring squads and profiles to initiate professional academic handshakes.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ConnectionCard = ({ user, actions, connectedSince }) => (
  <div className="bg-white border border-black/5 p-4 md:p-6 rounded-[2rem] md:rounded-[2.2rem] flex items-center justify-between hover:shadow-xl hover:shadow-black/5 transition-all">
    <div className="flex items-center gap-3 md:gap-4">
      <Link to={`/profile/${user.username}`} className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden border border-black/5 shrink-0">
        <img src={user.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${user.username}`} className="w-full h-full object-cover" alt="" />
      </Link>
      <div className="min-w-0">
        <Link to={`/profile/${user.username}`}>
          <h4 className="text-[12px] md:text-sm font-black uppercase tracking-tight hover:text-indigo-600 transition-colors truncate">{user.display_name}</h4>
        </Link>
        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed line-clamp-1">{user.headline || "Academic Researcher"}</p>
        {connectedSince && (
          <p className="text-[7px] md:text-[8px] font-black text-indigo-300 uppercase tracking-tighter mt-1">Bonded: {new Date(connectedSince).toLocaleDateString()}</p>
        )}
      </div>
    </div>
    <div className="ml-3 md:ml-4 shrink-0">{actions}</div>
  </div>
);

const TabBtn = ({ children, active, onClick, count }) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${active ? 'bg-white text-black shadow-lg shadow-black/5' : 'text-gray-400 hover:text-black'}`}>
    {children}
    {count > 0 && <span className="bg-black text-white px-2 py-0.5 rounded-full text-[8px]">{count}</span>}
  </button>
);

const SectionHeader = ({ title, icon }) => (
  <div className="flex items-center gap-3 mb-6 px-4">
    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-black border border-black/5">
      {icon}
    </div>
    <h3 className="text-xs font-black uppercase tracking-widest">{title}</h3>
    <div className="flex-1 h-px bg-gray-50" />
  </div>
);

const EmptyState = ({ icon, title }) => (
  <div className="py-12 flex flex-col items-center gap-4 opacity-30 text-center">
    {icon}
    <p className="text-[10px] font-black uppercase tracking-widest">{title}</p>
  </div>
);

export default ConnectionsPage;
