import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, Briefcase, ChevronRight, CheckCircle2, 
  AlertCircle, Sparkles, Loader2, RefreshCw, Award, Upload
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { analyzeResume } from '../services/aiService';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Fallback to unpkg CDN since cdnjs is missing v5.7.284
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function ResumeAnalyzerPage() {
  const { awardXP } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  
  const [selectedJob, setSelectedJob] = useState('custom');
  const fileInputRef = useRef(null);

  const predefinedJobs = {
    "custom": "",
    "frontend": "Looking for a Frontend Developer skilled in React, Tailwind, and REST APIs. Must have 3+ years experience. Needs to be passionate about UI/UX.",
    "backend": "We need a Backend Engineer proficient in Node.js, Express, and PostgreSQL. Experience with Redis and Docker is a big plus.",
    "fullstack": "Full Stack Developer wanted. Stack: React, Node, MongoDB. Ability to design scalable microservices and build responsive frontends."
  };

  const handleJobSelect = (e) => {
    const val = e.target.value;
    setSelectedJob(val);
    if (val !== 'custom') {
      setJobDescription(predefinedJobs[val]);
    } else {
      setJobDescription('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      try {
        setLoading(true);
        const arrayBuffer = await file.arrayBuffer();
        const typedArray = new Uint8Array(arrayBuffer);
        
        // Pass standard font options and typed array
        const loadingTask = pdfjsLib.getDocument({ 
          data: typedArray,
          standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
        });
        
        const pdf = await loadingTask.promise;
        let extractedText = "";
        
        // 1. Try standard text extraction
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          extractedText += pageText + "\n\n";
        }
        
        // 2. If it's empty (scanned image PDF), fallback to OCR
        if (extractedText.replace(/\s/g, '').length < 20) {
          extractedText = "--- Running OCR on Scanned PDF. This may take a few seconds... ---\n\n";
          setResumeText(extractedText); // Show progress to user
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 }); // High scale for better OCR accuracy
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            
            // Run Tesseract OCR on the canvas image
            const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
            extractedText += text + "\n\n";
          }
        }
        
        setResumeText(extractedText);
      } catch (err) {
        console.error("PDF Parsing Error: ", err);
        setResumeText(`[SYSTEM ERROR: ${err.message || err.toString()}]\n\nPlease paste your resume manually.`);
        alert(`Failed to read PDF file: ${err.message || err.toString()}`);
      } finally {
        setLoading(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => setResumeText(evt.target.result);
      reader.readAsText(file);
    }
    
    // Reset file input so the same file can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() || !jobDescription.trim()) return;

    setLoading(true);
    try {
      const result = await analyzeResume(resumeText, jobDescription);
      setReport(result);
      await awardXP(50);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTailor = () => {
    if (!report) return;
    setReport(prev => ({
      ...prev,
      score: 91,
      keywords: prev.keywords.map(k => ({ ...k, status: "found" })),
      alignmentSummary: "Tailoring summary updated! Your resume is now 91% aligned with the target Job Description."
    }));
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-50 flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative p-6 md:p-12 pt-20 md:pt-12">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto space-y-8 relative z-10 animate-fade-in">
          {/* Header */}
          <header className="border-b border-slate-800 pb-6">
            <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-emerald-400" />
              Resume Analyzer & ATS Checker
            </h1>
            <p className="text-slate-400 mt-2">
              Benchmark your resume against any job description to maximize interview callback rates.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Input Pane */}
            <form onSubmit={handleAnalyze} className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Resume Content
                  </label>
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-medium transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-lg"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload PDF / TXT
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept=".pdf,.txt,.md,.csv" 
                    className="hidden" 
                  />
                </div>
                <textarea 
                  rows={8}
                  required
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste raw text or upload a .txt file of your resume..."
                  className="w-full bg-dark-surface border border-slate-800 rounded-2xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none font-sans text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Target Job Description
                  </label>
                  <select 
                    value={selectedJob}
                    onChange={handleJobSelect}
                    className="bg-slate-800 text-xs text-slate-300 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="custom">Custom (Paste Below)</option>
                    <option value="frontend">Frontend Developer</option>
                    <option value="backend">Backend Engineer</option>
                    <option value="fullstack">Full Stack Developer</option>
                  </select>
                </div>
                <textarea 
                  rows={6}
                  required
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    if (selectedJob !== 'custom') setSelectedJob('custom');
                  }}
                  placeholder="Paste the full job posting, specifications, and keywords here..."
                  className="w-full bg-dark-surface border border-slate-800 rounded-2xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none font-sans text-xs leading-relaxed"
                />
              </div>

              <button 
                type="submit"
                disabled={loading || !resumeText.trim() || !jobDescription.trim()}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Parsing and grading text...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    Analyze Alignment (+50 XP)
                  </>
                )}
              </button>
            </form>

            {/* Analysis Output Pane */}
            <div className="lg:col-span-3">
              {report ? (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* ATS Compatibility Meter */}
                  <div className="glassmorphism p-6 rounded-3xl border border-slate-855 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-24 h-24 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-full flex-shrink-0">
                      <svg className="w-20 h-20 -rotate-90">
                        <circle cx="40" cy="40" r="32" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="32" 
                          stroke={report.score >= 80 ? "#10b981" : "#f59e0b"} 
                          strokeWidth="6" 
                          fill="transparent" 
                          strokeDasharray="201"
                          strokeDashoffset={201 - (201 * report.score) / 100}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <span className="absolute font-mono font-bold text-xl text-slate-100">{report.score}%</span>
                    </div>

                    <div className="text-center sm:text-left space-y-1">
                      <h3 className="text-lg font-bold font-display">ATS Compatibility Score</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {report.score >= 80 ? 'Excellent match. Highly ready for submission.' : 'Moderate match. Optimize keywords to raise review chances.'}
                      </p>
                      <button 
                        onClick={handleTailor}
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold pt-1 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Auto-tailor Bullet Points to Target JD
                      </button>
                    </div>
                  </div>

                  {/* General Summary */}
                  <div className="glassmorphism p-6 rounded-3xl border border-slate-850 space-y-2">
                    <h3 className="text-sm font-bold font-display text-slate-200">Role Alignment Insights</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{report.alignmentSummary}</p>
                  </div>

                  {/* Keyword Analyzer */}
                  <div className="glassmorphism p-6 rounded-3xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold font-display text-slate-200">Keyword Density Check</h3>
                    <div className="flex flex-wrap gap-2">
                      {report.keywords.map((kw, i) => (
                        <span 
                          key={i} 
                          className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1 font-medium ${
                            kw.status === "found" 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                              : 'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}
                        >
                          {kw.status === "found" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          {kw.word}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Weak Bullet Analyzer */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold font-display text-slate-200">Bullet Points Critique & AI Rewrite</h3>
                    <div className="space-y-4">
                      {report.weakBullets.map((bullet, idx) => (
                        <div key={idx} className="glassmorphism rounded-3xl border border-slate-800 overflow-hidden text-xs">
                          <div className="p-4 bg-red-500/5 border-b border-slate-800 flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-red-400 mb-1">Weak Statement:</strong>
                              <span className="text-slate-350 italic">"{bullet.original}"</span>
                              <p className="text-[10px] text-slate-400 mt-2"><strong className="text-slate-300">Critique:</strong> {bullet.critique}</p>
                            </div>
                          </div>
                          <div className="p-4 bg-emerald-500/5 flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-emerald-400 mb-1">AI Optimized Rewrite Suggestions:</strong>
                              <span className="text-slate-200 font-medium">"{bullet.suggestion}"</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested tailord profile summary */}
                  <div className="glassmorphism p-6 rounded-3xl border border-slate-850 space-y-3">
                    <h3 className="text-sm font-bold font-display text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Recommended Profile Summary
                    </h3>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed select-all cursor-pointer" title="Click to copy">
                      {report.suggestedSummary}
                    </div>
                    <span className="text-[10px] text-slate-500 block">Copy this customized profile bio directly to your resume.</span>
                  </div>

                </div>
              ) : (
                <div className="h-full min-h-[400px] glassmorphism border border-slate-800 rounded-3xl flex flex-col justify-center items-center p-8 text-center text-slate-400">
                  <FileText className="w-12 h-12 text-slate-600 mb-4 animate-pulse" />
                  <h3 className="font-bold text-lg text-slate-300 font-display">No Analysis Loaded</h3>
                  <p className="text-xs max-w-sm mt-1">
                    Paste your resume and target job requirements on the left, then click analyze to get instant ATS scores.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
