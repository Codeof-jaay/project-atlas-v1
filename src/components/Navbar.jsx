import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">DashHR</Link>
        <div className="space-x-4">
          <Link to="/jobs" className="text-sm text-gray-700">Jobs</Link>
          <Link to="/dashboard" className="text-sm text-gray-700">Dashboard</Link>
          <Link to="/employer" className="text-sm text-gray-700">Employer</Link>
          <Link to="/auth" className="text-sm text-gray-700">Login</Link>
        </div>
      </div>
    </nav>
  )
}
