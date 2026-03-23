import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase } from 'lucide-react'

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12 px-4">
      {/* Background gradient accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30"
        >
          <Briefcase size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary">The Modern Hiring Platform</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-text mb-6 leading-tight"
        >
          Smarter Hiring,{' '}
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Faster Growth
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-text/70 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Connect with top talent or land your dream job. DashHR makes hiring intelligent, 
          transparent, and effortless for both employers and candidates.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Link
            to="/auth"
            className="group relative px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-green-500 hover:text-blue-500 rounded-lg font-semibold overflow-hidden transition-all duration-300 hover:bg-accent hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2"
          >
            <span>Get Started Free</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/jobs"
            className="px-8 py-4 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all duration-300"
          >
            Browse Jobs
          </Link>
        </motion.div>

        {/* Visual Element - Dashboard Mockup */}
        <motion.div
          variants={itemVariants}
          className="relative"
          whileHover={{ y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl p-1 overflow-hidden border border-primary/40 shadow-2xl">
            <div className="bg-accent backdrop-blur-md rounded-xl p-8 space-y-4">
              {/* Header bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="h-3 bg-primary rounded-full w-1/3"></div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                </div>
              </div>

              {/* Content lines */}
              <div className="space-y-3">
                <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-full w-2/3"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-4/5"></div>
              </div>

              {/* Stats cards grid */}
              <div className="grid grid-cols-3 gap-3 mt-8">
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <div className="h-2 bg-primary rounded mb-2 w-2/3"></div>
                  <div className="h-3 bg-primary/80 rounded font-bold text-sm text-primary">500+</div>
                </div>
                <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
                  <div className="h-2 bg-secondary rounded mb-2 w-2/3"></div>
                  <div className="h-3 bg-secondary/80 rounded font-bold text-sm text-secondary">1.2K+</div>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <div className="h-2 bg-primary rounded mb-2 w-2/3"></div>
                  <div className="h-3 bg-primary/80 rounded font-bold text-sm text-primary">98%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-xl opacity-40 -z-10 animate-pulse"></div>
        </motion.div>
      </motion.div>
    </section>
  )
}
