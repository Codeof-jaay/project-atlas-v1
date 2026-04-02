import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from '../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, X, CheckCircle2, ArrowRight } from 'lucide-react';

const OnboardingCandidate = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [formData, setFormData] = useState({
    full_name: localStorage.getItem('dashhr_full_name') || '',
    skills: [],
    experience_years: '',
    education: '',
    bio: '',
    resume: null,
  });

  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleFileChange = (file) => {
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      setFormData(prev => ({ ...prev, resume: file }));
      setMessage('');
    } else {
      setMessage('Error: Please upload a valid PDF file.');
    }
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
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) return setMessage('Error: Full name is required');
    if (formData.skills.length === 0) return setMessage('Error: Please add at least one skill');
    if (!formData.experience_years) return setMessage('Error: Years of experience is required');

    setLoading(true);
    setMessage('');

    try {
      const submitData = {
        full_name: formData.full_name,
        skills: formData.skills,
        experience_years: parseInt(formData.experience_years),
        education: formData.education || '',
        bio: formData.bio || '',
        resume_url: formData.resume ? formData.resume.name : null 
      };

      const response = await fetch('http://localhost:8000/onboarding/candidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.access_token}`,
        },
        body: JSON.stringify(submitData),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('dashhr_full_name', formData.full_name);
        localStorage.setItem('dashhr_onboarding_completed', 'true');
        setCompleted(true);
        
        setTimeout(() => {
          navigate('/dashboard');
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
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Profile Complete!</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg">Redirecting to your dashboard...</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Build Your Master Profile</h2>
                <p className="text-slate-500 dark:text-slate-400">Complete this once, apply to jobs in one click forever.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {message && (
                  <div className={`p-4 rounded-xl text-sm font-medium border ${message.includes('Error') ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                    {message}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Full Name *</label>
                  <input
                    type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required
                    placeholder="e.g. John Doe"
                    className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Core Skills *</label>
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      placeholder="e.g. React, Python, Product Management"
                      className="flex-1 bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                    />
                    <button type="button" onClick={handleAddSkill} className="px-6 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold rounded-xl transition-colors">
                      Add
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map(skill => (
                      <motion.div
                        key={skill} initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-gray-200 dark:border-white/10 group"
                      >
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-slate-400 group-hover:text-red-500 transition-colors">
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Years of Experience *</label>
                    <select
                      name="experience_years" value={formData.experience_years} onChange={handleInputChange} required
                      className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none appearance-none"
                    >
                      <option value="" disabled>Select experience level</option>
                      <option value="0">Fresher (0 years)</option>
                      <option value="1">1 year</option>
                      <option value="2">2 years</option>
                      <option value="3">3-4 years</option>
                      <option value="5">5-9 years</option>
                      <option value="10">10+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Highest Education</label>
                    <input
                      type="text" name="education" value={formData.education} onChange={handleInputChange}
                      placeholder="e.g. BSc Computer Science"
                      className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Short Bio</label>
                  <textarea
                    name="bio" value={formData.bio} onChange={handleInputChange} rows="3"
                    placeholder="Tell employers what makes you great..."
                    className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Master Resume (PDF)</label>
                  <div 
                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D27] hover:border-blue-300 dark:hover:border-blue-500/30'}`}
                  >
                    <input 
                      type="file" accept=".pdf" onChange={(e) => handleFileChange(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud size={28} className={`mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                    {formData.resume ? (
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{formData.resume.name}</span>
                    ) : (
                      <>
                        <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">Upload your resume</p>
                        <p className="text-xs text-slate-400">PDFs only. Max 5MB.</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit" disabled={loading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Saving Profile...' : 'Complete Profile'}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                  <button
                    type="button" onClick={() => navigate('/dashboard')}
                    className="w-full mt-4 py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    Skip for now, I'll do this later
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

export default OnboardingCandidate;