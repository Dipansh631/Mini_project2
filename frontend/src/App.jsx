import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DealIntelligence from './pages/DealIntelligence';
import DealsManagement from './pages/DealsManagement';
import EmailAnalyzer from './pages/EmailAnalyzer';
import Insights from './pages/Insights';
import Leads from './pages/Leads';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import OrgSetupModal from './components/OrgSetupModal';
import { SIDEBAR_OPEN_W, SIDEBAR_CLOSE_W } from './layout';

// ─────────────────────────────────────────────────────────────────────
// Inner app – rendered after auth is resolved
// ─────────────────────────────────────────────────────────────────────
function AppInner() {
  const { session, loading, user, signOut, userOrg } = useAuth();
  const [currentPage, setCurrentPage]   = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

  const navigateTo = (page) => {
    setCurrentPage(page);
    if (isMobile()) setIsSidebarOpen(false);
  };

  // ── Loading spinner ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Loading SalesLens AI…</p>
        </div>
      </div>
    );
  }

  // ── Not logged in → show Login page ───────────────────────────
  if (!session) {
    return <LoginPage />;
  }

  // ── Logged in → show app ────────────────────────────────────
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':    return <Dashboard setCurrentPage={navigateTo} />;
      case 'deals':        return <DealsManagement />;
      case 'intelligence': return <DealIntelligence />;
      case 'email':        return <EmailAnalyzer />;
      case 'insights':     return <Insights />;
      case 'leads':        return <Leads />;
      case 'history':      return <HistoryPage />;
      default:             return <Dashboard setCurrentPage={navigateTo} />;
    }
  };

  const mainMarginLeft = isMobile() ? 0 : (isSidebarOpen ? SIDEBAR_OPEN_W : SIDEBAR_CLOSE_W);

  return (
    <div className="min-h-screen bg-background text-gray-100 font-sans selection:bg-primary/30">

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={navigateTo}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main
        style={{ marginLeft: mainMarginLeft, transition: 'margin-left 300ms ease-in-out' }}
        className="min-h-screen relative overflow-x-hidden"
      >
        {/* Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 md:hidden flex items-center gap-3 px-4 py-3 bg-surface/95 backdrop-blur-md border-b border-white/10 shadow-lg">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="text-base font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex-1">
            SalesLens AI
          </span>
          {/* Mobile logout */}
          <button onClick={signOut} className="p-2 text-gray-500 hover:text-red-400 transition-all rounded-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>

        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 relative z-10">
          {renderPage()}
        </div>
      </main>

      {/* Org-setup modal — shown once after login when org is not set */}
      {session && userOrg === null && <OrgSetupModal />}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Root – wraps everything in AuthProvider
// ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
