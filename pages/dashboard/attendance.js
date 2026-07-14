import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { dbService } from '../../lib/db';
import { 
  Calendar as CalendarIcon, 
  Check, 
  X, 
  Save, 
  Download, 
  Loader2, 
  TrendingUp, 
  Users, 
  AlertCircle
} from 'lucide-react';

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // studentId -> 'present' | 'absent'
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Fetch student list and existing attendance records for the selected date
  const loadAttendanceData = async (targetDate) => {
    setLoading(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const studentList = await dbService.getStudents();
      setStudents(studentList);

      const existingAttendance = await dbService.getAttendanceForDate(targetDate);
      
      const attendanceMap = {};
      // Initialize with default 'present' for students
      studentList.forEach(s => {
        attendanceMap[s.id] = 'present';
      });
      // Override with database records if they exist
      existingAttendance.forEach(record => {
        attendanceMap[record.studentId] = record.status;
      });

      setAttendance(attendanceMap);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Error loading attendance details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData(date);
  }, [date]);

  const handleStatusToggle = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setAttendance(updated);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status
      }));
      await dbService.saveAttendanceBatch(date, records);
      setStatusMessage({ type: 'success', text: `Attendance successfully saved for ${date}!` });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to save attendance. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Export attendance history as CSV
  const handleExportCSV = async () => {
    try {
      const allHistory = await dbService.getAllAttendanceHistory();
      const studentList = await dbService.getStudents();
      const studentMap = {};
      studentList.forEach(s => {
        studentMap[s.id] = s;
      });

      // Headers: Date, Student ID, Student Name, Class Group, Attendance Status, Logged Timestamp
      let csvContent = "data:text/csv;charset=utf-8,Date,Student ID,Student Name,Class Group,Status,Timestamp\n";

      allHistory.forEach(record => {
        const student = studentMap[record.studentId] || { name: 'Unknown Student', classGroup: 'Unknown' };
        const row = [
          record.date,
          record.studentId,
          `"${student.name.replace(/"/g, '""')}"`,
          student.classGroup,
          record.status,
          record.timestamp
        ].join(",");
        csvContent += row + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `attendance_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to generate export file.');
    }
  };

  const presentCount = Object.values(attendance).filter(status => status === 'present').length;
  const absentCount = Object.values(attendance).filter(status => status === 'absent').length;
  const totalStudents = students.length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  return (
    <DashboardLayout currentTab="attendance">
      <div className="flex flex-col gap-6">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Daily Attendance</h1>
            <p className="text-slate-400 text-sm mt-1">Track presence logs, register checks, and export attendance history tables.</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 py-3 px-5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg w-fit"
          >
            <Download className="h-5 w-5 text-brand-400" />
            Export History CSV
          </button>
        </div>

        {/* Stats Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{totalStudents}</h3>
            </div>
          </div>
          <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Present Today</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{presentCount}</h3>
            </div>
          </div>
          <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
              <X className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Absent Today</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{absentCount}</h3>
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="text-slate-400 h-5 w-5" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => handleMarkAll('present')}
              className="px-4 py-2 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 font-semibold text-sm rounded-xl hover:bg-emerald-950/40 transition-colors"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="px-4 py-2 bg-red-950/20 border border-red-900/30 text-red-400 font-semibold text-sm rounded-xl hover:bg-red-950/40 transition-colors"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage.text && (
          <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-3 border ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-300' 
              : 'bg-red-900/20 border-red-500/30 text-red-300'
          }`}>
            <AlertCircle className="h-5 w-5 shrink-0" />
            {statusMessage.text}
          </div>
        )}

        {/* Roster & Tracking */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-slate-800/80">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin h-10 w-10 text-brand-500 mb-4" />
              <p className="text-slate-400 text-sm">Loading attendance sheet...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-slate-400 font-medium">No students enrolled to register attendance.</p>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/55 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-4 px-6">Student</th>
                      <th className="py-4 px-6">Class Group</th>
                      <th className="py-4 px-6">Parent Info</th>
                      <th className="py-4 px-6 text-center">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {students.map((student) => {
                      const currentStatus = attendance[student.id] || 'present';
                      return (
                        <tr key={student.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-semibold text-white text-base">{student.name}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              student.classGroup === 'Pre-K' 
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                : 'bg-brand-500/10 border border-brand-500/20 text-brand-400'
                            }`}>
                              {student.classGroup}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-400 text-sm">
                            {student.parentName} ({student.parentPhone})
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleStatusToggle(student.id, 'present')}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                  currentStatus === 'present'
                                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/10'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-white'
                                }`}
                              >
                                <Check className="h-4.5 w-4.5" />
                                Present
                              </button>
                              <button
                                onClick={() => handleStatusToggle(student.id, 'absent')}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                  currentStatus === 'absent'
                                    ? 'bg-red-600 border-red-700 text-white shadow-md shadow-red-500/10'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-white'
                                }`}
                              >
                                <X className="h-4.5 w-4.5" />
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-6 border-t border-slate-800 bg-slate-900/30 flex justify-end">
                <button
                  onClick={handleSaveAttendance}
                  disabled={saving}
                  className="flex items-center gap-2 py-3 px-6 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-500/20 disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save Attendance Register
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
