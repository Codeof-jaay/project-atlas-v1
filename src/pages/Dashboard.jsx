import React from 'react'
import { getApplications, getJobs } from '../utils/store'

export default function Dashboard() {
  const apps = getApplications()
  const jobs = getJobs()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Candidate Dashboard</h1>
      {apps.length === 0 ? (
        <div>No applications yet.</div>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => {
            const job = jobs.find((j) => j.id === a.jobId)
            return (
              <div key={a.id} className="p-3 bg-white border rounded">
                <div className="font-semibold">{a.name} — {job?.title}</div>
                <div className="text-sm text-gray-600">{a.email} • Status: <span className="font-medium">{a.status}</span></div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
