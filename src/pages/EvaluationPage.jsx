import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CheckCircle2, Target, Trophy, Clock, FileText, Loader2, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function EvaluationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchInterview() {
      try {
        const docRef = doc(db, 'interviews', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().userId === currentUser.uid) {
          setInterview(docSnap.data());
        } else {
          setError("Interview not found or you don't have permission to view it.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load the evaluation report.");
      } finally {
        setLoading(false);
      }
    }
    fetchInterview();
  }, [id, currentUser]);

  const handleDelete = async () => {
    if(window.confirm("Are you sure you want to permanently delete this report?")) {
      try {
        await deleteDoc(doc(db, 'interviews', id));
        navigate('/dashboard');
      } catch (err) {
        console.error("Failed to delete interview", err);
        alert("Failed to delete the report.");
      }
    }
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

  const { evaluation, transcript, date, durationSeconds } = interview;
  const score = parseInt(evaluation?.score) || 0;
  
  // Determine color based on score
  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = score >= 80 ? 'bg-emerald-500/10 border-emerald-500/30' : score >= 60 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30';

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-50 p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto z-10 relative space-y-8 animate-fade-in">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight">Performance Report</h1>
            <p className="text-slate-400 mt-2 flex items-center gap-4">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatTime(durationSeconds || 0)}</span>
              <span className="text-slate-600">|</span>
              <span>{new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </p>
          </div>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors font-medium border border-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete Report</span>
          </button>
        </header>

        {/* Score Card */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`col-span-1 glassmorphism p-8 rounded-3xl border ${scoreBg} flex flex-col items-center justify-center text-center`}>
            <Trophy className={`w-12 h-12 ${scoreColor} mb-4`} />
            <div className={`text-6xl font-bold font-display tracking-tighter ${scoreColor}`}>
              {score}
              <span className="text-2xl text-slate-500 opacity-50 font-normal">/100</span>
            </div>
            <h2 className="text-lg font-semibold mt-4">Overall Score</h2>
          </div>
          
          <div className="col-span-1 md:col-span-2 glassmorphism p-8 rounded-3xl border border-slate-800 flex flex-col justify-center">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-400" />
              General Feedback
            </h2>
            <div className="text-slate-300 leading-relaxed text-lg">
              <ReactMarkdown>{evaluation?.generalFeedback || ''}</ReactMarkdown>
            </div>
          </div>
        </section>

        {/* Strengths & Weaknesses */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glassmorphism p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
              Key Strengths
            </h3>
            <ul className="space-y-4">
              {evaluation?.strengths?.map((strength, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span className="text-slate-300 leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glassmorphism p-8 rounded-3xl border border-amber-500/20 bg-amber-500/5">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-amber-400">
              <Target className="w-6 h-6" />
              Areas for Improvement
            </h3>
            <ul className="space-y-4">
              {evaluation?.weaknesses?.map((weakness, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span className="text-slate-300 leading-relaxed">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Transcript Replay */}
        <section className="glassmorphism rounded-3xl border border-slate-800 overflow-hidden mt-12">
          <div className="bg-slate-800/50 p-6 border-b border-slate-800">
            <h2 className="text-xl font-semibold font-display">Interview Transcript</h2>
          </div>
          <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
            {transcript?.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-5 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-tr-none' 
                    : 'bg-slate-800/50 text-slate-200 rounded-tl-none border border-slate-700'
                }`}>
                  <span className="text-xs opacity-50 uppercase tracking-wider block mb-2 font-bold">
                    {msg.role === 'user' ? 'You' : 'Interviewer'}
                  </span>
                  <div className="leading-relaxed prose-sm md:prose-base prose-invert max-w-none">
                    {msg.role === 'user' ? (
                      msg.content 
                    ) : (
                      <ReactMarkdown>{msg.parsed?.question || ''}</ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
