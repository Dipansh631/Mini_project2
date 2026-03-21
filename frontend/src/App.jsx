import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DealIntelligence from './pages/DealIntelligence';
import DealsManagement from './pages/DealsManagement';
import EmailAnalyzer from './pages/EmailAnalyzer';
import Insights from './pages/Insights';
import Leads from './pages/Leads';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  // Sidebar open/close state – lifted here so main content can react to it
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':    return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'deals':        return <DealsManagement />;
      case 'intelligence': return <DealIntelligence />;
      case 'email':        return <EmailAnalyzer />;
      case 'insights':     return <Insights />;
      case 'leads':        return <Leads />;
      default:             return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-gray-100 flex font-sans selection:bg-primary/30">
      {/* Sidebar – controls its own width; parent only passes state */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/*
        Main content – left margin mirrors sidebar width so nothing is hidden.
        transition-all duration-300 keeps it in sync with the sidebar animation.
      */}
      <main
        className={`
          flex-1 min-h-screen relative overflow-x-hidden
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'ml-[240px]' : 'ml-[70px]'}
        `}
      >
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-[1600px] mx-auto p-8 lg:p-12 relative z-10">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
