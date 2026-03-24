// src/contexts/AuthContext.jsx
// Provides auth session + user role to the entire app via React Context.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, API_BASE } from '../supabase';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [session, setSession]   = useState(null);   // Supabase session
  const [userRole, setUserRole] = useState(null);   // "admin" | "user" | null
  const [loading, setLoading]   = useState(true);

  // ── Helper: register / fetch role from backend ─────────────────────
  const syncRole = async (email) => {
    if (!email) { setUserRole(null); return; }
    try {
      // POST to /auth/login → upserts user row + returns role
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'X-User-Email': email },
      });
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role);
      } else {
        // Fallback: compare to hardcoded admin email
        const ADMIN = 'dipanshumaheshwari73698@gmail.com';
        setUserRole(email === ADMIN ? 'admin' : 'user');
      }
    } catch {
      const ADMIN = 'dipanshumaheshwari73698@gmail.com';
      setUserRole(email === ADMIN ? 'admin' : 'user');
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      syncRole(s?.user?.email || null).finally(() => setLoading(false));
    });

    // Listen for auth changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      syncRole(s?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Google login ───────────────────────────────────────────────────
  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });

  // ── Logout ────────────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole(null);
  };

  const isAdmin = userRole === 'admin';
  const user    = session?.user ?? null;

  return (
    <AuthContext.Provider value={{ session, user, userRole, isAdmin, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
