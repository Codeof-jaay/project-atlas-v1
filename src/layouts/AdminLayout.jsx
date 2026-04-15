import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, LineChart, ClipboardList, 
  Menu, X, LogOut, Moon, Sun, ShieldAlert 
} from 'lucide-react';
import { getRole, clearAuth, getTheme, setTheme } from '../utils/auth';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => getTheme() === 'dark' || document.documentElement.classList.contains('dark'));

  // Security Check: Only Admins allowed
  useEffect(() => {
    const role = getRole();
    if (role !== 'A' && role !== 'admin') {
      navigate('/auth');
    }
  }, [navigate]);

  // Theme Toggle Logic
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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuth();
    navigate('/auth');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Jobs Approvals', path: '/admin/jobs', icon: Briefcase },
    { name: 'Analytics', path: '/admin/analytics', icon: LineChart },
    { name: 'Audit Logs', path: '/admin/logs', icon: ClipboardList },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0A0C10] overflow-hidden">
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#12141C] border-b border-slate-200 dark:border-white/10 z-50 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
          <ShieldAlert size={24} /> Admin Portal
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-300">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#12141C] border-r border-slate-200 dark:border-white/10 flex flex-col transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 lg:h-20 p-6 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xl tracking-tight">
            <ShieldAlert size={28} /> DashHR Admin
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-500">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.name}
                to={link.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-500/20' 
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                <link.icon size={20} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} /> 
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-2">
          <button onClick={() => setDark(!dark)} className="flex items-center justify-between px-4 py-3 w-full rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 transition-colors font-bold">
            <span className="flex items-center gap-3">
              {dark ? <Sun size={20} className="text-amber-400"/> : <Moon size={20} />} Theme
            </span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors font-bold border border-transparent dark:hover:border-red-500/20">
            <LogOut size={20} /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
}