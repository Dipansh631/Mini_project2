// src/contexts/AuthContext.jsx
// Provides auth session + user role + organization to the entire app via React Context.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, API_BASE } from '../supabase';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [session, setSession]   = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userOrg, setUserOrg]   = useState(null);
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [loading, setLoading]   = useState(true);

  const orgCacheKey = (email) => `saleslens_org_${String(email || '').toLowerCase()}`;
  const getCachedOrg = (email) => {
    if (!email || typeof window === 'undefined') return null;
    const v = window.localStorage.getItem(orgCacheKey(email));
    return v && v.trim() ? v.trim() : null;
  };
  const setCachedOrg = (email, orgName) => {
    if (!email || !orgName || typeof window === 'undefined') return;
    window.localStorage.setItem(orgCacheKey(email), orgName.trim());
  };

  // ── Sync role + org from backend ───────────────────────────
  const syncRole = async (email) => {
    if (!email) {
      setUserRole(null);
      setUserOrg(null);
      setOrgModalOpen(false);
      return;
    }

    const cachedOrg = getCachedOrg(email);
    if (cachedOrg) setUserOrg(cachedOrg);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'X-User-Email': email },
      });
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role);
        const org = data.organization?.trim?.() || null;
        setUserOrg(org || cachedOrg || null);
        if (org) setCachedOrg(email, org);
        setOrgModalOpen(!(org || cachedOrg));
      } else {
        const ADMIN = 'dipanshumaheshwari73698@gmail.com';
        setUserRole(email === ADMIN ? 'admin' : 'user');
        setUserOrg(cachedOrg || null);
        setOrgModalOpen(!cachedOrg);
      }
    } catch {
      const ADMIN = 'dipanshumaheshwari73698@gmail.com';
      setUserRole(email === ADMIN ? 'admin' : 'user');
      setUserOrg(cachedOrg || null);
      setOrgModalOpen(!cachedOrg);
    }
  };

  // Called by OrgSetupModal after the user saves their org
  const saveOrg = (orgName) => {
    const clean = orgName?.trim?.() || null;
    setUserOrg(clean);
    if (clean && session?.user?.email) setCachedOrg(session.user.email, clean);
    setOrgModalOpen(false);
  };

  const openOrgModal = () => setOrgModalOpen(true);
  const closeOrgModal = () => setOrgModalOpen(false);

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
    setOrgModalOpen(false);
  };

  const isAdmin = userRole === 'admin';
  const user    = session?.user ?? null;

  return (
    <AuthContext.Provider value={{
      session, user, userRole, userOrg, isAdmin,
      orgModalOpen, loading, signInWithGoogle, signOut,
      saveOrg, openOrgModal, closeOrgModal,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
