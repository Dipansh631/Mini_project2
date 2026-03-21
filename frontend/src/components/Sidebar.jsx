import React, { useEffect, useRef } from 'react';
import {
  LayoutDashboard, Target, Briefcase, Mail, Lightbulb,
  Filter, BellRing, ChevronLeft, ChevronRight, Menu,
} from 'lucide-react';

/**
 * Sidebar
 * Props:
 *   currentPage   – active page id
 *   setCurrentPage – page navigation setter
 *   isOpen        – boolean, controlled by parent (App.jsx)
 *   setIsOpen     – state setter passed from parent
 */
const Sidebar = ({ currentPage, setCurrentPage, isOpen, setIsOpen }) => {
  const sidebarRef = useRef(null);

  // ── Auto-collapse on small screens ─────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handleChange = (e) => {
      if (e.matches) setIsOpen(false);
      else setIsOpen(true);
    };
    // Set initial state based on current viewport
    if (mq.matches) setIsOpen(false);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [setIsOpen]);

  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',          icon: LayoutDashboard },
    { id: 'deals',        label: 'Deals Management',   icon: Briefcase       },
    { id: 'intelligence', label: 'Deal Intelligence',  icon: Target          },
    { id: 'leads',        label: 'Lead Prioritization', icon: Filter         },
    { id: 'email',        label: 'Email Analyzer',     icon: Mail            },
    { id: 'insights',     label: 'AI Insights',        icon: Lightbulb       },
  ];

  return (
    <aside
      ref={sidebarRef}
      className={`
        fixed top-0 left-0 z-50 h-screen
        bg-surface border-r border-white/5
        flex flex-col
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-[240px]' : 'w-[70px]'}
      `}
    >
      {/* ── Header / Logo ─────────────────────────────────────────────── */}
      <div className={`flex items-center h-[72px] border-b border-white/5 shrink-0 ${isOpen ? 'px-5 justify-between' : 'px-0 justify-center'}`}>
        {/* Logo – hidden when collapsed */}
        <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
          <Target size={22} className="text-blue-400 shrink-0" />
          <span className="text-lg font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
            SalesLens AI
          </span>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className={`
            flex items-center justify-center rounded-xl
            w-9 h-9 shrink-0
            text-gray-400 hover:text-white
            bg-white/0 hover:bg-white/8
            border border-transparent hover:border-white/10
            transition-all duration-300
            ${!isOpen && 'mx-auto'}
          `}
        >
          {isOpen
            ? <ChevronLeft size={18} />
            : <Menu size={18} />
          }
        </button>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className={`flex-1 mt-4 space-y-1 overflow-hidden ${isOpen ? 'px-3' : 'px-2'}`}>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => setCurrentPage(item.id)}
                className={`
                  w-full flex items-center rounded-xl
                  transition-all duration-300
                  text-sm font-semibold
                  ${isOpen ? 'gap-3 px-4 py-3' : 'justify-center px-0 py-3'}
                  ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 translate-x-0.5'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-0.5'
                  }
                `}
              >
                <item.icon
                  size={20}
                  className={`shrink-0 ${isActive ? 'animate-pulse' : ''}`}
                />
                {/* Label – fades out when collapsed */}
                <span
                  className={`
                    whitespace-nowrap overflow-hidden
                    transition-all duration-300
                    ${isOpen ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}
                  `}
                >
                  {item.label}
                </span>
              </button>

              {/* Tooltip shown in collapsed mode */}
              {!isOpen && (
                <div
                  className="
                    absolute left-full top-1/2 -translate-y-1/2 ml-3
                    px-3 py-1.5 rounded-lg
                    bg-gray-800 border border-white/10
                    text-white text-xs font-semibold whitespace-nowrap
                    shadow-xl
                    opacity-0 pointer-events-none scale-95
                    group-hover:opacity-100 group-hover:scale-100
                    transition-all duration-200
                    z-[100]
                  "
                >
                  {item.label}
                  {/* Arrow */}
                  <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Alert footer ──────────────────────────────────────────────── */}
      <div className={`border-t border-white/5 shrink-0 ${isOpen ? 'p-4' : 'p-2'}`}>
        {isOpen ? (
          /* Full alert card when expanded */
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 cursor-pointer hover:bg-primary/10 transition-all shadow-inner">
            <div className="flex items-center gap-2 text-primary font-bold mb-2 text-sm">
              <BellRing size={15} className="animate-bounce shrink-0" />
              Alerts
            </div>
            <p className="text-xs text-gray-300 leading-relaxed truncate">
              Negative sentiment detected in recent Acme Corp communication.
            </p>
          </div>
        ) : (
          /* Icon-only alert badge when collapsed */
          <div className="relative group flex justify-center">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl text-primary hover:bg-primary/10 transition-all duration-300 relative">
              <BellRing size={20} className="animate-bounce" />
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-sm shadow-red-500/50" />
            </button>
            {/* Tooltip */}
            <div className="
              absolute left-full top-1/2 -translate-y-1/2 ml-3
              px-3 py-1.5 rounded-lg
              bg-gray-800 border border-white/10
              text-white text-xs font-semibold whitespace-nowrap
              shadow-xl
              opacity-0 pointer-events-none scale-95
              group-hover:opacity-100 group-hover:scale-100
              transition-all duration-200 z-[100]
            ">
              Alerts – 1 new
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
