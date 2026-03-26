import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Search, Loader2, Database } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../supabase';

const DealsManagement = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/deals`);
      setDeals(res.data);
    } catch (err) {
      console.error('Failed to fetch deals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const probColor = (p) =>
    (p * 100) >= 75 ? 'text-green-400 bg-green-400/10 border-green-400/20'
    : (p * 100) >= 40 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    : 'text-red-400 bg-red-400/10 border-red-400/20';

  const sentColor = (s) =>
    s === 'Positive' ? 'text-green-400' : s === 'Neutral' ? 'text-yellow-400' : 'text-red-400';

  const filteredDeals = deals.filter((d) =>
    (d.deal_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deal from the database?')) return;
    try {
      alert('Delete restricted to system administrators.');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 size={40} className="text-primary animate-spin" />
      <p className="text-gray-400 font-medium">Synchronizing with Supabase pipeline...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-white">Deals CRM Pipeline</h1>
          <p className="text-gray-400 font-medium text-sm md:text-base">Managing {deals.length} live records from your cloud database</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-9 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary outline-none w-full sm:w-56 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-[0_0_10px_rgba(34,211,238,0.1)] transition-all duration-300 text-sm">
            <Plus size={16} /> New Deal
          </button>
        </div>
      </header>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block glass-panel overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/80 text-gray-400 border-b border-white/5 uppercase text-xs font-bold tracking-wider">
                <th className="p-5">Client / Deal Name</th>
                <th className="p-5">Deal Value</th>
                <th className="p-5">Stage</th>
                <th className="p-5">AI Win Prob.</th>
                <th className="p-5">Sentiment</th>
                <th className="p-5">Category</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-medium text-gray-200">
              {filteredDeals.map((deal, idx) => (
                <tr key={deal.id || idx} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-primary shadow-[0_0_10px_rgba(34,211,238,0.1)] shrink-0 uppercase">
                      {(deal.deal_name || 'D').charAt(0)}
                    </div>
                    {deal.deal_name || 'Unnamed'}
                  </td>
                  <td className="p-5 font-bold tracking-wide text-cyan-50">${(deal.deal_value || 0).toLocaleString()}</td>
                  <td className="p-5">
                    <span className="px-3 py-1 bg-zinc-900 border border-white/10 rounded-full text-xs text-gray-300">{deal.stage || 'Lead'}</span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-zinc-800 rounded-full h-2 overflow-hidden border border-white/5">
                        <div
                          className={`h-full rounded-full ${ (deal.success_probability * 100) >= 75 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : (deal.success_probability * 100) >= 40 ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}
                          style={{ width: `${(deal.success_probability || 0) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${ (deal.success_probability * 100) >= 75 ? 'text-green-400' : (deal.success_probability * 100) >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {((deal.success_probability || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`flex items-center gap-1.5 font-bold ${sentColor(deal.sentiment || 'Neutral')}`}>
                      <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_5px_currentColor]" />{deal.sentiment || 'Neutral'}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded border ${probColor(deal.success_probability)} uppercase tracking-wider`}>
                      {deal.lead_category || 'COLD'}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors inline-block opacity-0 group-hover:opacity-100">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(deal.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors inline-block opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDeals.length === 0 && (
                <tr>
                   <td colSpan="7" className="p-12 text-center text-gray-500 italic">
                      No deals found in database. Start by predicting a new deal outcome.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-4">
        {filteredDeals.map((deal, idx) => (
          <div key={deal.id || idx} className="glass-panel p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-primary shadow-[0_0_10px_rgba(34,211,238,0.2)] shrink-0 uppercase">
                  {(deal.deal_name || 'D').charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white text-base leading-tight">{deal.deal_name || 'Unnamed'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{deal.stage || 'Lead'}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-zinc-900/50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Value</p>
                <p className="font-bold text-white">${(deal.deal_value || 0).toLocaleString()}</p>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Sentiment</p>
                <p className={`font-bold ${sentColor(deal.sentiment || 'Neutral')}`}>{deal.sentiment || 'Neutral'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealsManagement;
