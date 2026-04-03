import React, { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Briefcase, AlertCircle } from 'lucide-react';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('https://atlas-backend-1-jvkb.onrender.com/api/v1/jobs?skip=0&limit=50');
        
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load job listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  // Client-side search filtering
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                className="h-96 bg-white dark:bg-[#1A1D27] rounded-[1.5rem] p-6 border border-gray-200 dark:border-white/5 shadow-sm"
              />
            ))}
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/30 rounded-3xl p-8 text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-3">Failed to load jobs</h3>
            <p className="text-red-700 dark:text-red-300 max-w-md mx-auto mb-6">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
            >
              Retry
            </button>
          </motion.div>
        ) : filteredJobs.length === 0 ? (
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
              <JobCard 
                key={j.id} 
                job={{
                  id: j.id,
                  title: j.title,
                  company: j.company_name,
                  location: j.location,
                  type: j.job_type,
                  description: j.description,
                  requirements: j.required_skills || [],
                  isVerified: true
                }} 
                index={index} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}