// src/pages/AdminPanel.jsx
// Full CRUD admin panel – only accessible when role === "admin"
import React, { useEffect, useState } from 'react';
import { Shield, Trash2, Pencil, RefreshCw, AlertCircle, CheckCircle, X, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

const STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed'];

const AdminPanel = () => {
  const { user } = useAuth();
  const headers  = { 'X-User-Email': user?.email || '' };

  const [deals, setDeals]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(null);

  // Edit modal state
  const [editing, setEditing]     = useState(null);   // deal object being edited
  const [editForm, setEditForm]   = useState({});

  const fetchDeals = async () => {
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${API_BASE}/deals`, { headers });
      setDeals(res.data || []);
    } catch (e) {
      setError('Failed to load deals. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeals(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this deal?')) return;
    try {
      await axios.delete(`${API_BASE}/deals/${id}`, { headers });
      setSuccess('Deal deleted.');
      setDeals((prev) => prev.filter((d) => d.id !== id));
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e.response?.data?.detail || 'Delete failed.');
    }
  };

  const openEdit = (deal) => {
    setEditing(deal);
    setEditForm({
      client_name: deal.client_name,
      deal_value: deal.deal_value,
      stage: deal.stage,
      interactions: deal.interactions,
    });
  };

  const handleSave = async () => {
    try {
      const res = await axios.patch(`${API_BASE}/deals/${editing.id}`, editForm, { headers });
      setDeals((prev) => prev.map((d) => (d.id === editing.id ? { ...d, ...res.data } : d)));
      setEditing(null);
      setSuccess('Deal updated.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e.response?.data?.detail || 'Update failed.');
    }
  };

  const probColor = (p) =>
    p >= 0.75 ? 'text-green-400' : p >= 0.40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/15 rounded-xl">
              <Shield size={24} className="text-red-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white">Admin Panel</h1>
          </div>
          <p className="text-gray-400 text-sm">Manage all deals, view data, and control platform settings.</p>
        </div>
        <button onClick={fetchDeals} className="flex items-center gap-2 px-4 py-2 bg-surface border border-white/10 rounded-xl text-gray-300 hover:text-white hover:border-white/20 text-sm font-semibold transition-all">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </header>

      {/* Alerts */}
      {error   && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2"><CheckCircle size={16}/>{success}</div>}

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Deals',  value: deals.length },
          { label: 'Hot Leads',    value: deals.filter(d => (d.lead_category||'').includes('Hot')).length,  color: 'text-red-400' },
          { label: 'Warm Leads',   value: deals.filter(d => (d.lead_category||'').includes('Warm')).length, color: 'text-yellow-400' },
          { label: 'Cold Leads',   value: deals.filter(d => (d.lead_category||'').includes('Cold')).length, color: 'text-blue-400' },
        ].map(({ label, value, color = 'text-white' }) => (
          <div key={label} className="glass-panel p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-bold">{label}</p>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Desktop Table ────────────────────────────────────────────── */}
      <div className="hidden md:block glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-200">
            <thead className="bg-surface/80 text-gray-400 text-xs uppercase tracking-wider border-b border-white/5">
              <tr>
                {['Client','Value','Stage','Prob.','Lead Cat.','Risk','Score','Actions'].map(h => (
                  <th key={h} className="p-4 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="p-4"><div className="h-4 bg-white/5 rounded animate-pulse"/></td></tr>
                ))
              ) : deals.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">No deals saved yet. Run a prediction first.</td></tr>
              ) : deals.map(d => (
                <tr key={d.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 font-medium text-white">{d.client_name}</td>
                  <td className="p-4">${(d.deal_value||0).toLocaleString()}</td>
                  <td className="p-4 text-gray-400">{d.stage}</td>
                  <td className={`p-4 font-bold ${probColor(d.success_probability||0)}`}>
                    {((d.success_probability||0)*100).toFixed(0)}%
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                      (d.lead_category||'').includes('Hot')  ? 'text-red-400 bg-red-400/10 border-red-400/20'  :
                      (d.lead_category||'').includes('Warm') ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
                      'text-blue-400 bg-blue-400/10 border-blue-400/20'
                    }`}>{d.lead_category || '—'}</span>
                  </td>
                  <td className={`p-4 text-xs font-bold uppercase ${
                    d.risk_level==='Low' ? 'text-green-400' : d.risk_level==='Medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{d.risk_level||'—'}</td>
                  <td className="p-4 font-black text-primary">{d.deal_score||0}</td>
                  <td className="p-4 text-right space-x-1">
                    <button onClick={() => openEdit(d)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all inline-block">
                      <Pencil size={15}/>
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all inline-block">
                      <Trash2 size={15}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile Cards ─────────────────────────────────────────────── */}
      <div className="md:hidden space-y-4">
        {deals.map(d => (
          <div key={d.id} className="glass-panel p-5 border border-white/5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-white">{d.client_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{d.stage} · ${(d.deal_value||0).toLocaleString()}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(d)} className="p-2 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-blue-400/10 transition-all">
                  <Pencil size={14}/>
                </button>
                <button onClick={() => handleDelete(d.id)} className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-all">
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="bg-surface/50 rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">Score</p>
                <p className="font-black text-primary text-lg">{d.deal_score||0}</p>
              </div>
              <div className="bg-surface/50 rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">Prob</p>
                <p className={`font-bold ${probColor(d.success_probability||0)}`}>{((d.success_probability||0)*100).toFixed(0)}%</p>
              </div>
              <div className="bg-surface/50 rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">Risk</p>
                <p className={`font-bold text-xs ${d.risk_level==='Low' ? 'text-green-400' : d.risk_level==='Medium' ? 'text-yellow-400' : 'text-red-400'}`}>{d.risk_level||'—'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Edit Modal ───────────────────────────────────────────────── */}
      {editing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel p-8 w-full max-w-md border-t-4 border-t-primary relative">
            <button onClick={() => setEditing(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20}/>
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Edit Deal</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Client Name</label>
                <input
                  value={editForm.client_name || ''}
                  onChange={e => setEditForm(f => ({...f, client_name: e.target.value}))}
                  className="mt-1 w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deal Value ($)</label>
                <input
                  type="number"
                  value={editForm.deal_value || ''}
                  onChange={e => setEditForm(f => ({...f, deal_value: Number(e.target.value)}))}
                  className="mt-1 w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stage</label>
                <div className="relative mt-1">
                  <select
                    value={editForm.stage || ''}
                    onChange={e => setEditForm(f => ({...f, stage: e.target.value}))}
                    className="w-full appearance-none bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Interactions</label>
                <input
                  type="number"
                  value={editForm.interactions ?? ''}
                  onChange={e => setEditForm(f => ({...f, interactions: Number(e.target.value)}))}
                  className="mt-1 w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditing(null)} className="flex-1 py-3 border border-white/10 rounded-xl text-gray-400 text-sm font-semibold hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
