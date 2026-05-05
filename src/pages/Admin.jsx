import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, getRole, checkAuthStatus } from '../utils/auth';
import { motion } from 'framer-motion';
import { Users, Briefcase, BarChart3, Trash2, ToggleRight, AlertCircle, Loader } from 'lucide-react';
import { isVercelAnalyticsLoaded, getVercelMetrics, trackEvent, fetchAdminAnalytics } from '../utils/analytics';

const API_BASE_URL = 'https://atlas-backend-1-jvkb.onrender.com/api/v1';

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Enforce Admin Role
  useEffect(() => {
    if (getRole() !== 'A') {
      navigate('/auth');
    }
  }, [navigate]);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { access_token } = getAuth();
        if (!access_token) {
          navigate('/auth');
          return;
        }

        if (activeTab === 'analytics') {
          try {
            const data = await fetchAdminAnalytics(API_BASE_URL, access_token);
            setAnalytics(data);
          } catch (err) {
            throw err;
          }
        } else if (activeTab === 'users') {
          const response = await fetch(`${API_BASE_URL}/admin/users?skip=0&limit=100`, {
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json',
            },
          });

          if (checkAuthStatus(response, navigate)) return;

          if (!response.ok) throw new Error('Failed to fetch users');
          const data = await response.json();
          setUsers(data);
        } else if (activeTab === 'jobs') {
          const response = await fetch(`${API_BASE_URL}/admin/jobs?skip=0&limit=100`, {
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json',
            },
          });

          if (checkAuthStatus(response, navigate)) return;

          if (!response.ok) throw new Error('Failed to fetch jobs');
          const data = await response.json();
          setJobs(data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, navigate]);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(userId);
      const { access_token } = getAuth();

      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (checkAuthStatus(response, navigate)) return;

      if (!response.ok) throw new Error('Failed to update user status');

      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
    } catch (err) {
      console.error('Error updating user:', err);
      alert(`Failed to update user: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      setActionLoading(jobId);
      const { access_token } = getAuth();

      const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (checkAuthStatus(response, navigate)) return;

      if (!response.ok) throw new Error('Failed to delete job');

      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
      alert(`Failed to delete job: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-white dark:bg-[#12141C] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0C10] pt-24 pb-12 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage platform, users, and jobs</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-white/10">
          {[
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'jobs', label: 'Jobs', icon: Briefcase },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-6 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200">Error</h3>
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics && (
                <>
                  <StatCard icon={Users} title="Total Users" value={analytics.total_users} color="bg-blue-600" />
                  <StatCard icon={Users} title="Candidates" value={analytics.total_candidates} color="bg-green-600" />
                  <StatCard icon={Users} title="Employers" value={analytics.total_employers} color="bg-purple-600" />
                  <StatCard icon={Briefcase} title="Total Jobs" value={analytics.total_jobs} color="bg-orange-600" />
                  <StatCard icon={Briefcase} title="Active Jobs" value={analytics.active_jobs} color="bg-cyan-600" />
                  <StatCard icon={Briefcase} title="Applications" value={analytics.total_applications} color="bg-pink-600" />
                </>
              )}
            </div>

            {/* Client-side analytics panel (Vercel) */}
            <div className="bg-white dark:bg-[#12141C] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Client Analytics</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">This panel shows whether client-side analytics (Vercel Web Analytics) is loaded and lets you emit a test event.</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Vercel analytics loaded:</p>
                  <p className="font-medium">{isVercelAnalyticsLoaded() ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Client metrics (if available):</p>
                  <pre className="text-xs text-slate-700 dark:text-slate-300 bg-gray-50 dark:bg-white/5 p-2 rounded max-w-xl overflow-auto">{JSON.stringify(getVercelMetrics(), null, 2) || '—'}</pre>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    const ok = trackEvent('admin_test_event', { time: Date.now() });
                    if (!ok) alert('No analytics provider available to track events.');
                    else alert('Test event sent (best-effort).');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Send test event
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-slate-900 dark:text-white rounded hover:opacity-90"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="bg-white dark:bg-[#12141C] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                    <th className="px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Email</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Role</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Created</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-6 py-3 text-sm text-slate-900 dark:text-white">{user.email}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'C' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' :
                          user.role === 'R' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                        }`}>
                          {user.role === 'C' ? 'Candidate' : user.role === 'R' ? 'Employer' : 'Admin'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className={user.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                          disabled={actionLoading === user.id}
                          className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === user.id ? <Loader className="w-3 h-3 animate-spin" /> : <ToggleRight size={14} />}
                          {user.is_active ? 'Ban' : 'Unban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#12141C] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                    <th className="px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Title</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Company</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Applications</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Created</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-6 py-3 text-sm font-medium text-slate-900 dark:text-white">{job.title}</td>
                      <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">{job.company_name}</td>
                      <td className="px-6 py-3 text-sm text-slate-900 dark:text-white">{job.applications_count}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={job.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(job.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={actionLoading === job.id}
                          className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === job.id ? <Loader className="w-3 h-3 animate-spin" /> : <Trash2 size={14} />}
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
