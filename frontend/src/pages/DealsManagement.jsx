import React, { useState } from 'react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';

const DealsManagement = () => {
  const [deals, setDeals] = useState([
    { id: 1, client: 'Acme Corp',    value: 250000,  stage: 'Negotiation', probability: 85, sentiment: 'Positive', status: 'Active'  },
    { id: 2, client: 'Globex Inc',   value: 120000,  stage: 'Proposal',    probability: 45, sentiment: 'Negative', status: 'At Risk' },
    { id: 3, client: 'Initech',      value: 850000,  stage: 'Qualified',   probability: 60, sentiment: 'Neutral',  status: 'Active'  },
    { id: 4, client: 'Umbrella Corp',value: 45000,   stage: 'Lead',        probability: 20, sentiment: 'Neutral',  status: 'Stalled' },
    { id: 5, client: 'Stark Ind.',   value: 1200000, stage: 'Negotiation', probability: 95, sentiment: 'Positive', status: 'Closing' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const probColor = (p) =>
    p >= 75 ? 'text-green-400 bg-green-400/10 border-green-400/20'
    : p >= 40 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    : 'text-red-400 bg-red-400/10 border-red-400/20';

  const sentColor = (s) =>
    s === 'Positive' ? 'text-green-400' : s === 'Neutral' ? 'text-yellow-400' : 'text-red-400';

  const filteredDeals = deals.filter((d) =>
    d.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => setDeals((prev) => prev.filter((d) => d.id !== id));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-white">Deals CRM Pipeline</h1>
          <p className="text-gray-400 font-medium text-sm md:text-base">Manage and track your AI-scored sales opportunities</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-9 pr-4 py-2.5 bg-surface/50 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary outline-none w-full sm:w-56 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-lg shadow-primary/20 transition-all duration-300 text-sm">
            <Plus size={16} /> New Deal
          </button>
        </div>
      </header>

      {/* ── Desktop Table (hidden on mobile) ─────────────────────────────── */}
      <div className="hidden md:block glass-panel overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/80 text-gray-400 border-b border-white/5 uppercase text-xs font-bold tracking-wider">
                <th className="p-5">Client Name</th>
                <th className="p-5">Deal Value</th>
                <th className="p-5">Stage</th>
                <th className="p-5">AI Probability</th>
                <th className="p-5">Sentiment</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-medium text-gray-200">
              {filteredDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shrink-0">
                      {deal.client.charAt(0)}
                    </div>
                    {deal.client}
                  </td>
                  <td className="p-5 font-bold tracking-wide">${deal.value.toLocaleString()}</td>
                  <td className="p-5">
                    <span className="px-3 py-1 bg-surface border border-white/10 rounded-full text-xs text-gray-300">{deal.stage}</span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-surface rounded-full h-2 overflow-hidden border border-white/5">
                        <div
                          className={`h-full rounded-full ${deal.probability >= 75 ? 'bg-green-500' : deal.probability >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${deal.probability}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${deal.probability >= 75 ? 'text-green-400' : deal.probability >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {deal.probability}%
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`flex items-center gap-1.5 font-bold ${sentColor(deal.sentiment)}`}>
                      <span className="w-2 h-2 rounded-full bg-current" />{deal.sentiment}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded border ${probColor(deal.probability)} uppercase tracking-wider`}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors inline-block opacity-0 group-hover:opacity-100">
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
                  <td colSpan="7" className="p-8 text-center text-gray-500">No deals found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile Cards (hidden on md+) ──────────────────────────────────── */}
      <div className="md:hidden space-y-4">
        {filteredDeals.map((deal) => (
          <div key={deal.id} className="glass-panel p-5 border border-white/5">
            {/* Top row – avatar + name + actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shrink-0">
                  {deal.client.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white text-base leading-tight">{deal.client}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{deal.stage}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(deal.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-surface/50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Deal Value</p>
                <p className="font-bold text-white">${deal.value.toLocaleString()}</p>
              </div>
              <div className="bg-surface/50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Sentiment</p>
                <p className={`font-bold ${sentColor(deal.sentiment)}`}>{deal.sentiment}</p>
              </div>
              <div className="bg-surface/50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">AI Probability</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-surface rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${deal.probability >= 75 ? 'bg-green-500' : deal.probability >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${deal.probability}%` }}
                    />
                  </div>
                  <span className={`text-xs font-black shrink-0 ${deal.probability >= 75 ? 'text-green-400' : deal.probability >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {deal.probability}%
                  </span>
                </div>
              </div>
              <div className="bg-surface/50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Status</p>
                <span className={`px-2 py-0.5 text-xs font-bold rounded border ${probColor(deal.probability)} uppercase tracking-wider inline-block`}>
                  {deal.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filteredDeals.length === 0 && (
          <div className="text-center p-12 glass-panel opacity-60 border-dashed border-white/20">
            <p className="text-gray-400 font-medium">No deals found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsManagement;
