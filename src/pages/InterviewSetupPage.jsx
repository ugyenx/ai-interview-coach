import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Briefcase, Loader2, PlayCircle, Code2, Award, Landmark, UserCheck } from 'lucide-react';
import { generateInterviewResponse } from '../services/aiService';
import { generateInitialPrompt } from '../config/prompts';
import Sidebar from '../components/Sidebar';

export default function InterviewSetupPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level');
  const [persona, setPersona] = useState('Google Senior Engineer');
  const [industryTrack, setIndustryTrack] = useState('Software Engineering');
  const [interviewMode, setInterviewMode] = useState('Classic Q&A');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  async function handleStart(e) {
    e.preventDefault();
    if (!jobDescription.trim()) return setError('Job description or topic constraints are required.');

    try {
      setError('');
      setLoading(true);
      
      const prompt = generateInitialPrompt(jobDescription, experienceLevel, persona, industryTrack, interviewMode);
      
      if (interviewMode === 'Coding Arena') {
        // Direct to Coding Arena with details
        navigate('/coding-arena', {
          state: {
            jobDescription,
            experienceLevel,
            persona,
            track: industryTrack,
            initialPrompt: prompt
          }
        });
      } else {
        // Classic Q&A Interview Room
        const messages = [{ role: 'user', content: prompt }];
        const response = await generateInterviewResponse(messages);
        
        navigate('/interview', { 
          state: { 
            initialPrompt: prompt, 
            firstQuestion: response,
            persona,
            track: industryTrack,
            mode: interviewMode
          } 
        });
      }
    } catch (err) {
      setError(err.message || 'An error occurred while generating the interview.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-slate-50 flex flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-hidden pt-20 md:pt-12">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-3xl glassmorphism p-8 sm:p-10 rounded-3xl animate-fade-in z-10 shadow-2xl border border-slate-800">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
            <div className="p-3 bg-primary-500/20 rounded-2xl">
              <Briefcase className="w-8 h-8 text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight">Configure Interview Session</h1>
              <p className="text-slate-400 text-sm mt-1">Select your parameters to customize the AI coach evaluation.</p>
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
                Job Description or Role Focus
                <span className="text-xs text-slate-500">Paste job posting details here</span>
              </label>
              <textarea 
                rows={4}
                required
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="e.g. We are looking for a Senior Frontend Developer proficient in React, TypeScript, and modern CSS frameworks..."
                className="w-full bg-dark-surface border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none font-sans text-sm leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Industry / Discipline Track</label>
                <select 
                  value={industryTrack}
                  onChange={(e) => setIndustryTrack(e.target.value)}
                  className="w-full bg-dark-surface border border-slate-700 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                >
                  <option>Software Engineering</option>
                  <option>Cybersecurity</option>
                  <option>UI/UX Design</option>
                  <option>Product Management</option>
                  <option>Finance & Quantitative Analysis</option>
                  <option>Data Science & AI Engineering</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Experience Level</label>
                <select 
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-dark-surface border border-slate-700 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                >
                  <option>Intern / Entry-Level</option>
                  <option>Junior</option>
                  <option>Mid-Level</option>
                  <option>Senior</option>
                  <option>Lead / Staff Architect</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">Interviewer Persona</label>
                <select 
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="w-full bg-dark-surface border border-slate-700 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                >
                  <option value="Google Senior Engineer">Google Senior Engineer (FAANG Tech)</option>
                  <option value="HR Recruiter">HR Recruiter (STAR & Soft Skills)</option>
                  <option value="Startup Founder">Startup Founder (Fast & High Ownership)</option>
                  <option value="Strict Technical Panel">Strict Technical Panel (Intimidating Review)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">Interview Format</label>
                <select 
                  value={interviewMode}
                  onChange={(e) => setInterviewMode(e.target.value)}
                  className="w-full bg-dark-surface border border-slate-700 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                >
                  <option value="Classic Q&A">Classic Behavioral & Tech Q&A</option>
                  <option value="Coding Arena">Coding Arena (Algorithms & DSA)</option>
                </select>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-primary-500/25 mt-4 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating interview template...
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Start {interviewMode}
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
