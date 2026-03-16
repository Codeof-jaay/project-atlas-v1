import React, { useState } from 'react'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate')

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setIsLogin(true)} className={`px-3 py-1 ${isLogin ? 'bg-indigo-600 text-white' : 'border'}`}>Login</button>
        <button onClick={() => setIsLogin(false)} className={`px-3 py-1 ${!isLogin ? 'bg-indigo-600 text-white' : 'border'}`}>Signup</button>
      </div>

      <div className="p-4 bg-white border rounded">
        <div className="mb-3">
          <label className="block text-sm">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as any)} className="border rounded p-2 w-full">
            <option value="candidate">Candidate</option>
            <option value="employer">Employer</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm">Email</label>
          <input className="w-full border rounded p-2" />
        </div>
        <div className="mb-3">
          <label className="block text-sm">Password</label>
          <input type="password" className="w-full border rounded p-2" />
        </div>

        <div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded">{isLogin ? 'Login' : 'Create account'}</button>
        </div>
      </div>
    </div>
  )
}
