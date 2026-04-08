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

// Components, Layouts & Utils
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout'; // <--- NEW IMPORT
import { getAuth, ROLES, isAuthenticated, getRole } from './utils/auth';

// A simple layout wrapper that conditionally hides the Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  
  // 1. We added dashboard paths here so the global top navbar disappears 
  // when the DashboardLayout sidebar is on the screen!
  const dashboardPaths = ['/dashboard', '/applications', '/apply', '/employer', '/profile'];
  const isDashboardRoute = dashboardPaths.some(path => location.pathname.startsWith(path));
  
  const hideNavbarRoutes = ['/auth', '/onboarding/candidate', '/onboarding/employer'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname) || isDashboardRoute;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0C10] text-slate-900 dark:text-white transition-colors duration-300 font-sans flex flex-col">
      {!shouldHideNavbar && <Navbar />}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
};

// Route Guard Component: Protects public pages from logged-in users
const PublicOnlyRoute = ({ children }) => {
  const isAuth = isAuthenticated();
  const userRole = getRole();
  
  if (isAuth) {
    const defaultRoute = userRole === 'C' ? '/dashboard' : userRole === 'R' ? '/employer' : '/';
    return <Navigate to={defaultRoute} replace />;
  }
  
  return children;
};

// Route Guard for Jobs page: Employers cannot access job listings
const JobsAccessRoute = ({ children }) => {
  const isAuth = isAuthenticated();
  const userRole = getRole();
  
  if (isAuth && userRole === 'R') {
    return <Navigate to="/employer" replace />;
  }
  
  return children;
};

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />
        <Route path="/auth" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
        
        {/* Job Listings - Blocked for employers */}
        <Route path="/jobs" element={<JobsAccessRoute><Jobs /></JobsAccessRoute>} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        {/* Semi-Protected: Requires Auth, but specific to onboarding flow */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.CANDIDATE]} requireOnboarding={false} />}>
          <Route path="/onboarding/candidate" element={<OnboardingCandidate />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYER]} requireOnboarding={false} />}>
          <Route path="/onboarding/employer" element={<OnboardingEmployer />} />
        </Route>

        {/* ========================================== */}
        {/* NEW: DASHBOARD LAYOUT WRAPPER              */}
        {/* ========================================== */}
        <Route element={<DashboardLayout />}>
          
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

        </Route>
        {/* ========================================== */}

        {/* Catch-all: Redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}