import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Mail, User, ChevronLeft, Search, Loader, AlertCircle } from 'lucide-react';
import { getAuth } from '../utils/auth';

const API_BASE_URL = 'https://atlas-backend-1-jvkb.onrender.com/api/v1';

export default function Applicants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Load job and applications from API
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

        // Fetch job details
        const jobResponse = await fetch(`${API_BASE_URL}/jobs/${id}`, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!jobResponse.ok) {
          throw new Error('Job not found');
        }

        const jobData = await jobResponse.json();
        setJob(jobData);

        // Fetch applications for this job
        const appsResponse = await fetch(`${API_BASE_URL}/jobs/${id}/applications`, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!appsResponse.ok) {
          throw new Error('Failed to fetch applications');
        }

        const appsData = await appsResponse.json();
        setApps(appsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const onChangeStatus = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      const { access_token } = getAuth();

      const response = await fetch(`${API_BASE_URL}/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update status');
      }

      // Update local state for instant UI feedback
      setApps(apps.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error('Error updating status:', err);
      alert(`Failed to update application status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied': return 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300';
      case 'reviewed': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300';
      case 'shortlisted': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
      case 'accepted': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0C10] pt-24 pb-12 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-500/30 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading applicants...</p>
            </div>
          </div>
        ) : error || !job ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{error || 'Job not found'}</h2>
              <Link to="/employer" className="inline-block text-blue-600 hover:text-blue-500 font-semibold mt-4">
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <Link to="/employer" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-4">
                  <ChevronLeft size={16} /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Applicants for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{job.title}</span>
                </h1>
                <p className="text-slate-500 mt-1">Total Candidates: {apps.length}</p>
              </div>
              
              {/* Future feature: Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search candidates..." 
                  className="pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                />
              </div>
            </div>

            {/* ATS Table */}
            <div className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="p-4 pl-6">Candidate ID</th>
                      <th className="p-4">Applied At</th>
                      <th className="p-4 text-center">Resume</th>
                      <th className="p-4 pr-6">Pipeline Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-500">
                          No applications yet.
                        </td>
                      </tr>
                    ) : (
                      apps.map((a, index) => (
                        <motion.tr 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          key={a.id} 
                          className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                        >
                          <td className="p-4 pl-6">
                            <span className="font-medium text-slate-900 dark:text-white">Candidate #{a.candidate_id}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {new Date(a.applied_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {a.resume_url ? (
                              <a 
                                href={a.resume_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                              >
                                <FileText size={16} />
                                View Resume
                              </a>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </td>
                          <td className="p-4 pr-6">
                            <div className="relative">
                              <select 
                                value={a.status || 'applied'} 
                                onChange={(e) => onChangeStatus(a.id, e.target.value)}
                                disabled={updatingId === a.id}
                                className={`appearance-none w-full md:w-40 px-3 py-2 text-sm font-bold rounded-xl cursor-pointer outline-none transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColor(a.status)}`}
                              >
                                <option value="applied">Applied</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                              </select>
                              {updatingId === a.id && (
                                <Loader className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-600" size={16} />
                              )}
                              {!updatingId && (
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                  <ChevronLeft size={14} className="rotate-[-90deg] opacity-50" />
                                </div>
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
          </>
        )}

      </div>
    </div>
  );
}