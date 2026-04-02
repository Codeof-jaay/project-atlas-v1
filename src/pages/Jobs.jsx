import React, { useState } from 'react';
import JobCard from '../components/JobCard';
import { getJobs } from '../utils/store';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Briefcase } from 'lucide-react';

export default function Jobs() {
  const allJobs = getJobs();
  const [searchTerm, setSearchTerm] = useState('');

  // Simple client-side search filtering
  const filteredJobs = allJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0C10] pt-24 pb-20 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header & Search */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4"
            >
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Verified Opportunities</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-600 dark:text-slate-400 text-lg"
            >
              Find your next role with companies that respect your time. No black holes, just fast feedback and transparent pipelines.
            </motion.p>
          </div>

          {/* Search Bar & Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full md:w-auto flex items-center gap-3"
          >
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search roles, companies, cities..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none shadow-sm"
              />
            </div>
            {/* Filter Placeholder Button */}
            <button className="h-[52px] px-4 bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all shadow-sm">
              <SlidersHorizontal size={20} />
            </button>
          </motion.div>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-3xl p-16 text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase size={32} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No matching roles found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              We couldn't find any active job postings matching "{searchTerm}". Try adjusting your keywords or clearing your filters.
            </p>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-6 px-6 py-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
            >
              Clear Search
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((j, index) => (
              <JobCard job={j} key={j.id} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}