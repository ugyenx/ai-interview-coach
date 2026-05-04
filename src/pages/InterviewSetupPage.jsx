import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Briefcase, Loader2, PlayCircle } from 'lucide-react';
import { generateInterviewResponse } from '../services/aiService';
import { generateInitialPrompt } from '../config/prompts';

export default function InterviewSetupPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level');
  const [persona, setPersona] = useState('Standard Recruiter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  async function handleStart(e) {
    e.preventDefault();
    if (!jobDescription.trim()) return setError('Job description is required.');

    try {
      setError('');
      setLoading(true);
      
      const prompt = generateInitialPrompt(jobDescription, experienceLevel, persona);
      const messages = [{ role: 'user', content: prompt }];
      
      const response = await generateInterviewResponse(messages);
      
      // Navigate to the interview room, passing the context and first question
      navigate('/interview', { 
        state: { 
          initialPrompt: prompt, 
          firstQuestion: response 
        } 
      });
      
    } catch (err) {
      setError(err.message || 'An error occurred while generating the interview.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-bg relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-2xl glassmorphism p-8 sm:p-10 rounded-3xl animate-fade-in z-10 shadow-2xl">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
          <div className="p-3 bg-primary-500/20 rounded-2xl">
            <Briefcase className="w-8 h-8 text-primary-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">Configure Interview</h1>
            <p className="text-slate-400 text-sm mt-1">Paste the job description to tailor your mock interview.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleStart}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex justify-between">
              Job Description
              <span className="text-xs text-slate-500">Paste the full text here</span>
            </label>
            <textarea 
              rows={6}
              required
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="e.g. We are looking for a Senior Frontend Developer proficient in React, TypeScript, and modern CSS frameworks..."
              className="w-full bg-dark-surface border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none font-sans text-sm leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Experience Level</label>
            <select 
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full bg-dark-surface border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option>Intern / Entry-Level</option>
              <option>Junior</option>
              <option>Mid-Level</option>
              <option>Senior</option>
              <option>Lead / Staff</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 block">Interviewer Persona</label>
            <div className="relative">
              <select 
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                className="w-full bg-dark-surface border border-slate-700 rounded-xl p-4 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer"
              >
                <option value="Standard Recruiter">Standard Recruiter (Balanced)</option>
                <option value="Strict Technical Lead">Strict Technical Lead (Harsh & Deep)</option>
                <option value="Friendly Startup Founder">Friendly Startup Founder (Culture Focus)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-primary-500/25 mt-4 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Setting up environment...
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Start Interview
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
