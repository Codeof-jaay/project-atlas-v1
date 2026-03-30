import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Mail, Briefcase, Calendar, Eye, EyeOff, Plus, X } from 'lucide-react'
import { motion } from 'framer-motion'
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
  setJoinedDate
} from '../utils/auth'

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    email: '',
    role: '',
    roleLabel: '',
    company_name: '',
    full_name: '',
    joined_at: new Date().toLocaleDateString(),
    // Candidate-specific
    skills: [],
    experience_years: '',
    education: '',
    bio: '',
    // Employer-specific
    company_size: '',
    industry: '',
    company_description: '',
  })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    // Candidate-specific
    skills: [],
    experience_years: '',
    education: '',
    bio: '',
    // Employer-specific
    company_size: '',
    industry: '',
    company_description: '',
  })

  // Load user profile from localStorage and token
  useEffect(() => {
    const auth = getAuth()
    const userEmail = getUserEmail()
    const role = getRole()
    
    if (!auth.access_token) {
      navigate('/auth')
      return
    }

    // Map role codes to display names: 'C' = Candidate, 'R' = Employer, 'A' = Admin
    const roleLabel = role === 'R' ? 'Employer/Recruiter' : role === 'A' ? 'Administrator' : 'Candidate'
    const displayName = getUserDisplayName()
    
    // Load candidate-specific data
    const skills = JSON.parse(localStorage.getItem('dashhr_candidate_skills')) || []
    const experience_years = localStorage.getItem('dashhr_candidate_experience') || ''
    const education = localStorage.getItem('dashhr_candidate_education') || ''
    const bio = localStorage.getItem('dashhr_candidate_bio') || ''
    
    // Load employer-specific data
    const company_size = localStorage.getItem('dashhr_company_size') || ''
    const industry = localStorage.getItem('dashhr_company_industry') || ''
    const company_description = localStorage.getItem('dashhr_company_description') || ''
    
    setProfile({
      email: userEmail || 'user@example.com',
      role: role,  // 'C', 'R', or 'A'
      roleLabel,
      company_name: getCompanyName() || '',
      full_name: getCandidateName() || '',
      joined_at: getJoinedDate() || new Date().toLocaleDateString(),
      skills,
      experience_years,
      education,
      bio,
      company_size,
      industry,
      company_description,
    })

    setFormData({
      email: userEmail || '',
      name: displayName || '',
      password: '',
      skills,
      experience_years,
      education,
      bio,
      company_size,
      industry,
      company_description,
    })
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    setMessage('')

    try {
      // Save to localStorage using utility functions
      if (profile.role === 'R') {  // Employer/Recruiter
        setCompanyName(formData.name)
        localStorage.setItem('dashhr_company_size', formData.company_size)
        localStorage.setItem('dashhr_company_industry', formData.industry)
        localStorage.setItem('dashhr_company_description', formData.company_description)
      } else if (profile.role === 'C') {  // Candidate
        setCandidateName(formData.name)
        localStorage.setItem('dashhr_candidate_skills', JSON.stringify(formData.skills))
        localStorage.setItem('dashhr_candidate_experience', formData.experience_years)
        localStorage.setItem('dashhr_candidate_education', formData.education)
        localStorage.setItem('dashhr_candidate_bio', formData.bio)
      }

      // TODO: Connect to backend PUT /profile endpoint when ready
      // const response = await fetch('http://localhost:8000/profile', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${getAuth().access_token}`,
      //   },
      //   body: JSON.stringify(formData),
      // })

      setProfile((prev) => ({
        ...prev,
        company_name: profile.role === 'employer' ? formData.name : prev.company_name,
        full_name: profile.role === 'candidate' ? formData.name : prev.full_name,
        skills: formData.skills,
        experience_years: formData.experience_years,
        education: formData.education,
        bio: formData.bio,
        company_size: formData.company_size,
        industry: formData.industry,
        company_description: formData.company_description,
      }))

      setMessage('✅ Profile updated successfully!')
      setEditing(false)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Profile update error:', error)
      setMessage('❌ Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
    localStorage.removeItem('dashhr_user_email')
    localStorage.removeItem('dashhr_company_name')
    localStorage.removeItem('dashhr_full_name')
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">My Profile</h1>
          <p className="text-text/60">Manage your account settings and preferences</p>
        </div>

        {/* Main Card */}
        <div className="card rounded-lg p-8 shadow-sm mb-6">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-light">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
              <User size={40} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-text/60 mb-1">Account Type</p>
              <h2 className="text-2xl font-bold text-primary mb-2">{profile.roleLabel}</h2>
              <p className="text-sm text-text/60">Joined {profile.joined_at}</p>
            </div>
            {editing ? (
              <button
                onClick={() => setEditing(false)}
                className="text-text/60 hover:text-text transition"
              >
                ✕
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Information */}
          {!editing ? (
            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <Mail className="text-primary mt-1" size={20} />
                <div>
                  <p className="text-sm text-text/60 mb-1">Email</p>
                  <p className="text-lg font-medium text-text">{profile.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-4">
                <Briefcase className="text-primary mt-1" size={20} />
                <div>
                  <p className="text-sm text-text/60 mb-1">Role</p>
                  <p className="text-lg font-medium text-text">{profile.roleLabel}</p>
                </div>
              </div>

              {/* Company/Name */}
              <div className="flex items-start gap-4">
                <User className="text-primary mt-1" size={20} />
                <div>
                  <p className="text-sm text-text/60 mb-1">
                    {profile.role === 'employer' ? 'Company Name' : 'Full Name'}
                  </p>
                  <p className="text-lg font-medium text-text">
                    {profile.role === 'employer'
                      ? profile.company_name || 'Not set'
                      : profile.full_name || 'Not set'}
                  </p>
                </div>
              </div>

              {/* Joined Date */}
              <div className="flex items-start gap-4">
                <Calendar className="text-primary mt-1" size={20} />
                <div>
                  <p className="text-sm text-text/60 mb-1">Member Since</p>
                  <p className="text-lg font-medium text-text">{profile.joined_at}</p>
                </div>
              </div>

              {/* Candidate-specific sections */}
              {profile.role === 'candidate' && (
                <>
                  {/* Skills */}
                  {profile.skills.length > 0 && (
                    <div className="pt-6 border-t border-light">
                      <p className="text-sm text-text/60 mb-3">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {profile.experience_years && (
                    <div className="pt-4">
                      <p className="text-sm text-text/60 mb-1">Years of Experience</p>
                      <p className="text-lg font-medium text-text">{profile.experience_years} years</p>
                    </div>
                  )}

                  {/* Education */}
                  {profile.education && (
                    <div className="pt-4">
                      <p className="text-sm text-text/60 mb-1">Education</p>
                      <p className="text-lg font-medium text-text">{profile.education}</p>
                    </div>
                  )}

                  {/* Bio */}
                  {profile.bio && (
                    <div className="pt-4">
                      <p className="text-sm text-text/60 mb-1">Bio</p>
                      <p className="text-lg text-text">{profile.bio}</p>
                    </div>
                  )}
                </>
              )}

              {/* Employer-specific sections */}
              {profile.role === 'employer' && (
                <>
                  {/* Company Size */}
                  {profile.company_size && (
                    <div className="pt-6 border-t border-light">
                      <p className="text-sm text-text/60 mb-1">Company Size</p>
                      <p className="text-lg font-medium text-text">{profile.company_size}</p>
                    </div>
                  )}

                  {/* Industry */}
                  {profile.industry && (
                    <div className="pt-4">
                      <p className="text-sm text-text/60 mb-1">Industry</p>
                      <p className="text-lg font-medium text-text">{profile.industry}</p>
                    </div>
                  )}

                  {/* Company Description */}
                  {profile.company_description && (
                    <div className="pt-4">
                      <p className="text-sm text-text/60 mb-1">Company Description</p>
                      <p className="text-lg text-text">{profile.company_description}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* Edit Form */
            <div className="space-y-6">
              {/* Email (Disabled) */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-light rounded-lg bg-text/5 cursor-not-allowed opacity-60"
                />
                <p className="text-xs text-text/50 mt-1">Email cannot be changed</p>
              </div>

              {/* Name/Company */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  {profile.role === 'employer' ? 'Company Name' : 'Full Name'}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={
                    profile.role === 'employer'
                      ? 'Enter your company name'
                      : 'Enter your full name'
                  }
                  className="input w-full px-4 py-2 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Candidate-specific form fields */}
              {profile.role === 'candidate' && (
                <>
                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Skills</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                        placeholder="Add a skill (e.g., React, Python)"
                        className="flex-1 px-4 py-2 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium flex items-center gap-1"
                      >
                        <Plus size={16} /> Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <motion.span
                          key={index}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-primary/70"
                          >
                            <X size={14} />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Experience Years */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Years of Experience</label>
                    <select
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select experience level</option>
                      <option value="0">0-1 years (Fresher)</option>
                      <option value="1">1-2 years</option>
                      <option value="2">2-3 years</option>
                      <option value="3">3-5 years</option>
                      <option value="5">5-7 years</option>
                      <option value="7">7-10 years</option>
                      <option value="10">10+ years</option>
                    </select>
                  </div>

                  {/* Education */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Education</label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      placeholder="e.g., Bachelor's in Computer Science"
                      className="w-full px-4 py-2 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                    />
                  </div>
                </>
              )}

              {/* Employer-specific form fields */}
              {profile.role === 'employer' && (
                <>
                  {/* Company Size */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Company Size</label>
                    <select
                      name="company_size"
                      value={formData.company_size}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Industry</label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Retail">Retail</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Media">Media & Entertainment</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Company Description */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Company Description</label>
                    <textarea
                      name="company_description"
                      value={formData.company_description}
                      onChange={handleInputChange}
                      placeholder="Tell us about your company..."
                      className="w-full px-4 py-2 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                    />
                  </div>
                </>
              )}

              {/* Message Feedback */}
              {message && (
                <div
                  className={`p-4 rounded-lg text-sm ${
                    message.includes('✅')
                      ? 'bg-green-100/20 text-green-700'
                      : 'bg-red-100/20 text-red-700'
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="btn-primary flex-1 px-4 py-2 rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 px-4 py-2 border border-light rounded-lg text-text hover:bg-text/5 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Session & Security Card */}
        <div className="card rounded-lg p-8 shadow-sm mb-6">
          <h3 className="text-xl font-bold text-primary mb-6">Session & Security</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-light rounded-lg">
              <div>
                <p className="font-medium text-text">Active Session</p>
                <p className="text-sm text-text/60">You are logged in</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition font-medium"
            >
              <LogOut size={18} />
              Logout
            </button>

            {/* Security Info */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-6">
              <p className="text-sm text-text/70">
                <strong>Tip:</strong> For security, always logout on shared devices. Your session data is stored locally and encrypted via HTTPS on production.
              </p>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="card rounded-lg p-8 shadow-sm">
          <h3 className="text-xl font-bold text-primary mb-6">Account Actions</h3>
          
          <button className="w-full px-4 py-3 text-red-600 border border-red-600/30 rounded-lg hover:bg-red-50/20 transition font-medium">
            Delete Account
          </button>
          <p className="text-xs text-text/60 mt-2 text-center">
            This action cannot be undone
          </p>
        </div>
      </div>
    </div>
  )
}