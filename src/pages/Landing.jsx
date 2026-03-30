import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Briefcase, Users, CheckCircle, Zap, TrendingUp, BarChart3, ArrowRight } from 'lucide-react'
import Hero from '../components/Hero'
import FeatureCard from '../components/FeatureCard'
import StatCard from '../components/StatCard'
import JobCard from '../components/JobCard'
import ScrollToTop from '../components/ScrollToTop'
import { getJobs } from '../utils/store'

const FEATURES = [
  {
    icon: Zap,
    title: 'Smart Job Matching',
    description: 'Our AI-powered algorithm matches candidates with opportunities that fit their skills and career goals perfectly.',
  },
  {
    icon: Users,
    title: 'Easy Applications',
    description: 'Apply to jobs with a single click. No lengthy forms. Just your profile and you\'re in.',
  },
  {
    icon: BarChart3,
    title: 'Employer Dashboard',
    description: 'Post jobs, track applications, and manage your hiring pipeline from a beautiful, intuitive dashboard.',
  },
  {
    icon: TrendingUp,
    title: 'Applicant Tracking',
    description: 'Organize and track all your applications in one place. Never miss a promising candidate.',
  },
  {
    icon: CheckCircle,
    title: 'Verified Profiles',
    description: 'Build trust with verified candidate profiles and company badges. Know who you\'re hiring.',
  },
  {
    icon: Briefcase,
    title: 'Industry Insights',
    description: 'Access market data, salary trends, and insights to make informed hiring decisions.',
  },
]

const STATS = [
  { value: '500+', label: 'Jobs Posted' },
  { value: '1.2K+', label: 'Active Candidates' },
  { value: '98%', label: 'Success Rate' },
]

const HOW_IT_WORKS = [
  {
    number: '01',
    title: 'Create Account',
    description: 'Sign up as an employer or candidate in seconds. No credit card required.',
  },
  {
    number: '02',
    title: 'Post or Apply',
    description: 'Employers post jobs. Candidates apply with one click. That\'s it.',
  },
  {
    number: '03',
    title: 'Track Progress',
    description: 'Monitor applications, send messages, and close the deal. All in one place.',
  },
]

export default function Landing() {
  const jobs = getJobs().slice(0, 3)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="w-full">
      <ScrollToTop />
      {/* Hero Section */}
      <Hero />

      {/* Trust Section */}
      <section className="py-16 md:py-20 px-4 border-y border-subtle">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-text/60 text-sm font-semibold mb-12 uppercase tracking-wider"
          >
            Trusted by companies worldwide
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {STATS.map((stat, i) => (
              <StatCard key={i} {...stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-6">
              Powerful Features for Modern Hiring
            </h2>
            <p className="text-lg text-text/70 max-w-2xl mx-auto">
              Everything you need to find the right talent or land your perfect role.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {FEATURES.map((feature, i) => (
              <FeatureCard key={i} {...feature} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-6">
              How It Works
            </h2>
            <p className="text-lg text-text/70 max-w-2xl mx-auto">
              Get started in minutes. No complicated process, just simple and intuitive steps.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Connecting line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[calc(50%+80px)] w-[calc(100%_-_160px)] h-1 bg-gradient-to-r from-primary/30 to-transparent pointer-events-none"></div>
                )}

                <div className="relative card rounded-2xl p-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl text-white text-2xl font-bold mb-6 mx-auto">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-text mb-3">{step.title}</h3>
                  <p className="text-text/70">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
              Featured Opportunities
            </h2>
            <p className="text-lg text-text/70">
              Explore roles from companies actively hiring right now.
            </p>
          </motion.div>

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {jobs.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} />
            ))}
          </div>

          {/* View All CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all duration-300 group"
            >
              View All {jobs.length}+ Jobs
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 px-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Hiring or Get Hired Today
          </h2>
          <p className="text-lg text-white/90 mb-10">
            Join thousands of employers and candidates already using DashHR. 
            It's free, it's simple, and it works.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/auth"
              className="px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Create Account
            </Link>
            <Link
              to="/jobs"
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
            >
              Browse Jobs
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="font-bold text-lg text-primary mb-4">DashHR</h3>
              <p className="text-sm text-text/70">
                Modern hiring platform connecting talent with opportunity.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-text mb-4">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/jobs" className="text-sm text-text/70 hover:text-primary transition-colors">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/employer" className="text-sm text-text/70 hover:text-primary transition-colors">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-sm text-text/70 hover:text-primary transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-text mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-text/70 hover:text-primary transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-text/70 hover:text-primary transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-text/70 hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold text-text mb-4">Follow</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-text/70 hover:text-primary transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-text/70 hover:text-primary transition-colors">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-subtle pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-text/60">
              &copy; 2026 DashHR. All rights reserved.
            </p>
            <p className="text-sm text-text/60 mt-4 md:mt-0">
              Made with ❤️ for hiring teams everywhere
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
