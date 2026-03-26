// src/pages/LoginPage.jsx
import React from 'react';
import { Target, Zap, Shield, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { signInWithGoogle } = useAuth();

  const features = [
    { icon: BarChart3, label: 'AI Deal Predictions',   sub: 'ML-powered win probability' },
    { icon: Zap,       label: 'Email Sentiment NLP',   sub: 'Instant tone & emotion analysis' },
    { icon: Shield,    label: 'Role-Based Access',      sub: 'Admin & user permission system' },
    { icon: Target,    label: 'Lead Intelligence',      sub: 'Hot / Warm / Cold prioritization' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] bg-cyan-900/40 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 relative z-10">

        {/* ── Left: Branding ───────────────────────────────────────── */}
        <div className="flex flex-col justify-center">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Target size={26} className="text-primary drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-cyan-200 bg-clip-text text-transparent leading-tight">
                SalesLens AI
              </h1>
              <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">Sales Intelligence Platform</p>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Close more deals with <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">AI intelligence</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            Predict deal outcomes, analyse client sentiment, and get AI-powered insights — all in one platform.
          </p>

          {/* Feature pills */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-black flex items-center justify-center border border-zinc-800">
                  <Icon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">{label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Login card ────────────────────────────────────── */}
        <div className="flex flex-col justify-center">
          <div className="glass-panel p-8 md:p-10 border-t-4 border-t-primary relative overflow-hidden">
            {/* Glow inside card */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[60px]" />

            <div className="relative z-10">
              <h3 className="text-2xl font-extrabold text-white mb-2">Welcome back</h3>
              <p className="text-gray-400 text-sm mb-8">Sign in to access your sales dashboard</p>

              {/* Google login button */}
              <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl
                  bg-white text-gray-900 font-bold text-sm
                  hover:bg-gray-100 active:scale-[0.98]
                  transition-all duration-200 shadow-xl shadow-black/20
                  border border-white/10"
              >
                {/* Google SVG icon */}
                <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </button>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-xs text-gray-500 leading-relaxed">
                  By signing in, you agree to our terms of service.<br />
                  <span className="text-primary">Admin access</span> is role-restricted.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
