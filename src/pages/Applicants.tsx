import React from 'react'
import { useParams } from 'react-router-dom'
import { getApplications, updateApplicationStatus, getJobs } from '../utils/store'

export default function Applicants() {
  const { id } = useParams()
  const jobs = getJobs()
  const job = id ? jobs.find((j) => j.id === id) : null
  const apps = getApplications().filter((a) => a.jobId === id)

  if (!job) return <div>Job not found</div>

  function onChangeStatus(appId: string, status: string) {
    updateApplicationStatus(appId, status)
    // force re-render via location change or window reload for simplicity
    window.location.reload()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Applicants — {job.title}</h1>
      <div className="mt-4 bg-white border rounded">
        <table className="min-w-full">
          <thead>
            <tr className="text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">CV</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{a.name}</td>
                <td className="p-2">{a.email}</td>
                <td className="p-2">{a.cv || '-'}</td>
                <td className="p-2">
                  <select value={a.status} onChange={(e) => onChangeStatus(a.id, e.target.value)} className="border rounded p-1">
                    <option>Applied</option>
                    <option>Screened</option>
                    <option>Interview</option>
                    <option>Hired</option>
                    <option>Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
