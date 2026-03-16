import { jobs } from '../data/mock'

const KEY = 'dashhr_applications_v1'

export function getJobs() {
  return jobs
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
