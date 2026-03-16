import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { getJobById } from '../utils/store'

export default function JobDetails() {
  const { id } = useParams()
  const job = id ? getJobById(id) : null
  if (!job) return <div>Job not found</div>
  return (
    <div>
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <p className="text-sm text-gray-600">{job.company} — {job.location}</p>
      <div className="mt-4">
        <h3 className="font-semibold">Description</h3>
        <p className="mt-2">{job.description}</p>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Requirements</h3>
        <ul className="list-disc list-inside">
          {job.requirements.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
  <Link to={`/apply/${job.id}`} className="px-4 py-2 btn-primary rounded">Apply for Job</Link>
      </div>
    </div>
  )
}
