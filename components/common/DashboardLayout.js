import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';
import { 
  Home, 
  Users, 
  CheckSquare, 
  Calendar, 
  LogOut, 
  Menu, 
  X,
  GraduationCap
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-slate-500 font-semibold">Verifying Session...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'home', name: 'Overview', href: '/dashboard', icon: Home },
    { id: 'students', name: 'Students Roster', href: '/dashboard/students', icon: Users },
    { id: 'attendance', name: 'Daily Attendance', href: '/dashboard/attendance', icon: CheckSquare },
    { id: 'activities', name: 'Activities Log', href: '/dashboard/activities', icon: Calendar },
  ];

  return (
    <div className="min-h-screen flex bg-amber-50/20 text-slate-700">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r-2 border-slate-100">
        <div className="p-6 border-b-2 border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-sky-50 border-2 border-sky-100 rounded-2xl text-sky-600">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-800 leading-tight">Little Sprouts</h2>
            <span className="text-xs text-slate-400 font-bold">Admin Portal</span>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/10'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-850'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t-2 border-slate-100 space-y-3">
          <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logged In As</p>
            <p className="text-xs font-bold text-slate-700 truncate">{user.email}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${user.isMock ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              {user.isMock ? 'Simulator' : 'Production'}
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-white border-b-2 border-slate-100 px-6 py-4 flex items-center justify-between z-25">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-50 border border-sky-100 rounded-2xl text-sky-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h2 className="font-extrabold text-slate-800">Little Sprouts</h2>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-600 hover:text-slate-800"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm pt-20 px-6">
            <div className="bg-white rounded-3xl p-6 shadow-2xl space-y-4">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                        isActive
                          ? 'bg-sky-500 text-white'
                          : 'text-slate-600 hover:bg-slate-55'
                      }`}
                    >
                      <Icon className="h-5.5 w-5.5" />
                      {item.name}
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-5.5 w-5.5" />
                  Sign Out
                </button>
              </nav>
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
