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
  Users, 
  AlertCircle
} from 'lucide-react';

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const loadAttendanceData = async (targetDate) => {
    setLoading(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const studentList = await dbService.getStudents();
      setStudents(studentList);

      const existingAttendance = await dbService.getAttendanceForDate(targetDate);
      
      const attendanceMap = {};
      studentList.forEach(s => {
        attendanceMap[s.id] = 'present';
      });
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

  const handleExportCSV = async () => {
    try {
      const allHistory = await dbService.getAllAttendanceHistory();
      const studentList = await dbService.getStudents();
      const studentMap = {};
      studentList.forEach(s => {
        studentMap[s.id] = s;
      });

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

  return (
    <DashboardLayout currentTab="attendance">
      <div className="flex flex-col gap-6 animate-fade-in text-slate-700">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Daily Attendance</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Log classroom attendance and export historic records.</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 py-3 px-5 bg-white border-2 border-slate-100 hover:bg-slate-55 text-slate-750 font-bold rounded-2xl transition-all shadow-sm w-fit"
          >
            <Download className="h-5 w-5 text-sky-500" />
            Export History CSV
          </button>
        </div>

        {/* Stats Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="school-panel p-5 rounded-3xl flex items-center gap-4 bg-white">
            <div className="p-3 bg-sky-50 border border-sky-100 text-sky-600 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{totalStudents}</h3>
            </div>
          </div>
          <div className="school-panel p-5 rounded-3xl flex items-center gap-4 bg-white">
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present</p>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{presentCount}</h3>
            </div>
          </div>
          <div className="school-panel p-5 rounded-3xl flex items-center gap-4 bg-white">
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl">
              <X className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Absent</p>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{absentCount}</h3>
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="school-panel p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <CalendarIcon className="text-slate-400 h-5 w-5" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-700 focus:outline-none focus:border-sky-400 font-bold text-sm"
            />
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => handleMarkAll('present')}
              className="px-4 py-2 bg-emerald-55 border border-emerald-100 text-emerald-600 font-bold text-sm rounded-2xl hover:bg-emerald-100 transition-colors"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="px-4 py-2 bg-rose-55 border border-rose-100 text-rose-600 font-bold text-sm rounded-2xl hover:bg-rose-105 transition-colors"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage.text && (
          <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
              : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
            <AlertCircle className="h-5 w-5 shrink-0" />
            {statusMessage.text}
          </div>
        )}

        {/* Roster & Tracking */}
        <div className="school-panel rounded-3xl overflow-hidden bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin h-10 w-10 text-sky-500 mb-4" />
              <p className="text-slate-500 text-sm font-bold">Loading attendance sheet...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-slate-400 font-bold">No students enrolled to register attendance.</p>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Student</th>
                      <th className="py-4 px-6">Class Group</th>
                      <th className="py-4 px-6">Parent Info</th>
                      <th className="py-4 px-6 text-center">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((student) => {
                      const currentStatus = attendance[student.id] || 'present';
                      return (
                        <tr key={student.id} className="hover:bg-slate-55/30 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-bold text-slate-800 text-base">{student.name}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              student.classGroup === 'Pre-K' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : 'bg-sky-50 text-sky-600 border border-sky-100'
                            }`}>
                              {student.classGroup}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-550 text-sm font-medium">
                            {student.parentName} ({student.parentPhone})
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleStatusToggle(student.id, 'present')}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold border transition-all ${
                                  currentStatus === 'present'
                                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                                }`}
                              >
                                <Check className="h-4.5 w-4.5" />
                                Present
                              </button>
                              <button
                                onClick={() => handleStatusToggle(student.id, 'absent')}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold border transition-all ${
                                  currentStatus === 'absent'
                                    ? 'bg-rose-500 border-rose-600 text-white shadow-sm'
                                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
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
              <div className="p-6 border-t border-slate-100 bg-slate-50/20 flex justify-end">
                <button
                  onClick={handleSaveAttendance}
                  disabled={saving}
                  className="flex items-center gap-2 py-3 px-6 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-extrabold rounded-2xl transition-all shadow-md hover:shadow-sky-500/20 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save Register
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
