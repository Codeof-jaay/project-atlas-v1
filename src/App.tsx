import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Landing from './pages/Landing'
import Jobs from './pages/Jobs'
import JobDetails from './pages/JobDetails'
import Apply from './pages/Apply'
import Dashboard from './pages/Dashboard'
import Employer from './pages/Employer'
import Applicants from './pages/Applicants'
import Auth from './pages/Auth'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/apply/:jobId" element={<Apply />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employer" element={<Employer />} />
          <Route path="/employer/job/:id/applicants" element={<Applicants />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
    </div>
  )
}
