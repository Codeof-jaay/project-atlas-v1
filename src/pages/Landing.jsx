import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, Users, ShieldCheck, Zap, Activity, BarChart3, ArrowRight, Twitter, Linkedin, Github } from 'lucide-react';
import Hero from '../components/Hero';
import FeatureCard from '../components/FeatureCard';
import StatCard from '../components/StatCard';
import JobCard from '../components/JobCard';
import ScrollToTop from '../components/ScrollToTop';
import { getJobs } from '../utils/store';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Mandatory Verification',
    description: 'We require CAC and Bank ID verification for all employers. Build your career in a scam-free, trusted ecosystem.',
  },
  {
    icon: Zap,
    title: 'One-Click Applications',
    description: 'Apply to top Nigerian companies instantly. No redundant forms or forced account creations on external sites.',
  },
  {
    icon: Activity,
    title: 'WhatsApp-Style Tracking',
    description: 'Never fall into a resume black hole again. See exactly when your application is delivered, viewed, and updated.',
  },
  {
    icon: BarChart3,
    title: 'Modern ATS Dashboard',
    description: 'Employers get a lightweight, powerful Applicant Tracking System to manage pipelines without the enterprise bloat.',
  },
  {
    icon: Users,
    title: 'Curated Talent Pools',
    description: 'Access highly skilled, AI-screened professionals ready to make an immediate impact on your business.',
  },
  {
    icon: Briefcase,
    title: 'Transparent Culture',
    description: 'Read real reviews, salary insights, and company culture details before you even hit the apply button.',
  },
];

const STATS = [
  { value: '2,500+', label: 'Verified Employers' },
  { value: '45k+', label: 'Active Candidates' },
  { value: '94%', label: 'Response Rate' },
];

const HOW_IT_WORKS = [
  {
    number: '01',
    title: 'Create & Verify',
    description: 'Sign up in seconds. Employers undergo a fast verification process to ensure platform integrity.',
  },
  {
    number: '02',
    title: 'Connect Instantly',
    description: 'Employers post detailed roles. Candidates apply with a single click using their master profile.',
  },
  {
    number: '03',
    title: 'Track & Hire',
    description: 'Monitor the pipeline with real-time read receipts and status updates. Close the deal faster.',
  },
];

export default function Landing() {
  const jobs = getJobs().slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="w-full bg-white dark:bg-[#0A0C10] transition-colors duration-300">
      <ScrollToTop />
      
      {/* Hero Section */}
      <Hero />

      {/* Trust Section */}
      <section className="py-16 md:py-20 px-6 border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0A0C10]">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-slate-500 dark:text-slate-400 text-sm font-bold mb-12 uppercase tracking-widest"
          >
            Powering modern teams across Africa
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {STATS.map((stat, i) => (
              <StatCard key={i} {...stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 px-6 bg-white dark:bg-[#12141C]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
              The Engine for Modern Hiring
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              We rebuilt the recruitment process from the ground up to prioritize speed, transparency, and trust for both sides of the market.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {FEATURES.map((feature, i) => (
              <FeatureCard key={i} {...feature} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32 px-6 bg-blue-50/50 dark:bg-[#0A0C10] border-y border-gray-100 dark:border-white/5 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
              How DashHR Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Skip the outdated job boards. Get set up and start moving candidates through the pipeline in minutes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Connecting line (Desktop only) */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[calc(50%+4rem)] w-[calc(100%-8rem)] h-[2px] bg-gradient-to-r from-blue-600/30 to-transparent pointer-events-none" />
                )}

                <div className="bg-white dark:bg-[#1A1D27]/80 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 text-center shadow-sm relative z-10 hover:-translate-y-2 transition-transform duration-300">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white text-2xl font-black mb-6 mx-auto shadow-lg shadow-blue-600/30">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-24 md:py-32 px-6 bg-white dark:bg-[#12141C]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                Featured Roles
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Top opportunities from our verified partner network.
              </p>
            </div>
            
            <Link
              to="/jobs"
              className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-blue-50 hover:bg-blue-100 dark:bg-white/5 dark:hover:bg-white/10 text-blue-600 dark:text-white rounded-xl font-bold transition-all group"
            >
              View All Jobs
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {jobs.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} />
            ))}
          </div>

          <Link
            to="/jobs"
            className="md:hidden w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-2xl font-bold transition-all"
          >
            View All Jobs
          </Link>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 md:py-32 px-6 bg-gradient-to-br from-blue-700 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            Ready to experience the future of hiring?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the fastest-growing professional ecosystem in Nigeria. Stop waiting and start moving.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/auth"
              className="w-full sm:w-auto px-10 py-4 bg-white text-blue-700 rounded-2xl font-black hover:bg-gray-50 hover:scale-105 transition-all shadow-xl"
            >
              Create Free Account
            </Link>
            <Link
              to="/jobs"
              className="w-full sm:w-auto px-10 py-4 border border-white/30 text-white rounded-2xl font-bold hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Explore Open Roles
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0A0C10] border-t border-gray-100 dark:border-white/5 pt-16 pb-8 px-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-16">
            
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="text-white" size={16} />
                </div>
                <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight">DashHR</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Bridging the gap between verified employers and elite African talent through transparency and speed.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors"><Twitter size={20} /></a>
                <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors"><Linkedin size={20} /></a>
                <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors"><Github size={20} /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Platform</h4>
              <ul className="space-y-3">
                <li><Link to="/jobs" className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Browse Jobs</Link></li>
                <li><Link to="/employer" className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Post a Job</Link></li>
                <li><Link to="/auth" className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Employer Login</Link></li>
                <li><Link to="/auth" className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Candidate Login</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Trust & Verification</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Support</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} DashHR. All rights reserved.
            </p>
            <p className="text-sm text-slate-500 font-medium">
              Built for the future of work.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};