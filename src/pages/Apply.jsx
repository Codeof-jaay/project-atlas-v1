import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobById, saveApplication } from '../utils/store';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle2, Building2, MapPin, ArrowLeft } from 'lucide-react';

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Apply() {
  const { jobId } = useParams();
  const job = jobId ? getJobById(jobId) : null;
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cv, setCv] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-fill email if logged in
  useEffect(() => {
    const savedEmail = localStorage.getItem('dashhr_user_email');
    if (savedEmail) setEmail(savedEmail);
  }, []);

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Job not found.
      </div>
    );
  }

  const onSubmit = (e) => {
    e.preventDefault();
    const app = {
      id: uid(),
      jobId: job.id,
      name,
      email,
      phone,
      cv: cv ? cv.name : undefined,
      status: 'Applied', // Triggers the "Sent" tick
    };
    saveApplication(app);
    setSubmitted(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCv(e.dataTransfer.files[0]);
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
              Your application for <span className="font-semibold text-slate-900 dark:text-white">{job.title}</span> at <span className="font-semibold text-slate-900 dark:text-white">{job.company}</span> has been securely delivered. 
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
                <span className="flex items-center gap-1.5"><Building2 size={16}/> {job.company}</span>
                <span className="flex items-center gap-1.5"><MapPin size={16}/> {job.location}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="p-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Full Name</label>
                  <input 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="John Doe"
                    className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="john@example.com"
                    className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Phone Number (Optional)</label>
                <input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+234 800 000 0000"
                  className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" 
                />
              </div>

              {/* Custom File Upload */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Resume / CV (PDF or DOCX)</label>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D27] hover:border-blue-300 dark:hover:border-blue-500/30'}`}
                >
                  <input 
                    type="file" 
                    required
                    onChange={(e) => setCv(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.doc,.docx"
                  />
                  <UploadCloud size={32} className={`mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                  {cv ? (
                    <div className="text-blue-600 dark:text-blue-400 font-medium">
                      {cv.name}
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-400">Maximum file size 5MB.</p>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                  Submit Application
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}