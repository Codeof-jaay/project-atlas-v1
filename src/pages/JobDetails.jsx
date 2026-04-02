import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobById } from '../utils/store';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, MapPin, ShieldCheck, CheckCircle2, Clock, Zap } from 'lucide-react';

export default function JobDetails() {
  const { id } = useParams();
  const job = id ? getJobById(id) : null;

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 bg-gray-50 dark:bg-[#0A0C10]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Job not found</h2>
          <Link to="/jobs" className="text-blue-600 hover:underline">Return to jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0C10] pt-24 pb-28 lg:pb-12 px-6 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        {/* Back Navigation */}
        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Job Board
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Job Header */}
          <div className="p-8 md:p-10 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 dark:bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider rounded-lg">
                  {job.type || 'Full-Time'}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider rounded-lg">
                  <ShieldCheck size={14} /> Verified Employer
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                {job.title}
              </h1>

              <div className="flex flex-wrap gap-4 md:gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-slate-400" />
                  {job.company}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-slate-400" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-slate-400" />
                  Posted Recently
                </div>
              </div>
            </div>
          </div>

          {/* Job Body */}
          <div className="p-8 md:p-10 space-y-10">
            
            {/* Description */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Zap size={16} />
                </div>
                The Role
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </section>

            {/* Requirements */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <CheckCircle2 size={16} />
                </div>
                Requirements
              </h3>
              <ul className="space-y-3">
                {job.requirements && job.requirements.length > 0 ? (
                  job.requirements.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                      <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 italic">No specific requirements listed.</li>
                )}
              </ul>
            </section>

          </div>
          
          {/* Desktop CTA (Hidden on mobile, sticky bottom bar used instead) */}
          <div className="hidden lg:flex justify-end p-8 md:p-10 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#1A1D27]">
            <Link 
              to={`/apply/${job.id}`} 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              Easy Apply Now
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Mobile Sticky Bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full p-4 bg-white/80 dark:bg-[#12141C]/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 z-40">
        <Link 
          to={`/apply/${job.id}`} 
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
        >
          Easy Apply Now
        </Link>
      </div>

    </div>
  );
}