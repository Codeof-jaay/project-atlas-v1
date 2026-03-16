import React from 'react'
import { Link } from 'react-router-dom'
import JobCard from '../components/JobCard'
import { getJobs } from '../utils/store'

export default function Landing() {
  const jobs = getJobs()
  return (
    <div>
      <section className="py-8">
        <h1 className="text-3xl font-bold">Hire & Get Hired — DashHR</h1>
        <p className="mt-2 text-gray-600">A simple hiring marketplace MVP.</p>
        <div className="mt-4 space-x-3">
          <Link to="/jobs" className="px-4 py-2 btn-primary rounded">Browse Jobs</Link>
          <Link to="/employer" className="px-4 py-2 border rounded">Post a Job</Link>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Sample Jobs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jobs.map((j) => (
            <JobCard job={j} key={j.id} />
          ))}
        </div>
      </section>
    </div>
  )
}
