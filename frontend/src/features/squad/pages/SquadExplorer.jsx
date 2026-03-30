import React, { useState, useEffect } from "react";
import apiClient from "../../../services/apiClient";
import SquadCard from "../components/SquadCard";
import CreateSquadModal from "../components/CreateSquadModal";
import ErrorMessage from "../../../components/shared/ErrorMessage";
import { Plus, Search, Filter, Compass, LayoutGrid, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SquadExplorer = () => {
  const [squads, setSquads] = useState([]);
  const [mySquads, setMySquads] = useState([]);
  const [view, setView] = useState('EXPLORE'); // EXPLORE or MY_SQUADS
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [publicRes, myRes] = await Promise.all([
        apiClient.get("/squads/public"),
        apiClient.get("/squads/my")
      ]);
      setSquads(publicRes.data.data);
      setMySquads(myRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load squads");
    } finally {
      setLoading(false);
    }
  };

  const onSquadCreated = (newSquad) => {
    setMySquads([newSquad, ...mySquads]);
    setSquads([newSquad, ...squads]);
    setView('MY_SQUADS');
  };

  const filteredSquads = squads.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const myFilteredSquads = mySquads.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-10">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2 font-black uppercase tracking-widest text-[10px]">
            <Compass size={14} />
            Enterprise Hub
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 leading-none">
            Academy <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Squads</span>
          </h1>
          <div className="mt-4 px-3 py-1 bg-amber-100 text-amber-700 font-black uppercase tracking-widest text-[10px] rounded border border-amber-200 inline-block">
            🚧 UNDER DEVELOPMENT
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Tab Switcher */}
           <div className="flex bg-gray-100 p-2 rounded-[2rem]">
              <TabBtn active={view === 'EXPLORE'} onClick={() => setView('EXPLORE')} label="EXPLORE" icon={<LayoutGrid size={16}/>} />
              <TabBtn active={view === 'MY_SQUADS'} onClick={() => setView('MY_SQUADS')} label="MY SQUADS" icon={<Users size={16}/>} />
           </div>

           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-3 px-8 py-5 bg-black text-white rounded-[2.2rem] font-black uppercase text-[11px] tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-2xl shadow-black/10"
           >
             <Plus size={18} />
             Create
           </button>
        </div>
      </div>

      <div className="relative">
        {/* UNDER DEVELOPMENT OVERLAY */}
        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md rounded-[3rem] border border-black/5 flex flex-col items-center justify-center pointer-events-auto">
           <div className="p-8 bg-white border border-black/10 shadow-2xl rounded-[2.5rem] flex flex-col items-center max-w-sm text-center">
             <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Compass size={32} />
             </div>
             <h2 className="text-xl font-black uppercase tracking-tighter mb-2">Phase 3 Deployment</h2>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Study Groups and Enterprise Squads are currently being configured for Phase 3. Core infrastructure is locked.</p>
           </div>
        </div>

      {/* Search & Filter Bar */}
      <div className="relative z-0">
      <div className="bg-white border border-black/5 rounded-[3rem] p-4 mb-12 flex items-center gap-4 shadow-xl shadow-black/5">
        <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-gray-50 rounded-2xl focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5 transition-all">
          <Search className="text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder={`SEARCH ${view === 'EXPLORE' ? 'ENTERPRISE SQUADS' : 'MY SQUADS'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-[11px] font-black uppercase tracking-widest placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Grid Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => <SquadSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (view === 'EXPLORE' ? filteredSquads : myFilteredSquads).length === 0 ? (
        <div className="py-24 text-center bg-white border border-black/5 rounded-[3rem]">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">No Squads Found</h3>
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mt-2 px-8">Try clearing your filters or create a new one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {(view === 'EXPLORE' ? filteredSquads : myFilteredSquads).map(squad => (
            <SquadCard key={squad.id} squad={squad} />
          ))}
        </div>
      )}
      </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateSquadModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSquadCreated={onSquadCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const TabBtn = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all ${
      active ? 'bg-white shadow-xl shadow-black/5 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    {icon}
    {label}
  </button>
);

const SquadSkeleton = () => (
  <div className="bg-white border border-black/5 rounded-[2.5rem] p-6 animate-pulse">
    <div className="w-16 h-16 bg-gray-100 rounded-[1.5rem] mb-6" />
    <div className="space-y-3">
      <div className="w-1/2 h-4 bg-gray-100 rounded-full" />
      <div className="w-1/3 h-2 bg-gray-100 rounded-full" />
      <div className="w-full h-8 bg-gray-50 rounded-2xl mt-4" />
    </div>
    <div className="mt-8 pt-6 border-t border-black/5 flex justify-between">
       <div className="w-20 h-4 bg-gray-100 rounded-full" />
       <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
    </div>
  </div>
);

export default SquadExplorer;
