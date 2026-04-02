import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Pages
import Landing from './pages/Landing';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Apply from './pages/Apply';
import Dashboard from './pages/Dashboard';
import Employer from './pages/Employer';
import Applicants from './pages/Applicants';
import AuthPage from './pages/AuthPage';
import OnboardingCandidate from './pages/OnboardingCandidate';
import OnboardingEmployer from './pages/OnboardingEmployer';
import Profile from './pages/Profile';
import MyApplications from './pages/MyApplications';

// Components & Utils
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { getAuth, ROLES } from './utils/auth';

// A simple layout wrapper that conditionally hides the Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ['/auth', '/onboarding/candidate', '/onboarding/employer'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0C10] text-slate-900 dark:text-white transition-colors duration-300 font-sans flex flex-col">
      {!shouldHideNavbar && <Navbar />}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial auth check to prevent flicker
    const { access_token } = getAuth();
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        {/* Semi-Protected: Requires Auth, but specific to onboarding flow */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.CANDIDATE]} requireOnboarding={false} />}>
          <Route path="/onboarding/candidate" element={<OnboardingCandidate />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYER]} requireOnboarding={false} />}>
          <Route path="/onboarding/employer" element={<OnboardingEmployer />} />
        </Route>

        {/* Protected Routes: Require Auth + Specific Role + Completed Onboarding 
        */}
        
        {/* Candidate Only Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.CANDIDATE]} requireOnboarding={true} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<MyApplications />} />
          <Route path="/apply/:jobId" element={<Apply />} />
        </Route>

        {/* Employer Only Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYER]} requireOnboarding={true} />}>
          <Route path="/employer" element={<Employer />} />
          <Route path="/employer/job/:id/applicants" element={<Applicants />} />
        </Route>

        {/* Shared Protected Routes (Candidate or Employer) */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.CANDIDATE, ROLES.EMPLOYER]} requireOnboarding={false} />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Catch-all: Redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}