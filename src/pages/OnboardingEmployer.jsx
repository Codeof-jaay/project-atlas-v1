import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from '../utils/auth';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Building2 } from 'lucide-react';

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
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ];

  const industryOptions = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Retail',
    'Manufacturing',
    'Hospitality',
    'Real Estate',
    'Media & Entertainment',
    'Consulting',
    'Legal',
    'Other',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.company_name.trim()) {
      setMessage('Company name is required');
      return;
    }

    if (!formData.company_size) {
      setMessage('Company size is required');
      return;
    }

    if (!formData.industry) {
      setMessage('Industry is required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const submitData = {
        company_name: formData.company_name,
        company_size: formData.company_size,
        industry: formData.industry,
        company_description: formData.company_description || '',
      };

      const response = await fetch('http://localhost:8000/onboarding/employer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Onboarding response:', data);

      if (response.ok) {
        localStorage.setItem('dashhr_company_name', formData.company_name);
        localStorage.setItem('dashhr_onboarding_completed', 'true');
        setCompleted(true);
        setMessage('Company setup completed successfully!');
        
        setTimeout(() => {
          navigate('/employer');
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
            <h2 className="text-2xl font-bold">Set Up Your Company</h2>
          </div>
          <p className="text-muted">Tell us about your organization. This information helps candidates learn about your company.</p>
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
            <h3 className="text-xl font-bold mb-2">Company Setup Complete!</h3>
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

            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Company Name *</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Your company name"
                className="w-full input"
                required
              />
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Company Size *</label>
              <select
                name="company_size"
                value={formData.company_size}
                onChange={handleInputChange}
                className="w-full input"
                required
              >
                <option value="">Select company size</option>
                {companySizeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Industry *</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full input"
                required
              >
                <option value="">Select industry</option>
                {industryOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Description */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Company Description</label>
              <textarea
                name="company_description"
                value={formData.company_description}
                onChange={handleInputChange}
                placeholder="Tell candidates about your company, culture, and what makes you special"
                rows="4"
                className="w-full input"
              />
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 flex gap-3">
              <Building2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted">
                You can update these details anytime in your company settings. Complete your profile to start posting jobs and connecting with talent.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary font-bold py-3 rounded-lg mt-8 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Setting Up...' : 'Complete Setup'}
              {!loading && <ArrowRight size={18} />}
            </button>

            {/* Skip Link */}
            <button
              type="button"
              onClick={() => navigate('/employer')}
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

export default OnboardingEmployer;
