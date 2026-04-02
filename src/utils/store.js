import { jobs as mockJobs } from '../data/mock';

// Storage Keys
const APPS_KEY = 'dashhr_applications_v1';
const JOBS_KEY = 'dashhr_jobs_v1';

// ============================================================================
// Initialization
// ============================================================================

/**
 * Ensures the local "database" is seeded with mock data on first load.
 */
const initializeStore = () => {
  if (!localStorage.getItem(JOBS_KEY)) {
    localStorage.setItem(JOBS_KEY, JSON.stringify(mockJobs));
  }
  if (!localStorage.getItem(APPS_KEY)) {
    localStorage.setItem(APPS_KEY, JSON.stringify([]));
  }
};

// ============================================================================
// Jobs API
// ============================================================================

export function getJobs() {
  initializeStore();
  const stored = localStorage.getItem(JOBS_KEY);
  if (!stored) return mockJobs;
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error parsing jobs from local storage:", error);
    return mockJobs;
  }
}

export function getJobById(id) {
  // CRITICAL FIX: Must search the full local storage list, not just the static mock file
  const allJobs = getJobs();
  return allJobs.find((j) => j.id === id) || null;
}

export function saveJob(jobData) {
  initializeStore();
  const allJobs = getJobs();
  
  const newJob = {
    id: String(Date.now()), // Generate a simple unique ID
    ...jobData,
    isVerified: true, // Assuming the employer passed onboarding
    postedAt: new Date().toISOString(),
  };
  
  allJobs.push(newJob);
  localStorage.setItem(JOBS_KEY, JSON.stringify(allJobs));
  
  return newJob;
}

export function deleteJob(id) {
  const allJobs = getJobs();
  const filteredJobs = allJobs.filter((j) => j.id !== id);
  localStorage.setItem(JOBS_KEY, JSON.stringify(filteredJobs));
  
  // Note: In a real DB, you'd probably also want to cascade delete or archive 
  // the applications associated with this job.
}

// ============================================================================
// Applications API
// ============================================================================

export function getApplications() {
  initializeStore();
  const stored = localStorage.getItem(APPS_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error parsing applications from local storage:", error);
    return [];
  }
}

export function saveApplication(appData) {
  initializeStore();
  const allApps = getApplications();
  
  const newApp = {
    ...appData,
    appliedAt: new Date().toISOString(),
    // status is expected to be passed in ('Applied')
  };
  
  allApps.push(newApp);
  localStorage.setItem(APPS_KEY, JSON.stringify(allApps));
  
  return newApp;
}

export function updateApplicationStatus(id, newStatus) {
  const allApps = getApplications();
  const appIndex = allApps.findIndex((a) => a.id === id);
  
  if (appIndex >= 0) {
    allApps[appIndex].status = newStatus;
    allApps[appIndex].lastUpdated = new Date().toISOString();
    localStorage.setItem(APPS_KEY, JSON.stringify(allApps));
    return true;
  }
  
  return false;
}