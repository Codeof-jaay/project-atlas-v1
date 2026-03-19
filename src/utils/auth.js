/**
 * Consolidated Auth Utility Module
 * Manages authentication state, tokens, user info, and role-based access
 * 
 * Storage Keys:
 * - dashhr_auth: Main auth object (access_token, refresh_token, role)
 * - dashhr_user_email: User's email
 * - dashhr_full_name: Candidate's full name
 * - dashhr_company_name: Employer's company name
 * - dashhr_joined_at: Account creation date
 * - dashhr_theme: Light/dark theme preference
 */

// ============================================================================
// Core Auth Functions
// ============================================================================

/**
 * Get authentication data from localStorage
 * @returns {Object} Auth object with access_token, refresh_token, role
 */
export const getAuth = () => {
  try {
    const auth = localStorage.getItem('dashhr_auth');
    if (!auth) return { access_token: null, refresh_token: null, role: null };
    return JSON.parse(auth);
  } catch (error) {
    console.error('Failed to parse auth from localStorage:', error);
    return { access_token: null, refresh_token: null, role: null };
  }
};

/**
 * Set authentication data in localStorage
 * @param {Object} authData - Object with access_token, refresh_token, role
 */
export const setAuth = (authData) => {
  try {
    localStorage.setItem('dashhr_auth', JSON.stringify(authData));
  } catch (error) {
    console.error('Failed to save auth to localStorage:', error);
  }
};

/**
 * Clear all authentication and theme data from localStorage
 */
export const clearAuth = () => {
  try {
    localStorage.removeItem('dashhr_auth');
    localStorage.removeItem('dashhr_user_email');
    localStorage.removeItem('dashhr_full_name');
    localStorage.removeItem('dashhr_company_name');
    localStorage.removeItem('dashhr_joined_at');
    localStorage.removeItem('dashhr_theme');
  } catch (error) {
    console.error('Failed to clear auth from localStorage:', error);
  }
};

// ============================================================================
// Authentication Status & Role Functions
// ============================================================================

/**
 * Check if user is authenticated
 * @returns {Boolean} True if valid access token exists
 */
export const isAuthenticated = () => {
  const { access_token } = getAuth();
  return !!access_token;
};

/**
 * Get user's role
 * @returns {String|null} 'C' (Candidate), 'R' (Recruiter), 'A' (Admin), or null
 */
export const getRole = () => {
  const { role } = getAuth();
  return role;
};

/**
 * Check if user has a specific role
 * @param {String} roleToCheck - Role to check against
 * @returns {Boolean} True if user's role matches
 */
export const hasRole = (roleToCheck) => {
  const role = getRole();
  return role === roleToCheck;
};

// ============================================================================
// User Info Functions
// ============================================================================

/**
 * Get user's email
 * @returns {String|null} User's email or null
 */
export const getUserEmail = () => {
  return localStorage.getItem('dashhr_user_email') || null;
};

/**
 * Set user's email
 * @param {String} email - User's email address
 */
export const setUserEmail = (email) => {
  try {
    localStorage.setItem('dashhr_user_email', email);
  } catch (error) {
    console.error('Failed to save user email:', error);
  }
};

/**
 * Get user's display name based on role
 * @returns {String} Candidate name, Company name, 'Admin', or 'User'
 */
export const getUserDisplayName = () => {
  const role = getRole();
  
  if (role === 'A') return 'Admin';
  if (role === 'R') return localStorage.getItem('dashhr_company_name') || 'Company';
  if (role === 'C') return localStorage.getItem('dashhr_full_name') || 'Candidate';
  
  return 'User';
};

/**
 * Get candidate's full name
 * @returns {String|null} Full name or null
 */
export const getCandidateName = () => {
  return localStorage.getItem('dashhr_full_name') || null;
};

/**
 * Set candidate's full name
 * @param {String} name - Candidate's full name
 */
export const setCandidateName = (name) => {
  try {
    localStorage.setItem('dashhr_full_name', name);
  } catch (error) {
    console.error('Failed to save candidate name:', error);
  }
};

/**
 * Get employer's company name
 * @returns {String|null} Company name or null
 */
export const getCompanyName = () => {
  return localStorage.getItem('dashhr_company_name') || null;
};

/**
 * Set employer's company name
 * @param {String} name - Company name
 */
export const setCompanyName = (name) => {
  try {
    localStorage.setItem('dashhr_company_name', name);
  } catch (error) {
    console.error('Failed to save company name:', error);
  }
};

/**
 * Get account join date
 * @returns {String} Join date or current date
 */
export const getJoinedDate = () => {
  return localStorage.getItem('dashhr_joined_at') || new Date().toLocaleDateString();
};

/**
 * Set account join date
 * @param {String} date - Join date
 */
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

/**
 * Get current theme preference
 * @returns {String} 'light' or 'dark'
 */
export const getTheme = () => {
  return localStorage.getItem('dashhr_theme') || 'light';
};

/**
 * Set theme preference
 * @param {String} theme - 'light' or 'dark'
 */
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

/**
 * Check if current user is a Candidate
 * @returns {Boolean}
 */
export const isCandidate = () => hasRole('C');

/**
 * Check if current user is a Recruiter/Employer
 * @returns {Boolean}
 */
export const isRecruiter = () => hasRole('R');

/**
 * Check if current user is an Admin
 * @returns {Boolean}
 */
export const isAdmin = () => hasRole('A');

/**
 * Check if user has access to a specific route based on role
 * @param {String} routeRole - Required role for the route
 * @returns {Boolean} True if user has access
 */
export const hasRouteAccess = (routeRole) => {
  const userRole = getRole();
  if (!userRole) return false;
  
  // Define role access levels
  const accessMatrix = {
    'C': ['C'], // Candidate can only access C routes
    'R': ['R'], // Recruiter can only access R routes
    'A': ['A', 'R', 'C'], // Admin can access all
  };
  
  return accessMatrix[userRole]?.includes(routeRole) || false;
};
