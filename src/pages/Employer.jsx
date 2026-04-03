import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Users, Clock, Eye, Trash2, X, Activity, Loader } from 'lucide-react';
import { getRole, getAuth } from '../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export default function Employer() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);
  const [userId, setUserId] = useState(null);
  
  // Enforce Employer Role
  useEffect(() => {
    if (getRole() !== 'R') {
      navigate('/auth');
    }
  }, [navigate]);

  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    company_name: '',
    location: '',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    remote_option: false,
    currency: 'USD',
  });

  // Fetch employer's jobs and applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { access_token } = getAuth();
        if (!access_token) {
          navigate('/auth');
          return;
        }

        // Get current user info to filter jobs
        const meResponse = await fetch(`${API_BASE_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        });

        let currentUserId = null;
        if (meResponse.ok) {
          const userData = await meResponse.json();
          currentUserId = userData.id;
          setUserId(userData.id);
        }

        // Fetch all jobs
        const jobsResponse = await fetch(`${API_BASE_URL}/jobs?skip=0&limit=100`, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!jobsResponse.ok) {
          throw new Error(`Failed to fetch jobs: ${jobsResponse.status}`);
        }

        const jobsData = await jobsResponse.json();
        // Filter to only show current employer's jobs
        const userJobs = jobsData.filter(job => job.employer_id === currentUserId) || [];
        setJobs(userJobs);

        // Fetch applications for those jobs
        const allApps = [];
        for (const job of userJobs) {
          const appsResponse = await fetch(`${API_BASE_URL}/jobs/${job.id}/applications`, {
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (appsResponse.ok) {
            const appsData = await appsResponse.json();
            allApps.push(...(appsData || []));
          }
        }
        setApplications(allApps);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Calculate stats
  const totalJobs = jobs.length;
  const totalApplications = applications.length;
  const pendingApplications = applications.filter((a) => a.status === 'Applied' || a.status === 'pending').length;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobForm((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      setPosting(true);
      const { access_token } = getAuth();
      
      if (!access_token) {
        navigate('/auth');
        return;
      }

      // Format the job data for the API - keep it simple
      const jobData = {
        title: jobForm.title,
        description: jobForm.description,
        company_name: jobForm.company_name,
        location: jobForm.location,
        job_type: jobForm.job_type,
        experience_level: jobForm.experience_level,
        remote_option: jobForm.remote_option,
        currency: jobForm.currency,
      };

      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMsg = `Error ${response.status}`;
        
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        }
        
        throw new Error(errorMsg);
      }

      const newJob = await response.json();
      setJobs([...jobs, newJob]);
      setJobForm({
        title: '',
        description: '',
        company_name: '',
        location: '',
        job_type: 'Full-time',
        experience_level: 'Mid-level',
        remote_option: false,
        currency: 'USD',
      });
      setShowPostJobModal(false);
      alert('Job posted successfully!');
    } catch (err) {
      console.error('Error posting job:', err);
      console.error('Error details:', err.message);
      alert(`Failed to post job: ${err.message}`);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      const { access_token } = getAuth();
      
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete job: ${response.status}`);
      }

      setJobs(jobs.filter(j => j.id !== jobId));
      alert('Job deleted successfully');
    } catch (err) {
      console.error('Error deleting job:', err);
      alert(`Failed to delete job: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0C10] pt-24 pb-12 px-6 transition-colors duration-300">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Employer Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your talent pipeline and active job postings.
            </p>
          </div>
          <button
            onClick={() => setShowPostJobModal(true)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all shrink-0"
          >
            <Plus size={20} /> Post New Job
          </button>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-3xl p-6 mb-10 shadow-sm"
          >
            <p className="text-red-600 dark:text-red-400 font-semibold mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { title: "Active Postings", value: jobs.length, icon: <Briefcase size={24}/>, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
            { title: "Total Applicants", value: applications.length, icon: <Users size={24}/>, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
            { title: "Pending Review", value: applications.filter(a => a.status === 'applied').length, icon: <Clock size={24}/>, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" }
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex items-center gap-6"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Jobs List (Takes up 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-blue-500" size={24} />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Postings</h2>
            </div>

            {loading ? (
              <div className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center gap-4">
                <Loader size={32} className="text-blue-600 dark:text-blue-400 animate-spin" />
                <p className="text-slate-600 dark:text-slate-400">Loading your jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={24} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No active jobs</h3>
                <p className="text-slate-500 mb-6">Create a listing to start attracting top talent.</p>
                <button onClick={() => setShowPostJobModal(true)} className="text-blue-600 font-bold hover:underline">
                  + Create your first job
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => {
                  const jobApps = applications.filter((a) => a.job_id === job.id);
                  return (
                    <div key={job.id} className="bg-white dark:bg-[#1A1D27]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mb-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <span className="font-medium">{job.location}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                          <span className={`font-medium ${job.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {job.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Applicants</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{jobApps.length}</p>
                        </div>
                        
                        <Link
                          to={`/employer/job/${job.id}/applicants`}
                          className="p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl transition-colors"
                          title="View ATS Pipeline"
                        >
                          <Eye size={20} />
                        </Link>
                        
                        <button 
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-3 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-xl transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar: Recent Activity */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Users size={20} className="text-slate-400"/> Recent Activity
            </h2>
            
            <div className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm p-4">
              {applications.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No recent applications.</p>
              ) : (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((app, i) => {
                    const job = jobs.find((j) => j.id === app.job_id);
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                          {app.candidate_id ? String(app.candidate_id).charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">Candidate #{app.candidate_id}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">Applied for: {job?.title}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Job Modal */}
      <AnimatePresence>
        {showPostJobModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#1A1D27] rounded-3xl w-full max-w-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Listing</h2>
                <button onClick={() => setShowPostJobModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handlePostJob} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Job Title *</label>
                  <input
                    type="text" name="title" value={jobForm.title} onChange={handleInputChange} required
                    placeholder="e.g. Senior Product Manager"
                    className="w-full bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Company Name *</label>
                  <input
                    type="text" name="company_name" value={jobForm.company_name} onChange={handleInputChange} required
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Location *</label>
                  <input
                    type="text" name="location" value={jobForm.location} onChange={handleInputChange} required
                    placeholder="e.g. Lagos, Nigeria (Hybrid)"
                    className="w-full bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest block ml-1">Job Description *</label>
                    <span className={`text-xs font-semibold ${
                      jobForm.description.length < 20 
                        ? 'text-red-500' 
                        : jobForm.description.length > 3000 
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}>
                      {jobForm.description.length}/3000
                    </span>
                  </div>
                  <textarea
                    name="description" 
                    value={jobForm.description} 
                    onChange={handleInputChange} 
                    required 
                    rows="6"
                    maxLength="3000"
                    placeholder="Describe the role, responsibilities, and what you're looking for... (minimum 20 characters)"
                    className={`w-full bg-white dark:bg-[#12141C] border rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none ${
                      jobForm.description.length < 20 && jobForm.description.length > 0
                        ? 'border-red-300 dark:border-red-500/30'
                        : 'border-gray-200 dark:border-white/10'
                    }`}
                  />
                  {jobForm.description.length < 20 && jobForm.description.length > 0 && (
                    <p className="text-xs text-red-500 mt-1 ml-1">
                      Minimum 20 characters required ({20 - jobForm.description.length} more needed)
                    </p>
                  )}
                  {jobForm.description.length > 3000 && (
                    <p className="text-xs text-red-500 mt-1 ml-1">
                      Maximum 3000 characters exceeded
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Job Type</label>
                    <select
                      name="job_type" value={jobForm.job_type} onChange={handleInputChange}
                      className="w-full bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Temporary</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Experience Level</label>
                    <select
                      name="experience_level" value={jobForm.experience_level} onChange={handleInputChange}
                      className="w-full bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                    >
                      <option>Entry-level</option>
                      <option>Mid-level</option>
                      <option>Senior</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                  <input
                    type="checkbox" name="remote_option" id="remote" checked={jobForm.remote_option} onChange={handleInputChange}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <label htmlFor="remote" className="text-sm font-semibold text-slate-900 dark:text-white cursor-pointer">
                    Remote Work Available
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowPostJobModal(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={posting} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                    {posting ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      'Publish Job'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}