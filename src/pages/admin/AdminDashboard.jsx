import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, CheckCircle, TrendingUp, ShieldAlert, Activity } from 'lucide-react';

export default function AdminDashboard() {
  // placeholder
  const kpis = [
    { label: 'Total Users', value: '12,450', icon: Users, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Total Jobs', value: '842', icon: Briefcase, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Pending Approvals', value: '24', icon: CheckCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Monthly Growth', value: '+18.2%', icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">System Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Platform health and high-level metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-[#12141C] p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${kpi.bg}`}>
                <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                <h3 className="text-3xl font-black mt-1 text-slate-900 dark:text-white">{kpi.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & System Status */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#12141C] p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="text-indigo-500" size={24} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold transition-colors flex justify-between items-center text-left">
              Review Pending Jobs <span>→</span>
            </button>
            <button className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold transition-colors flex justify-between items-center text-left">
              Investigate Reported Users <span>→</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#12141C] p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-emerald-500" size={24} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Status</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-black/20">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Database Connection</span>
              <span className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">Online</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-black/20">
              <span className="font-semibold text-slate-600 dark:text-slate-400">API Gateway</span>
              <span className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">Healthy</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}