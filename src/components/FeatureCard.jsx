import { motion } from 'framer-motion'

export default function FeatureCard({ icon: Icon, title, description, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group card rounded-2xl p-8 border border-subtle hover:shadow-lg transition-all duration-300"
    >
      <div className="mb-6 inline-flex p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
        <Icon size={28} className="text-primary" />
      </div>

      <h3 className="text-xl font-bold text-text mb-3">{title}</h3>

      <p className="text-text/70 leading-relaxed">{description}</p>

      {/* Bottom accent line */}
      <div className="mt-6 h-1 w-0 group-hover:w-12 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"></div>
    </motion.div>
  )
}
