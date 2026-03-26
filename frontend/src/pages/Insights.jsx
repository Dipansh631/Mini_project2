import React, { useEffect, useState } from 'react';
import { Lightbulb, RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/get-insights`);
      setInsights(response.data.insights || []);
    } catch (err) {
      console.error('Insight fetch error:', err);
      setError('Live insights currently unavailable. Check your backend connection.');
      setInsights([]); // No more train data fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInsights(); }, []);

  // Colour tiers for insight cards (rotate across the list)
  const cardStyles = [
    { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', label: 'Risk' },
    { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', label: 'Opportunity' },
    { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', label: 'Warning' },
    { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', label: 'System' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-5xl mx-auto">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-yellow-400/10 rounded-full mb-4 text-yellow-400 shadow-inner">
          <Lightbulb size={32} />
        </div>
        <h1 className="text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-white">Smart Insights Panel</h1>
        <p className="text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
          AI-generated strategic recommendations based on cross-analyzing your CRM deal probabilities, value, and client sentiment models.
        </p>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-white/10 hover:border-white/20 text-gray-300 font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 text-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Fetching Insights…' : 'Refresh Insights'}
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm font-medium flex items-center gap-3">
          <AlertCircle size={18} /> {error} Showing cached insights below.
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel p-8 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
              <div className="h-6 bg-white/5 rounded w-2/3 mb-3" />
              <div className="h-4 bg-white/5 rounded w-full mb-2" />
              <div className="h-4 bg-white/5 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, index) => {
            const style = cardStyles[index % cardStyles.length];
            return (
              <div key={index} className={`glass-panel p-8 border hover:bg-surface/60 transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 shadow-md hover:shadow-xl ${style.border}`}>
                <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full ${style.bg} blur-[40px] group-hover:scale-150 transition-transform duration-700`} />
                <div className="relative z-10">
                  <span className={`text-xs font-bold uppercase tracking-wider ${style.color}`}>{style.label}</span>
                  <p className="text-gray-200 mt-3 leading-relaxed font-medium">{insight}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center border-dashed border-white/10">
          <div className="p-4 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lightbulb size={24} className="text-gray-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-300">No real-time insights yet</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
            Once your pipeline grows and deal activities are logged, our AI will automatically generate strategic advice here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Insights;

