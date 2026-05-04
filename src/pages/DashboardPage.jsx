import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { LogOut, Plus, Settings, History, Loader2, Bot, Trophy, Trash2, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { currentUser, logout, userProfile } = useAuth();
  const navigate = useNavigate();
  const [pastInterviews, setPastInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback to email if display name isn't set yet
  const displayName = userProfile?.displayName || currentUser?.email?.split('@')[0] || "User";

  useEffect(() => {
    async function fetchInterviews() {
      try {
        const q = query(
          collection(db, 'interviews'),
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const interviews = [];
        querySnapshot.forEach((doc) => {
          interviews.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort locally by date descending to avoid requiring a Firebase composite index
        interviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setPastInterviews(interviews);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInterviews();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm("Delete this interview report permanently?")) {
      try {
        await deleteDoc(doc(db, 'interviews', id));
        setPastInterviews(prev => prev.filter(i => i.id !== id));
      } catch (err) {
        console.error("Failed to delete interview", err);
      }
    }
  };

  const chartData = [...pastInterviews].reverse().map((interview, index) => ({
    name: `Int ${index + 1}`,
    score: parseInt(interview.evaluation?.score) || 0
  }));

  return (
    <div className="min-h-screen bg-dark-bg text-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 glassmorphism border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
          <Bot className="w-8 h-8 text-primary-500" />
          <span className="font-display text-xl font-bold tracking-tight">InterviewAI</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-primary-600/10 text-primary-400 rounded-xl font-medium transition-colors">
            <History className="w-5 h-5" />
            Dashboard
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative p-6 md:p-12">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto space-y-12 relative z-10 animate-fade-in">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Welcome back, {displayName}.</h1>
              <p className="text-slate-400 mt-2">Ready to master your next interview?</p>
            </div>
            <Link to="/setup" className="hidden sm:flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <Plus className="w-5 h-5" />
              New Interview
            </Link>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/setup" className="glassmorphism p-6 rounded-2xl flex flex-col justify-center items-center text-center border border-primary-500/30 hover:border-primary-500 transition-colors cursor-pointer group h-full min-h-[200px]">
              <div className="w-14 h-14 rounded-full bg-primary-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="font-semibold text-lg">Start New Interview</h3>
              <p className="text-sm text-slate-400 mt-1">Paste a job description</p>
            </Link>

            {loading ? (
              <div className="col-span-2 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : pastInterviews.slice(0, 2).map((interview) => (
              <div key={interview.id} className="glassmorphism p-6 rounded-2xl border border-slate-800 flex flex-col h-full min-h-[200px]">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-slate-800">
                    <Bot className="w-6 h-6 text-slate-300" />
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    interview.evaluation?.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 
                    interview.evaluation?.score >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    Score: {interview.evaluation?.score || 0}%
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1 truncate">Mock Interview</h3>
                <p className="text-sm text-slate-400 mb-6">{new Date(interview.date).toLocaleDateString()}</p>
                <Link to={`/evaluation/${interview.id}`} className="mt-auto flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium text-sm transition-colors group">
                  <Trophy className="w-4 h-4" />
                  View Report
                </Link>
              </div>
            ))}
          </section>

          {/* Analytics Chart */}
          {pastInterviews.length > 1 && (
            <section className="glassmorphism p-6 rounded-3xl border border-slate-800">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary-400" />
                <h2 className="text-xl font-bold font-display">Score Progression</h2>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Recent Activity List */}
          <section>
            <h2 className="text-xl font-bold font-display mb-6">Recent Activity</h2>
            <div className="glassmorphism rounded-3xl border border-slate-800 overflow-hidden">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                </div>
              ) : pastInterviews.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No past interviews found. Start one today!
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {pastInterviews.map((interview) => (
                    <div key={interview.id} className="p-6 hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-200">Completed Mock Interview</h4>
                          <p className="text-sm text-slate-500 mt-1">
                            {new Date(interview.date).toLocaleDateString()} • Score: {interview.evaluation?.score || 0}/100
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/evaluation/${interview.id}`} className="text-sm font-medium text-slate-300 hover:text-primary-400 transition-colors px-4 py-2 rounded-lg hover:bg-primary-500/10">
                          View
                        </Link>
                        <button onClick={(e) => handleDelete(interview.id, e)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
