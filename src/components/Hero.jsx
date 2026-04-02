import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }, // Smooth custom ease
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16 px-6 bg-white dark:bg-[#0A0C10] transition-colors duration-300">
      
      {/* Background Gradient*/}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px]"></div>
      </div>

      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 backdrop-blur-md shadow-sm"
        >
          <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 tracking-wide">
            Nigeria's Verified Talent Ecosystem
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight"
        >
          Hire Smarter. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Grow Faster.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Eliminate the "black hole." Connect with verified employers and top-tier talent on a platform built for absolute transparency and speed.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link
            to="/auth"
            className="group relative w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 flex items-center justify-center gap-2"
          >
            <span>Get Started Free</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/jobs"
            className="w-full sm:w-auto px-8 py-4 border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-800 dark:text-white rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Sparkles size={18} className="text-slate-400" />
            <span>Browse Jobs</span>
          </Link>
        </motion.div>

        {/* Visual Element*/}
        <motion.div
          variants={itemVariants}
          className="relative mx-auto max-w-4xl"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Outer Glass Container */}
          <div className="relative bg-white/40 dark:bg-[#12141C]/60 backdrop-blur-2xl rounded-3xl p-2 md:p-4 border border-white/40 dark:border-white/10 shadow-2xl overflow-hidden">
            
            {/* Inner "App" Window */}
            <div className="bg-gray-50 dark:bg-[#0A0C10] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-inner">
              
              {/* Fake Mac Window Controls */}
              <div className="bg-gray-100 dark:bg-[#1A1D27] px-4 py-3 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="mx-auto w-32 h-4 bg-gray-200 dark:bg-white/5 rounded-full"></div>
              </div>

              {/* Fake Dashboard Layout */}
              <div className="flex h-64 md:h-80">
                {/* Sidebar */}
                <div className="hidden md:block w-48 border-r border-gray-200 dark:border-white/5 p-4 space-y-4">
                  <div className="h-6 w-24 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-8"></div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-200 dark:bg-white/10 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/5 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-200 dark:bg-white/5 rounded"></div>
                  </div>
                </div>

                {/* Main Content (Candidate Pipeline) */}
                <div className="flex-1 p-6 flex gap-4 overflow-hidden">
                  {/* Pipeline Column 1 */}
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-white/10 rounded mb-4"></div>
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white dark:bg-[#1A1D27] p-3 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="h-3 w-24 bg-gray-300 dark:bg-white/20 rounded"></div>
                          {/* Fake Blue Tick */}
                          <div className="h-3 w-3 bg-blue-500 rounded-full"></div> 
                        </div>
                        <div className="h-2 w-16 bg-gray-200 dark:bg-white/10 rounded"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pipeline Column 2 */}
                  <div className="hidden sm:block flex-1 space-y-3">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded mb-4"></div>
                    <div className="bg-white dark:bg-[#1A1D27] p-3 rounded-xl border border-blue-200 dark:border-blue-500/30 shadow-md shadow-blue-500/5">
                      <div className="flex justify-between items-start mb-2">
                        <div className="h-3 w-20 bg-blue-600 dark:bg-blue-400 rounded"></div>
                      </div>
                      <div className="h-2 w-full bg-blue-100 dark:bg-blue-900/50 rounded mb-1"></div>
                      <div className="h-2 w-2/3 bg-blue-100 dark:bg-blue-900/50 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Underlying Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-blue-600/20 rounded-[3rem] blur-2xl opacity-50 -z-10 animate-pulse"></div>
        </motion.div>
      </motion.div>
    </section>
  );
}