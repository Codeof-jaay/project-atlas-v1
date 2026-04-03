import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, getRole } from '../utils/auth';

export default function ProtectedRoute({ allowedRoles = [], requireOnboarding = false }) {
  const location = useLocation();
  const isAuth = isAuthenticated();
  
  // Assuming getRole() returns 'C' (Candidate), 'R' (Employer), or 'A' (Admin)
  const userRole = getRole(); 
  
  // Read onboarding status from local storage (set during Auth)
  const onboardingCompleted = localStorage.getItem('dashhr_onboarding_completed') === 'true';

  // 1. Authentication Check
  if (!isAuth) {
    // Send them to login, but remember where they wanted to go
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 2. Role-Based Access Check
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // If they try to access the wrong portal, bounce them to their correct home
    const defaultRoute = userRole === 'C' ? '/dashboard' : userRole === 'R' ? '/employer' : '/';
    return <Navigate to={defaultRoute} replace />;
  }

  // 3. Onboarding Check
  // Prevent access to dashboards if their profile is incomplete
  if (requireOnboarding && !onboardingCompleted) {
    const onboardingRoute = userRole === 'C' ? '/onboarding/candidate' : '/onboarding/employer';
    // Prevent infinite loops if they are already on the onboarding page
    if (!location.pathname.includes('/onboarding')) {
      return <Navigate to={onboardingRoute} replace />;
    }
  }

  // 4. Authorized -> Render the protected content
  return <Outlet />;
}