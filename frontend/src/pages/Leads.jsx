import React, { useState } from 'react';
import { Filter, Star, Zap, Snowflake } from 'lucide-react';

const Leads = () => {
  const [activeTab, setActiveTab] = useState('Hot');

  const mockLeads = [
    { id: 1, name: 'Stark Industries', value: 1200000, prob: 95, sentiment: 'Positive', category: 'Hot' },
    { id: 2, name: 'Wayne Enterprises', value: 850000, prob: 88, sentiment: 'Positive', category: 'Hot' },
    { id: 3, name: 'Acme Corp', value: 250000, prob: 60, sentiment: 'Neutral', category: 'Warm' },
    { id: 4, name: 'Globex Inc', value: 120000, prob: 45, sentiment: 'Negative', category: 'Cold' },
    { id: 5, name: 'Umbrella Corp', value: 450000, prob: 20, sentiment: 'Neutral', category: 'Cold' },
  ];

  const filteredLeads = mockLeads
    .filter(l => l.category === activeTab)
    .sort((a, b) => b.prob - a.prob);

  const tabs = [
    { name: 'Hot', icon: Zap, count: mockLeads.filter(l => l.category === 'Hot').length, color: 'text-red-500 bg-red-500/10 border-red-500/30' },
    { name: 'Warm', icon: Star, count: mockLeads.filter(l => l.category === 'Warm').length, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30' },
    { name: 'Cold', icon: Snowflake, count: mockLeads.filter(l => l.category === 'Cold').length, color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-white flex items-center gap-4">
            <Filter className="text-primary" size={32} /> Lead Prioritization
          </h1>
          <p className="text-gray-400 font-medium leading-relaxed max-w-xl">
            Focus your team's efforts automatically categorized by combined AI success probability, deal value, and immediate sentiment indicators.
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
                ? `${tab.color} scale-105 shadow-md shadow-white/5` 
                : 'bg-surface/50 text-gray-400 border-white/5 hover:bg-surface hover:text-white'
            }`}
          >
            <tab.icon size={20} className={activeTab === tab.name ? 'animate-pulse' : ''} />
            {tab.name} Leads
            <span className={`px-2 py-0.5 rounded-md text-xs bg-black/20 ${activeTab === tab.name ? 'text-white' : 'text-gray-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between group hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner
                ${lead.category === 'Hot' ? 'bg-red-500/20 text-red-500' : 
                  lead.category === 'Warm' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-400'}`}>
                {lead.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{lead.name}</h3>
                <p className="text-gray-400 font-medium text-sm flex items-center gap-2">
                  <span className="text-primary font-bold">Value:</span> ${lead.value.toLocaleString()} 
                  <span className="text-white/20 mx-1">|</span>
                  <span className="text-primary font-bold">Sentiment:</span> {lead.sentiment}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-white/10 sm:border-0 pl-0 sm:pl-8">
              <div className="flex flex-col items-center flex-1 sm:flex-none">
                <span className="text-xs uppercase font-bold text-gray-500 mb-1 tracking-wider">AI Probability</span>
                <span className={`text-2xl font-black ${lead.prob >= 75 ? 'text-green-500' : lead.prob >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {lead.prob}%
                </span>
              </div>
              
              <button className={`px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95
                ${lead.category === 'Hot' ? 'bg-primary text-white hover:bg-primary/80 shadow-primary/30' : 
                  'bg-surface border border-white/10 text-white hover:bg-white/10'}`}>
                Action Plan
              </button>
            </div>
          </div>
        ))}
        {filteredLeads.length === 0 && (
          <div className="text-center p-12 glass-panel opacity-60 border-dashed border-white/20">
            <p className="text-gray-400 font-medium text-lg">No {activeTab.toLowerCase()} leads currently prioritized.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;
