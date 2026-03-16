import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getJobById, saveApplication } from '../utils/store'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export default function Apply() {
  const { jobId } = useParams()
  const job = jobId ? getJobById(jobId) : null
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [cv, setCv] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  if (!job) return <div>Job not found</div>

  function onSubmit(e) {
    e.preventDefault()
    // store minimal info; CV is stored as filename only for mock
    const app = {
      id: uid(),
      jobId: job.id,
      name,
      email,
      phone,
      cv: cv ? cv.name : undefined,
      status: 'Applied',
    }
    saveApplication(app)
    setSubmitted(true)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Apply: {job.title}</h1>
      {submitted ? (
  <div className="mt-4 p-4" style={{ backgroundColor: 'rgba(var(--color-success), 0.08)', border: '1px solid rgba(var(--color-success), 0.16)' }}>Thank you — your application was submitted.</div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 space-y-3 max-w-md">
          <div>
            <label className="block text-sm">Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm">Upload CV</label>
            <input type="file" onChange={(e) => setCv(e.target.files ? e.target.files[0] : null)} />
          </div>
          <div>
            <button className="px-4 py-2 btn-primary rounded">Submit</button>
          </div>
        </form>
      )}
    </div>
  )
}
