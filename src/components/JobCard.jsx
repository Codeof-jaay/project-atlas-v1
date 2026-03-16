import React from 'react'
import { Link } from 'react-router-dom'

export default function JobCard({ job }) {
  return (
    <div className="border rounded p-4 bg-white">
      <h3 className="font-semibold text-lg">{job.title}</h3>
      <p className="text-sm text-gray-600">{job.company} — {job.location}</p>
      <div className="mt-3 flex items-center justify-between">
        <Link to={`/jobs/${job.id}`} className="text-sm text-indigo-600">View</Link>
        <Link to={`/apply/${job.id}`} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Apply</Link>
      </div>
    </div>
  )
}
