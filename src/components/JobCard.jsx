import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, Clock, ArrowRight } from 'lucide-react'

export default function JobCard({ job, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group card rounded-2xl p-6 border border-subtle hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors">{job.title}</h3>
            <p className="text-sm text-text/60 mt-1 font-medium">{job.company}</p>
          </div>
          <div className="text-xs font-semibold px-3 py-1 bg-primary/10 text-primary rounded-full">New</div>
        </div>

        {/* Location & Type */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-1 text-sm text-text/70">
            <MapPin size={16} className="text-primary/70" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-text/70">
            <Clock size={16} className="text-primary/70" />
            <span>Full-time</span>
          </div>
        </div>

        {/* Description preview */}
        <p className="text-sm text-text/70 mb-6 line-clamp-2">{job.description}</p>

        {/* Tags/Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {job.requirements.slice(0, 3).map((req, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-text/5 text-text/70 rounded-md">
                {req}
              </span>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-3 pt-4 border-t border-subtle">
          <Link
            to={`/jobs/${job.id}`}
            className="flex-1 px-4 py-2 text-center text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors text-sm"
          >
            View Details
          </Link>
          <Link
            to={`/apply/${job.id}`}
            className="flex-1 px-4 py-2 text-center bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm flex items-center justify-center gap-2 group/btn"
          >
            Apply
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

