import { jobs } from '../data/mock'

const KEY = 'dashhr_applications_v1'
const JOBS_KEY = 'dashhr_jobs_v1'

// Initialize jobs in localStorage if not already there
const initializeJobs = () => {
  if (!localStorage.getItem(JOBS_KEY)) {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs))
  }
}

export function getJobs() {
  initializeJobs()
  const stored = localStorage.getItem(JOBS_KEY)
  if (!stored) return jobs
  try {
    return JSON.parse(stored)
  } catch {
    return jobs
  }
}

export function saveJob(jobData) {
  initializeJobs()
  const all = getJobs()
  const newJob = {
    id: String(Date.now()),
    ...jobData,
    requirements: jobData.requirements ? jobData.requirements.split(',').map((r) => r.trim()) : [],
  }
  all.push(newJob)
  localStorage.setItem(JOBS_KEY, JSON.stringify(all))
  return newJob
}

export function getJobById(id) {
  return jobs.find((j) => j.id === id)
}

export function getApplications() {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveApplication(app) {
  const all = getApplications()
  all.push(app)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function updateApplicationStatus(id, status) {
  const all = getApplications()
  const idx = all.findIndex((a) => a.id === id)
  if (idx >= 0) {
    all[idx].status = status
    localStorage.setItem(KEY, JSON.stringify(all))
  }
}
