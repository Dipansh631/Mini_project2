import React, { useState } from 'react';
import { Target, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../supabase';

const DealIntelligence = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ clientName: '', dealValue: '', stage: 'Lead', interactions: '', emailText: '' });
  const [result, setResult] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Real FastAPI call to /predict-deal then /get-insights
  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ── 1. Deal prediction ──────────────────────────────────────────
      const dealResp = await axios.post(`${API_BASE}/predict-deal`, {
        client_name: formData.clientName,
        deal_value: Number(formData.dealValue),
        stage: formData.stage,
        interactions: Number(formData.interactions),
        email_text: formData.emailText || '',
      }, {
        headers: { 'X-User-Email': user?.email || '' },
      });

      const d = dealResp.data;

      // ── 2. Pull AI insights for this specific deal ──────────────────
      const insightResp = await axios.get(`${API_BASE}/get-insights`, {
        params: {
          success_probability: d.success_probability,
          deal_value: Number(formData.dealValue),
          stage: formData.stage,
          interactions: Number(formData.interactions),
          deal_score: d.deal_score,
        },
      });

      setResult({
        probability: Math.round(d.success_probability * 100),
        expectedRev: d.predicted_revenue,
        risk: d.risk_level,
        dealScore: d.deal_score,
        leadCategory: d.lead_category,
      });
      setInsights(insightResp.data.insights || []);
    } catch (err) {
      console.error('API error:', err);
      setError('Could not reach the backend. Make sure the FastAPI server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-5xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-white">Deal Intelligence Engine</h1>
        <p className="text-gray-400 font-medium">Predict CRM outcomes, expected revenue, and analyze communication sentiment</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium flex items-center gap-3">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-3 glass-panel p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Target className="text-primary" /> Deal Parameters
          </h3>
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Client Name</label>
                <input required type="text" className="w-full bg-surface/50 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} placeholder="Acme Corp" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Deal Value ($)</label>
                <input required type="number" className="w-full bg-surface/50 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" value={formData.dealValue} onChange={e => setFormData({...formData, dealValue: e.target.value})} placeholder="50000" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Deal Stage</label>
                <select className="w-full bg-surface/50 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
                  <option>Lead</option>
                  <option>Qualified</option>
                  <option>Proposal</option>
                  <option>Negotiation</option>
                  <option>Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Past Interactions</label>
                <input required type="number" className="w-full bg-surface/50 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" value={formData.interactions} onChange={e => setFormData({...formData, interactions: e.target.value})} placeholder="e.g. 5" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Recent Email Text (Optional NLP Analysis)</label>
              <textarea rows="4" className="w-full bg-surface/50 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none" value={formData.emailText} onChange={e => setFormData({...formData, emailText: e.target.value})} placeholder="Paste client's recent email here for sentiment scoring..." />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 flex justify-center items-center gap-2">
              {loading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Run AI Analysis'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <>
              <div className="glass-panel p-8 animate-in zoom-in-95 duration-500 border-primary/30 bg-primary/5">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="text-primary" /> AI Analysis Complete
                </h3>
                
                <div className="flex flex-col items-center justify-center p-6 bg-surface/50 rounded-xl border border-white/5 mb-4 shadow-inner">
                  <span className="text-gray-400 font-medium mb-2 uppercase tracking-widest text-sm">Overall Deal Score</span>
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-surface" />
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className={`${result.dealScore > 75 ? 'text-green-500' : result.dealScore > 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`} strokeDasharray="351.858" strokeDashoffset={351.858 - (351.858 * result.dealScore) / 100} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-black">{result.dealScore}</span>
                    </div>
                  </div>
                  <span className={`mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${result.leadCategory === 'Hot Lead' ? 'bg-green-500/20 text-green-400' : result.leadCategory === 'Warm Lead' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {result.leadCategory}
                  </span>
                </div>

                <div className="space-y-4">
                  <ResultRow label="Success Probability" value={`${result.probability}%`} />
                  <ResultRow label="Expected Revenue" value={`$${Number(result.expectedRev).toLocaleString(undefined, {maximumFractionDigits: 0})}`} valueColor="text-green-400" />
                  <ResultRow label="Risk Level" value={result.risk} valueColor={result.risk === 'Low' ? 'text-green-400' : result.risk === 'Medium' ? 'text-yellow-400' : 'text-red-400'} />
                </div>
              </div>

              {insights.length > 0 && (
                <div className="glass-panel p-6 border border-yellow-500/20 bg-yellow-500/5 animate-in slide-in-from-bottom-4 duration-500">
                  <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Lightbulb size={16} /> AI Insights
                  </h4>
                  <ul className="space-y-3">
                    {insights.slice(0, 4).map((ins, i) => (
                      <li key={i} className="text-sm text-gray-300 leading-relaxed flex gap-2">
                        <span className="text-yellow-400 mt-0.5 shrink-0">▸</span> {ins}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="glass-panel p-8 h-full flex flex-col items-center justify-center text-center opacity-50 border-dashed border-white/20 pb-20 pt-20">
              <AlertCircle size={48} className="text-gray-500 mb-4" />
              <h4 className="text-xl font-bold text-gray-400 mb-2">Awaiting Parameters</h4>
              <p className="text-sm text-gray-500 max-w-[250px]">Fill out the deal details and run the analysis to view ML predictions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ResultRow = ({ label, value, valueColor = "text-white" }) => (
  <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
    <span className="text-gray-400 font-medium text-sm">{label}</span>
    <span className={`font-bold text-lg ${valueColor}`}>{value}</span>
  </div>
);

export default DealIntelligence;

