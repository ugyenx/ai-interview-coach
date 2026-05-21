import { Link } from 'react-router-dom';
import { Bot, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center pt-24 px-6 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      <nav className="w-full max-w-6xl flex justify-between items-center py-6 absolute top-0 z-10 glassmorphism px-8 mt-4 rounded-2xl">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          <Bot className="w-8 h-8 text-primary-500" />
          <span>InterviewAI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-300 hover:text-white transition-colors font-medium">Log in</Link>
          <Link to="/signup" className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            Sign up
          </Link>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center text-center mt-12 z-10 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glassmorphism text-sm font-medium text-primary-100 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>Powered by Groq LLM API</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Master your next interview with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">AI precision.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          Simulate realistic, dynamic job interviews tailored to your exact role. Get real-time feedback, improve your communication, and land your dream job.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Link to="/signup" className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:scale-105">
            Start Practicing Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="flex items-center justify-center gap-2 glassmorphism hover:bg-slate-800/50 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all">
            View Dashboard
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full animate-slide-up" style={{ animationDelay: '0.5s' }}>
          {[
            { title: 'Dynamic Questions', icon: Bot, desc: 'Paste a job description and our AI generates relevant technical and behavioral questions.' },
            { title: 'Real-time Environment', icon: Zap, desc: 'Mimics the pacing and structure of a real interview to help reduce your anxiety.' },
            { title: 'Automated Feedback', icon: ShieldCheck, desc: 'Receive instant, actionable evaluation on your accuracy, clarity, and confidence.' }
          ].map((feature, i) => (
            <div key={i} className="glassmorphism p-8 rounded-2xl flex flex-col items-start text-left hover:-translate-y-1 transition-transform">
              <div className="p-3 bg-primary-500/20 rounded-xl mb-4">
                <feature.icon className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 font-display">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
