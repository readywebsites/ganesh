'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: 'admin@suratchagaurinandan.org',
    password: 'admin123',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        router.push('/admin');
      } else {
        setErrorMsg(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setErrorMsg('Login failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
      {/* Subtle glowing background circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md bg-zinc-950/90 border border-amber-500/30 p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <img src="/logo/official_logo.png" alt="Logo" className="w-20 h-20 mx-auto mb-3 object-contain" />
          <h1 className="text-2xl font-bold font-heading text-amber-400 tracking-wider">
            ADMIN PORTAL
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Surat Cha Gaurinandan Ganesh Mahotsav</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-950/70 border border-red-800 text-red-300 text-xs rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-amber-200/80 mb-2 uppercase tracking-wider">
              Admin Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@suratchagaurinandan.org"
              className="w-full bg-zinc-900 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-200/80 mb-2 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:from-amber-400 hover:to-yellow-500 transition-all transform active:scale-95 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center text-xs text-zinc-500">
          <p>Default Login: <span className="text-zinc-300">admin@suratchagaurinandan.org</span> / <span className="text-zinc-300">admin123</span></p>
        </div>
      </div>
    </div>
  );
}
