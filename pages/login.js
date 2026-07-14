import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isFirebaseConfigured } from '../lib/firebase';
import { Lock, Mail, Activity, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/router';

export default function Login() {
  const { user, login, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect straight to dashboard
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }
    try {
      await login(email, password);
    } catch (err) {
      // Handled by auth hook/error state
    }
  };

  const fillMockCredentials = () => {
    setEmail('admin@kindergarten.com');
    setPassword('password123');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 relative overflow-hidden">
      {/* Background ambient glowing circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-brand-500/15 border border-brand-500/30 rounded-2xl mb-4 text-brand-500">
            <Activity className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Little Sprouts</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Kindergarten Administration Portal</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Admin Access</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          {formError && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-red-200 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {!isFirebaseConfigured && (
            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400 mb-2">
                🔧 Running in <strong>Simulator Mode</strong>
              </p>
              <button
                type="button"
                onClick={fillMockCredentials}
                className="text-xs text-brand-400 hover:text-brand-300 underline font-medium"
              >
                Auto-fill demo credentials
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
