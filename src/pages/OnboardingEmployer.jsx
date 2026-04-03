import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from '../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Building2, ShieldCheck } from 'lucide-react';

const OnboardingEmployer = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [formData, setFormData] = useState({
    company_name: localStorage.getItem('dashhr_company_name') || '',
    company_size: '',
    industry: '',
    company_description: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState(false);

  const companySizeOptions = [
    { value: '1-10', label: '1-10 employees (Startup)' },
    { value: '11-50', label: '11-50 employees (Growing SME)' },
    { value: '51-200', label: '51-200 employees (Mid-Size)' },
    { value: '201-500', label: '201-500 employees (Enterprise)' },
    { value: '500+', label: '500+ employees (Large Enterprise)' },
  ];

  const industryOptions = [
    'Technology & Software',
    'FinTech & Banking',
    'Healthcare & Medical',
    'Logistics & Supply Chain',
    'E-commerce & Retail',
    'Education & EdTech',
    'Manufacturing & Industrial',
    'Media & Entertainment',
    'Consulting & Professional Services',
    'Real Estate & Construction',
    'Other',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.company_name.trim()) return setMessage('Error: Company name is required');
    if (!formData.company_size) return setMessage('Error: Company size is required');
    if (!formData.industry) return setMessage('Error: Industry is required');

    setLoading(true);
    setMessage('');

    try {
      const submitData = {
        company_name: formData.company_name,
        company_size: formData.company_size,
        industry: formData.industry,
        company_description: formData.company_description || '',
      };

      const response = await fetch('https://atlas-backend-1-jvkb.onrender.com/onboarding/employer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('dashhr_company_name', formData.company_name);
        localStorage.setItem('dashhr_onboarding_completed', 'true');
        setCompleted(true);
        
        setTimeout(() => {
          navigate('/employer');
        }, 2000);
      } else {
        setMessage(`Error: ${data.detail || data.message || 'Onboarding failed'}`);
      }
    } catch (error) {
      setMessage(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0C10] flex items-center justify-center p-4 py-12 transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        className="w-full max-w-2xl bg-white/80 dark:bg-[#12141C]/80 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          {completed ? (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 size={48} className="text-emerald-600 dark:text-emerald-400" />
              </motion.div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Company Created!</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg">Preparing your ATS Dashboard...</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100 dark:border-blue-500/20">
                  <Building2 size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Set Up Your Organization</h2>
                <p className="text-slate-500 dark:text-slate-400">Establish your presence on Nigeria's verified talent ecosystem.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {message && (
                  <div className={`p-4 rounded-xl text-sm font-medium border ${message.includes('Error') ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                    {message}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Company / Organization Name *</label>
                  <input
                    type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} required
                    placeholder="e.g. Acme Tech Solutions Ltd."
                    className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Company Size *</label>
                    <select
                      name="company_size" value={formData.company_size} onChange={handleInputChange} required
                      className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none appearance-none"
                    >
                      <option value="" disabled>Select headcount</option>
                      {companySizeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Primary Industry *</label>
                    <select
                      name="industry" value={formData.industry} onChange={handleInputChange} required
                      className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none appearance-none"
                    >
                      <option value="" disabled>Select sector</option>
                      {industryOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Company Profile & Culture</label>
                  <textarea
                    name="company_description" value={formData.company_description} onChange={handleInputChange} rows="4"
                    placeholder="What does your company do? What is the work culture like? (Candidates read this before applying)"
                    className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none"
                  />
                </div>

                {/* Trust/Verification Note */}
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/10 flex gap-3">
                  <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                    <strong>DashHR Verification:</strong> After onboarding, you will need to provide your CAC (Corporate Affairs Commission) registration number before your job postings go live.
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    type="submit" disabled={loading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Finalizing Setup...' : 'Enter Dashboard'}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                  <button
                    type="button" onClick={() => navigate('/employer')}
                    className="w-full mt-4 py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    Skip to dashboard (Limited Access)
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default OnboardingEmployer;