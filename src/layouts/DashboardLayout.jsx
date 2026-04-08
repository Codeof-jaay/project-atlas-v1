import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, Settings, Moon, Sun, Menu, X, Briefcase } from 'lucide-react';
import { clearAuth, getTheme, setTheme } from '../utils/auth';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('dashhr_role'); // 'C', 'R', 'candidate', 'employer'
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Theme state
  const [dark, setDark] = useState(() => getTheme() === 'dark' || document.documentElement.classList.contains('dark'));

  // Handle Theme Toggle
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
      setTheme('dark');
    } else {
      root.removeAttribute('data-theme');
      root.classList.remove('dark');
      setTheme('light');
    }
  }, [dark]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    navigate('/'); 
  };

  const isEmployer = role === 'R' || role === 'employer';
  const homeRoute = isEmployer ? '/employer' : '/dashboard';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0A0C10] overflow-hidden">
      
      {/* MOBILE HEADER (Only visible on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#12141C] border-b border-slate-200 dark:border-slate-800 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">D</div>
          <span className="text-xl font-bold">DashHR</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-300">
          <Menu size={24} />
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION (Desktop & Mobile Slide-out) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#12141C] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Sidebar Header */}
        <div className="h-16 md:h-auto p-4 md:p-6 flex items-center justify-between border-b md:border-none border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">D</div>
            <span className="text-xl font-bold hidden md:block">DashHR</span>
          </div>
          {/* Mobile Close Button */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-slate-500">
            <X size={24} />
          </button>
        </div>

        {/* Main Links */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <Link 
            to={homeRoute} 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
              location.pathname === homeRoute 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </Link>

          {!isEmployer && (
            <Link 
              to="/applications" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                location.pathname === '/applications' 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Briefcase size={20} /> My Applications
            </Link>
          )}

          <Link 
            to="/profile" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
              location.pathname === '/profile' 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <User size={20} /> My Profile
          </Link>
        </nav>

        {/* Bottom Actions (Theme & Logout) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          
          <button 
            onClick={() => setDark(!dark)}
            className="flex items-center justify-between px-3 py-2.5 w-full rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors font-medium"
          >
            <span className="flex items-center gap-3">
              {dark ? <Sun size={20} className="text-amber-400"/> : <Moon size={20} />} 
              Theme
            </span>
            <span className="text-xs uppercase tracking-wider opacity-60">{dark ? 'Dark' : 'Light'}</span>
          </button>

          <Link 
            to="/profile" 
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors font-medium"
          >
            <Settings size={20} /> Settings
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors font-medium"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;