import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { dbService } from '../../lib/db';
import { 
  Calendar as CalendarIcon, 
  BookOpen, 
  Plus, 
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

  // Form fields
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
      setSuccessMessage('Activity successfully logged!');
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
      <div className="flex flex-col gap-6">
        {/* Header Block */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Daily Activities Log</h1>
          <p className="text-slate-400 text-sm mt-1">Log notes for parent communication feeds and document daily classroom events.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Log Form */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 sticky top-6">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-brand-500" />
                Log Daily Note
              </h2>

              {formError && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 text-red-300 text-xs font-semibold rounded-xl">
                  {formError}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-900/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-1.5">Class Group</label>
                  <select
                    value={classGroup}
                    onChange={(e) => setClassGroup(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  >
                    <option value="Toddlers">Toddlers (2-3 yrs)</option>
                    <option value="Pre-K">Pre-K (4-5 yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-1.5">Activity Description</label>
                  <textarea
                    rows="4"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. Practiced finger painting today, reviewed basic circle colors and sang the ABC song."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Saving log...
                    </>
                  ) : (
                    <>
                      <Send className="h-4.5 w-4.5" />
                      Post Class Note
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Activity Feed timeline */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
              <BookOpen className="h-5.5 w-5.5 text-brand-400" />
              Activity Feed Timeline
            </h2>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-brand-500 mb-4" />
                <p className="text-slate-400 text-sm">Loading activity logs...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="glass-panel p-10 rounded-2xl text-center border border-slate-800">
                <p className="text-slate-400 font-medium">No classroom logs recorded yet. Start by adding one!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700/60 transition-all flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        act.classGroup === 'Pre-K' 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-brand-500/10 border border-brand-500/20 text-brand-400'
                      }`}>
                        {act.classGroup}
                      </span>
                      <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {act.date}
                      </div>
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{act.text}</p>
                    <div className="pt-3 border-t border-slate-850 flex justify-between items-center text-[10px] text-slate-500">
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
