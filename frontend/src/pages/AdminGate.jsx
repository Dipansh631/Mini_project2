// src/pages/AdminGate.jsx
import React, { useEffect, useState } from 'react';
import {
  Shield, Lock, UserPlus, KeyRound, Eye, EyeOff,
  CheckCircle, AlertCircle, Loader2, Copy, ArrowRight,
  Building2, Users, TriangleAlert,
} from 'lucide-react';
import { API_BASE } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import AdminPanel from './AdminPanel';

// ── Shared UI helpers ──────────────────────────────────────────
const Field = ({ label, type = 'text', value, onChange, placeholder, readOnly, right }) => (
  <div className="relative">
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full px-4 py-3 rounded-xl border text-white text-sm outline-none transition-all
        ${readOnly
          ? 'bg-black/30 border-white/10 text-gray-300 cursor-default select-all'
          : 'bg-surface/60 border-white/15 focus:border-primary/60 focus:ring-1 focus:ring-primary/30'
        } ${right ? 'pr-10' : ''}`}
    />
    {right && <div className="absolute right-3 top-[34px]">{right}</div>}
  </div>
);

// ── Credential Reveal Modal (full-screen blocking) ────────────
function CredentialRevealModal({ creds, onProceed }) {
  const [copied, setCopied] = useState({});
  const [confirmed, setConfirmed] = useState(false);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2500);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-lg animate-in zoom-in-95 fade-in duration-500 relative">

        {/* Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64
          bg-green-500/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative glass-panel rounded-3xl overflow-hidden border-2 border-green-500/40">

          {/* ── Warning banner ── */}
          <div className="flex items-center gap-3 px-6 py-4 bg-yellow-500/10 border-b border-yellow-500/25">
            <TriangleAlert size={20} className="text-yellow-400 shrink-0 animate-pulse" />
            <p className="text-yellow-300 text-sm font-bold">
              ⚠️ Save these credentials NOW — they won't be shown again!
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* Heading */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Admin Account Created!</h2>
              <p className="text-gray-400 text-sm mt-1">
                Your credentials have been generated and saved to the database.
              </p>
            </div>

            {/* Credentials */}
            <div className="space-y-4">
              {[
                { label: 'Username', value: creds.username, key: 'u', hint: 'firstname + birth year' },
                { label: 'Password', value: creds.password, key: 'p', hint: 'birth_year + age + username_length + @salesdeal' },
              ].map(({ label, value, key, hint }) => (
                <div key={key} className="p-4 rounded-2xl bg-black/30 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                    <span className="text-[10px] text-gray-600 italic">{hint}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={value}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-surface/80 border border-white/10
                        text-white text-sm font-mono outline-none select-all tracking-wide"
                    />
                    <button
                      onClick={() => copy(value, key)}
                      className={`p-3 rounded-xl border transition-all shrink-0
                        ${copied[key]
                          ? 'bg-green-500/20 border-green-500/40 text-green-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      title={`Copy ${label}`}
                    >
                      {copied[key] ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="p-4 rounded-2xl bg-blue-500/8 border border-blue-500/20 space-y-1.5 text-xs text-gray-400">
              <p className="font-bold text-blue-400 flex items-center gap-1.5"><Shield size={12}/> How to keep them safe</p>
              <p>📋 Copy both fields above using the copy buttons</p>
              <p>📒 Save them in a notes app, password manager, or write them down</p>
              <p>🔒 Never share your password with anyone</p>
              <p>🔑 You will need both to sign in as admin every time</p>
            </div>

            {/* Confirmation checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={`mt-0.5 w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all
                ${confirmed
                  ? 'bg-green-500 border-green-500'
                  : 'border-white/30 group-hover:border-white/50'
                }`}
                onClick={() => setConfirmed(p => !p)}
              >
                {confirmed && <CheckCircle size={13} className="text-white" />}
              </div>
              <span className="text-sm text-gray-300 select-none" onClick={() => setConfirmed(p => !p)}>
                I have copied and saved my <span className="text-white font-semibold">username</span> and{' '}
                <span className="text-white font-semibold">password</span> in a safe place.
              </span>
            </label>

            {/* Proceed button — locked until confirmed */}
            <button
              onClick={onProceed}
              disabled={!confirmed}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all
                shadow-lg disabled:opacity-40 disabled:cursor-not-allowed
                bg-gradient-to-r from-green-600 to-emerald-500 text-white
                hover:from-green-500 hover:to-emerald-400 shadow-green-500/25
                disabled:shadow-none"
            >
              <Shield size={16} /> Enter Admin Panel
              {!confirmed && <span className="text-xs font-normal opacity-70 ml-1">(check the box first)</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Already-registered notice ─────────────────────────────────
function AlreadyAdmin({ username, organization, onLogin }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/25 rounded-2xl">
        <CheckCircle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-300 text-sm font-bold">You are already registered as Admin</p>
          <p className="text-yellow-400/70 text-xs mt-1">
            Username: <span className="font-mono font-bold">{username}</span>
            {organization && <> &nbsp;·&nbsp; Org: <span className="font-semibold">{organization}</span></>}
          </p>
        </div>
      </div>
      <p className="text-gray-400 text-sm text-center">Use your existing credentials to log in.</p>
      <button onClick={onLogin}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-500/25 hover:bg-red-400 transition-all">
        <Lock size={16} /> Go to Login
      </button>
    </div>
  );
}

// ── Main AdminGate ─────────────────────────────────────────────
export default function AdminGate() {
  const { user } = useAuth();

  // views: 'checking' | 'choice' | 'already' | 'login' | 'apply' | 'success' | 'granted'
  const [view, setView]       = useState('checking');
  const [adminInfo, setAdminInfo] = useState(null);  // {username, status, organization}

  // Login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);

  // Apply form
  const [fullName, setFullName]   = useState('');
  const [dob, setDob]             = useState('');
  const [orgName, setOrgName]     = useState('');

  // Shared
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [creds, setCreds]     = useState(null);

  // Check existing admin record on mount
  useEffect(() => {
    if (!user?.email) return;
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/admin/status`, { headers: { 'X-User-Email': user.email } });
        const data = await res.json();
        if (data.has_credentials) {
          setAdminInfo(data);
          setView('login');   // default to login page if has credentials
        } else {
          setView('choice');
        }
      } catch {
        setView('choice');
      }
    })();
  }, [user?.email]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, username, password }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Invalid credentials.'); }
      setView('granted');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // Apply handler
  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, full_name: fullName, dob, organization: orgName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Application failed.');
      setCreds(data);
      setView('success');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── granted → show actual admin page with org-users panel ─────
  if (view === 'granted') return <AdminWithOrg adminEmail={user.email} />;

  // ── Card wrapper ──────────────────────────────────────────────
  const card = (content) => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border-t-4 border-t-red-500 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10">{content}</div>
      </div>
    </div>
  );

  const Header = ({ icon: Icon, title, sub }) => (
    <div className="flex items-center gap-4 mb-7">
      <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center shrink-0">
        <Icon size={22} className="text-red-400" />
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-white">{title}</h2>
        <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
      </div>
    </div>
  );

  const ErrorBox = () => error ? (
    <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs font-medium">
      <AlertCircle size={14} className="shrink-0" /> {error}
    </div>
  ) : null;

  const Back = ({ to }) => (
    <button onClick={() => { setView(to); setError(''); }}
      className="mt-4 w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-all">
      ← Back
    </button>
  );

  if (view === 'checking') return card(
    <div className="flex flex-col items-center gap-4 py-8">
      <Loader2 size={32} className="text-red-400 animate-spin" />
      <p className="text-gray-400 text-sm">Checking admin status…</p>
    </div>
  );

  // ── choice ────────────────────────────────────────────────────
  if (view === 'choice') return card(
    <>
      <Header icon={Shield} title="Admin Panel" sub="Restricted access — verification required" />
      <p className="text-gray-400 text-sm mb-6">Signed in as <span className="text-white font-semibold">{user?.email}</span></p>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setView('login')}
          className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <KeyRound size={20} className="text-blue-400" />
          </div>
          <span className="text-sm font-bold text-white">Already Admin</span>
          <span className="text-xs text-gray-500 text-center">Login with credentials</span>
        </button>
        <button onClick={() => setView('apply')}
          className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserPlus size={20} className="text-green-400" />
          </div>
          <span className="text-sm font-bold text-white">Apply for Admin</span>
          <span className="text-xs text-gray-500 text-center">Register & get credentials</span>
        </button>
      </div>
    </>
  );

  // ── already registered (intercepted from choice → apply when has record) ──
  if (view === 'already') return card(
    <>
      <Header icon={Shield} title="Admin Panel" sub="Restricted access" />
      <AlreadyAdmin
        username={adminInfo?.username}
        organization={adminInfo?.organization}
        onLogin={() => setView('login')}
      />
      <Back to="choice" />
    </>
  );

  // ── login ─────────────────────────────────────────────────────
  if (view === 'login') return card(
    <>
      <Header icon={Lock} title="Admin Login" sub={`Signed in as ${user?.email}`} />
      <ErrorBox />
      <form onSubmit={handleLogin} className="space-y-4">
        <Field label="Username" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. dipansh2001" />
        <Field label="Password" type={showPw ? 'text' : 'password'} value={password}
          onChange={e => setPassword(e.target.value)} placeholder="Your admin password"
          right={<button type="button" onClick={() => setShowPw(p => !p)} className="text-gray-500 hover:text-white">
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
        />
        <button type="submit" disabled={loading || !username || !password}
          className="w-full mt-1 py-3.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-400 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />} Enter Admin Panel
        </button>
      </form>
      {!adminInfo && <Back to="choice" />}
    </>
  );

  // ── apply ─────────────────────────────────────────────────────
  if (view === 'apply') {
    // If user already has a record, intercept here
    if (adminInfo) return card(
      <>
        <Header icon={Shield} title="Admin Panel" sub="Restricted access" />
        <AlreadyAdmin
          username={adminInfo.username}
          organization={adminInfo.organization}
          onLogin={() => setView('login')}
        />
        <Back to="choice" />
      </>
    );

    return card(
      <>
        <Header icon={UserPlus} title="Apply for Admin" sub="Your credentials will be auto-generated" />
        <ErrorBox />
        <form onSubmit={handleApply} className="space-y-4">
          <Field label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Dipansh Maheshwari" />
          <Field label="Date of Birth" type="date" value={dob} onChange={e => setDob(e.target.value)} />
          <Field label="Organization Name" value={orgName} onChange={e => setOrgName(e.target.value)}
            placeholder="e.g. SalesLens Corp" />
          <div className="p-3 bg-blue-500/8 border border-blue-500/20 rounded-xl text-xs text-gray-400 space-y-1">
            <p className="font-bold text-blue-400 mb-1">Credential formula</p>
            <p>🔑 <b>Username</b> = firstname + birth_year &nbsp;(e.g. <span className="font-mono">dipansh2001</span>)</p>
            <p>🔒 <b>Password</b> = birth_year + age + username_len + @salesdeal</p>
          </div>
          <button type="submit" disabled={loading || !fullName || !dob || !orgName}
            className="w-full py-3.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-500 transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            Generate My Admin Credentials
          </button>
        </form>
        <Back to="choice" />
      </>
    );
  }

  // ── success ── full-screen blocking credential reveal ─────────
  if (view === 'success') return (
    <CredentialRevealModal creds={creds} onProceed={() => setView('granted')} />
  );

  return null;
}

// ── AdminWithOrg: shows AdminPanel + Org Users tab ────────────
function AdminWithOrg({ adminEmail }) {
  const [tab, setTab]   = useState('panel');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [org, setOrg]   = useState('');

  useEffect(() => {
    if (tab !== 'org') return;
    setLoading(true);
    fetch(`${API_BASE}/admin/org-users`, { headers: { 'X-User-Email': adminEmail } })
      .then(r => r.json())
      .then(data => { setUsers(data); if (data[0]) setOrg(data[0].organization || ''); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab, adminEmail]);

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-3 border-b border-white/10 pb-4">
        {[
          { id: 'panel', label: 'Admin Panel', icon: Shield },
          { id: 'org',   label: 'Organization Users', icon: Users },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
              ${tab === id ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'panel' ? <AdminPanel /> : (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Building2 size={22} className="text-blue-400" />
            <div>
              <h2 className="text-xl font-extrabold text-white">
                {org ? `${org} — Members` : 'Organization Members'}
              </h2>
              <p className="text-gray-400 text-xs">Users who registered under your organization</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="text-blue-400 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center">
              <Users size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold">No users registered under your organization yet.</p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl overflow-hidden">
              <table className="w-full text-sm text-left text-gray-200">
                <thead className="bg-surface/80 text-gray-400 text-xs uppercase tracking-wider border-b border-white/5">
                  <tr>
                    {['Email', 'Role', 'Organization', 'Joined'].map(h => (
                      <th key={h} className="p-4 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.email} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium text-white">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                          u.role === 'admin'
                            ? 'bg-red-500/15 text-red-400 border-red-500/20'
                            : 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                        }`}>{u.role}</span>
                      </td>
                      <td className="p-4 text-gray-400">{u.organization || '—'}</td>
                      <td className="p-4 text-gray-500 text-xs">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
