import Link from 'next/link';
import { ArrowLeft, Home, HelpCircle } from 'lucide-react';

export default function Custom404() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 relative overflow-hidden text-slate-100">
      {/* Background ambient glowing circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>

      <div className="text-center z-10 max-w-md">
        <div className="inline-flex items-center justify-center p-4 bg-brand-500/10 border border-brand-500/20 rounded-3xl mb-6 text-brand-400">
          <HelpCircle className="h-12 w-12" />
        </div>
        <h1 className="text-6xl font-extrabold text-white tracking-tighter">404</h1>
        <h2 className="text-xl font-bold text-slate-200 mt-3">Page Not Found</h2>
        <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
          The dashboard screen you are looking for does not exist or has been relocated by the administrator.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 py-3 px-5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-brand-500/20 text-sm"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 py-3 px-5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl transition-all text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
