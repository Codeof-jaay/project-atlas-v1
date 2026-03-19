import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApplications, getJobs } from '../utils/store'
import { getRole } from '../utils/auth'

export default function Dashboard() {
  const navigate = useNavigate()
  const apps = getApplications()
  const jobs = getJobs()

  // Restrict Dashboard to Candidates only (role 'C')
  useEffect(() => {
    const role = getRole()
    if (role !== 'C') {
      navigate('/')
    }
  }, [navigate])

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
