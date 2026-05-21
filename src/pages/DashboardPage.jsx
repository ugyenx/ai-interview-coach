import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Plus, Loader2, Bot, Trophy, Trash2, TrendingUp, 
  FileText, Code2, Sparkles, Compass, Landmark, ShieldCheck, Flame
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';

export default function DashboardPage() {
  const { currentUser, userProfile } = useAuth();
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

  const features = [
    {
      title: "Interactive Interview",
      desc: "Simulate a live behavioral or technical interview with AI.",
      path: "/setup",
      icon: Plus,
      badge: "Voice & Webcam",
      color: "border-primary-500/20 bg-primary-500/5 hover:border-primary-500 text-primary-400"
    },
    {
      title: "Resume & ATS Checker",
      desc: "Upload resume to scan for ATS keywords and get AI rewrite recommendations.",
      path: "/resume-analyzer",
      icon: FileText,
      badge: "Career Tool",
      color: "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500 text-emerald-400"
    },
    {
      title: "Coding Arena",
      desc: "Solve programming problems inside our live AI evaluation sandbox.",
      path: "/coding-arena",
      icon: Code2,
      badge: "DSA Practice",
      color: "border-purple-500/20 bg-purple-500/5 hover:border-purple-500 text-purple-400"
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-slate-50 flex flex-col md:flex-row">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative p-6 md:p-12 pt-20 md:pt-12">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto space-y-10 relative z-10 animate-fade-in">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">Welcome back, {displayName}.</h1>
              <p className="text-slate-400 mt-2">Ready to master your next interview and level up?</p>
            </div>
            
            <div className="flex gap-3">
              {userProfile?.streak > 0 && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-amber-400 font-medium">
                  <Flame className="w-5 h-5 fill-amber-500" />
                  <span>{userProfile.streak}-Day Practice Streak</span>
                </div>
              )}
            </div>
          </header>

          {/* New Upgrade Tools Grid */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-display tracking-tight text-slate-200">Interactive Career Suites</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <Link 
                    key={i}
                    to={feature.path} 
                    className={`glassmorphism p-6 rounded-3xl border flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 cursor-pointer h-[220px] group ${feature.color}`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700/30">
                          {feature.badge}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-100">{feature.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{feature.desc}</p>
                    </div>
                    
                    <span className="flex items-center gap-1 font-semibold text-xs mt-4">
                      Launch Module &rarr;
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Analytics Chart */}
          {pastInterviews.length > 0 && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score Progression */}
              <div className="lg:col-span-2 glassmorphism p-6 rounded-3xl border border-slate-800">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary-400" />
                  <h2 className="text-xl font-bold font-display">Score Progression</h2>
                </div>
                <div className="h-[250px] w-full">
                  {pastInterviews.length > 1 ? (
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
                  ) : (
                    <div className="h-full flex flex-col justify-center items-center text-slate-500 text-sm">
                      Complete another interview to view score progression.
                    </div>
                  )}
                </div>
              </div>

              {/* Badges unlocked */}
              <div className="glassmorphism p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-200 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    Achievements
                  </h2>
                  <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto">
                    {userProfile?.badges && userProfile.badges.length > 0 ? (
                      userProfile.badges.map((badge, idx) => (
                        <span key={idx} className="text-xs bg-slate-850 border border-slate-700/60 text-slate-350 px-3 py-1 rounded-xl font-medium shadow-sm flex items-center gap-1.5 hover:border-amber-400/50 transition-colors">
                          🏅 {badge}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No achievements unlocked yet.</span>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                  Earn more achievements by completing mock sessions, getting scores above 80%, or solving code tasks.
                </div>
              </div>
            </section>
          )}

          {/* Recent Activity List */}
          <section>
            <h2 className="text-xl font-bold font-display mb-6">Recent Mock History</h2>
            <div className="glassmorphism rounded-3xl border border-slate-800 overflow-hidden">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                </div>
              ) : pastInterviews.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-4">
                  <Bot className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
                  <p>No past interviews found. Click "Interactive Interview" to begin your journey!</p>
                  <Link to="/setup" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">
                    Start Mock Interview
                  </Link>
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
                          <h4 className="font-medium text-slate-200">
                            {interview.track || 'Mock Interview'} 
                            {interview.mode && <span className="ml-2 text-xs bg-slate-800 px-2 py-0.5 rounded text-primary-400 border border-slate-700/50">{interview.mode}</span>}
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">
                            {new Date(interview.date).toLocaleDateString()} • Score: {interview.evaluation?.score || 0}/100 • Trust: {interview.cheatScore !== undefined ? `${interview.cheatScore}%` : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/evaluation/${interview.id}`} className="text-sm font-medium text-slate-350 hover:text-primary-400 transition-colors px-4 py-2 rounded-lg hover:bg-primary-500/10">
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
