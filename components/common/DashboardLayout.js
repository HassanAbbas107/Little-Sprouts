import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { isFirebaseConfigured } from '../../lib/firebase';
import Link from 'next/link';
import { 
  Home, 
  Users, 
  CheckSquare, 
  Calendar, 
  LogOut, 
  Menu, 
  X,
  Activity
} from 'lucide-react';

export default function DashboardLayout({ children, currentTab = 'home' }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-slate-400 font-medium">Verifying Session...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'home', name: 'Dashboard', href: '/dashboard', icon: Home },
    { id: 'students', name: 'Students', href: '/dashboard/students', icon: Users },
    { id: 'attendance', name: 'Attendance', href: '/dashboard/attendance', icon: CheckSquare },
    { id: 'activities', name: 'Activities Log', href: '/dashboard/activities', icon: Calendar },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-500">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-white leading-tight">Little Sprouts</h2>
            <span className="text-xs text-slate-400 font-medium">School Dashboard</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="px-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
            <p className="text-xs text-slate-500 font-semibold truncate uppercase tracking-wider">Logged In As</p>
            <p className="text-sm font-semibold text-white truncate">{user.email}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${user.isMock ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              {user.isMock ? 'Simulator Mode' : 'Connected to Firestore'}
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden glass-panel border-b border-slate-800 px-6 py-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-500">
              <Activity className="h-5 w-5" />
            </div>
            <h2 className="font-bold text-white">Little Sprouts</h2>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-10 bg-slate-950/90 backdrop-blur-md pt-20 px-6">
            <nav className="space-y-3 mt-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl text-lg font-medium transition-all ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-4 w-full px-5 py-4 rounded-xl text-lg font-medium text-red-400 hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="h-6 w-6" />
                Sign Out
              </button>
            </nav>
            <div className="absolute bottom-8 left-6 right-6 p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Logged In As</p>
              <p className="text-sm font-semibold text-white truncate">{user.email}</p>
              <p className="text-xs text-slate-400 mt-1">
                Mode: {user.isMock ? 'Simulator' : 'Production Firestore'}
              </p>
            </div>
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
