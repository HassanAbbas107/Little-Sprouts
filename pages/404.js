import Link from 'next/link';
import { ArrowLeft, Home, HelpCircle } from 'lucide-react';

export default function Custom404() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 via-amber-50 to-emerald-50 px-4 relative overflow-hidden">
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl"></div>

      <div className="text-center z-10 max-w-md">
        <div className="inline-flex items-center justify-center p-4 bg-sky-50 border-2 border-sky-100 rounded-3xl mb-6 text-sky-500">
          <HelpCircle className="h-12 w-12" />
        </div>
        <h1 className="text-6xl font-extrabold text-slate-800 tracking-tighter">404</h1>
        <h2 className="text-xl font-bold text-slate-700 mt-3">Page Not Found</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed font-medium">
          Oops! The page you are looking for does not exist or may have been moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 py-3 px-5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl transition-all shadow-md text-sm"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 py-3 px-5 bg-white hover:bg-slate-50 border-2 border-slate-100 text-slate-600 font-bold rounded-2xl transition-all text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
