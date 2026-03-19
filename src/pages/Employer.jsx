import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Briefcase, Users, Clock, Eye, Trash2 } from 'lucide-react'
import { getJobs, getApplications, saveJob } from '../utils/store'

export default function Employer() {
  const [jobs, setJobs] = useState(getJobs())
  const applications = getApplications()
  const [showPostJobModal, setShowPostJobModal] = useState(false)
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    location: '',
    requirements: '',
  })

  // Calculate stats
  const totalJobs = jobs.length
  const totalApplications = applications.length
  const pendingApplications = applications.filter((a) => a.status === 'pending').length

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setJobForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePostJob = (e) => {
    e.preventDefault()
    try {
      saveJob(jobForm)
      setJobs(getJobs()) // Refresh the jobs list
      setJobForm({ title: '', description: '', location: '', requirements: '' })
      setShowPostJobModal(false)
      alert('Job posted successfully!')
    } catch (error) {
      console.error('Error posting job:', error)
      alert('Failed to post job. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">Employer Dashboard</h1>
            <p className="text-text/60">Manage job postings and applicants</p>
          </div>
          <button
            onClick={() => setShowPostJobModal(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <Plus size={18} /> Post New Job
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card rounded-lg p-6 border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text/60 text-sm font-medium">Total Jobs Posted</p>
                <p className="text-3xl font-bold text-primary mt-2">{totalJobs}</p>
              </div>
              <Briefcase size={40} className="text-primary/20" />
            </div>
          </div>

          <div className="card rounded-lg p-6 border-l-4 border-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text/60 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-secondary mt-2">{totalApplications}</p>
              </div>
              <Users size={40} className="text-secondary/20" />
            </div>
          </div>

          <div className="card rounded-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text/60 text-sm font-medium">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingApplications}</p>
              </div>
              <Clock size={40} className="text-yellow-500/20" />
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="card rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Briefcase size={24} /> Your Job Postings
          </h2>

          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text/60">No job postings yet. Create your first job to get started!</p>
              <button
                onClick={() => setShowPostJobModal(true)}
                className="btn-primary mt-4 px-4 py-2 rounded-lg"
              >
                Post First Job
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                const jobApplications = applications.filter((a) => a.jobId === job.id)
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border border-subtle rounded-lg hover:bg-primary/5 transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-text text-lg">{job.title}</h3>
                      <p className="text-text/60 text-sm mt-1">
                        {job.company} • {job.location}
                      </p>
                      <p className="text-text/50 text-xs mt-2 line-clamp-1">{job.description}</p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {/* Application count */}
                      <div className="bg-secondary/10 px-3 py-1 rounded-full text-center">
                        <p className="text-xs text-text/60">Applications</p>
                        <p className="text-lg font-bold text-secondary">{jobApplications.length}</p>
                      </div>

                      {/* View Applicants */}
                      <Link
                        to={`/employer/job/${job.id}/applicants`}
                        className="bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 transition flex items-center gap-1 whitespace-nowrap"
                      >
                        <Eye size={16} /> View
                      </Link>

                      {/* Delete button (TODO) */}
                      <button className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        {applications.length > 0 && (
          <div className="card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <Users size={24} /> Recent Applications
            </h2>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {applications.slice(0, 5).map((app) => {
                const job = jobs.find((j) => j.id === app.jobId)
                return (
                  <div key={app.id} className="p-3 border border-subtle rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-text">{app.candidateName}</p>
                        <p className="text-sm text-text/60">
                          Applied for: <span className="font-medium">{job?.title}</span>
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          app.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : app.status === 'accepted'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Post Job Modal */}
      {showPostJobModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card rounded-lg max-w-2xl w-full p-8 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-primary mb-6">Post a New Job</h2>

            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={jobForm.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Frontend Engineer"
                  className="input w-full px-3 py-2 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">Description</label>
                <textarea
                  name="description"
                  value={jobForm.description}
                  onChange={handleInputChange}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows="4"
                  className="input w-full px-3 py-2 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={jobForm.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Remote, NYC, SF"
                  className="input w-full px-3 py-2 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Requirements (comma-separated)
                </label>
                <input
                  type="text"
                  name="requirements"
                  value={jobForm.requirements}
                  onChange={handleInputChange}
                  placeholder="e.g., React, TypeScript, Node.js"
                  className="input w-full px-3 py-2 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1 px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                >
                  Post Job
                </button>
                <button
                  type="button"
                  onClick={() => setShowPostJobModal(false)}
                  className="flex-1 px-4 py-2 border border-light rounded-lg text-text hover:bg-text/5 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
