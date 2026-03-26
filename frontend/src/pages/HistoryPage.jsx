// src/pages/HistoryPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { History, RefreshCw, TrendingUp, Mail, ChevronDown, ChevronUp, Search, User } from 'lucide-react';
import { API_BASE } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

// ── helpers ────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const ACTION_META = {
  'Deal Prediction': {
    icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    badge: 'bg-blue-500/15 text-blue-400',
  },
  'Email Analysis': {
    icon: Mail,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    badge: 'bg-purple-500/15 text-purple-400',
  },
};

const DEFAULT_META = {
  icon: History,
  color: 'text-gray-400',
  bg: 'bg-white/5 border-white/10',
  badge: 'bg-gray-500/15 text-gray-400',
};

// ── sub-components ────────────────────────────────────────────────────

function DetailsRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-gray-500 shrink-0 w-36">{label}</span>
      <span className="text-gray-200 font-medium break-words flex-1">
        {typeof value === 'number' ? value.toLocaleString() : String(value)}
      </span>
    </div>
  );
}

function HistoryCard({ row, isAdmin }) {
  const [expanded, setExpanded] = useState(false);
  const meta = ACTION_META[row.action] || DEFAULT_META;
  const Icon = meta.icon;

  const details = row.details || {};

  return (
    <div className={`rounded-2xl border ${meta.bg} p-4 transition-all duration-300 hover:brightness-110`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${meta.badge}`}>
          <Icon size={18} />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.badge}`}>
              {row.action}
            </span>
            {isAdmin && row.user_email && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <User size={11} /> {row.user_email}
              </span>
            )}
          </div>
          <p className="text-white font-semibold text-sm truncate">
            {details.client_name || details.email_text?.slice(0, 60) || 'Action recorded'}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">{formatDate(row.created_at)}</p>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all shrink-0"
          aria-label="Toggle details"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(details).map(([k, v]) =>
            k !== 'email_text' ? (
              <DetailsRow
                key={k}
                label={k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                value={v}
              />
            ) : null
          )}
          {details.email_text && (
            <div className="col-span-full mt-2">
              <p className="text-xs text-gray-500 mb-1">Email Text</p>
              <p className="text-xs text-gray-300 bg-black/20 rounded-xl p-3 font-mono leading-relaxed whitespace-pre-wrap">
                {details.email_text}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────

export default function HistoryPage() {
  const { user, isAdmin } = useAuth();
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all'); // 'all' | 'Deal Prediction' | 'Email Analysis'

  const fetchHistory = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/history`, {
        headers: { 'X-User-Email': user.email },
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setRows(data);
    } catch (err) {
      setError(err.message || 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Filter + search
  const visible = rows.filter((r) => {
    const matchAction = filter === 'all' || r.action === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.action?.toLowerCase().includes(q) ||
      r.user_email?.toLowerCase().includes(q) ||
      JSON.stringify(r.details || {}).toLowerCase().includes(q);
    return matchAction && matchSearch;
  });

  const dealCount  = rows.filter((r) => r.action === 'Deal Prediction').length;
  const emailCount = rows.filter((r) => r.action === 'Email Analysis').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <History size={30} className="text-blue-400" /> Activity History
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isAdmin
              ? "Admin view \u2014 all users' activity is shown below."
              : 'Your personal prediction and analysis history.'}
          </p>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 text-blue-400
            hover:bg-primary/30 border border-blue-500/20 transition-all text-sm font-semibold disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Actions', value: rows.length, color: 'text-white' },
          { label: 'Deal Predictions', value: dealCount, color: 'text-blue-400' },
          { label: 'Email Analyses', value: emailCount, color: 'text-purple-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-panel p-4 rounded-2xl text-center">
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-gray-400 text-xs mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search history…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-white/10
              text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
        {/* Type filter */}
        {['all', 'Deal Prediction', 'Email Analysis'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border
              ${filter === f
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
              }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading history…</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-2xl text-center">
          <p className="text-red-400 font-semibold">{error}</p>
          <button onClick={fetchHistory} className="mt-3 text-sm text-blue-400 hover:underline">
            Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <History size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold">
            {rows.length === 0 ? 'No history yet. Start making predictions!' : 'No results match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((row) => (
            <HistoryCard key={row.id} row={row} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}
