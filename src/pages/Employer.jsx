import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Users, Clock, Eye, Trash2, X, Activity } from 'lucide-react';
import { getJobs, getApplications, saveJob } from '../utils/store';
import { getRole } from '../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function Employer() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(getJobs());
  const [applications, setApplications] = useState(getApplications());
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  
  // Enforce Employer Role
  useEffect(() => {
    if (getRole() !== 'R') {
      navigate('/auth');
    }
  }, [navigate]);

  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    location: '',
    requirements: '',
  });

  // Calculate stats
  const totalJobs = jobs.length;
  const totalApplications = applications.length;
  const pendingApplications = applications.filter((a) => a.status === 'Applied' || a.status === 'pending').length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePostJob = (e) => {
    e.preventDefault();
    try {
      // Format requirements from comma-separated string to array
      const formattedJob = {
        ...jobForm,
        requirements: jobForm.requirements.split(',').map(req => req.trim()).filter(Boolean),
        company: "Your Company", // In a real app, pull this from user profile
      };
      
      saveJob(formattedJob);
      setJobs(getJobs());
      setJobForm({ title: '', description: '', location: '', requirements: '' });
      setShowPostJobModal(false);
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
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
            className="bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all shrink-0"
          >
            <Plus size={20} /> Post New Job
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { title: "Active Postings", value: totalJobs, icon: <Briefcase size={24}/>, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
            { title: "Total Applicants", value: totalApplications, icon: <Users size={24}/>, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
            { title: "Pending Review", value: pendingApplications, icon: <Clock size={24}/>, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" }
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

            {jobs.length === 0 ? (
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
                  const jobApps = applications.filter((a) => a.jobId === job.id);
                  return (
                    <div key={job.id} className="bg-white dark:bg-[#1A1D27]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mb-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <span className="font-medium">{job.location}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
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
                        
                        <button className="p-3 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-xl transition-colors">
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
                    const job = jobs.find((j) => j.id === app.jobId);
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                          {app.name ? app.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{app.name || "Unknown Candidate"}</p>
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
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Job Title</label>
                  <input
                    type="text" name="title" value={jobForm.title} onChange={handleInputChange} required
                    placeholder="e.g. Senior Product Manager"
                    className="w-full bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Location / Setup</label>
                  <input
                    type="text" name="location" value={jobForm.location} onChange={handleInputChange} required
                    placeholder="e.g. Lagos, Nigeria (Hybrid)"
                    className="w-full bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Job Description</label>
                  <textarea
                    name="description" value={jobForm.description} onChange={handleInputChange} required rows="4"
                    placeholder="Describe the responsibilities and impact..."
                    className="w-full bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Requirements (Comma Separated)</label>
                  <input
                    type="text" name="requirements" value={jobForm.requirements} onChange={handleInputChange}
                    placeholder="e.g. 5+ Yrs Exp, Agile, B2B SaaS"
                    className="w-full bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowPostJobModal(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all">
                    Publish Listing
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