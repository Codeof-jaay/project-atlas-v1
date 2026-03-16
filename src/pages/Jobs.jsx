import React from 'react'
import JobCard from '../components/JobCard'
import { getJobs } from '../utils/store'

export default function Jobs() {
  const jobs = getJobs()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Jobs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((j) => (
          <JobCard job={j} key={j.id} />
        ))}
      </div>
    </div>
  )
}
