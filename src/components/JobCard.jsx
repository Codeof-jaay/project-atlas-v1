import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowRight, ShieldCheck, Briefcase } from 'lucide-react';

export default function JobCard({ job, index = 0 }) {
  // Mock data for the example if not provided
  const jobType = job.type || "Full-time";
  const isVerified = job.isVerified !== false; // Default to true for the mockup

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -4 }}
      className="relative group bg-white dark:bg-[#1A1D27]/80 backdrop-blur-xl rounded-[1.5rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Background Hover Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-600/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header: Title & Company */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-1.5">
              {job.title || "Untitled Role"}
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {job.company || "Unknown Company"}
              </span>
              {isVerified && (
                <div className="flex items-center justify-center text-blue-500" title="Verified Employer (CAC/Bank ID)">
                  <ShieldCheck size={14} className="fill-blue-500/10" />
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-500/20">
            New
          </div>
        </div>

        {/* Metadata: Location & Type */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <MapPin size={14} className="text-slate-400 dark:text-slate-500" />
            <span>{job.location || "Location not specified"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Briefcase size={14} className="text-slate-400 dark:text-slate-500" />
            <span>{jobType}</span>
          </div>
        </div>

        {/* Description Preview */}
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed flex-grow">
          {job.description || "No description provided for this role."}
        </p>

        {/* Tags / Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {job.requirements.slice(0, 3).map((req, i) => (
              <span key={i} className="text-[11px] font-medium px-2.5 py-1 bg-gray-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-md border border-gray-100 dark:border-white/5">
                {req}
              </span>
            ))}
            {job.requirements.length > 3 && (
              <span className="text-[11px] font-medium px-2.5 py-1 bg-gray-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-md border border-gray-100 dark:border-white/5">
                +{job.requirements.length - 3}
              </span>
            )}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
          <Link
            to={`/jobs/${job.id}`}
            className="flex-1 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all duration-200"
          >
            View Details
          </Link>
          <Link
            to={`/apply/${job.id}`}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all duration-200 group/btn"
          >
            Easy Apply
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}