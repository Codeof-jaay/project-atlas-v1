import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from '../utils/auth';
import { motion } from 'framer-motion';
import { Upload, X, CheckCircle, ArrowRight } from 'lucide-react';

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      setFormData(prev => ({ ...prev, resume: file }));
      setMessage('Resume uploaded successfully');
    } else {
      setMessage('Please upload a PDF file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      setMessage('Full name is required');
      return;
    }

    if (formData.skills.length === 0) {
      setMessage('Please add at least one skill');
      return;
    }

    if (!formData.experience_years) {
      setMessage('Years of experience is required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Send JSON payload matching backend schema
      const submitData = {
        full_name: formData.full_name,
        skills: formData.skills,
        experience_years: parseInt(formData.experience_years),
        education: formData.education || '',
        bio: formData.bio || '',
        resume_url: formData.resume ? formData.resume.name : null  // URL will be set by backend
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
      console.log('Onboarding response:', data);

      if (response.ok) {
        localStorage.setItem('dashhr_full_name', formData.full_name);
        localStorage.setItem('dashhr_onboarding_completed', 'true');
        setCompleted(true);
        setMessage('Profile completed successfully!');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        const errorMsg = data.detail || data.message || 'Onboarding failed';
        setMessage(`Error: ${errorMsg}`);
        console.error('Onboarding error:', errorMsg);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans" style={{ color: 'rgb(var(--text))' }}>
      {/* Background Gradient Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#274690] blur-[120px] opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#576CA8] blur-[120px] opacity-20" />
      </div>

      <motion.div 
        className="w-full max-w-2xl card backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full btn-primary flex items-center justify-center text-white font-bold">
              1
            </div>
            <h2 className="text-2xl font-bold">Complete Your Profile</h2>
          </div>
          <p className="text-muted">Help employers find the perfect match. It takes just 5 minutes.</p>
        </div>

        {/* Success State */}
        {completed && (
          <motion.div
            className="text-center py-12"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">Profile Complete!</h3>
            <p className="text-muted mb-6">Redirecting to your dashboard...</p>
          </motion.div>
        )}

        {/* Form */}
        {!completed && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
                {message}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Your full name"
                className="w-full input"
                required
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Skills *</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="Add a skill (e.g., React, Node.js)"
                  className="flex-1 input"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn-primary px-4 rounded-lg"
                >
                  Add
                </button>
              </div>
              
              {/* Skills Tags */}
              <div className="flex flex-wrap gap-2">
                {formData.skills.map(skill => (
                  <motion.div
                    key={skill}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5"
                  >
                    <span className="text-sm">{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-red-500 transition"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Experience Years */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Years of Experience *</label>
              <select
                name="experience_years"
                value={formData.experience_years}
                onChange={handleInputChange}
                className="w-full input"
                required
              >
                <option value="">Select experience level</option>
                <option value="0">Fresher (0 years)</option>
                <option value="1">0-1 year</option>
                <option value="2">1-2 years</option>
                <option value="3">2-3 years</option>
                <option value="5">3-5 years</option>
                <option value="10">5-10 years</option>
                <option value="15">10+ years</option>
              </select>
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Education</label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                placeholder="e.g., Bachelor's in Computer Science"
                className="w-full input"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself (optional)"
                rows="4"
                className="w-full input"
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Resume (PDF)</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-primary/50 transition"
                >
                  <Upload size={20} className="text-muted" />
                  <span className="text-sm text-muted">
                    {formData.resume ? formData.resume.name : 'Click to upload your resume'}
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary font-bold py-3 rounded-lg mt-8 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Completing Profile...' : 'Complete Profile'}
              {!loading && <ArrowRight size={18} />}
            </button>

            {/* Skip Link */}
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full text-center text-sm text-muted hover:underline mt-4"
            >
              Skip for now
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default OnboardingCandidate;
