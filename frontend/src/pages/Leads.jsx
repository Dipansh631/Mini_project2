import React, { useState, useEffect } from 'react';
import { Filter, Star, Zap, Snowflake, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

const Leads = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Hot');
  const [leadsData, setLeadsData] = useState({ hot: [], warm: [], cold: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await axios.get(`${API_BASE}/leads`, {
          headers: { 'X-User-Email': user?.email || '' },
        });
        setLeadsData(res.data);
      } catch (err) {
        console.error('Failed to fetch lead data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (!user?.email) {
      setLeadsData({ hot: [], warm: [], cold: [] });
      setLoading(false);
      return;
    }
    fetchLeads();
  }, [user?.email]);

  const currentLeads = leadsData[activeTab.toLowerCase()] || [];

  const tabs = [
    { name: 'Hot', icon: Zap, count: leadsData.hot.length, color: 'text-red-500 bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]' },
    { name: 'Warm', icon: Star, count: leadsData.warm.length, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30 shadow-[0_0_15px_rgba(250,204,21,0.15)]' },
    { name: 'Cold', icon: Snowflake, count: leadsData.cold.length, color: 'text-primary bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(34,211,238,0.15)]' }
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 size={40} className="text-primary animate-spin" />
      <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Categorizing your pipeline leads...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold mb-3 text-white flex items-center gap-4">
            <Filter className="text-primary drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" size={32} /> Lead Prioritization
          </h1>
          <p className="text-gray-400 font-medium leading-relaxed max-w-xl">
            Real-time lead categorization fetched from your database, sorted by AI success probability and recent engagement sentiment.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 transform border shadow-sm ${
              activeTab === tab.name 
                ? `${tab.color} scale-105` 
                : 'bg-zinc-900/50 text-gray-500 border-white/5 hover:bg-zinc-900 hover:text-gray-300'
            }`}
          >
            <tab.icon size={20} className={activeTab === tab.name ? 'animate-pulse' : ''} />
            {tab.name} Leads
            <span className={`px-2 py-0.5 rounded-md text-xs font-black bg-black/40 border border-white/5 ${activeTab === tab.name ? 'text-white' : 'text-gray-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="grid grid-cols-1 gap-4">
        {currentLeads.map((lead, idx) => (
          <div key={lead.id || idx} className="glass-panel bg-black/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between group hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.05)] hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border
                ${activeTab === 'Hot' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                  activeTab === 'Warm' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                {(lead.client_name || "D").charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{lead.client_name || "Unnamed Deal"}</h3>
                <p className="text-gray-400 font-medium text-sm flex items-center gap-2">
                  <span className="text-primary font-bold tracking-wider uppercase text-[10px]">Value:</span> ${(lead.deal_value || 0).toLocaleString()} 
                  <span className="text-white/20 mx-1">|</span>
                  <span className="text-primary font-bold tracking-wider uppercase text-[10px]">Sentiment:</span> <span className="text-gray-300">{lead.sentiment || "Neutral"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-white/5 sm:border-0 pl-0 sm:pl-8">
              <div className="flex flex-col items-center flex-1 sm:flex-none">
                <span className="text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">AI Prob</span>
                <span className={`text-3xl font-black ${ (lead.success_probability * 100) >= 70 ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : (lead.success_probability * 100) >= 40 ? 'text-yellow-400' : 'text-primary'}`}>
                  {(lead.success_probability * 100).toFixed(0)}%
                </span>
              </div>
              
              <button className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95
                ${activeTab === 'Hot' ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white' : 
                  'bg-zinc-900 border border-white/5 text-gray-400 hover:text-white hover:border-white/20'}`}>
                Action Plan
              </button>
            </div>
          </div>
        ))}
        {currentLeads.length === 0 && (
          <div className="text-center p-12 glass-panel border border-dashed border-white/10 bg-black/20">
            <Filter size={32} className="mx-auto mb-3 text-white/10" />
            <p className="text-gray-500 font-medium text-sm uppercase tracking-widest">No {activeTab.toLowerCase()} leads currently prioritized in database.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;
