import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { dbService } from '../../lib/db';
import { 
  Calendar as CalendarIcon, 
  BookOpen, 
  Clock, 
  Check, 
  Send,
  Loader2,
  Bookmark
} from 'lucide-react';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [classGroup, setClassGroup] = useState('Toddlers');
  const [text, setText] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await dbService.getAllActivities();
      setActivities(data);
    } catch (err) {
      console.error("Error loading activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!text.trim()) {
      setFormError('Please write a short note about the class activities.');
      return;
    }

    setSaving(true);
    try {
      const newActivity = await dbService.addActivity(date, classGroup, text.trim());
      setActivities(prev => [newActivity, ...prev]);
      setText('');
      setSuccessMessage('Activity logged successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setFormError('Failed to log activity. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout currentTab="activities">
      <div className="flex flex-col gap-6 animate-fade-in text-slate-700">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Activities Log</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Record daily classroom notes for parents and school records.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Log Form */}
          <div className="lg:col-span-1">
            <div className="school-panel p-6 rounded-3xl bg-white sticky top-6">
              <h2 className="text-lg font-extrabold text-slate-800 mb-5 flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-sky-500" />
                New Class Note
              </h2>

              {formError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-2xl">
                  {formError}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-600 text-sm font-bold mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 focus:outline-none focus:border-sky-400 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-sm font-bold mb-1.5">Class Group</label>
                  <select
                    value={classGroup}
                    onChange={(e) => setClassGroup(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 focus:outline-none focus:border-sky-400 font-bold text-sm"
                  >
                    <option value="Toddlers">Toddlers (2-3 yrs)</option>
                    <option value="Pre-K">Pre-K (4-5 yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 text-sm font-bold mb-1.5">Activity Description</label>
                  <textarea
                    rows="4"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. Practiced finger painting today, reviewed basic shapes and sang the ABC song."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-sky-400 resize-none text-sm font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-extrabold rounded-2xl transition-all shadow-md hover:shadow-sky-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Post Class Note
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-sky-500" />
              Activity Timeline
            </h2>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-sky-500 mb-4" />
                <p className="text-slate-500 text-sm font-bold">Loading activity logs...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="school-panel p-10 rounded-3xl text-center bg-white">
                <p className="text-slate-400 font-bold">No classroom logs recorded yet. Start by adding one!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="school-panel p-5 rounded-3xl bg-white hover:-translate-y-0.5 transition-all flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        act.classGroup === 'Pre-K' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-sky-50 text-sky-600 border border-sky-100'
                      }`}>
                        {act.classGroup}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {act.date}
                      </div>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">{act.text}</p>
                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Posted {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
