import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Users, Clock, Eye, Trash2, X, Activity, Loader, TrendingUp, MapPin } from 'lucide-react';
import { getRole, getAuth } from '../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'https://atlas-backend-1-jvkb.onrender.com/api/v1';

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
    const role = getRole();
    if (role !== 'R' && role !== 'employer') {
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

  // Dynamic Stats
  const totalJobs = jobs.length;
  const totalApplications = applications.length;
  const pendingApplications = applications.filter((a) => a.status === 'Applied' || a.status === 'pending' || a.status === 'applied').length;

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

      const jobData = { ...jobForm };

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
          errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
        throw new Error(errorMsg);
      }

      const newJob = await response.json();
      setJobs([...jobs, newJob]);
      setJobForm({
        title: '', description: '', company_name: '', location: '', job_type: 'Full-time', experience_level: 'Mid-level', remote_option: false, currency: 'USD',
      });
      setShowPostJobModal(false);
    } catch (err) {
      alert(`Failed to post job: ${err.message}`);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This cannot be undone.')) {
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
      // Optionally filter out applications for that job
      setApplications(applications.filter(a => a.job_id !== jobId));
    } catch (err) {
      alert(`Failed to delete job: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Employer Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your talent pipeline and active job postings.</p>
        </div>
        <button 
          onClick={() => setShowPostJobModal(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} /> Post New Job
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-3xl p-6 shadow-sm">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors">
            Try Again
          </button>
        </div>
      )}

      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Job Posts', value: totalJobs, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Total Applicants', value: totalApplications, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
          { label: 'In Review', value: pendingApplications, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
        ].map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-[#12141C] p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Jobs List (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Postings</h2>
          </div>

          {loading ? (
            <div className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-3xl p-12 text-center flex flex-col items-center gap-4 shadow-sm">
              <Loader size={32} className="text-blue-600 animate-spin" />
              <p className="text-slate-500">Loading your jobs...</p>
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
            <div className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 text-sm text-slate-500 dark:text-slate-400">
                      <th className="p-6 font-semibold">Job Title</th>
                      <th className="p-6 font-semibold">Applicants</th>
                      <th className="p-6 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {jobs.map((job) => {
                      const jobApps = applications.filter((a) => a.job_id === job.id);
                      return (
                        <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                          <td className="p-6">
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.title}</p>
                            <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-2">
                              <span className="flex items-center gap-1"><Briefcase size={14}/> {job.job_type || 'Full-time'}</span>
                              <span className="flex items-center gap-1"><MapPin size={14}/> {job.location || 'Remote'}</span>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                                {jobApps.length}
                              </span>
                              {jobApps.length > 0 && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse ml-1"></span>}
                            </div>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link 
                                to={`/employer/job/${job.id}/applicants`}
                                className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                              >
                                Review
                              </Link>
                              <button 
                                onClick={() => handleDeleteJob(job.id)}
                                className="p-2.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10"
                                title="Delete Job"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (1 Column) */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            <Users size={20} className="text-slate-400"/> Recent Activity
          </h2>
          
          <div className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm p-4">
            {applications.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No recent applications.</p>
            ) : (
              <div className="space-y-2">
                {applications.slice(0, 5).map((app, i) => {
                  const job = jobs.find((j) => j.id === app.job_id);
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-transparent dark:hover:border-white/5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {app.candidate_id ? String(app.candidate_id).charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Candidate #{app.candidate_id}</p>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">Applied for: {job?.title || 'Unknown Role'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Job Modal (Preserved exactly from your code) */}
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
                      jobForm.description.length < 20 ? 'text-red-500' : jobForm.description.length > 3000 ? 'text-red-500' : 'text-slate-400'
                    }`}>
                      {jobForm.description.length}/3000
                    </span>
                  </div>
                  <textarea
                    name="description" value={jobForm.description} onChange={handleInputChange} required rows="6" maxLength="3000"
                    placeholder="Describe the role, responsibilities, and what you're looking for... (minimum 20 characters)"
                    className={`w-full bg-white dark:bg-[#12141C] border rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none ${
                      jobForm.description.length < 20 && jobForm.description.length > 0
                        ? 'border-red-300 dark:border-red-500/30'
                        : 'border-gray-200 dark:border-white/10'
                    }`}
                  />
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
                      <><Loader size={16} className="animate-spin" /> Publishing...</>
                    ) : ('Publish Job')}
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