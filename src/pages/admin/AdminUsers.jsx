import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MoreVertical, ShieldAlert, AlertTriangle, X, CheckCircle2, UserX } from 'lucide-react';

export default function AdminUsers() {
  // Mock Data
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice Johnson', email: 'alice@techcorp.com', role: 'Employer', status: 'Active', joined: '2023-10-12' },
    { id: 2, name: 'Michael Smith', email: 'michael.s@gmail.com', role: 'Candidate', status: 'Active', joined: '2023-11-05' },
    { id: 3, name: 'System Admin', email: 'admin@dashhr.com', role: 'Admin', status: 'Active', joined: '2023-01-01' },
    { id: 4, name: 'Sarah Connor', email: 'sarah.c@yahoo.com', role: 'Candidate', status: 'Suspended', joined: '2024-02-14' },
    { id: 5, name: 'Spam Account', email: 'fake123@scam.net', role: 'Candidate', status: 'Banned', joined: '2024-03-20' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [userToBan, setUserToBan] = useState(null);

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // UX Requirement: Status Color Coding
  const getStatusStyles = (status) => {
    switch(status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'Suspended': return 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300 border-slate-200 dark:border-white/10';
      case 'Banned': return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleBanClick = (user) => {
    setUserToBan(user);
    setBanModalOpen(true);
  };

  const confirmBan = () => {
    setUsers(users.map(u => u.id === userToBan.id ? { ...u, status: 'Banned' } : u));
    setBanModalOpen(false);
    setUserToBan(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor and manage platform access.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
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
                <th className="p-5 pl-6">User / Email</th>
                <th className="p-5">Role</th>
                <th className="p-5">Status</th>
                <th className="p-5">Date Joined</th>
                <th className="p-5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500">
                    <UserX size={32} className="mx-auto mb-3 opacity-50" />
                    No users found matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={user.id} 
                    className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-5 pl-6">
                      <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.role}</span>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${getStatusStyles(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-slate-500">
                      {user.joined}
                    </td>
                    <td className="p-5 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 transition-colors px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg">
                          View
                        </button>
                        {user.status !== 'Banned' && user.role !== 'Admin' && (
                          <button 
                            onClick={() => handleBanClick(user)}
                            className="text-sm font-semibold text-red-600 hover:text-red-800 dark:text-red-400 transition-colors px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                          >
                            Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal Requirement */}
      <AnimatePresence>
        {banModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#1A1D27] rounded-3xl w-full max-w-md border border-gray-200 dark:border-white/10 shadow-2xl p-8"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">Ban User?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-center mb-8">
                Are you sure you want to ban <strong>{userToBan?.name}</strong>? They will immediately lose all access to the platform.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setBanModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmBan}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all"
                >
                  Confirm Ban
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}