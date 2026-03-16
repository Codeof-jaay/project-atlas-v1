import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [dark, setDark] = useState(() => localStorage.getItem('dashhr_theme') === 'dark')

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.setAttribute('data-theme', 'dark')
      localStorage.setItem('dashhr_theme', 'dark')
    } else {
      root.removeAttribute('data-theme')
      localStorage.setItem('dashhr_theme', 'light')
    }
  }, [dark])

  return (
    <nav className="shadow-md bg-primary/10">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-primary">DashHR</Link>
        <div className="space-x-4 flex items-center">
          <Link to="/jobs" className="text-sm text-muted">Jobs</Link>
          <Link to="/dashboard" className="text-sm text-muted">Dashboard</Link>
          <Link to="/employer" className="text-sm text-muted">Employer</Link>
          <Link to="/auth/:mode" className="text-sm text-muted">Login</Link>
          <button onClick={() => setDark((d) => !d)} className="ml-3 px-2 py-1 border rounded text-sm">
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </nav>
  )
}
