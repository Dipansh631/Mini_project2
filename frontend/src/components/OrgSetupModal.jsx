// src/components/OrgSetupModal.jsx
// Shown once after Google login when the user has no organization set.
import React, { useState } from 'react';
import { Building2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { API_BASE } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

export default function OrgSetupModal() {
  const { user, userOrg, saveOrg, closeOrgModal } = useAuth();
  const [orgName, setOrgName]   = useState(userOrg || '');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const isEditMode = Boolean(userOrg);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/user/organization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, organization: orgName.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || 'Could not save organization.');
      }
      saveOrg(orgName.trim());  // update AuthContext → modal disappears
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Full-screen overlay
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">

      {/* Animated card */}
      <div className="w-full max-w-md animate-in zoom-in-95 fade-in duration-500
        glass-panel rounded-3xl overflow-hidden border-t-4 border-t-blue-500 relative">

        {/* Top glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48
          bg-blue-500/20 rounded-full blur-[70px] pointer-events-none" />

        <div className="relative z-10 p-8">
          {/* Icon + heading */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/15 flex items-center justify-center shrink-0
              shadow-lg shadow-blue-500/10">
              <Building2 size={26} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Almost there!</h2>
              <p className="text-gray-400 text-sm mt-0.5">
                Welcome, <span className="text-white font-semibold">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </span> 👋
              </p>
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {isEditMode ? (
              <>Update your <span className="text-white font-semibold">organization</span>. Your dashboard data will remain tied to your account.</>
            ) : (
              <>Please enter the name of your <span className="text-white font-semibold">organization</span> to personalise your SalesLens experience. This helps admins manage team data.</>
            )}
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/25
              rounded-xl text-red-400 text-xs font-medium">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. SalesLens Corp, Acme Ltd…"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-surface/60 border border-white/15 text-white
                  text-sm outline-none transition-all focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !orgName.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600
                text-white font-bold text-sm hover:bg-blue-500 transition-all
                shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : <ArrowRight size={16} />
              }
              {loading ? 'Saving…' : 'Continue to Dashboard'}
            </button>

            {isEditMode && (
              <button
                type="button"
                onClick={closeOrgModal}
                className="w-full py-3 rounded-xl bg-transparent border border-white/15 text-gray-300 font-semibold text-sm hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            )}
          </form>

          <p className="text-[11px] text-gray-600 text-center mt-4">
            You can change this later from your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
}
