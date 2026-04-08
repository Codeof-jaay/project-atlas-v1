import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Check, 
  CheckCheck, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight,
  Building2,
  MapPin,
  AlertCircle
} from 'lucide-react';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState({}); // NEW: Store job details here
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('dashhr_token');
        if (!token) {
          setError('You must be logged in to view applications');
          setLoading(false);
          return;
        }

        // 1. Fetch the Application IDs and Statuses
        const response = await fetch('https://atlas-backend-1-jvkb.onrender.com/api/v1/my-applications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load applications');
        }

        const data = await response.json();
        setApplications(data);

        // 2. Fetch the specific Job Details for each application
        if (data && data.length > 0) {
          const jobsMap = {};
          for (const app of data) {
            if (app.job_id && !jobsMap[app.job_id]) {
              const jobRes = await fetch(`https://atlas-backend-1-jvkb.onrender.com/api/v1/jobs/${app.job_id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              if (jobRes.ok) {
                jobsMap[app.job_id] = await jobRes.json();
              }
            }
          }
          setJobs(jobsMap);
        }

        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load applications');
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Status mapping from backend to UI
  const getStatusUI = (status) => {
    switch (status) {
      case 'applied':
        return { 
          icon: <Check size={16} className="text-slate-400" />, 
          text: 'Applied', 
          color: 'text-slate-500 dark:text-slate-400',
          bg: 'bg-slate-100 dark:bg-white/5'
        };
      case 'reviewed':
        return { 
          icon: <CheckCheck size={16} className="text-blue-500" />, 
          text: 'Reviewed', 
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-500/10'
        };
      case 'shortlisted':
        return { 
          icon: <Calendar size={16} className="text-purple-500" />, 
          text: 'Shortlisted', 
          color: 'text-purple-600 dark:text-purple-400',
          bg: 'bg-purple-50 dark:bg-purple-500/10'
        };
      case 'accepted':
        return { 
          icon: <CheckCircle2 size={16} className="text-emerald-500" />, 
          text: 'Accepted', 
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-500/10'
        };
      case 'rejected':
        return { 
          icon: <XCircle size={16} className="text-red-500" />, 
          text: 'Rejected', 
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-500/10'
        };
      default:
        return { 
          icon: <Clock size={16} className="text-slate-400" />, 
          text: 'Pending', 
          color: 'text-slate-500',
          bg: 'bg-slate-100 dark:bg-white/5'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0C10] pt-24 pb-12 px-6 transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-500/30 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0C10] pt-24 pb-12 px-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Application History
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            A complete record of every role you've applied for on DashHR.
          </p>
        </div>

        {error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/30 rounded-3xl p-8 text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-3">Error loading applications</h2>
            <p className="text-red-700 dark:text-red-300 max-w-md mx-auto">{error}</p>
          </motion.div>
        ) : applications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-3xl p-16 text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock size={32} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No applications yet</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
              You haven't applied to any jobs yet. Start exploring open roles to build your pipeline.
            </p>
            <Link 
              to="/jobs" 
              className="inline-flex items-center justify-center px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              Explore Jobs
            </Link>
          </motion.div>
        ) : (
          <div className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {applications.map((app, index) => {
                const statusUI = getStatusUI(app.status);
                const job = jobs[app.job_id]; // NEW: Map the specific job data
                
                return (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    key={app.id}
                  >
                    <Link 
                      to={`/jobs/${app.job_id}`}
                      className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      {/* Job Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                          {job?.title || 'Loading Role...'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Building2 size={16} className="text-slate-400" />
                            {job?.company_name || 'Loading Company...'}
                          </span>
                          <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={16} className="text-slate-400" />
                            {job?.location || 'Remote'}
                          </span>
                        </div>
                      </div>

                      {/* Status & Action */}
                      <div className="flex items-center justify-between md:justify-end gap-6 mt-4 md:mt-0">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusUI.bg} border border-transparent`}>
                          {statusUI.icon}
                          <span className={`text-xs font-bold uppercase tracking-wider ${statusUI.color}`}>
                            {statusUI.text}
                          </span>
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all shadow-sm">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}