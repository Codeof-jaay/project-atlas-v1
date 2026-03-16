import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, LogIn, ArrowRight } from 'lucide-react';

const AuthPage = () => {
  // States: 'login' | 'employer' | 'employee'
  const [view, setView] = useState('login');

  const variants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans" style={{color: 'rgb(var(--text))' }}>
      {/* Background Gradient Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#274690] blur-[120px] opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#576CA8] blur-[120px] opacity-20" />
      </div>

  <div className="w-full max-max-w-md card backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ background: 'linear-gradient(90deg, rgba(var(--color-primary),1), rgba(var(--color-primary),0.8))', WebkitBackgroundClip: 'text', color: 'rgba(var(--text),0.8)' }}>
            Hybrid ATS & HR
          </h1>
          <p className="mt-2 text-muted">
            {view === 'login' ? 'Welcome back' : `Join as ${view}`}
          </p>
        </div>

        {/* View Toggle Controls */}
  <div className="flex p-1 rounded-2xl mb-8  border border-slate-800 border-opacity-10" style={{ backgroundColor: 'rgba(var(--text),0.04)' }}>
          <button
            onClick={() => setView('login')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${view === 'login' ? 'btn-primary text-white' : 'text-muted'}`}
          >
            <LogIn size={18} /> Login
          </button>
          <button
            onClick={() => setView('employer')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${view === 'employer' ? 'btn-primary text-white' : 'text-muted'}`}
          >
            <Building2 size={18} /> Employer
          </button>
          <button
            onClick={() => setView('employee')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${view === 'employee' ? 'btn-primary text-white' : 'text-muted'}`}
          >
            <User size={18} /> Employee
          </button>
        </div>

        {/* Dynamic Form Content */}
        <div className="relative overflow-hidden min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                
                {/* Common Email Field */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="name@company.com"
                    className="w-full input"
                  />
                </div>

                {/* Specific Fields for Employer */}
                {view === 'employer' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 ml-1">Company Name</label>
                    <input 
                      type="text" 
                      placeholder="TechCorp Ltd"
                      className="w-full input"
                    />
                  </motion.div>
                )}

                {/* Specific Fields for Employee */}
                {view === 'employee' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full input"
                    />
                  </motion.div>
                )}

                {/* Common Password Field */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 ml-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full input"
                  />
                </div>

                {/* Submit Button */}
                <button className="w-full btn-primary font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  {view === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Link */}
        <p className="text-center text-slate-500 text-sm mt-8">
          {view === 'login' ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setView(view === 'login' ? 'employee' : 'login')}
            className="ml-2 muted-link hover:underline font-medium"
          >
            {view === 'login' ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;