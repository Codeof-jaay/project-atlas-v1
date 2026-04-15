import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, TrendingUp, BarChart3 } from 'lucide-react';

export default function AdminAnalytics() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Deep dive into platform performance and growth.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* User Growth Chart (Simulated with CSS) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#12141C] p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="text-indigo-500" size={24} /> User Growth (Last 6 Months)
            </h2>
            <span className="text-sm font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg">+24%</span>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-4">
            {[40, 55, 45, 70, 85, 100].map((height, i) => (
              // FIX: Added 'h-full' and 'justify-end' here so the bars stretch upwards properly!
              <div key={i} className="w-full h-full flex flex-col items-center justify-end gap-3">
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-t-xl h-full flex items-end relative overflow-hidden group">
                  <motion.div 
                    initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                    className="w-full bg-indigo-500 rounded-t-xl group-hover:bg-indigo-400 transition-colors"
                  />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase">
                  {['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'][i]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Job Posting Trends */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#12141C] p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="text-blue-500" size={24} /> Jobs Posted vs Filled
            </h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-slate-700 dark:text-slate-300">Technology</span>
                <span className="text-blue-600">84% Filled</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-3">
                <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} transition={{ duration: 1 }} className="bg-blue-500 h-3 rounded-full" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-slate-700 dark:text-slate-300">Finance</span>
                <span className="text-indigo-600">62% Filled</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-3">
                <motion.div initial={{ width: 0 }} animate={{ width: '62%' }} transition={{ duration: 1 }} className="bg-indigo-500 h-3 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-slate-700 dark:text-slate-300">Healthcare</span>
                <span className="text-emerald-600">91% Filled</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-3">
                <motion.div initial={{ width: 0 }} animate={{ width: '91%' }} transition={{ duration: 1 }} className="bg-emerald-500 h-3 rounded-full" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-slate-700 dark:text-slate-300">Education</span>
                <span className="text-amber-600">45% Filled</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-3">
                <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} transition={{ duration: 1 }} className="bg-amber-500 h-3 rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}