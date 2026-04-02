import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApplications, updateApplicationStatus, getJobs } from '../utils/store';
import { motion } from 'framer-motion';
import { FileText, Mail, User, ChevronLeft, Search } from 'lucide-react';

export default function Applicants() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [apps, setApps] = useState([]);

  // Load data into state to avoid window.location.reload()
  useEffect(() => {
    const jobs = getJobs();
    const foundJob = jobs.find((j) => j.id === id);
    setJob(foundJob);
    if (foundJob) {
      setApps(getApplications().filter((a) => a.jobId === id));
    }
  }, [id]);

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Job not found or has been removed.
      </div>
    );
  }

  const onChangeStatus = (appId, newStatus) => {
    // 1. Update the store/backend
    updateApplicationStatus(appId, newStatus);
    // 2. Update local state for instant UI feedback (No reload needed!)
    setApps(apps.map(a => a.id === appId ? { ...a, status: newStatus } : a));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300';
      case 'Screened': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300';
      case 'Interview': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
      case 'Hired': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300';
      case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0C10] pt-24 pb-12 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Link to="/employer" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-4">
              <ChevronLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Applicants for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{job.title}</span>
            </h1>
            <p className="text-slate-500 mt-1">Total Candidates: {apps.length}</p>
          </div>
          
          {/* Future feature: Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search candidates..." 
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
            />
          </div>
        </div>

        {/* ATS Table */}
        <div className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4 pl-6">Candidate</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-center">Resume</th>
                  <th className="p-4 pr-6">Pipeline Status</th>
                </tr>
              </thead>
              <tbody>
                {apps.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500">
                      No applications yet.
                    </td>
                  </tr>
                ) : (
                  apps.map((a, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      key={a.id} 
                      className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                            {a.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{a.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Mail size={14} className="text-slate-400" />
                          {a.email}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                          <FileText size={16} />
                          {a.cv || 'View CV'}
                        </button>
                      </td>
                      <td className="p-4 pr-6">
                        <div className="relative">
                          <select 
                            value={a.status} 
                            onChange={(e) => onChangeStatus(a.id, e.target.value)} 
                            className={`appearance-none w-full md:w-40 px-3 py-2 text-sm font-bold rounded-xl cursor-pointer outline-none transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10 ${getStatusColor(a.status)}`}
                          >
                            <option value="Applied">Applied</option>
                            <option value="Screened">Screened</option>
                            <option value="Interview">Interview</option>
                            <option value="Hired">Hired</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <ChevronLeft size={14} className="rotate-[-90deg] opacity-50" />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}