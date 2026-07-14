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

  const calculateUpcomingBirthdays = (studentList) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const upcoming = [];

    studentList.forEach(student => {
      if (!student.birthDate) return;
      
      const dob = new Date(student.birthDate);
      const birthdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate());
      
      if (birthdayThisYear < today && birthdayThisYear.toDateString() !== today.toDateString()) {
        birthdayThisYear.setFullYear(currentYear + 1);
      }

      const diffTime = birthdayThisYear - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 7) {
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

        let toddlers = 0;
        let preK = 0;
        students.forEach(s => {
          if (s.classGroup === 'Toddlers') toddlers++;
          if (s.classGroup === 'Pre-K') preK++;
        });
        setClassBreakdown({ toddlers, preK });

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

        const birthdays = calculateUpcomingBirthdays(students);
        setUpcomingBirthdays(birthdays);

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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mb-4"></div>
          <p className="text-slate-500 font-semibold">Assembling Dashboard Data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentTab="home">
      <div className="flex flex-col gap-8 animate-fade-in">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Overview</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Welcome back! Here is the summary of today's activities and registers.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card: Total Students */}
          <div className="school-panel p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="absolute top-0 right-0 p-3 bg-sky-50 rounded-bl-3xl text-sky-600">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
            <h2 className="text-3xl font-extrabold text-slate-800 mt-2">{stats.totalStudents}</h2>
            <div className="mt-4 flex gap-4 text-xs font-bold text-sky-600">
              <span>{classBreakdown.toddlers} Toddlers</span>
              <span>•</span>
              <span>{classBreakdown.preK} Pre-K</span>
            </div>
          </div>

          {/* Card: Present Today */}
          <div className="school-panel p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="absolute top-0 right-0 p-3 bg-emerald-50 rounded-bl-3xl text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present Today</p>
            <h2 className="text-3xl font-extrabold text-slate-800 mt-2">{stats.presentToday}</h2>
            <p className="text-xs text-emerald-600 mt-4 font-bold">
              Marked present in register.
            </p>
          </div>

          {/* Card: Absent Today */}
          <div className="school-panel p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="absolute top-0 right-0 p-3 bg-rose-50 rounded-bl-3xl text-rose-600">
              <XCircle className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Absent Today</p>
            <h2 className="text-3xl font-extrabold text-slate-800 mt-2">{stats.absentToday}</h2>
            <p className="text-xs text-rose-600 mt-4 font-bold">
              Absent notes registered.
            </p>
          </div>

          {/* Card: Unmarked Register */}
          <div className="school-panel p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="absolute top-0 right-0 p-3 bg-amber-50 rounded-bl-3xl text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unmarked Register</p>
            <h2 className="text-3xl font-extrabold text-slate-800 mt-2">{stats.unmarkedToday}</h2>
            <div className="mt-3 flex items-center justify-between">
              {stats.unmarkedToday > 0 ? (
                <Link href="/dashboard/attendance" className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1">
                  Mark Register Now <ChevronRight className="h-3 w-3" />
                </Link>
              ) : (
                <span className="text-[11px] text-emerald-600 font-bold">✓ Register Completed</span>
              )}
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Birthdays Section */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Cake className="h-5.5 w-5.5 text-amber-500" />
              Upcoming Birthdays (7 Days)
            </h3>
            <div className="school-panel p-5 rounded-3xl bg-white flex-1 flex flex-col gap-4">
              {upcomingBirthdays.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                  <p className="text-slate-400 text-sm font-semibold">No birthdays in the next 7 days.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBirthdays.map((student) => (
                    <div key={student.id} className="flex items-center gap-3.5 p-3 bg-amber-50/40 border border-amber-100/50 rounded-2xl hover:border-amber-200 transition-colors">
                      <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                        <Cake className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{student.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          Turning {student.turnAge} ({student.classGroup})
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                        student.daysLeft === 0 
                          ? 'bg-yellow-400 text-yellow-900' 
                          : 'bg-white text-slate-500 border border-slate-200'
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
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-5.5 w-5.5 text-sky-500" />
                Latest Class Activity Logs
              </h3>
              <Link href="/dashboard/activities" className="text-sm text-sky-500 hover:text-sky-600 font-bold flex items-center gap-1">
                View Feed <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="school-panel p-6 rounded-3xl bg-white flex-1 space-y-4">
              {recentActivities.length === 0 ? (
                <div className="flex items-center justify-center py-20 text-center">
                  <p className="text-slate-400 text-sm font-semibold">No activity logs recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((act) => (
                    <div key={act.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          act.classGroup === 'Pre-K'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-sky-50 text-sky-600 border border-sky-100'
                        }`}>
                          {act.classGroup}
                        </span>
                        <span className="text-[10px] text-slate-450 font-bold">{act.date}</span>
                      </div>
                      <p className="text-slate-650 text-sm font-medium leading-relaxed">{act.text}</p>
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
