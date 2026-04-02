import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, getRole } from '../utils/auth';

export default function ProtectedRoute({ allowedRoles = [], requireOnboarding = false }) {
  const location = useLocation();
  const isAuth = isAuthenticated();
  const userRole = getRole(); 
  const onboardingCompleted = localStorage.getItem('dashhr_onboarding_completed') === 'true';

  // 1. Authentication Check
  if (!isAuth) {
    console.log('[ProtectedRoute] User not authenticated, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 2. Role-Based Access Check
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.log('[ProtectedRoute] User role', userRole, 'not in allowed roles', allowedRoles);
    const defaultRoute = userRole === 'C' ? '/dashboard' : userRole === 'R' ? '/employer' : '/';
    return <Navigate to={defaultRoute} replace />;
  }

  // 3. Onboarding Check
  if (requireOnboarding && !onboardingCompleted) {
    console.log('[ProtectedRoute] Onboarding not completed, redirecting to onboarding');
    if (!location.pathname.includes('/onboarding')) {
      const onboardingRoute = userRole === 'C' ? '/onboarding/candidate' : '/onboarding/employer';
      return <Navigate to={onboardingRoute} replace />;
    }
  }

  // 4. Authorized -> Render the protected content
  console.log('[ProtectedRoute] Access granted to', location.pathname);
  return <Outlet />;
}