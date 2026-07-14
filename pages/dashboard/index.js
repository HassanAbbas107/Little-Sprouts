import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { dbService } from '../../lib/db';
import Link from 'next/link';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Cake, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  FileText, 
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    unmarkedToday: 0,
  });
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [classBreakdown, setClassBreakdown] = useState({ toddlers: 0, preK: 0 });
  const [loading, setLoading] = useState(true);

  // Helper function to calculate upcoming birthdays in next 7 days
  const calculateUpcomingBirthdays = (studentList) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const upcoming = [];

    studentList.forEach(student => {
      if (!student.birthDate) return;
      
      const dob = new Date(student.birthDate);
      const birthdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate());
      
      // If birthday has already passed this year, check next year
      if (birthdayThisYear < today && birthdayThisYear.toDateString() !== today.toDateString()) {
        birthdayThisYear.setFullYear(currentYear + 1);
      }

      // Calculate difference in milliseconds
      const diffTime = birthdayThisYear - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If birthday is today (diffDays === 0) or in the next 7 days
      if (diffDays >= 0 && diffDays <= 7) {
        // Calculate age they will turn
        const turnAge = birthdayThisYear.getFullYear() - dob.getFullYear();
        upcoming.push({
          ...student,
          daysLeft: diffDays,
          turnAge
        });
      }
    });

    return upcoming.sort((a, b) => a.daysLeft - b.daysLeft);
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const students = await dbService.getStudents();
        const todayStr = new Date().toISOString().split('T')[0];
        const attendance = await dbService.getAttendanceForDate(todayStr);
        const activities = await dbService.getAllActivities();

        // Calculate class sizes
        let toddlers = 0;
        let preK = 0;
        students.forEach(s => {
          if (s.classGroup === 'Toddlers') toddlers++;
          if (s.classGroup === 'Pre-K') preK++;
        });
        setClassBreakdown({ toddlers, preK });

        // Calculate attendance today
        let present = 0;
        let absent = 0;
        const markedIds = new Set();
        attendance.forEach(record => {
          markedIds.add(record.studentId);
          if (record.status === 'present') present++;
          if (record.status === 'absent') absent++;
        });

        setStats({
          totalStudents: students.length,
          presentToday: present,
          absentToday: absent,
          unmarkedToday: students.length - markedIds.size,
        });

        // Birthdays
        const birthdays = calculateUpcomingBirthdays(students);
        setUpcomingBirthdays(birthdays);

        // Recent 3 activities
        setRecentActivities(activities.slice(0, 3));
      } catch (err) {
        console.error("Error fetching dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout currentTab="home">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mb-4"></div>
          <p className="text-slate-400 font-medium">Assembling Dashboard Data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentTab="home">
      <div className="flex flex-col gap-8 animate-fade-in">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Overview</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back. Here is the operational summary for Little Sprouts Kindergarten today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card: Total Students */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 p-3 bg-brand-500/10 rounded-bl-2xl text-brand-400">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</p>
            <h2 className="text-3xl font-extrabold text-white mt-2">{stats.totalStudents}</h2>
            <div className="mt-4 flex gap-4 text-xs font-medium text-slate-400">
              <span>{classBreakdown.toddlers} Toddlers</span>
              <span>•</span>
              <span>{classBreakdown.preK} Pre-K</span>
            </div>
          </div>

          {/* Card: Present Today */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 p-3 bg-emerald-500/10 rounded-bl-2xl text-emerald-400">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Present Today</p>
            <h2 className="text-3xl font-extrabold text-white mt-2">{stats.presentToday}</h2>
            <p className="text-xs text-slate-400 mt-4 font-medium">
              Attendance marked for today.
            </p>
          </div>

          {/* Card: Absent Today */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 p-3 bg-red-500/10 rounded-bl-2xl text-red-400">
              <XCircle className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Absent Today</p>
            <h2 className="text-3xl font-extrabold text-white mt-2">{stats.absentToday}</h2>
            <p className="text-xs text-slate-400 mt-4 font-medium">
              Absent notifications logged.
            </p>
          </div>

          {/* Card: Unmarked Register */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 p-3 bg-amber-500/10 rounded-bl-2xl text-amber-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unmarked Register</p>
            <h2 className="text-3xl font-extrabold text-white mt-2">{stats.unmarkedToday}</h2>
            <div className="mt-3 flex items-center justify-between">
              {stats.unmarkedToday > 0 ? (
                <Link href="/dashboard/attendance" className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
                  Mark Register Now <ChevronRight className="h-3 w-3" />
                </Link>
              ) : (
                <span className="text-[11px] text-emerald-400 font-medium">✓ Complete for today</span>
              )}
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Birthdays Section */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Cake className="h-5.5 w-5.5 text-brand-400" />
              Upcoming Birthdays (7 Days)
            </h3>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex-1 flex flex-col gap-4">
              {upcomingBirthdays.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                  <p className="text-slate-500 text-sm font-medium">No birthdays in the next 7 days.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBirthdays.map((student) => (
                    <div key={student.id} className="flex items-center gap-3.5 p-3.5 bg-slate-900/60 border border-slate-800/60 rounded-xl hover:border-slate-700 transition-colors">
                      <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl">
                        <Cake className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{student.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Turning {student.turnAge} ({student.classGroup})
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                        student.daysLeft === 0 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}>
                        {student.daysLeft === 0 ? 'Today 🎉' : `In ${student.daysLeft}d`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent activities section */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="h-5.5 w-5.5 text-brand-400" />
                Latest Activity Logs
              </h3>
              <Link href="/dashboard/activities" className="text-sm text-brand-400 hover:text-brand-350 font-bold flex items-center gap-1">
                View Feed <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex-1 space-y-4">
              {recentActivities.length === 0 ? (
                <div className="flex items-center justify-center py-20 text-center">
                  <p className="text-slate-500 text-sm font-medium">No activity notes recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((act) => (
                    <div key={act.id} className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl hover:border-slate-700 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          act.classGroup === 'Pre-K'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : 'bg-brand-500/10 border border-brand-500/20 text-brand-400'
                        }`}>
                          {act.classGroup}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">{act.date}</span>
                      </div>
                      <p className="text-slate-355 text-sm line-clamp-2 leading-relaxed">{act.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
