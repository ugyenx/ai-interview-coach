import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  ArrowLeft, Save, Trash2, AlertTriangle, User, 
  Trophy, Star, Flame, Mail, Award
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function SettingsPage() {
  const { currentUser, logout, userProfile, setUserProfile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showWipeModal, setShowWipeModal] = useState(false);

  // Sync state with loaded user profile details
  useEffect(() => {
    if (userProfile?.displayName) {
      setDisplayName(userProfile.displayName);
    } else if (currentUser?.displayName) {
      setDisplayName(currentUser.displayName);
    }
  }, [userProfile, currentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Display name cannot be empty.' });
      return;
    }
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // 1. Update Firebase Auth Profile
      await updateProfile(currentUser, { displayName });

      // 2. Update Firestore User Document
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { displayName });

      // 3. Update React Context State
      setUserProfile(prev => ({
        ...prev,
        displayName
      }));

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleWipeData = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'interviews'), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = [];
      querySnapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(db, 'interviews', document.id)));
      });
      
      await Promise.all(deletePromises);
      setShowWipeModal(false);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to delete data.' });
      setLoading(false);
    }
  };

  // Gamification variables
  const xp = userProfile?.xp || 0;
  const level = userProfile?.level || 1;
  const streak = userProfile?.streak || 0;
  const badges = userProfile?.badges || [];

  const xpProgress = xp % 300;
  const xpPercent = Math.min(100, Math.floor((xpProgress / 300) * 100));

  const getLevelTitle = (lvl) => {
    if (lvl <= 1) return "Novice Candidate";
    if (lvl === 2) return "Competent Developer";
    if (lvl === 3) return "Technical Specialist";
    if (lvl === 4) return "Senior Engineer";
    return "Elite Lead Architect";
  };

  const getInitials = () => {
    const name = displayName || currentUser?.email || 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-50 flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-6 md:p-12 relative overflow-y-auto pt-20 md:pt-12">
        {/* Glow backdrop decor */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in relative z-10">
          
          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold font-display tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Profile & Settings</h1>
                <p className="text-sm text-slate-400">Manage your profile, track progression, and edit account preferences.</p>
              </div>
            </div>
          </header>

          {message.text && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              {message.text}
            </div>
          )}

          {/* Two-Column Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Profile Card & Level/XP Showcase */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Profile Overview Card */}
              <div className="glassmorphism p-8 rounded-3xl border border-slate-800 relative overflow-hidden shadow-xl shadow-primary-500/5 hover:border-slate-700/80 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary-500/10 to-transparent rounded-bl-full pointer-events-none" />
                
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Rotating Gradient Avatar Ring */}
                  <div className="relative group">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 opacity-75 blur-sm group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
                    <div className="relative w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center text-4xl font-bold font-display text-white border-2 border-slate-800 shadow-inner">
                      {getInitials()}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold font-display text-white mt-2">{displayName || "User"}</h2>
                    <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {currentUser?.email}
                    </p>
                  </div>

                  {/* Level & XP Progression Details */}
                  <div className="w-full pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-300 uppercase tracking-wider text-xs">Progression</span>
                      <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                        {getLevelTitle(level)}
                      </span>
                    </div>

                    <div className="flex justify-between items-end">
                      <span className="text-xl font-bold text-white flex items-center gap-1">
                        <Award className="w-5 h-5 text-primary-400" />
                        Level {level}
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-400">{xpProgress} / 300 XP</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-purple-500 h-full rounded-full transition-all duration-700 relative"
                        style={{ width: `${xpPercent}%` }}
                      >
                        <div className="absolute top-0 right-0 w-2 h-full bg-white/40 blur-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
                    <div className="bg-slate-900/40 border border-slate-800/50 p-3 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Total XP</span>
                      <p className="text-lg font-bold text-primary-400">{xp} XP</p>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800/50 p-3 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Streak</span>
                      <p className="text-lg font-bold text-amber-400 flex items-center justify-center gap-1">
                        <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                        {streak} Days
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Achievements Box */}
              <div className="glassmorphism p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-md font-bold font-display text-slate-200 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Unlocked Achievements ({badges.length})
                </h3>

                <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {badges.length > 0 ? (
                    badges.map((badge, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/30 border border-slate-800/60 hover:border-amber-400/20 transition-all duration-300 group">
                        <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
                        <span className="text-xs font-semibold text-slate-200">{badge}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-500">
                      No achievements unlocked yet. Complete mock sessions or practice to earn achievements!
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Settings & Forms */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Profile Details Edit Form */}
              <section className="glassmorphism p-8 rounded-3xl border border-slate-800 space-y-6">
                <h2 className="text-xl font-bold font-display text-slate-200 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-400" />
                  Profile Details
                </h2>
                
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Display Name</label>
                    <input 
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter display name"
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-350">Email Address</label>
                      <div className="w-full bg-slate-900/20 border border-slate-800 text-slate-500 rounded-xl p-4 text-xs font-mono select-none">
                        {currentUser?.email}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-350">User ID</label>
                      <div className="w-full bg-slate-900/20 border border-slate-800 text-slate-500 rounded-xl p-4 text-xs font-mono select-none truncate" title={currentUser?.uid}>
                        {currentUser?.uid}
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={loading}
                    type="submit"
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-primary-600/10 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </section>

              {/* Danger Zone */}
              <section className="glassmorphism p-8 rounded-3xl border border-red-500/20 bg-red-500/5 space-y-6">
                <h2 className="text-xl font-bold font-display text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Permanently delete all your past mock interviews, transcripts, code practice history, and evaluation reports. This action is instantaneous and cannot be reversed.
                </p>
                <button 
                  onClick={() => setShowWipeModal(true)}
                  className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 px-5 py-3.5 rounded-xl font-semibold transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Wipe Practice & Mock History
                </button>
              </section>

            </div>

          </div>

        </div>
      </main>

      {/* Wipe Modal */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl animate-slide-up">
            <h3 className="text-2xl font-bold font-display mb-2 text-white">Delete All History?</h3>
            <p className="text-slate-400 mb-8">
              Are you absolutely sure? This will wipe every transcript and evaluation report from your account forever.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowWipeModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleWipeData}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium transition-colors shadow-lg shadow-red-600/20 flex justify-center items-center"
              >
                {loading ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
