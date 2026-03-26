import React, { useEffect } from 'react';
import {
  LayoutDashboard, Target, Briefcase, Mail, Lightbulb,
  Filter, BellRing, ChevronLeft, Menu, LogOut, User, History,
} from 'lucide-react';
import { SIDEBAR_OPEN_W } from '../layout';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ currentPage, setCurrentPage, isOpen, setIsOpen }) => {
  const { user, signOut } = useAuth();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handle = (e) => setIsOpen(!e.matches);
    setIsOpen(!mq.matches);
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, [setIsOpen]);

  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',           icon: LayoutDashboard },
    { id: 'deals',        label: 'Deals Management',    icon: Briefcase       },
    { id: 'intelligence', label: 'Deal Intelligence',   icon: Target          },
    { id: 'leads',        label: 'Lead Prioritization', icon: Filter          },
    { id: 'email',        label: 'Email Analyzer',      icon: Mail            },
    { id: 'insights',     label: 'AI Insights',         icon: Lightbulb       },
    { id: 'history',      label: 'My History',          icon: History         },
  ];

  const isMobileNow = typeof window !== 'undefined' && window.innerWidth < 768;
  const sidebarWidth = isMobileNow ? SIDEBAR_OPEN_W : (isOpen ? SIDEBAR_OPEN_W : 70);
  const translateX   = isMobileNow ? (isOpen ? 0 : -SIDEBAR_OPEN_W) : 0;

  return (
    <aside
      style={{
        width: sidebarWidth,
        transform: `translateX(${translateX}px)`,
        transition: 'transform 300ms ease-in-out, width 300ms ease-in-out',
      }}
      className="fixed top-0 left-0 z-50 h-screen bg-surface border-r border-white/5 flex flex-col"
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between h-[64px] px-4 border-b border-white/5 shrink-0">
        <div
          className="flex items-center gap-2 overflow-hidden transition-all duration-300"
          style={{ opacity: isOpen ? 1 : 0, maxWidth: isOpen ? 180 : 0 }}
        >
          <Target size={22} className="text-blue-400 shrink-0" />
          <span className="text-base font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
            SalesLens AI
          </span>
        </div>
        <button
          onClick={() => setIsOpen((p) => !p)}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl
            text-gray-400 hover:text-white hover:bg-white/8 border border-transparent
            hover:border-white/10 transition-all duration-300 ml-auto"
        >
          {isOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <nav className="flex-1 mt-3 space-y-1 overflow-y-auto overflow-x-hidden px-2">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => setCurrentPage(item.id)}
                className={`
                  w-full flex items-center rounded-xl text-sm font-semibold
                  transition-all duration-200
                  ${isOpen ? 'gap-3 px-3 py-3' : 'justify-center px-0 py-3'}
                  ${item.adminOnly
                    ? active
                      ? 'bg-red-500/20 text-red-400'
                      : 'text-red-400/60 hover:text-red-400 hover:bg-red-400/10'
                    : active
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <item.icon size={20} className={`shrink-0 ${active && !item.adminOnly ? 'animate-pulse' : ''}`} />
                <span
                  className="whitespace-nowrap overflow-hidden transition-all duration-300"
                  style={{ opacity: isOpen ? 1 : 0, maxWidth: isOpen ? 160 : 0 }}
                >
                  {item.label}
                  {item.adminOnly && (
                    <span className="ml-2 text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded font-bold uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                </span>
              </button>

              {/* Tooltip in collapsed mode */}
              {!isOpen && (
                <div className="
                  absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[100]
                  px-3 py-1.5 rounded-lg bg-gray-800 border border-white/10
                  text-white text-xs font-semibold whitespace-nowrap shadow-xl
                  opacity-0 pointer-events-none scale-95
                  group-hover:opacity-100 group-hover:scale-100
                  transition-all duration-200 hidden md:block
                ">
                  {item.label}
                  <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── User footer ─────────────────────────────────────────────── */}
      <div className="border-t border-white/5 shrink-0 p-3">
        {isOpen ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.email?.charAt(0).toUpperCase() || <User size={14}/>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {user?.email || 'Guest'}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                User
              </p>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
            >
              <LogOut size={15}/>
            </button>
          </div>
        ) : (
          <div className="relative group flex justify-center">
            <button
              onClick={signOut}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut size={18}/>
            </button>
            <div className="
              hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[100]
              px-3 py-1.5 rounded-lg bg-gray-800 border border-white/10
              text-white text-xs font-semibold whitespace-nowrap shadow-xl
              opacity-0 pointer-events-none scale-95
              group-hover:opacity-100 group-hover:scale-100 transition-all duration-200
            ">
              Sign out
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
