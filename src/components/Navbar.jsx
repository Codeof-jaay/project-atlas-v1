import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Briefcase, ChevronDown, Moon, Sun, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAuth, 
  clearAuth, 
  getRole,
  getUserEmail,
  getUserDisplayName,
  getTheme,
  setTheme
} from '../utils/auth';

export default function Navbar() {
  const [dark, setDark] = useState(() => getTheme() === 'dark');
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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
    const auth = getAuth();
    if (auth.access_token) {
      setAuthenticated(true);
      
      // Standardize role to match your routing ('C', 'R', or the full word depending on your utils)
      // If your utils returns 'candidate', we use that. If it returns 'C', we adapt.
      const currentRole = getRole();
      setRole(currentRole === 'C' ? 'candidate' : currentRole === 'R' ? 'employer' : currentRole);
      
      setEmail(getUserEmail() || 'User');
      setDisplayName(getUserDisplayName());
    } else {
      setAuthenticated(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const handleLogout = () => {
    clearAuth();
    setAuthenticated(false);
    setShowProfileMenu(false);
    navigate('/auth');
  };

  // Determine where the logo should route
  const homeRoute = authenticated ? (role === 'employer' ? '/employer' : '/dashboard') : '/';

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#12141C]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Smart Logo */}
        <Link to={homeRoute} className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <Briefcase className="text-white" size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">DashHR</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 mr-4">
            
            {/* Show Jobs only if not employer */}
            {role !== 'employer' && (
              <Link to="/jobs" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Jobs
              </Link>
            )}
            
            {!authenticated && (
              <Link to="/auth" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity">
                Login
              </Link>
            )}

            {/* Highlighted Return to Dashboard Button */}
            {authenticated && (
              <Link 
                to={homeRoute} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
              >
                Go to Dashboard
              </Link>
            )}
          </div>

          {/* Profile Section */}
          {authenticated && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <User size={14} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate hidden sm:block">
                  {displayName}
                </span>
                <ChevronDown 
                  size={14} 
                  className={`text-slate-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#1A1D27] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden origin-top-right"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{email}</p>
                      <div className="mt-2 inline-block px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        {role}
                      </div>
                    </div>

                    <div className="p-2">
                      {/* Theme Toggle */}
                      <button 
                        onClick={() => setDark((d) => !d)} 
                        className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-left flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          {dark ? <Sun size={16} className="text-amber-400"/> : <Moon size={16} className="text-slate-400"/>}
                          {dark ? 'Light Mode' : 'Dark Mode'}
                        </span>
                      </button>

                      {/* Mobile Links */}
                      <div className="md:hidden border-t border-gray-100 dark:border-white/5 my-1"></div>
                      {role !== 'employer' && (
                        <Link to="/jobs" className="md:hidden w-full px-3 py-2.5 rounded-xl text-sm font-medium flex items-center text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" onClick={() => setShowProfileMenu(false)}>
                          Jobs
                        </Link>
                      )}
                      <Link to={homeRoute} className="md:hidden w-full px-3 py-2.5 rounded-xl text-sm font-medium flex items-center text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" onClick={() => setShowProfileMenu(false)}>
                        Dashboard
                      </Link>
                      
                      <div className="border-t border-gray-100 dark:border-white/5 my-1"></div>
                      
                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-left flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}