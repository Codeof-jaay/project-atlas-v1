import { motion } from 'framer-motion';

export default function FeatureCard({ icon: Icon, title, description, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="relative group bg-white dark:bg-[#1A1D27]/80 backdrop-blur-xl rounded-[2rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 overflow-hidden"
    >
      {/* Background Hover Gradient Blob (Subtle) */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/5 dark:bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

      {/* Icon Container */}
      <div className="w-14 h-14 mb-6 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm border border-blue-100 dark:border-blue-500/20">
        <Icon size={26} className="text-blue-600 dark:text-blue-400" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
          {description}
        </p>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-8 left-8 h-1 w-0 group-hover:w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out" />
    </motion.div>
  );
}