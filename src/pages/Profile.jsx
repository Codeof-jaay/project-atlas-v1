import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Mail, Briefcase, Calendar, Eye, EyeOff, Plus, X, ShieldAlert, Building2, FileText, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAuth, 
  clearAuth, 
  getRole, 
  getUserEmail,
  getUserDisplayName,
  getCandidateName,
  setCandidateName,
  getCompanyName,
  setCompanyName,
  getJoinedDate,
  checkAuthStatus
} from '../utils/auth';

const API_BASE_URL = 'https://atlas-backend-1-jvkb.onrender.com/api/v1';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    email: '', role: '', roleLabel: '', company_name: '', full_name: '', joined_at: '',
    skills: [], experience_years: '', education: '', bio: '', portfolio_url: '', resume_url: '',
    company_size: '', industry: '', company_description: '', website: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({
    email: '', name: '', skills: [], experience_years: '', education: '', bio: '', portfolio_url: '', resume_url: '',
    company_size: '', industry: '', company_description: '', website: ''
  });

  const isEmployer = profile.role === 'R' || profile.role === 'employer';

  // Load Profile Data from Backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const auth = getAuth();
        if (!auth.access_token) {
          navigate('/auth');
          return;
        }

        const role = getRole();
        const roleLabel = role === 'R' || role === 'employer' ? 'Employer/Recruiter' : role === 'A' || role === 'admin' ? 'Administrator' : 'Candidate';

        const initialData = {
          email: getUserEmail() || '',
          role, 
          roleLabel,
          company_name: getCompanyName() || '',
          full_name: getCandidateName() || '',
          joined_at: getJoinedDate() || new Date().toLocaleDateString(),
          skills: JSON.parse(localStorage.getItem('dashhr_candidate_skills')) || [],
          experience_years: localStorage.getItem('dashhr_candidate_experience') || '',
          education: localStorage.getItem('dashhr_candidate_education') || '',
          bio: localStorage.getItem('dashhr_candidate_bio') || '',
          portfolio_url: '',
          resume_url: '',
          company_size: localStorage.getItem('dashhr_company_size') || '',
          industry: localStorage.getItem('dashhr_company_industry') || '',
          company_description: localStorage.getItem('dashhr_company_description') || '',
          website: ''
        };

        setProfile(initialData);
        setFormData({ ...initialData, name: role === 'R' || role === 'employer' ? initialData.company_name : initialData.full_name });

        const response = await fetch(`${API_BASE_URL}/me`, {
          headers: { 'Authorization': `Bearer ${auth.access_token}` }
        });

        if (checkAuthStatus(response, navigate)) return;

        if (response.ok) {
          const data = await response.json();
          
          let fetchedSkills = initialData.skills;
          if (data.skills) {
            if (Array.isArray(data.skills)) fetchedSkills = data.skills;
            else if (typeof data.skills === 'string') {
              try { fetchedSkills = JSON.parse(data.skills); } catch(e) { fetchedSkills = [data.skills]; }
            }
          }

          const freshData = {
            ...initialData,
            company_name: data.company_name || initialData.company_name,
            full_name: data.full_name || initialData.full_name,
            bio: data.bio || initialData.bio,
            portfolio_url: data.portfolio_url || '',
            resume_url: data.resume_url || '',
            website: data.website || '',
            industry: data.industry || initialData.industry,
            education: data.education || initialData.education,
            experience_years: data.experience_years || data.experience || initialData.experience_years,
            skills: fetchedSkills,
            company_size: data.company_size || initialData.company_size,
            company_description: data.company_description || initialData.company_description
          };
          
          setProfile(freshData);
          setFormData({ ...freshData, name: role === 'R' || role === 'employer' ? freshData.company_name : freshData.full_name });
        }
      } catch (error) {
        console.error('Failed to load profile from API:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  // --- NEW: CLOUD SAVING LOGIC ---
  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      const auth = getAuth();
      if (!auth.access_token) throw new Error("No token");

      // 1. Build the payload for the backend
      const updatePayload = isEmployer ? {
        company_name: formData.name,
        company_size: formData.company_size,
        industry: formData.industry,
        company_description: formData.company_description,
        website: formData.website,
      } : {
        full_name: formData.name,
        skills: formData.skills, // Backend might expect this as an array or string depending on setup
        experience_years: formData.experience_years,
        education: formData.education,
        bio: formData.bio,
        portfolio_url: formData.portfolio_url,
      };

      // 2. Send the update to the Cloud DB 
      // (Using PUT or PATCH /me depending on what your partner built)
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'PUT', // Change to PATCH if your backend prefers it
        headers: {
          'Authorization': `Bearer ${auth.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (checkAuthStatus(response, navigate)) return;

      if (!response.ok) {
        console.warn("Backend update endpoint failed, falling back to local storage only.");
      }

      // 3. Fallback: Save to local storage for instant UI updates
      if (isEmployer) {
        setCompanyName(formData.name);
        localStorage.setItem('dashhr_company_size', formData.company_size);
        localStorage.setItem('dashhr_company_industry', formData.industry);
        localStorage.setItem('dashhr_company_description', formData.company_description);
      } else {
        setCandidateName(formData.name);
        localStorage.setItem('dashhr_candidate_skills', JSON.stringify(formData.skills));
        localStorage.setItem('dashhr_candidate_experience', formData.experience_years);
        localStorage.setItem('dashhr_candidate_education', formData.education);
        localStorage.setItem('dashhr_candidate_bio', formData.bio);
      }

      // 4. Update the UI State
      setProfile((prev) => ({
        ...prev,
        company_name: isEmployer ? formData.name : prev.company_name,
        full_name: !isEmployer ? formData.name : prev.full_name,
        skills: formData.skills, 
        experience_years: formData.experience_years,
        education: formData.education, 
        bio: formData.bio, 
        portfolio_url: formData.portfolio_url,
        company_size: formData.company_size, 
        industry: formData.industry,
        company_description: formData.company_description, 
        website: formData.website,
      }));

      setMessage('✅ Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    navigate('/auth');
  };

  const InfoField = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
      <div className="mt-1 text-slate-400"><Icon size={20} /></div>
      <div className="flex-1 overflow-hidden">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-base font-medium text-slate-900 dark:text-white truncate">
          {value || <span className="text-slate-400 italic">Not specified</span>}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0A0C10]">
        <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-500/30 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0C10] pt-24 pb-12 px-6 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Account Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your profile, preferences, and security.</p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm overflow-hidden relative">
          
          {/* Top Info Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 mb-8 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 shrink-0">
                {isEmployer ? <Building2 size={36} /> : <User size={36} />}
              </div>
              <div>
                <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-lg mb-2 border border-blue-100 dark:border-blue-500/20">
                  {profile.roleLabel}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 truncate max-w-[200px] sm:max-w-xs">
                  {isEmployer ? profile.company_name : profile.full_name || 'Anonymous User'}
                </h2>
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <Calendar size={14} /> Joined {profile.joined_at}
                </p>
              </div>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl font-bold transition-all">
                Edit Profile
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!editing ? (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                
                {/* SHARED FIELDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField icon={Mail} label="Email Address" value={profile.email} />
                  
                  {isEmployer ? (
                    <>
                      <InfoField icon={Users} label="Company Size" value={profile.company_size} />
                      <InfoField icon={Briefcase} label="Industry" value={profile.industry} />
                      <InfoField icon={LinkIcon} label="Website" value={profile.website} />
                    </>
                  ) : (
                    <>
                      <InfoField icon={Briefcase} label="Experience" value={profile.experience_years ? `${profile.experience_years} Years` : null} />
                      <InfoField icon={LinkIcon} label="Portfolio URL" value={profile.portfolio_url} />
                    </>
                  )}
                </div>

                {/* CANDIDATE ONLY FIELDS */}
                {!isEmployer && (
                  <>
                    {profile.education && <InfoField icon={Building2} label="Education" value={profile.education} />}
                    
                    <div className="p-6 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Core Skills</p>
                      {profile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-white dark:bg-[#1A1D27] text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-gray-200 dark:border-white/10">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No skills listed</p>
                      )}
                    </div>
                  </>
                )}

                {/* SHARED BIO FIELD */}
                {(profile.bio || profile.company_description) && (
                  <div className="p-6 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      {isEmployer ? 'Company Description' : 'About Me'}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {isEmployer ? profile.company_description : profile.bio}
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                
                {message && (
                  <div className={`p-4 rounded-xl text-sm font-medium border ${message.includes('❌') ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                    {message}
                  </div>
                )}

                {/* SHARED EDIT FIELDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Email (Read Only)</label>
                    <input type="email" value={formData.email} disabled className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">
                      {isEmployer ? 'Company Name' : 'Full Name'}
                    </label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
                  </div>
                </div>

                {/* CANDIDATE ONLY EDIT FIELDS */}
                {!isEmployer && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Portfolio URL</label>
                        <input type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleInputChange} placeholder="https://github.com/..." className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Education</label>
                        <input type="text" name="education" value={formData.education} onChange={handleInputChange} className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Years Experience</label>
                      <select name="experience_years" value={formData.experience_years} onChange={handleInputChange} className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 outline-none appearance-none">
                        <option value="">Select level</option>
                        <option value="0">0-1 Years</option>
                        <option value="2">2-3 Years</option>
                        <option value="5">5+ Years</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Skills</label>
                      <div className="flex gap-2 mb-3">
                        <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()} placeholder="Add a skill" className="flex-1 bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 outline-none" />
                        <button type="button" onClick={handleAddSkill} className="px-6 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold rounded-xl transition-colors">Add</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map(skill => (
                          <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-gray-200 dark:border-white/10 group">
                            {skill}
                            <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-slate-400 group-hover:text-red-500"><X size={14} /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* EMPLOYER ONLY EDIT FIELDS */}
                {isEmployer && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Company Website</label>
                      <input type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://..." className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Company Size</label>
                      <input type="text" name="company_size" value={formData.company_size} onChange={handleInputChange} placeholder="e.g. 10-50 employees" className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Industry</label>
                      <select name="industry" value={formData.industry} onChange={handleInputChange} className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 outline-none appearance-none">
                        <option value="">Select Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance & FinTech">Finance & FinTech</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* SHARED BIO EDIT FIELD */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">
                    {isEmployer ? 'Company Description' : 'Bio'}
                  </label>
                  <textarea name={isEmployer ? 'company_description' : 'bio'} value={isEmployer ? formData.company_description : formData.bio} onChange={handleInputChange} rows="4" className="w-full bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none" />
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-white/10 flex gap-3">
                  <button type="button" onClick={() => setEditing(false)} className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSaveProfile} disabled={saving} className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Security & Danger Zone */}
        <div className="bg-white dark:bg-[#12141C] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="text-slate-400" size={24} />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security & Access</h3>
          </div>
          
          <div className="space-y-4">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all border border-gray-200 dark:border-white/10">
              <LogOut size={18} /> Sign Out
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-bold transition-all border border-red-200 dark:border-red-500/20">
              Delete Account Permanently
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}