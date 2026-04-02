import { motion } from 'framer-motion';

export default function StatCard({ value, label, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -5 }}
      className="relative group p-6 md:p-8 rounded-[2rem] bg-gray-50/80 dark:bg-[#1A1D27]/40 backdrop-blur-md border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 text-center overflow-hidden"
    >
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        {/* The Number */}
        <div className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2 md:mb-3 tracking-tight">
          {value}
        </div>
        
        {/* The Label */}
        <p className="text-slate-600 dark:text-slate-400 font-bold text-sm md:text-xs uppercase tracking-widest">
          {label}
        </p>
      </div>
    </motion.div>
  );
}