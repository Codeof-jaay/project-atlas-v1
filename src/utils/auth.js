/**
 * Consolidated Auth Utility Module
 * Manages authentication state, tokens, user info, and role-based access
 */

// Define standard role codes matching the backend
export const ROLES = {
  CANDIDATE: 'C',
  EMPLOYER: 'R', // Recruiter
  ADMIN: 'A'
};

// ============================================================================
// Core Auth Functions
// ============================================================================

export const getAuth = () => {
  try {
    const authString = localStorage.getItem('dashhr_auth');
    if (!authString) return { access_token: null, refresh_token: null, role: null };
    return JSON.parse(authString);
  } catch (error) {
    console.error('Failed to parse auth from localStorage:', error);
    return { access_token: null, refresh_token: null, role: null };
  }
};

export const setAuth = (authData) => {
  try {
    localStorage.setItem('dashhr_auth', JSON.stringify(authData));
  } catch (error) {
    console.error('Failed to save auth to localStorage:', error);
  }
};

export const clearAuth = () => {
  try {
    // Core Auth
    localStorage.removeItem('dashhr_auth');
    localStorage.removeItem('dashhr_user_email');
    localStorage.removeItem('dashhr_onboarding_completed');
    
    // User Identity
    localStorage.removeItem('dashhr_full_name');
    localStorage.removeItem('dashhr_company_name');
    localStorage.removeItem('dashhr_joined_at');
    
    // Employer Specific
    localStorage.removeItem('dashhr_company_size');
    localStorage.removeItem('dashhr_company_industry');
    localStorage.removeItem('dashhr_company_description');
    
    // Candidate Specific
    localStorage.removeItem('dashhr_candidate_skills');
    localStorage.removeItem('dashhr_candidate_experience');
    localStorage.removeItem('dashhr_candidate_education');
    localStorage.removeItem('dashhr_candidate_bio');

    // Note: Intentionally leaving 'dashhr_theme' so their dark mode preference persists
  } catch (error) {
    console.error('Failed to clear auth from localStorage:', error);
  }
};

// ============================================================================
// Authentication Status & Role Functions
// ============================================================================

export const isAuthenticated = () => {
  const { access_token } = getAuth();
  return !!access_token;
};

export const getRole = () => {
  const { role } = getAuth();
  return role;
};

export const hasRole = (roleToCheck) => {
  return getRole() === roleToCheck;
};

export const getRoleDisplayName = () => {
  const role = getRole();
  const roleMap = {
    [ROLES.CANDIDATE]: 'Candidate',
    [ROLES.EMPLOYER]: 'Employer',
    [ROLES.ADMIN]: 'Administrator'
  };
  return roleMap[role] || 'Unknown';
};

// ============================================================================
// User Info Functions
// ============================================================================

export const getUserEmail = () => {
  return localStorage.getItem('dashhr_user_email') || null;
};

export const setUserEmail = (email) => {
  try {
    localStorage.setItem('dashhr_user_email', email);
  } catch (error) {
    console.error('Failed to save user email:', error);
  }
};

export const getUserDisplayName = () => {
  const role = getRole();
  
  if (role === ROLES.ADMIN) return 'Administrator';
  if (role === ROLES.EMPLOYER) return localStorage.getItem('dashhr_company_name') || 'Company Profile';
  if (role === ROLES.CANDIDATE) return localStorage.getItem('dashhr_full_name') || 'Candidate Profile';
  
  return 'User';
};

export const getCandidateName = () => localStorage.getItem('dashhr_full_name') || null;

export const setCandidateName = (name) => {
  try {
    localStorage.setItem('dashhr_full_name', name);
  } catch (error) {
    console.error('Failed to save candidate name:', error);
  }
};

export const getCompanyName = () => localStorage.getItem('dashhr_company_name') || null;

export const setCompanyName = (name) => {
  try {
    localStorage.setItem('dashhr_company_name', name);
  } catch (error) {
    console.error('Failed to save company name:', error);
  }
};

export const getJoinedDate = () => {
  return localStorage.getItem('dashhr_joined_at') || new Date().toLocaleDateString();
};

export const setJoinedDate = (date) => {
  try {
    localStorage.setItem('dashhr_joined_at', date);
  } catch (error) {
    console.error('Failed to save joined date:', error);
  }
};

// ============================================================================
// Theme Functions
// ============================================================================

export const getTheme = () => localStorage.getItem('dashhr_theme') || 'light';

export const setTheme = (theme) => {
  try {
    localStorage.setItem('dashhr_theme', theme);
  } catch (error) {
    console.error('Failed to save theme:', error);
  }
};

// ============================================================================
// Access Control Functions
// ============================================================================

export const isCandidate = () => hasRole(ROLES.CANDIDATE);
export const isRecruiter = () => hasRole(ROLES.EMPLOYER);
export const isAdmin = () => hasRole(ROLES.ADMIN);

export const hasRouteAccess = (routeRole) => {
  const userRole = getRole();
  if (!userRole) return false;
  
  const accessMatrix = {
    [ROLES.CANDIDATE]: [ROLES.CANDIDATE], 
    [ROLES.EMPLOYER]: [ROLES.EMPLOYER], 
    [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.EMPLOYER, ROLES.CANDIDATE], 
  };
  
  return accessMatrix[userRole]?.includes(routeRole) || false;
};