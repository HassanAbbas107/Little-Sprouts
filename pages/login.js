import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isFirebaseConfigured } from '../lib/firebase';
import { Lock, Mail, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/router';

export default function Login() {
  const { user, login, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const router = useRouter();

  useEffect(() => {
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
      // Handled by auth hook
    }
  };

  const fillMockCredentials = () => {
    setEmail('admin@kindergarten.com');
    setPassword('password123');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 via-amber-50 to-emerald-50 px-4 relative overflow-hidden">
      {/* Decorative playful circles (Clouds & Suns) */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-yellow-250/30 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-sky-100 border-2 border-sky-200 rounded-3xl mb-4 text-sky-600 shadow-sm">
            <GraduationCap className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Little Sprouts</h1>
          <p className="text-slate-500 mt-2 text-sm font-semibold">Kindergarten Admin Dashboard</p>
        </div>

        <div className="school-panel p-8 rounded-3xl bg-white">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Welcome Back!</h2>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-medium">
              {error}
            </div>
          )}

          {formError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-medium">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Verifying...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {!isFirebaseConfigured && (
            <div className="mt-8 pt-6 border-t-2 border-slate-50 text-center">
              <p className="text-xs text-slate-400 mb-2 font-medium">
                🎒 Running in <strong>Simulator Mode</strong>
              </p>
              <button
                type="button"
                onClick={fillMockCredentials}
                className="text-xs text-sky-500 hover:text-sky-600 underline font-bold"
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
