import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Briefcase, Building2, MapPin, Clock } from 'lucide-react';

export default function AdminJobs() {
  const [activeTab, setActiveTab] = useState('Pending');
  
  // Mock Data
  const [jobs, setJobs] = useState([
    { id: 1, title: 'Senior Frontend Engineer', company: 'TechNova', location: 'Remote', posted: '2 hours ago', status: 'Pending' },
    { id: 2, title: 'HR Manager', company: 'Global Corp', location: 'Lagos', posted: '5 hours ago', status: 'Pending' },
    { id: 3, title: 'Backend Developer (Python)', company: 'Startup Inc', location: 'Abuja', posted: '1 day ago', status: 'Approved' },
    { id: 4, title: 'Get Rich Quick - Scam', company: 'Shady LLC', location: 'Unknown', posted: '2 days ago', status: 'Rejected' },
  ]);

  const handleAction = (id, newStatus) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status: newStatus } : job));
  };

  const filteredJobs = jobs.filter(job => job.status === activeTab);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Job Approvals</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review and moderate platform job postings.</p>
      </div>

      {/* UX Requirement: Top-Level Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-[#12141C] border border-slate-200 dark:border-white/10 rounded-2xl w-full md:w-max">
        {['Pending', 'Approved', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 md:w-32 py-2.5 px-4 rounded-xl text-sm font-bold transition-all relative ${
              activeTab === tab 
                ? 'text-indigo-700 dark:text-white shadow-sm bg-white dark:bg-white/10' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab}
            {tab === 'Pending' && jobs.filter(j => j.status === 'Pending').length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Data List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-3xl p-16 text-center shadow-sm">
            <Briefcase size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No {activeTab.toLowerCase()} jobs</h3>
            <p className="text-slate-500">You're all caught up!</p>
          </div>
        ) : (
          filteredJobs.map((job, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={job.id}
              className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
            >
              {/* Job Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{job.title}</h3>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                    job.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400' :
                    job.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400' :
                    'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400'
                  }`}>
                    {job.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><Building2 size={16}/> {job.company}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={16}/> {job.location}</span>
                  <span className="flex items-center gap-1.5"><Clock size={16}/> {job.posted}</span>
                </div>
              </div>

              {/* UX Requirement: Primary Actions */}
              {job.status === 'Pending' && (
                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    onClick={() => handleAction(job.id, 'Rejected')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 dark:bg-transparent dark:border-red-500/30 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button 
                    onClick={() => handleAction(job.id, 'Approved')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <CheckCircle2 size={18} /> Approve
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}