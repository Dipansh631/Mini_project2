import React, { useState } from 'react';
import { Mail, MessageSquare, AlertCircle, Wand2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../supabase';

const EmailAnalyzer = () => {
  const { user } = useAuth();
  const [emailText, setEmailText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!emailText) return;
    
    setLoading(true);
    setError(null);

    try {
      // Call real FastAPI /analyze-email endpoint
      const response = await axios.post(`${API_BASE}/analyze-email`, {
        email_text: emailText,
      }, {
        headers: { 'X-User-Email': user?.email || '' },
      });

      const d = response.data;
      setAnalysis({
        sentiment: d.sentiment,
        emotion: d.emotion,
        suggestion: d.suggestion,
        confidence: d.sentiment_score,
        detectedKeywords: d.detected_keywords || [],
      });
    } catch (err) {
      console.error('API error:', err);
      setError('Could not reach the backend. Make sure the FastAPI server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4 text-primary shadow-inner">
          <Mail size={32} />
        </div>
        <h1 className="text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-white">NLP Email Sentiment Analyzer</h1>
        <p className="text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">Paste client communications below to instantly detect underlying sentiment, emotional state, and receive AI-generated response strategies.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium flex items-center gap-3">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="glass-panel p-8 mb-8 border-t-4 border-t-primary relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none"></div>
        <form onSubmit={handleAnalyze}>
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Client Email Content</label>
            <textarea 
              rows="8" 
              className="w-full bg-surface/50 border border-white/10 rounded-xl p-5 text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none font-mono text-sm leading-relaxed placeholder-gray-600 shadow-inner"
              placeholder="e.g., 'Hi team, we're currently reviewing the proposal but have concerns regarding the implementation timeline...'"
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
            ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={loading || !emailText}
            className="w-full bg-gradient-to-r from-blue-600 to-primary hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 flex justify-center items-center gap-3 text-lg"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Wand2 size={20} />}
            {loading ? 'Processing NLP Pipeline...' : 'Run NLP Analysis'}
          </button>
        </form>
      </div>

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
          <div className="glass-panel p-6 border border-white/5 space-y-6 bg-surface/60">
            <h3 className="text-lg font-bold border-b border-white/10 pb-3 flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" /> Analysis Results
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400 font-medium">Detected Sentiment</span>
                <span className={`px-3 py-1 rounded-md text-sm font-bold border ${analysis.sentiment === 'Positive' ? 'text-green-400 bg-green-400/10 border-green-400/20' : analysis.sentiment === 'Neutral' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
                  {analysis.sentiment}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400 font-medium">Primary Emotion</span>
                <span className="font-bold text-white text-lg">{analysis.emotion}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400 font-medium">Model Confidence</span>
                <span className="font-bold text-primary text-lg">{analysis.confidence}%</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 border-l-4 border-l-purple-500 bg-surface/60 flex flex-col justify-center relative overflow-hidden group hover:bg-surface/80 transition-colors">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/10 blur-[40px] rounded-full"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold border-b border-white/10 pb-3 mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-purple-400" /> AI Recommended Action
              </h3>
              <p className="text-gray-200 text-lg leading-relaxed italic font-medium">
                "{analysis.suggestion}"
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold block w-full mb-1">Key Triggers Triggered:</span>
                {analysis.detectedKeywords.map(kw => (
                  <span key={kw} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300">{kw}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailAnalyzer;
