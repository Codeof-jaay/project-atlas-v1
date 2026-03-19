import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Jobs from './pages/Jobs'
import JobDetails from './pages/JobDetails'
import Apply from './pages/Apply'
import Dashboard from './pages/Dashboard'
import Employer from './pages/Employer'
import Applicants from './pages/Applicants'
import AuthPage from './pages/AuthPage'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './pages/Profile'
import { getAuth, setAuth, clearAuth } from './utils/auth'

export default function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { access_token, refresh_token, role: userRole } = getAuth();
    
    // If no tokens, user is not authenticated
    if (!access_token || !refresh_token) {
      setRole(null);
      setLoading(false);
      return;
    }

    // Set current role
    setRole(userRole);
    setLoading(false);

    // Optional: Add token expiry check and refresh logic here in the future
    // For now, we rely on backend to validate token on protected endpoints
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--bg))', color: 'rgb(var(--text))' }}>
      <Navbar />
      <main className="container mx-auto p-4">
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/:mode" element={<AuthPage />} />

          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/apply/:jobId" element={<Apply />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employer" element={<Employer />} />
            <Route path="/employer/job/:id/applicants" element={<Applicants />} />
          </Route>

          {/* Catch-all: redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}