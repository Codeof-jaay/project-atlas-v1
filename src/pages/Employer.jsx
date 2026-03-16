import React from 'react'
import { Link } from 'react-router-dom'
import { getJobs } from '../utils/store'

export default function Employer() {
  const jobs = getJobs()
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employer Dashboard</h1>
  <button className="px-3 py-1 bg-success text-white rounded">Post Job</button>
      </div>

      <div className="mt-4 space-y-2">
        {jobs.map((j) => (
          <div key={j.id} className="p-3 bg-white border rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">{j.title}</div>
              <div className="text-sm text-gray-600">{j.company} • {j.location}</div>
            </div>
            <div>
              <Link to={`/employer/job/${j.id}/applicants`} className="text-sm text-primary">View Applicants</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
