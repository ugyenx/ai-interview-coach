import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ArrowLeft, Save, Trash2, AlertTriangle, User, Bot, History, Settings, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showWipeModal, setShowWipeModal] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await updateProfile(currentUser, { displayName });
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 glassmorphism border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
          <Bot className="w-8 h-8 text-primary-500" />
          <span className="font-display text-xl font-bold tracking-tight">InterviewAI</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl font-medium transition-colors">
            <History className="w-5 h-5" />
            Dashboard
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 bg-primary-600/10 text-primary-400 rounded-xl font-medium transition-colors">
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

      <main className="flex-1 p-6 md:p-12 relative overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in relative z-10">
          <header className="flex items-center gap-4 border-b border-slate-800 pb-6 md:hidden">
             <Link to="/dashboard" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-6 h-6" />
             </Link>
             <h1 className="text-2xl font-bold font-display">Settings</h1>
          </header>
          <h1 className="text-3xl font-bold font-display hidden md:block border-b border-slate-800 pb-6">Settings</h1>

          {message.text && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
               {message.text}
            </div>
          )}

          <section className="glassmorphism p-8 rounded-3xl border border-slate-800">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-400" />
              Profile
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Display Name</label>
                <input 
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-dark-surface border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
              <button 
                disabled={loading}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-medium transition-all"
              >
                <Save className="w-4 h-4" />
                Save Profile
              </button>
            </form>
          </section>

          <section className="glassmorphism p-8 rounded-3xl border border-red-500/20 bg-red-500/5">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </h2>
            <p className="text-slate-400 mb-6">
              Permanently delete all your past mock interviews, transcripts, and evaluation reports. This action cannot be undone.
            </p>
            <button 
              onClick={() => setShowWipeModal(true)}
              className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 px-5 py-3 rounded-xl font-medium transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete All History
            </button>
          </section>
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
