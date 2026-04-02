import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getApplications, getJobs } from '../utils/store';
import { getRole } from '../utils/auth';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Check, 
  CheckCheck, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const apps = getApplications();
  const jobs = getJobs();

  // Restrict Dashboard to Candidates only
  useEffect(() => {
    const role = getRole();
    if (role !== 'C') {
      navigate('/auth');
    }
  }, [navigate]);

  // WhatsApp-Style Transparency Logic
  const getStatusUI = (status) => {
    switch (status) {
      case 'Applied':
        return { 
          icon: <Check size={18} className="text-slate-400" />, 
          text: 'Application Sent', 
          color: 'text-slate-500 dark:text-slate-400',
          bg: 'bg-slate-100 dark:bg-white/5'
        };
      case 'Screened':
        return { 
          icon: <CheckCheck size={18} className="text-blue-500" />, 
          text: 'CV Viewed & Downloaded', 
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-500/10'
        };
      case 'Interview':
        return { 
          icon: <Calendar size={18} className="text-purple-500" />, 
          text: 'Interview Requested', 
          color: 'text-purple-600 dark:text-purple-400',
          bg: 'bg-purple-50 dark:bg-purple-500/10'
        };
      case 'Hired':
        return { 
          icon: <CheckCircle2 size={18} className="text-emerald-500" />, 
          text: 'Offer Extended', 
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-500/10'
        };
      case 'Rejected':
        return { 
          icon: <XCircle size={18} className="text-red-500" />, 
          text: 'Not Selected', 
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-500/10'
        };
      default:
        return { 
          icon: <Clock size={18} className="text-slate-400" />, 
          text: 'Processing', 
          color: 'text-slate-500',
          bg: 'bg-slate-100'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0C10] pt-24 pb-12 px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Your Applications
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your progress in real-time. No more black holes.
          </p>
        </div>

        {apps.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Your pipeline is empty</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              You haven't applied to any roles yet. Browse our verified employers and land your next big opportunity.
            </p>
            <Link 
              to="/jobs" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              Browse Jobs <ArrowRight size={18} />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {apps.map((a, index) => {
              const job = jobs.find((j) => j.id === a.jobId);
              const statusUI = getStatusUI(a.status);
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  key={a.id} 
                  className="group bg-white dark:bg-[#1A1D27]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Job Details */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                        {job?.title || 'Unknown Role'}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Briefcase size={14} />
                        {job?.company || 'Unknown Company'}
                      </p>
                    </div>

                    {/* WhatsApp-Style Tracker */}
                    <div className="flex items-center sm:justify-end">
                      <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl ${statusUI.bg} border border-white/10 shadow-sm`}>
                        {statusUI.icon}
                        <span className={`text-sm font-bold tracking-wide ${statusUI.color}`}>
                          {statusUI.text}
                        </span>
                      </div>
                    </div>
                    
                  </div>

                  {/* Optional: Action / View Details link could go here */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-end">
                    <Link to={`/jobs/${a.jobId}`} className="text-xs font-semibold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      View Job Details &rarr;
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}