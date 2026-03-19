import React, { useState } from 'react';
import { setAuth } from "../utils/auth";
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, LogIn, ArrowRight } from 'lucide-react';

const AuthPage = () => {
  // States: 'login' | 'employer' | 'employee'
  const [view, setView] = useState('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regFullName, setRegFullName] = useState('');

  const variants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  // Map view to role code
  const getRoleCode = () => {
    if (view === 'employer') return 'R'; // Recruiter
    if (view === 'employee') return 'C'; // Candidate
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // FastAPI's OAuth2PasswordRequestForm expects form-data, not JSON
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      console.log('Attempting login with email:', email);

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Login response status:', response.status);
      console.log('Login response data:', data);

      if (response.ok) {
        setAuth({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        role: data.role,
      });
        // Save user email to localStorage for Navbar display
        localStorage.setItem('dashhr_user_email', email);
        
        // Save user name (full_name for candidates, company_name for recruiters)
        // Backend supplies this as "name" field based on role
        if (data.name) {
          if (data.role === 'C') {
            localStorage.setItem('dashhr_full_name', data.name);
          } else if (data.role === 'R') {
            localStorage.setItem('dashhr_company_name', data.name);
          }
        }
        
        setMessage('Logged in successfully!');
        // Optionally redirect or update app state here
        alert('Logged in successfully!');
        // Redirect to dashboard or home page
        window.location.href = '/dashboard';
      } else {
        const errorMsg = data.detail || data.message || 'Login failed';
        setMessage(`Error: ${errorMsg}`);
        console.error('Login error:', errorMsg);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const roleCode = getRoleCode();
      if (!roleCode) {
        setMessage('Please select a role (Employer or Employee)');
        setLoading(false);
        return;
      }

      const registerData = {
        email: regEmail || email,
        password: regPassword || password,
        role: roleCode,
      };

      // Add role-specific fields
      if (view === 'employer') {
        registerData.company_name = regCompanyName;
      } else if (view === 'employee') {
        registerData.full_name = regFullName;
      }

      console.log('Attempting registration with data:', registerData);

      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Register response status:', response.status);
      console.log('Register response data:', data);

      if (response.ok) {
        setMessage('Account created! You can now log in.');
        // Clear form
        setRegEmail('');
        setRegPassword('');
        setRegCompanyName('');
        setRegFullName('');
        // Switch back to login view
        setView('login');
      } else {
        const errorMsg = data.detail || data.message || 'Registration failed';
        setMessage(`Error: ${errorMsg}`);
        console.error('Registration error:', errorMsg);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Choose handler based on view
  const handleSubmit = view === 'login' ? handleLogin : handleRegister;


  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans" style={{color: 'rgb(var(--text))' }}>
      {/* Background Gradient Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#274690] blur-[120px] opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#576CA8] blur-[120px] opacity-20" />
      </div>

  <div className="w-full max-max-w-md card backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ background: 'linear-gradient(90deg, rgba(var(--color-primary),1), rgba(var(--color-primary),0.8))', WebkitBackgroundClip: 'text', color: 'rgba(var(--text),0.8)' }}>
            Hybrid ATS & HR
          </h1>
          <p className="mt-2 text-muted">
            {view === 'login' ? 'Welcome back' : `Join as ${view}`}
          </p>
        </div>

        {/* View Toggle Controls */}
  <div className="flex p-1 rounded-2xl mb-8  border border-slate-800 border-opacity-10" style={{ backgroundColor: 'rgba(var(--text),0.04)' }}>
          <button
            onClick={() => setView('login')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${view === 'login' ? 'btn-primary text-white' : 'text-muted'}`}
          >
            <LogIn size={18} /> Login
          </button>
          <button
            onClick={() => setView('employer')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${view === 'employer' ? 'btn-primary text-white' : 'text-muted'}`}
          >
            <Building2 size={18} /> Employer
          </button>
          <button
            onClick={() => setView('employee')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${view === 'employee' ? 'btn-primary text-white' : 'text-muted'}`}
          >
            <User size={18} /> Employee
          </button>
        </div>

        {/* Dynamic Form Content */}
        <div className="relative overflow-hidden min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <form className="space-y-4" onSubmit={handleSubmit}>
                
                {/* Message Display */}
                {message && (
                  <div className={`p-3 rounded text-sm ${message.includes('Error') ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
                    {message}
                  </div>
                )}

                {/* Common Email Field */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="name@company.com"
                    className="w-full input"
                    value={view === 'login' ? email : regEmail}
                    onChange={(e) => view === 'login' ? setEmail(e.target.value) : setRegEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Specific Fields for Employer */}
                {view === 'employer' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1 ml-1">Company Name</label>
                    <input 
                      type="text" 
                      placeholder="TechCorp Ltd"
                      className="w-full input"
                      value={regCompanyName}
                      onChange={(e) => setRegCompanyName(e.target.value)}
                      required
                    />
                  </motion.div>
                )}

                {/* Specific Fields for Employee */}
                {view === 'employee' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full input"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      required
                    />
                  </motion.div>
                )}

                {/* Common Password Field */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1 ml-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full input"
                    value={view === 'login' ? password : regPassword}
                    onChange={(e) => view === 'login' ? setPassword(e.target.value) : setRegPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={loading} className="w-full btn-primary font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading ? 'Processing...' : (view === 'login' ? 'Sign In' : 'Create Account')}
                  <ArrowRight size={18} />
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Link */}
        <p className="text-center text-muted text-sm mt-8">
          {view === 'login' ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setView(view === 'login' ? 'employee' : 'login')}
            className="ml-2 muted-link hover:underline font-medium"
          >
            {view === 'login' ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;