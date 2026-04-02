import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, Zap, Users, Building2 } from 'lucide-react';
import { setAuth } from "../utils/auth";

const AuthPage = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('candidate'); // 'candidate' or 'employer'
  const [name, setName] = useState(''); // Used for either Full Name or Company Name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // --- LOGIN FLOW (Matches original backend JSON expectation) ---
        const response = await fetch('http://localhost:8000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });

        const data = await response.json();

        if (response.ok) {

          setAuth({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            role: data.role,
          });
          
          // Save all the data the original code expected to save
          localStorage.setItem('dashhr_token', data.access_token);
          localStorage.setItem('dashhr_role', data.role);
          localStorage.setItem('dashhr_user_email', email);
          localStorage.setItem('dashhr_onboarding_completed', data.onboarding_completed ? 'true' : 'false');
          
          // Smart redirect based on the backend's onboarding flag
          if (!data.onboarding_completed) {
            navigate(data.role === 'C' ? '/onboarding/candidate' : '/onboarding/employer');
          } else {
            navigate(data.role === 'C' ? '/dashboard' : '/employer');
          }
        } else {
          throw new Error(data.detail || data.message || 'Incorrect email or password');
        }

      } else {
        // --- REGISTER FLOW ---
        const roleCode = role === 'employer' ? 'R' : 'C';
        
        // Build the specific payload the backend expects
        const registerData = {
          email: email,
          password: password,
          role: roleCode,
        };

        // Inject the specific name field based on role
        if (role === 'employer') {
          registerData.company_name = name;
        } else {
          registerData.full_name = name;
        }

        const response = await fetch('http://localhost:8000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerData),
        });

        const data = await response.json();

        if (response.ok) {
          setIsLogin(true);
          setError('Registration successful! Please log in.');
          setPassword(''); 
          setName('');
        } else {
          throw new Error(data.detail || data.message || 'Registration failed.');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl card grid md:grid-cols-2 overflow-hidden shadow-2xl">
        
        {/* Left Side: Branding & Trust Factors */}
        <div className="hidden md:flex flex-col justify-between bg-blue-600 p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500 to-indigo-700 opacity-90 z-0" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-blue-600 font-black text-xl">D</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">DashHR</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight mb-6">
              Nigeria's Most Trusted<br />Hiring Ecosystem.
            </h1>

            <div className="space-y-6 mt-12">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500/30 rounded-lg backdrop-blur-sm">
                  <ShieldCheck className="w-6 h-6 text-blue-100" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Verified Partners</h3>
                  <p className="text-blue-100/80 text-sm mt-1">Mandatory CAC & Bank ID verification.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500/30 rounded-lg backdrop-blur-sm">
                  <Zap className="w-6 h-6 text-blue-100" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Real-time Tracking</h3>
                  <p className="text-blue-100/80 text-sm mt-1">WhatsApp-style status for every application.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500/30 rounded-lg backdrop-blur-sm">
                  <Users className="w-6 h-6 text-blue-100" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Verified Talent</h3>
                  <p className="text-blue-100/80 text-sm mt-1">AI-screened candidates ready for success.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 text-sm text-blue-200">
            © 2026 DashHR. Building the future of African work.
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-[#0A0C10]">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-muted mb-8">
              {isLogin 
                ? 'Enter your details to access your dashboard.' 
                : 'Join the fastest growing verified network in Nigeria.'}
            </p>

            {/* Role Toggle Switch */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-8">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  role === 'candidate' 
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  role === 'employer' 
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Employer
              </button>
            </div>

            {/* Error Message Display */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl mb-6 text-sm font-medium ${
                  error.includes('successful') 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
                }`}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Dynamic Name Field (Only on Register) */}
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                    {role === 'employer' ? 'Company Name' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      {role === 'employer' ? (
                        <Building2 className="h-5 w-5 text-slate-400" />
                      ) : (
                        <Users className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <input
                      type="text"
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input pl-11 w-full"
                      placeholder={role === 'employer' ? 'TechCorp Ltd' : 'John Doe'}
                    />
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-11 w-full"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-11 w-full"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-muted">
                {isLogin ? "New to DashHR? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                {isLogin ? 'Create an account' : 'Sign in instead'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;