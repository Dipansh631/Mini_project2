// src/contexts/AuthContext.jsx
// Provides auth session + user role + organization to the entire app via React Context.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, API_BASE } from '../supabase';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [session, setSession]   = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userOrg, setUserOrg]   = useState(null);   // null means not set yet
  const [loading, setLoading]   = useState(true);

  // ── Sync role + org from backend ───────────────────────────
  const syncRole = async (email) => {
    if (!email) { setUserRole(null); setUserOrg(null); return; }
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'X-User-Email': email },
      });
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role);
        setUserOrg(data.organization ?? null);
      } else {
        const ADMIN = 'dipanshumaheshwari73698@gmail.com';
        setUserRole(email === ADMIN ? 'admin' : 'user');
        setUserOrg(null);
      }
    } catch {
      const ADMIN = 'dipanshumaheshwari73698@gmail.com';
      setUserRole(email === ADMIN ? 'admin' : 'user');
      setUserOrg(null);
    }
  };

  // Called by OrgSetupModal after the user saves their org
  const saveOrg = (orgName) => setUserOrg(orgName);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      syncRole(s?.user?.email || null).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      syncRole(s?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Google login ────────────────────────────────────────────
  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });

  // ── Logout ──────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole(null);
    setUserOrg(null);
  };

  const isAdmin = userRole === 'admin';
  const user    = session?.user ?? null;

  return (
    <AuthContext.Provider value={{
      session, user, userRole, userOrg, isAdmin,
      loading, signInWithGoogle, signOut, saveOrg,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
