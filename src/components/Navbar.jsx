import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { 
  getAuth, 
  clearAuth, 
  isAuthenticated,
  getRole,
  getUserEmail,
  getUserDisplayName,
  getTheme,
  setTheme
} from '../utils/auth'

export default function Navbar() {
  const [dark, setDark] = useState(() => getTheme() === 'dark')
  const [authenticated, setAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.setAttribute('data-theme', 'dark')
      setTheme('dark')
    } else {
      root.removeAttribute('data-theme')
      setTheme('light')
    }
  }, [dark])

  useEffect(() => {
    // Check if user is authenticated
    const auth = getAuth()
    if (auth.access_token) {
      setAuthenticated(true)
      const userRole = getRole()
      setRole(userRole)
      
      const userEmail = getUserEmail() || 'User'
      setEmail(userEmail)

      // Set display name based on role
      const displayName = getUserDisplayName()
      setDisplayName(displayName)
    } else {
      setAuthenticated(false)
    }
  }, [])

  const handleLogout = () => {
    clearAuth()
    setAuthenticated(false)
    setShowProfileMenu(false)
    navigate('/auth')
  }

  return (
    <nav className="shadow-md bg-primary/10 fixed w-full z-50 bg-accent">
      <div className="container mx-auto p-4 flex items-center justify-between text-gray-200">
        <Link to="/" className="font-bold text-xl text-primary">DashHR</Link>
        
        <div className="space-x-4 flex items-center">
          {/* Navigation Links */}
          {!authenticated && (
            <>
              <Link to="/jobs" className="text-sm text-primaryhover:text-primary transition">Jobs</Link>
              <Link to="/auth" className="text-sm hover:text-primary transition">Login</Link>
            </>
          )}

          {authenticated && (
            <>
              <Link to="/jobs" className="text-sm text-primary hover:text-primary transition">Jobs</Link>
              {role === 'C' && <Link to="/dashboard" className="text-sm text-primary hover:text-primary transition">Dashboard</Link>}
              {role === 'R' && <Link to="/employer" className="text-sm text-primary hover:text-primary transition">Employer</Link>}
              {role === 'A' && <Link to="/admin" className="text-sm text-primary hover:text-primary transition">Admin</Link>}
            </>
          )}


          {/* Profile Section - Visible when authenticated */}
          {authenticated && (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 transition"
              >
                {/* Circular Avatar Placeholder */}
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <User size={18} />
                </div>
                <span className="text-sm font-medium text-muted truncate max-w-[100px]">{displayName}</span>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 card rounded-lg shadow-lg z-50">
                  <Link 
                    to="/profile"
                    className="block p-4 border-b border-light hover:bg-primary/5 transition"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <p className="text-sm font-semibold text-primary">{displayName}</p>
                    <p className="text-xs text-muted">{email}</p>
                  </Link>
                  {/* Theme Toggle */}
                  <button 
                    onClick={() => setDark((d) => !d)} 
                    className="w-full px-4 py-2 rounded text-sm text-left hover:bg-primary/10 transition"
                  >
                    {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
                  </button>
                  {/*logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50/20 flex items-center gap-2 transition border-t border-light"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
