import { motion } from 'framer-motion'

export default function StatCard({ value, label, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
        {value}
      </div>
      <p className="text-text/70 font-medium">{label}</p>
    </motion.div>
  )
}
