import { jobs } from '../data/mock'
import type { Application } from '../data/mock'

const KEY = 'dashhr_applications_v1'

export function getJobs() {
  return jobs
}

export function getJobById(id: string) {
  return jobs.find((j) => j.id === id)
}

export function getApplications(): Application[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveApplication(app: Application) {
  const all = getApplications()
  all.push(app)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function updateApplicationStatus(id: string, status: string) {
  const all = getApplications()
  const idx = all.findIndex((a) => a.id === id)
  if (idx >= 0) {
    all[idx].status = status
    localStorage.setItem(KEY, JSON.stringify(all))
  }
}
