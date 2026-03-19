import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Mail, Briefcase, Calendar, Eye, EyeOff } from 'lucide-react'
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
  })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
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

    const roleLabel = role === 'R' ? 'Employer/Recruiter' : role === 'A' ? 'Administrator' : 'Candidate'
    const displayName = getUserDisplayName()
    
    setProfile({
      email: userEmail || 'user@example.com',
      role: role,
      roleLabel,
      company_name: getCompanyName() || '',
      full_name: getCandidateName() || '',
      joined_at: getJoinedDate() || new Date().toLocaleDateString(),
    })

    setFormData({
      email: userEmail || '',
      name: displayName || '',
      password: '',
    })
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    setMessage('')

    try {
      // Save to localStorage using utility functions
      if (profile.role === 'R') {
        setCompanyName(formData.name)
      } else if (profile.role === 'C') {
        setCandidateName(formData.name)
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
        company_name: profile.role === 'R' ? formData.name : prev.company_name,
        full_name: profile.role === 'C' ? formData.name : prev.full_name,
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
                    {profile.role === 'R' ? 'Company Name' : 'Full Name'}
                  </p>
                  <p className="text-lg font-medium text-text">
                    {profile.role === 'R'
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
                  {profile.role === 'R' ? 'Company Name' : 'Full Name'}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={
                    profile.role === 'R'
                      ? 'Enter your company name'
                      : 'Enter your full name'
                  }
                  className="input w-full px-4 py-2 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

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