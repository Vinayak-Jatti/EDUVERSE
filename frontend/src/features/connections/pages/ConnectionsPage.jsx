import React, { useState, useEffect } from "react";
import { Users, UserPlus, Clock, Check, X, ShieldCheck, Mail, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { ConfirmModal } from "../../../components/shared";

const ConnectionsPage = () => {
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("network"); 
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [connRes, pendRes, suggRes] = await Promise.all([
        apiClient.get("/connections"),
        apiClient.get("/connections/pending"),
        apiClient.get("/connections/suggestions")
      ]);
      setConnections(connRes.data.data.connections || connRes.data.data);
      setPending(pendRes.data.data);
      setSuggestions(suggRes.data.data?.suggestions || []);
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

  const handleRequestAccess = async (userId) => {
    try {
      await apiClient.post(`/connections/request/${userId}`);
      toast.success("Handshake Initiated");
      fetchData(); // Refresh UI to update status
    } catch (err) {
      toast.error(err.response?.data?.message || "Protocol Error");
    }
  };

  const confirmRemove = async () => {
    if (!deleteTargetId) return;
    try {
      await apiClient.delete(`/connections/${deleteTargetId}`);
      toast.info("Connection Neutralized");
      fetchData();
    } catch (err) {
      toast.error("Protocol Error");
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2">My Intelligence Network</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">Securely manage your academic bonds and encrypted handshakes</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
          <TabBtn active={activeTab === "network"} onClick={() => setActiveTab("network")} count={connections.length}>Network</TabBtn>
          <TabBtn active={activeTab === "requests"} onClick={() => setActiveTab("requests")} count={pending.incoming.length}>Handshakes</TabBtn>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" className="flex justify-center p-20">
            <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
          </motion.div>
        ) : activeTab === "requests" ? (
          <motion.div key="requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 md:space-y-12">
            <div>
              <SectionHeader title="Incoming Protocols" icon={<UserPlus size={15} />} />
              {pending.incoming.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 px-4">
                  {pending.incoming.map(req => (
                    <ConnectionCard 
                      key={req.request_id} 
                      user={req} 
                      actions={
                        <div className="flex gap-2">
                           <button onClick={() => handleAccept(req.request_id)} className="p-3 md:p-4 bg-black text-white rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-black/10"><Check size={16} /></button>
                           <button onClick={() => setDeleteTargetId(req.requester_id)} className="p-3 md:p-4 bg-gray-100 text-gray-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95"><X size={16} /></button>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Mail size={28} />} title="Zero inbound requests" />
              )}
            </div>

            {pending.outgoing.length > 0 && (
              <div>
                <SectionHeader title="Pending Outbound Protocols" icon={<Clock size={15} />} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 px-4">
                  {pending.outgoing.map(req => (
                    <ConnectionCard 
                      key={req.request_id} 
                      user={req} 
                      actions={<span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">Wait-listed</span>}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="network" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="px-4">
            {connections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                 {connections.map(conn => (
                   <ConnectionCard 
                     key={conn.connection_id}
                     user={conn}
                     connectedSince={conn.connected_since}
                     actions={
                       <button onClick={() => setDeleteTargetId(conn.user_id)} className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-rose-500 transition-colors">Terminate</button>
                     }
                   />
                 ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 md:p-20 bg-white border border-black/5 rounded-[3rem] md:rounded-[4rem] shadow-sm mb-10">
                 <Users size={50} className="text-gray-100 mb-6" />
                 <h2 className="text-lg md:text-xl font-black uppercase tracking-tight mb-4">Registry is Empty</h2>
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px] text-center max-w-xs md:max-w-sm leading-relaxed mb-6">Start exploring the feeds to initiate professional academic handshakes and expand your intelligence pool.</p>
              </div>
            )}

            {/* Suggestions Block */}
            {connections.length === 0 && suggestions.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
                 <SectionHeader title="Suggested Peers" icon={<Search size={15} />} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                   {suggestions.map(sugg => (
                     <ConnectionCard 
                       key={sugg.user_id}
                       user={sugg}
                       actions={
                         <button onClick={() => handleRequestAccess(sugg.user_id)} className="p-3 md:p-4 bg-indigo-600 text-white rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg flex items-center gap-2">
                            <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Connect</span>
                            <UserPlus size={16} />
                         </button>
                       }
                     />
                   ))}
                 </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmRemove}
        title="Neutralize Bond?"
        message="Neutralizing this connection will terminate the academic handshake and shared intelligence sync permanently."
        confirmText="Confirm Removal"
      />
    </div>
  );
};

const ConnectionCard = ({ user, actions, connectedSince }) => (
  <div className="bg-white border border-black/5 p-5 md:p-7 rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-between hover:shadow-2xl hover:shadow-black/5 transition-all group">
    <div className="flex items-center gap-4 md:gap-5">
      <Link to={`/profile/${user.username}`} className="w-12 h-12 md:w-16 md:h-16 rounded-[1.3rem] md:rounded-[1.8rem] overflow-hidden border border-black/5 shrink-0 shadow-sm transition-transform group-hover:scale-105 duration-500">
        <img src={user.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${user.username}`} className="w-full h-full object-cover" alt="" />
      </Link>
      <div className="min-w-0">
        <Link to={`/profile/${user.username}`}>
          <h4 className="text-[13px] md:text-sm font-black uppercase tracking-tight text-gray-900 leading-none mb-1.5 hover:text-indigo-600 transition-colors truncate">{user.display_name}</h4>
        </Link>
        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none truncate">{user.headline || "Academic Researcher"}</p>
        {connectedSince && (
          <p className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter mt-2 opacity-50">Sync Active Since {new Date(connectedSince).toLocaleDateString()}</p>
        )}
      </div>
    </div>
    <div className="ml-4 shrink-0">{actions}</div>
  </div>
);

const TabBtn = ({ children, active, onClick, count }) => (
  <button onClick={onClick} className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${active ? 'bg-white text-black shadow-xl shadow-black/5' : 'text-gray-400 hover:text-black'}`}>
    {children}
    {count > 0 && <span className="bg-black text-white w-5 h-5 flex items-center justify-center rounded-full text-[8px] font-black">{count}</span>}
  </button>
);

const SectionHeader = ({ title, icon }) => (
  <div className="flex items-center gap-4 mb-8 px-6">
    <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-black border border-black/5">
      {icon}
    </div>
    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-900">{title}</h3>
    <div className="flex-1 h-px bg-black/5" />
  </div>
);

const EmptyState = ({ icon, title }) => (
  <div className="py-20 flex flex-col items-center gap-6 opacity-20 text-center">
    {icon}
    <p className="text-[11px] font-black uppercase tracking-[0.5em]">{title}</p>
  </div>
);

export default ConnectionsPage;
