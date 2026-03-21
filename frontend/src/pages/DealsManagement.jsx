import React, { useState } from 'react';
import { Pencil, Trash2, Plus, Filter, Search } from 'lucide-react';

const DealsManagement = () => {
  const [deals, setDeals] = useState([
    { id: 1, client: 'Acme Corp', value: 250000, stage: 'Negotiation', probability: 85, sentiment: 'Positive', status: 'Active' },
    { id: 2, client: 'Globex Inc', value: 120000, stage: 'Proposal', probability: 45, sentiment: 'Negative', status: 'At Risk' },
    { id: 3, client: 'Initech', value: 850000, stage: 'Qualified', probability: 60, sentiment: 'Neutral', status: 'Active' },
    { id: 4, client: 'Umbrella Corp', value: 45000, stage: 'Lead', probability: 20, sentiment: 'Neutral', status: 'Stalled' },
    { id: 5, client: 'Stark Ind.', value: 1200000, stage: 'Negotiation', probability: 95, sentiment: 'Positive', status: 'Closing' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (prob) => {
    if (prob >= 75) return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (prob >= 40) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  const filteredDeals = deals.filter(d => d.client.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-white">Deals CRM Pipeline</h1>
          <p className="text-gray-400 font-medium">Manage and track your AI-scored sales opportunities</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="pl-10 pr-4 py-2 bg-surface/50 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary outline-none w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/40">
            <Plus size={18} /> New Deal
          </button>
        </div>
      </header>

      <div className="glass-panel overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/80 text-gray-400 border-b border-white/5 uppercase text-xs font-bold tracking-wider">
                <th className="p-5 font-semibold">Client Name</th>
                <th className="p-5 font-semibold">Deal Value</th>
                <th className="p-5 font-semibold">Stage</th>
                <th className="p-5 font-semibold">AI Probability</th>
                <th className="p-5 font-semibold">Sentiment</th>
                <th className="p-5 font-semibold">Status</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-medium text-gray-200">
              {filteredDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
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
                      <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-white/5">
                        <div className={`h-full rounded-full ${deal.probability >= 75 ? 'bg-green-500' : deal.probability >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${deal.probability}%` }}></div>
                      </div>
                      <span className={`text-xs font-bold ${deal.probability >= 75 ? 'text-green-400' : deal.probability >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {deal.probability}%
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`flex items-center gap-1.5 font-bold ${deal.sentiment === 'Positive' ? 'text-green-400' : deal.sentiment === 'Neutral' ? 'text-yellow-400' : 'text-red-400'}`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      {deal.sentiment}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded border ${getStatusColor(deal.probability)} uppercase tracking-wider`}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors inline-block opacity-0 group-hover:opacity-100">
                      <Pencil size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors inline-block opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
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
    </div>
  );
};

export default DealsManagement;
