import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApplications, getJobs } from '../utils/store';
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
  MapPin
} from 'lucide-react';

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // In a real app, this would filter by the logged-in user's ID
    setApps(getApplications());
    setJobs(getJobs());
  }, []);

  // WhatsApp-Style Transparency Logic (Consistent with Dashboard)
  const getStatusUI = (status) => {
    switch (status) {
      case 'Applied':
        return { 
          icon: <Check size={16} className="text-slate-400" />, 
          text: 'Sent', 
          color: 'text-slate-500 dark:text-slate-400',
          bg: 'bg-slate-100 dark:bg-white/5'
        };
      case 'Screened':
        return { 
          icon: <CheckCheck size={16} className="text-blue-500" />, 
          text: 'Viewed', 
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-500/10'
        };
      case 'Interview':
        return { 
          icon: <Calendar size={16} className="text-purple-500" />, 
          text: 'Interview', 
          color: 'text-purple-600 dark:text-purple-400',
          bg: 'bg-purple-50 dark:bg-purple-500/10'
        };
      case 'Hired':
        return { 
          icon: <CheckCircle2 size={16} className="text-emerald-500" />, 
          text: 'Offer', 
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-500/10'
        };
      case 'Rejected':
        return { 
          icon: <XCircle size={16} className="text-red-500" />, 
          text: 'Closed', 
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-500/10'
        };
      default:
        return { 
          icon: <Clock size={16} className="text-slate-400" />, 
          text: 'Processing', 
          color: 'text-slate-500',
          bg: 'bg-slate-100 dark:bg-white/5'
        };
    }
  };

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

        {apps.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-3xl p-16 text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock size={32} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No history found</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
              Your application history is currently empty. Start exploring open roles to build your pipeline.
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
              {apps.map((app, index) => {
                const job = jobs.find((j) => j.id === app.jobId);
                const statusUI = getStatusUI(app.status);
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, opacity: 0 }}
                    animate={{ opacity: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    key={app.id}
                  >
                    <Link 
                      to={`/jobs/${app.jobId}`}
                      className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      {/* Job Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                          {job?.title || 'Unknown Role'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Building2 size={16} className="text-slate-400" />
                            {job?.company || 'Unknown Company'}
                          </span>
                          <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={16} className="text-slate-400" />
                            {job?.location || 'Unknown Location'}
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