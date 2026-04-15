import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Search, ShieldAlert, UserX, CheckCircle, Trash2 } from 'lucide-react';

export default function AdminLogs() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Data. supply real data via GET /api/v1/admin/logs
  const logs = [
    { id: 1, admin: 'System Admin', action: 'Banned User', target: 'fake123@scam.net', time: '2026-04-15 14:30', type: 'danger' },
    { id: 2, admin: 'System Admin', action: 'Approved Job', target: 'Senior Frontend Engineer (TechNova)', time: '2026-04-15 11:15', type: 'success' },
    { id: 3, admin: 'Moderator_01', action: 'Rejected Job', target: 'Get Rich Quick (Shady LLC)', time: '2026-04-14 16:45', type: 'warning' },
    { id: 4, admin: 'System Admin', action: 'System Update', target: 'API Gateway', time: '2026-04-14 02:00', type: 'info' },
    { id: 5, admin: 'System Admin', action: 'Suspended User', target: 'sarah.c@yahoo.com', time: '2026-04-13 09:20', type: 'warning' },
  ];

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.admin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLogIcon = (type) => {
    switch(type) {
      case 'danger': return <UserX size={16} className="text-red-500" />;
      case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'warning': return <ShieldAlert size={16} className="text-amber-500" />;
      default: return <ClipboardList size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Audit Logs</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Chronological security and tracking records.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="p-5 pl-6">Time</th>
                <th className="p-5">Admin</th>
                <th className="p-5">Action</th>
                <th className="p-5">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500">
                    No logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={log.id} 
                    className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="p-5 pl-6 text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {log.time}
                    </td>
                    <td className="p-5 font-semibold text-slate-700 dark:text-slate-300">
                      {log.admin}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                        {getLogIcon(log.type)} {log.action}
                      </div>
                    </td>
                    <td className="p-5 text-sm text-slate-600 dark:text-slate-400">
                      {log.target}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}