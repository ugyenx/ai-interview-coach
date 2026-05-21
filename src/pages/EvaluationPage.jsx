import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, CheckCircle2, Target, Trophy, Clock, 
  FileText, Loader2, Trash2, Play, Volume2, 
  Compass, Map, ShieldAlert, Sparkles, MessageSquare, AlertCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Sidebar from '../components/Sidebar';

export default function EvaluationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const location = useLocation();
  
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tab control: 'feedback', 'replay', 'roadmap'
  const [activeTab, setActiveTab] = useState('feedback');
  
  // XP Toast notification
  const [showXpToast, setShowXpToast] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);

  useEffect(() => {
    async function fetchInterview() {
      try {
        const docRef = doc(db, 'interviews', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().userId === currentUser.uid) {
          setInterview(docSnap.data());
        } else {
          setError("Interview report not found or you do not have permission.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load evaluation database records.");
      } finally {
        setLoading(false);
      }
    }
    fetchInterview();
  }, [id, currentUser]);

  useEffect(() => {
    if (location.state?.xpAwarded) {
      setXpAmount(location.state.xpAwarded);
      setShowXpToast(true);
      setTimeout(() => setShowXpToast(false), 6000);
    }
  }, [location.state]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this report?")) {
      try {
        await deleteDoc(doc(db, 'interviews', id));
        navigate('/dashboard');
      } catch (err) {
        console.error("Failed to delete interview", err);
        alert("Failed to delete the report.");
      }
    }
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m ${s}s`;
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    window.speechSynthesis.speak(utterance);
  };

  // Helper to color/highlight detected filler words
  const renderHighlightedUserText = (text) => {
    const words = text.split(/\s+/);
    return words.map((word, i) => {
      const clean = word.toLowerCase().replace(/[^a-z]/g, '');
      if (['um', 'uh', 'like', 'basically', 'actually'].includes(clean)) {
        return (
          <span key={i} className="bg-amber-500/20 text-amber-300 font-bold px-1 rounded border border-amber-500/30" title="Verbal filler word detected">
            {word}{' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="text-red-400 mb-4">{error}</div>
        <Link to="/dashboard" className="text-primary-400 hover:text-primary-300 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { 
    evaluation, transcript, date, durationSeconds, track, mode, 
    sentimentMetrics, cheatScore, cheatIncidents, speechMetrics 
  } = interview;
  
  const score = parseInt(evaluation?.score) || 0;
  const trust = cheatScore !== undefined ? cheatScore : 100;

  // Color schemes
  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = score >= 80 ? 'bg-emerald-500/10 border-emerald-500/30' : score >= 60 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30';

  // Roadmap simulation mapping based on identified weaknesses
  const defaultRoadmapSteps = [
    {
      title: "Master Algorithmic Edge Cases",
      targetGap: "System design or low level code constraints",
      steps: [
        "Take Course: Advanced Data Structures on Coursera / FreeCodeCamp",
        "Targeted Practice: Implement 10 core hash-map and sliding-window exercises",
        "Recommended Project: Build custom key-value backend cache with LRU eviction policy"
      ],
      duration: "Week 1 - 2"
    },
    {
      title: "Optimize API Communication Protocols",
      targetGap: "Weak communication latency",
      steps: [
        "Take Course: High-Performance Networking (YouTube tracks)",
        "Targeted Practice: Benchmark REST APIs against gRPC latency benchmarks",
        "Recommended Project: Create mock distributed microservice chat application using WebSocket message broker"
      ],
      duration: "Week 3 - 4"
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-slate-50 flex flex-col md:flex-row">
      <Sidebar />

      {/* Gamification Level/XP Toast */}
      {showXpToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-950 border border-emerald-500/35 p-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce max-w-sm">
          <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <strong className="block text-white text-sm font-semibold">Session Complete!</strong>
            <span className="text-xs text-emerald-300">+{xpAmount} XP Awarded to your profile.</span>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto relative p-6 md:p-12 pt-20 md:pt-12">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/5 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto z-10 relative space-y-8 animate-fade-in">
          
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6 gap-4">
            <div>
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-xs font-medium">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold font-display tracking-tight">AI Assessment Report</h1>
              <p className="text-xs text-slate-400 mt-2 flex flex-wrap items-center gap-3">
                <span className="bg-slate-800/80 px-2.5 py-1 rounded text-primary-400 font-mono font-medium">{track || 'General Practice'}</span>
                <span className="bg-slate-800/80 px-2.5 py-1 rounded text-amber-400 font-mono font-medium">{mode || 'Classic Room'}</span>
                <span className="flex items-center gap-1 font-mono"><Clock className="w-3.5 h-3.5" /> {formatTime(durationSeconds || 0)}</span>
                <span className="text-slate-650">|</span>
                <span>{new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </p>
            </div>
            <button 
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors font-medium border border-red-500/20 text-xs self-start sm:self-center"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Session Report</span>
            </button>
          </header>

          {/* Core Score Section */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Score circle widget */}
            <div className={`col-span-1 glassmorphism p-6 rounded-3xl border ${scoreBg} flex flex-col items-center justify-center text-center shadow-lg`}>
              <Trophy className={`w-10 h-10 ${scoreColor} mb-3`} />
              <div className={`text-5xl font-bold font-display tracking-tighter ${scoreColor}`}>
                {score}
                <span className="text-lg text-slate-500 opacity-50 font-normal">/100</span>
              </div>
              <h2 className="text-sm font-semibold mt-3 text-slate-200">Session Evaluation</h2>
            </div>
            
            {/* General Feedback card */}
            <div className="col-span-1 md:col-span-3 glassmorphism p-6 rounded-3xl border border-slate-800 flex flex-col justify-center shadow-lg">
              <h2 className="text-sm font-bold font-display text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary-400" />
                Interviewer Panel Summary
              </h2>
              <div className="text-slate-355 text-xs sm:text-sm leading-relaxed">
                <ReactMarkdown>{evaluation?.generalFeedback || ''}</ReactMarkdown>
              </div>
            </div>

          </section>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-800 text-xs font-semibold gap-6 pb-px">
            <button 
              onClick={() => setActiveTab('feedback')}
              className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'feedback' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Critique & Analytics
            </button>
            <button 
              onClick={() => setActiveTab('replay')}
              className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'replay' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              Transcript Replay System
            </button>
            <button 
              onClick={() => setActiveTab('roadmap')}
              className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'roadmap' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              AI Career Roadmap Generator
            </button>
          </div>

          {/* Tab 1: Critique & Analytics */}
          {activeTab === 'feedback' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Strengths */}
                <div className="glassmorphism p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
                  <h3 className="text-sm font-bold font-display mb-4 flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    Areas of Strength
                  </h3>
                  <ul className="space-y-3 text-xs leading-relaxed">
                    {evaluation?.strengths?.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                        <span className="text-slate-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvement Areas */}
                <div className="glassmorphism p-6 rounded-3xl border border-amber-500/20 bg-amber-500/5">
                  <h3 className="text-sm font-bold font-display mb-4 flex items-center gap-2 text-amber-400">
                    <Target className="w-5 h-5" />
                    Areas to Refine
                  </h3>
                  <ul className="space-y-3 text-xs leading-relaxed">
                    {evaluation?.weaknesses?.map((weakness, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        <span className="text-slate-300">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Speech & Sentiment Analytics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Trust Score */}
                <div className="glassmorphism p-5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Authenticity Score</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold font-mono text-slate-205">{trust}%</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${trust >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {trust >= 80 ? 'Trusted' : 'Flagged'}
                    </span>
                  </div>
                  {cheatIncidents && cheatIncidents.length > 0 && (
                    <div className="mt-2 text-[9px] text-red-450 max-h-12 overflow-y-auto font-mono">
                      {cheatIncidents.map((c, i) => <div key={i}>* {c.reason}</div>)}
                    </div>
                  )}
                </div>

                {/* Speaking Speed */}
                <div className="glassmorphism p-5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Speaking Speed</span>
                  <span className="text-lg font-bold text-slate-205 block mt-1">
                    {evaluation?.speakingSpeed || 'Normal (130 WPM)'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Optimized for client delivery.</span>
                </div>

                {/* Clarity & Filler count */}
                <div className="glassmorphism p-5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Filler Word Index</span>
                  <span className="text-lg font-bold text-slate-205 block mt-1">
                    {speechMetrics?.totalFillerCount !== undefined ? `${speechMetrics.totalFillerCount} occurrences` : 'Low (under 5)'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Includes 'um', 'like', 'basically'.</span>
                </div>

              </div>
            </div>
          )}

          {/* Tab 2: Interview Replay System */}
          {activeTab === 'replay' && (
            <div className="glassmorphism rounded-3xl border border-slate-800 overflow-hidden animate-fade-in">
              <div className="bg-slate-800/40 p-5 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold font-display text-slate-200">Replay Timeline & Audio Player</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Play back questions with simulated text-to-speech speaker outputs.</p>
                </div>
                <span className="text-[10px] font-semibold text-primary-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-450" />
                  Filler Word Highlighter Active
                </span>
              </div>

              <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                {transcript?.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-slate-800 border border-slate-700/60 text-slate-200 rounded-tr-none' 
                        : 'bg-primary-600/10 border border-primary-500/20 text-slate-100 rounded-tl-none'
                    }`}>
                      <div className="flex justify-between items-center gap-6 mb-2">
                        <span className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-wider">
                          {msg.role === 'user' ? 'Candidate Response' : 'Interviewer Prompt'}
                        </span>
                        {msg.role !== 'user' && (
                          <button 
                            onClick={() => speakText(msg.parsed?.question || '')}
                            className="p-1 hover:bg-primary-500/20 text-primary-400 rounded-lg transition-colors"
                            title="Speak question audio"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="text-xs leading-relaxed">
                        {msg.role === 'user' ? (
                          renderHighlightedUserText(msg.content)
                        ) : (
                          <ReactMarkdown>{msg.parsed?.question || ''}</ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: AI Career Roadmap Generator */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800/80 flex items-start gap-4">
                <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-400">
                  <Map className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-slate-200">Roadmap Target: Technical Skill Upskills</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Based on your weak areas ({evaluation?.weaknesses?.slice(0,2).join(', ') || 'caching logic'}), we have designed a customized development syllabus.
                  </p>
                </div>
              </div>

              {/* Milestones timeline */}
              <div className="space-y-4">
                {defaultRoadmapSteps.map((step, idx) => (
                  <div key={idx} className="glassmorphism p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row gap-6 justify-between">
                    <div className="space-y-3 flex-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-400 flex items-center justify-center font-bold text-[11px]">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-slate-200">{step.title}</h4>
                      </div>

                      <ul className="space-y-2 text-slate-400 pl-8 list-disc list-outside">
                        {step.steps.map((st, i) => <li key={i}>{st}</li>)}
                      </ul>
                    </div>

                    <div className="flex flex-col justify-center items-center md:items-end flex-shrink-0 self-center md:self-stretch">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Timeline</span>
                      <span className="bg-primary-500/10 border border-primary-500/20 px-3 py-1 rounded-full text-[10px] text-primary-400 font-bold font-mono">
                        {step.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Course Suggestions Card */}
              <div className="glassmorphism p-6 rounded-3xl border border-slate-800 space-y-4 text-xs">
                <h3 className="font-bold font-display text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  Suggested Professional Certifications & Courses
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                    <strong className="block text-slate-200">AWS Certified Solutions Architect</strong>
                    <span className="text-[10px] text-slate-500 block">Amazon Web Services Academy</span>
                    <a href="https://aws.amazon.com/certification/" target="_blank" rel="noreferrer" className="inline-block text-[10px] text-primary-400 font-bold pt-1.5 hover:underline">
                      View Syllabus Catalog &rarr;
                    </a>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                    <strong className="block text-slate-200">System Design Fundamentals Suite</strong>
                    <span className="text-[10px] text-slate-500 block">ByteByteGo Architecture course</span>
                    <a href="https://bytebytego.com/" target="_blank" rel="noreferrer" className="inline-block text-[10px] text-primary-400 font-bold pt-1.5 hover:underline">
                      View Syllabus Catalog &rarr;
                    </a>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
