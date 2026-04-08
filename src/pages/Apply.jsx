import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle2, Building2, MapPin, ArrowLeft, AlertCircle } from 'lucide-react';
import { getAuth, handleAuthError } from '../utils/auth'; // PARTNER FIX: Imported handler

const API_BASE_URL = 'https://atlas-backend-1-jvkb.onrender.com/api/v1';

export default function Apply() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobError, setJobError] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch job details and check if already applied
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
        if (!response.ok) {
          throw new Error('Job not found');
        }
        const data = await response.json();
        setJob(data);
        setJobError('');

        // Check if user already applied
        const { access_token } = getAuth();
        if (access_token) {
          const appsResponse = await fetch(`${API_BASE_URL}/my-applications`, {
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json',
            },
          });

          // PARTNER FIX: Added explicit 401 handling
          if (appsResponse.status === 401) {
            handleAuthError(navigate);
            return;
          }

          if (appsResponse.ok) {
            const appsData = await appsResponse.json();
            const alreadyApplied = appsData.some(app => app.job_id === parseInt(jobId));
            setHasApplied(alreadyApplied);
          }
        }
      } catch (err) {
        setJobError(err.message || 'Failed to load job details');
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0A0C10] pt-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-500/30 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0A0C10] pt-24">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Job not found</h2>
          <Link to="/jobs" className="inline-block text-blue-600 hover:text-blue-500 font-semibold">Return to jobs</Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const { access_token } = getAuth();
      if (!access_token) {
        throw new Error('You must be logged in to apply');
      }

      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({
          cover_letter: coverLetter,
          resume_url: resumeUrl
        })
      });

      // PARTNER FIX: Added explicit 401 handling
      if (response.status === 401) {
        handleAuthError(navigate);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit application');
      }

      setSubmitted(true);
      setHasApplied(true);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0C10] pt-24 pb-12 px-6 transition-colors duration-300 flex justify-center">
      <div className="w-full max-w-2xl">
        
        <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Job Description
        </Link>

        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#12141C] p-10 rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl text-center"
          >
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Application Sent!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Your application for <span className="font-semibold text-slate-900 dark:text-white">{job.title}</span> at <span className="font-semibold text-slate-900 dark:text-white">{job.company_name}</span> has been securely delivered. 
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                Track Status
              </Link>
              <Link to="/jobs" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl font-bold transition-all">
                Browse More Jobs
              </Link>
            </div>
          </motion.div>
        ) : hasApplied ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#12141C] p-10 rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl text-center"
          >
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Already Applied</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              You have already applied to <span className="font-semibold text-slate-900 dark:text-white">{job.title}</span> at <span className="font-semibold text-slate-900 dark:text-white">{job.company_name}</span>. 
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                View Your Applications
              </Link>
              <Link to="/jobs" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl font-bold transition-all">
                Browse Other Jobs
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#12141C] rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden"
          >
            {/* Job Header Info */}
            <div className="bg-gray-50/50 dark:bg-white/5 p-8 border-b border-gray-200 dark:border-white/10">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Building2 size={16}/> {job.company_name}</span>
                <span className="flex items-center gap-1.5"><MapPin size={16}/> {job.location}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="p-8 space-y-6">
              
              {submitError && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl flex gap-3">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-200">Error submitting application</p>
                    <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Cover Letter</label>
                <textarea 
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're a great fit for this role..."
                  rows={6}
                  className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Resume URL</label>
                <input 
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://example.com/resume.pdf"
                  className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}