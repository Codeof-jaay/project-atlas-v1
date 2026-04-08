import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getRole, getAuth, checkAuthStatus } from '../utils/auth'; // INTERCEPTOR IMPORTED
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Check, 
  CheckCheck, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Clock,
  Loader,
  FileText
} from 'lucide-react';

const API_BASE_URL = 'https://atlas-backend-1-jvkb.onrender.com/api/v1';

export default function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restrict Dashboard to Candidates only
  useEffect(() => {
    const role = getRole();
    if (role !== 'C' && role !== 'candidate') {
      navigate('/auth');
    }
  }, [navigate]);

  // Fetch candidate's applications and associated jobs
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { access_token } = getAuth();
        if (!access_token) {
          navigate('/auth');
          return;
        }

        const appsResponse = await fetch(`${API_BASE_URL}/my-applications`, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        });

        // 1. PARTNER LOGIC INJECTED HERE
        if (checkAuthStatus(appsResponse, navigate)) return;

        if (!appsResponse.ok) {
          throw new Error(`Failed to fetch applications: ${appsResponse.status}`);
        }

        const appsData = await appsResponse.json();
        setApplications(appsData || []);

        if (appsData && appsData.length > 0) {
          const jobsMap = {};
          for (const app of appsData) {
            if (app.job_id && !jobsMap[app.job_id]) {
              const jobResponse = await fetch(`${API_BASE_URL}/jobs/${app.job_id}`, {
                headers: {
                  'Authorization': `Bearer ${access_token}`,
                  'Content-Type': 'application/json',
                },
              });
              
              // 2. PARTNER LOGIC INJECTED HERE
              if (checkAuthStatus(jobResponse, navigate)) return;
              
              if (jobResponse.ok) {
                const jobData = await jobResponse.json();
                jobsMap[app.job_id] = jobData;
              }
            }
          }
          setJobs(jobsMap);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  // WhatsApp-Style Transparency Logic
  const getStatusUI = (status) => {
    switch (status) {
      case 'applied':
        return { icon: <Check size={18} />, text: 'Sent', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-white/5' };
      case 'reviewed':
        return { icon: <CheckCheck size={18} />, text: 'Viewed', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' };
      case 'shortlisted':
        return { icon: <Calendar size={18} />, text: 'Interview', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' };
      case 'accepted':
        return { icon: <CheckCircle2 size={18} />, text: 'Offer', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
      case 'rejected':
        return { icon: <XCircle size={18} />, text: 'Not Selected', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' };
      default:
        return { icon: <Clock size={18} />, text: 'Processing', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-white/5' };
    }
  };

  // Dynamic Math for Stats Cards
  const stats = [
    { label: 'Total Applications', value: applications.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'In Review', value: applications.filter(a => ['reviewed', 'shortlisted'].includes(a.status)).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Interviews', value: applications.filter(a => a.status === 'shortlisted').length, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Offers', value: applications.filter(a => a.status === 'accepted').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidate Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track your progress in real-time. No more black holes.</p>
        </div>
        <Link to="/jobs" className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all">
          Explore Jobs <ArrowRight size={18} />
        </Link>
      </div>

      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-[#12141C]"
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Applications Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Recent Applications</h2>
          
          {loading && (
            <div className="card p-12 flex flex-col items-center border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#12141C]">
              <Loader size={32} className="text-blue-600 animate-spin mb-4" />
              <p className="text-slate-500">Loading your pipeline...</p>
            </div>
          )}

          {error && (
            <div className="card p-8 text-center border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-500/20 rounded-2xl">
              <p className="text-red-600 dark:text-red-400 font-semibold mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold">Try Again</button>
            </div>
          )}

          {!loading && !error && applications.length === 0 && (
             <div className="card border border-slate-100 dark:border-slate-800 rounded-2xl p-12 text-center bg-white dark:bg-[#12141C] shadow-sm">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Your pipeline is empty</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                  You haven't applied to any roles yet. Check out the job board to find your next great opportunity!
                </p>
                <Link to="/jobs" className="text-blue-600 font-medium hover:underline">
                  Browse open roles
                </Link>
             </div>
          )}

          {!loading && !error && applications.length > 0 && (
            <div className="space-y-4">
              {applications.map((app, index) => {
                const job = jobs[app.job_id];
                const statusUI = getStatusUI(app.status);
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={app.id} 
                    className="group bg-white dark:bg-[#12141C] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {job?.title || 'Loading Role...'}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                        <Briefcase size={14} /> {job?.company_name || 'Loading Company...'}
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusUI.bg}`}>
                        {React.cloneElement(statusUI.icon, { className: statusUI.color })}
                        <span className={`text-xs font-bold uppercase tracking-wider ${statusUI.color}`}>
                          {statusUI.text}
                        </span>
                      </div>
                      <Link to={`/jobs/${app.job_id}`} className="text-xs text-slate-400 hover:text-blue-600 transition-colors">
                        View Details &rarr;
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile Completion Widget (Static for now) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Your Profile</h2>
          <div className="card p-6 border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#12141C] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Profile Strength</span>
              <span className="text-sm font-bold text-blue-600">80%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-6">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2 line-through opacity-70"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Basic Details</li>
              <li className="flex items-center gap-2 line-through opacity-70"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Resume Uploaded</li>
              <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div> Add Portfolio Link</li>
            </ul>
            <Link to="/profile" className="block text-center w-full mt-6 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-sm font-semibold rounded-lg transition-colors">
              Update Profile
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}