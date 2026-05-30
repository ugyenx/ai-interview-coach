import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bot, Code2, Send, Loader2, Play, Check, 
  Terminal, User, Shield, Camera, Clock 
} from 'lucide-react';
import { generateInterviewResponse, generateInterviewEvaluation } from '../services/aiService';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import ReactMarkdown from 'react-markdown';
import Sidebar from '../components/Sidebar';
import { executeCode } from '../services/codeExecutionService';
import { QUESTION_BANK } from '../config/questions';;

export default function CodingArenaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, awardXP } = useAuth();
  
  const { jobDescription, experienceLevel, persona, track, initialPrompt } = location.state || {};

  // Workspace States
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Editor States
  const [language, setLanguage] = useState('javascript');
  const [executionMode, setExecutionMode] = useState('docker');
  const [code, setCode] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('Console ready. Write code and click "Run Code Tests"');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState(null);

  // Split Panel & Question Selection States
  const [selectedDifficulty, setSelectedDifficulty] = useState('basic');
  const [selectedQuestionId, setSelectedQuestionId] = useState('two-sum');
  const [leftPaneTab, setLeftPaneTab] = useState('problem');
  const [hasNewMessage, setHasNewMessage] = useState(false);

  // Practice progress and timer states
  const [completedQuestions, setCompletedQuestions] = useState({});
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const [isSubmittingPractice, setIsSubmittingPractice] = useState(false);
  const [showPracticeSuccess, setShowPracticeSuccess] = useState(false);
  const [practiceTimeResult, setPracticeTimeResult] = useState('');

  // Webcam Mock Alignments
  const [confidence, setConfidence] = useState(88);
  const [stress, setStress] = useState(25);
  const [eyeContact, setEyeContact] = useState(95);

  const chatEndRef = useRef(null);

  // Load completed questions from local storage on mount
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`completed_${currentUser.uid}`);
      if (saved) {
        try {
          setCompletedQuestions(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse practice history", e);
        }
      }
    }
  }, [currentUser]);

  // Load Initial question template and set up chat greeting
  useEffect(() => {
    const initialQuestion = QUESTION_BANK.basic[0];
    setCode(initialQuestion.templates[language] || '');

    if (!initialPrompt) {
      const defaultDesc = "Looking for a Software Engineer proficient in Data Structures and Algorithms.";
      const defaultPrompt = `Conducting coding interview. Track: Software Engineering. Job Description: ${defaultDesc}. Let's start with the question: "${initialQuestion.title}".`;
      
      setLoading(true);
      generateInterviewResponse([{ role: 'user', content: defaultPrompt }]).then(res => {
        setMessages([
          { role: 'system_hidden', content: defaultPrompt },
          { role: 'assistant', parsed: res, content: JSON.stringify(res) }
        ]);
        setLoading(false);
      }).catch(() => navigate('/dashboard'));
    } else {
      setLoading(true);
      generateInterviewResponse([{ role: 'user', content: initialPrompt }]).then(res => {
        setMessages([
          { role: 'system_hidden', content: initialPrompt },
          { role: 'assistant', parsed: res, content: JSON.stringify(res) }
        ]);
        setLoading(false);
      }).catch(() => navigate('/dashboard'));
    }
  }, [initialPrompt, navigate]);

  // Scroll Chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Show notification indicator when new message arrives in the background
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      if (leftPaneTab !== 'chat') {
        setHasNewMessage(true);
      }
    }
  }, [messages, leftPaneTab]);

  // Total session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Per-question practice timer that resets when active question changes
  useEffect(() => {
    setQuestionSeconds(0);
    const timer = setInterval(() => {
      setQuestionSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedQuestionId]);

  // Update mock camera fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setConfidence(prev => Math.max(70, Math.min(100, prev + (Math.random() > 0.5 ? 1 : -1))));
      setStress(prev => Math.max(10, Math.min(60, prev + (Math.random() > 0.6 ? 2 : -2))));
      setEyeContact(prev => Math.max(80, Math.min(100, prev + (Math.random() > 0.4 ? 1 : -1))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    const q = QUESTION_BANK[selectedDifficulty].find(x => x.id === selectedQuestionId);
    if (q) {
      setCode(q.templates[lang] || '');
    }
  };

  const handleDifficultyChange = (diff) => {
    setSelectedDifficulty(diff);
    const questions = QUESTION_BANK[diff];
    if (questions.length > 0) {
      handleQuestionChange(questions[0].id, diff);
    }
  };

  const handleQuestionChange = (qId, diff = selectedDifficulty) => {
    setSelectedQuestionId(qId);
    const q = QUESTION_BANK[diff].find(x => x.id === qId);
    if (q) {
      setCode(q.templates[language] || '');
      setTerminalOutput('Console ready. Write code and click "Run Code Tests"');
      
      const prompt = `Candidate has switched to solving "${q.title}" (${q.difficulty}). Please introduce the problem, give any brief comments, and ask the candidate to explain their approach.`;
      
      setLoading(true);
      const transitionMsg = { role: 'system_hidden', content: prompt };
      generateInterviewResponse([...messages.filter(m => m.role !== 'system_hidden'), transitionMsg]).then(res => {
        setMessages(prev => [
          ...prev,
          transitionMsg,
          { role: 'assistant', parsed: res, content: JSON.stringify(res) }
        ]);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  };

  const handleTabChange = (tab) => {
    setLeftPaneTab(tab);
    if (tab === 'chat') {
      setHasNewMessage(false);
    }
  };

  const handleEditorKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      const textarea = e.target;
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    let engineName = 'Docker Container';
    if (executionMode === 'local') engineName = 'Local Browser Sandbox';
    if (executionMode === 'api') engineName = 'Cloud API (Gemini)';
    setTerminalOutput(`Initializing ${engineName}...\nExecuting code...`);
    try {
      let codeToExecute = code;
      const q = QUESTION_BANK[selectedDifficulty].find(x => x.id === selectedQuestionId);
      if (q && q.testScript && q.testScript[language]) {
        codeToExecute = code + "\n" + q.testScript[language];
      }

      const output = await executeCode(language, codeToExecute, executionMode);
      setTerminalOutput(output);
      setTestResults(output);
    } catch (error) {
      console.error(error);
      setTerminalOutput("Error executing code: " + error.message);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleSubmitPractice = async () => {
    setIsSubmittingPractice(true);
    setTerminalOutput("Running test cases for practice submission...");
    try {
      let codeToExecute = code;
      const q = QUESTION_BANK[selectedDifficulty].find(x => x.id === selectedQuestionId);
      if (q && q.testScript && q.testScript[language]) {
        codeToExecute = code + "\n" + q.testScript[language];
      }

      const output = await executeCode(language, codeToExecute, executionMode);
      setTerminalOutput(output);
      setTestResults(output);

      if (output.includes("All test cases PASSED!")) {
        const timeSpent = questionSeconds;
        const timeFormatted = formatTime(timeSpent);
        setPracticeTimeResult(timeFormatted);
        
        // Save progress locally and sync state
        const updated = {
          ...completedQuestions,
          [selectedQuestionId]: {
            completed: true,
            timeTaken: timeSpent,
            completedAt: new Date().toISOString()
          }
        };
        setCompletedQuestions(updated);
        if (currentUser) {
          localStorage.setItem(`completed_${currentUser.uid}`, JSON.stringify(updated));
          
          // Save practice history separately in Firestore (does NOT touch 'interviews' history)
          await addDoc(collection(db, 'practice_submissions'), {
            userId: currentUser.uid,
            questionId: selectedQuestionId,
            difficulty: selectedDifficulty,
            language: language,
            timeTakenSeconds: timeSpent,
            completedAt: new Date().toISOString()
          });
        }
        
        setShowPracticeSuccess(true);
      } else {
        alert("Some test cases failed. Please review the compilation output console.");
      }
    } catch (error) {
      console.error(error);
      setTerminalOutput("Error running practice checks: " + error.message);
    } finally {
      setIsSubmittingPractice(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (!inputValue.trim() && !loading) return;

    setLoading(true);
    const textToSend = inputValue;
    setInputValue('');

    const combinedMessage = `I have updated my code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nExplanation/Question: ${textToSend}`;
    
    const userMessage = { role: 'user', content: combinedMessage };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);

    try {
      const apiMessages = newMessages.map(msg => ({
        role: msg.role === 'system_hidden' ? 'user' : msg.role,
        content: msg.content
      }));

      // Add instruction telling AI to specifically evaluate code syntax and return followups
      apiMessages.push({
        role: 'user',
        content: 'Please evaluate the code above. Critique: 1) Syntax issues, 2) Time/Space complexity (Big-O), 3) Edge-case bugs. Respond with feedback on the code and raise your next follow-up interview question.'
      });

      const response = await generateInterviewResponse(apiMessages);
      
      setMessages([...newMessages, { 
        role: 'assistant', 
        parsed: response, 
        content: JSON.stringify(response) 
      }]);
    } catch (err) {
      console.error(err);
      alert("Failed to submit code to AI panel.");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateAll = async () => {
    setEvaluating(true);
    try {
      const transcriptText = messages.map(m => {
        if (m.role === 'system_hidden') return '';
        if (m.role === 'assistant') return `Interviewer: ${m.parsed?.question || ''}`;
        return `Candidate: ${m.content}`;
      }).filter(Boolean).join('\n\n') + `\n\nFinal Solution Code Submissions:\n\`\`\`${language}\n${code}\n\`\`\``;
      
      const evaluation = await generateInterviewEvaluation(transcriptText);

      // Save report
      const docRef = await addDoc(collection(db, 'interviews'), {
        userId: currentUser.uid,
        date: new Date().toISOString(),
        transcript: messages.filter(m => m.role !== 'system_hidden'),
        evaluation: evaluation,
        durationSeconds: secondsElapsed,
        track: track || "Software Engineering",
        mode: "Coding Arena",
        persona: persona || "Google Senior Engineer",
        codeSnippet: {
          code: code,
          language: language
        },
        sentimentMetrics: {
          averageConfidence: confidence,
          averageEyeContact: eyeContact,
          averageStress: stress,
          bodyLanguage: "Typing"
        }
      });

      // Award XP
      const scoreBonus = Math.min(100, Math.max(0, parseInt(evaluation?.score) || 0));
      const xpEarned = 150 + scoreBonus;
      await awardXP(xpEarned);

      navigate(`/evaluation/${docRef.id}`, {
        state: { xpAwarded: xpEarned }
      });
    } catch (err) {
      console.error(err);
      alert("Failed to complete coding assessment evaluation.");
    } finally {
      setEvaluating(false);
    }
  };

  if (evaluating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg p-6 text-center z-50">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-6" />
        <h2 className="text-3xl font-bold font-display mb-2">Analyzing Code Submission...</h2>
        <p className="text-slate-400">Evaluating compiler test cases, algorithmic complexity, and structure.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-slate-50 flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 flex flex-col lg:flex-row h-screen overflow-hidden pt-16 md:pt-0">

        {/* Left Column: Problem description and AI Panel (35% width) */}
        <section className="w-full lg:w-[450px] border-r border-slate-900 bg-slate-950 flex flex-col h-full overflow-hidden flex-shrink-0">
          {/* Tab Selector */}
          <div className="flex border-b border-slate-900 bg-slate-900/20 p-2 gap-1.5 flex-shrink-0">
            <button
              onClick={() => handleTabChange('problem')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                leftPaneTab === 'problem'
                  ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400'
                  : 'bg-slate-900/40 text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              Problem Description
            </button>
            <button
              onClick={() => handleTabChange('chat')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors relative ${
                leftPaneTab === 'chat'
                  ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400'
                  : 'bg-slate-900/40 text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              AI Interview Panel
              {hasNewMessage && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
              )}
            </button>
          </div>

          {leftPaneTab === 'problem' ? (
            /* Problem view */
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-slate-950">
              {/* Difficulty selector tabs */}
              <div className="flex border-b border-slate-900 bg-slate-900/10 p-2 gap-1 flex-shrink-0">
                {['basic', 'medium', 'advanced'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleDifficultyChange(diff)}
                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${
                      selectedDifficulty === diff
                        ? diff === 'basic' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : diff === 'medium' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                        : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/30'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Problem selection dropdown */}
              <div className="p-3.5 border-b border-slate-900 bg-slate-950 flex-shrink-0">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1.5">Active DSA Problem</label>
                <select
                  value={selectedQuestionId}
                  onChange={(e) => handleQuestionChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none cursor-pointer font-medium"
                >
                  {QUESTION_BANK[selectedDifficulty].map((q) => {
                    const isDone = completedQuestions[q.id];
                    const timeTaken = isDone ? formatTime(completedQuestions[q.id].timeTaken) : null;
                    return (
                      <option key={q.id} value={q.id}>
                        {isDone ? '✓ ' : ''}{q.title} {timeTaken ? `(${timeTaken})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Problem Details */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                      selectedDifficulty === 'basic' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      selectedDifficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {QUESTION_BANK[selectedDifficulty].find(x => x.id === selectedQuestionId)?.difficulty}
                    </span>
                    <h2 className="text-sm font-bold text-slate-100">
                      {QUESTION_BANK[selectedDifficulty].find(x => x.id === selectedQuestionId)?.title}
                    </h2>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                    <span>Time: {formatTime(questionSeconds)}</span>
                  </div>
                </div>
                <div className="prose prose-invert prose-xs text-slate-350 leading-relaxed text-xs">
                  <ReactMarkdown>
                    {QUESTION_BANK[selectedDifficulty].find(x => x.id === selectedQuestionId)?.description}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            /* AI Chat & webcam view */
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-slate-950">
              {/* Mock webcam stream */}
              <div className="p-3.5 border-b border-slate-900 bg-slate-950/60 flex-shrink-0 flex gap-3.5">
                <div className="w-24 h-18 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 relative flex items-center justify-center shadow-inner">
                  <Camera className="w-6 h-6 text-slate-700 animate-pulse" />
                  <div className="absolute top-1 left-1 flex items-center gap-1 bg-black/60 px-1 py-0.5 rounded text-[8px] font-semibold text-emerald-400 border border-emerald-500/20">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                    <span>MOCK ASSESS</span>
                  </div>
                </div>
                <div className="flex-1 space-y-1.5 text-[10px]">
                  <div className="flex justify-between items-center text-slate-450">
                    <span>Confidence Level</span>
                    <span className="font-mono text-purple-400 font-bold">{confidence}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${confidence}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-slate-455">
                    <span>Eye Contact Alignment</span>
                    <span className="font-mono text-emerald-400 font-bold">{eyeContact}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${eyeContact}%` }} />
                  </div>
                </div>
              </div>

              {/* Chat history */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-slate-950/20">
                {messages.filter(m => m.role !== 'system_hidden').map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' ? (
                      <div className="flex gap-2.5 max-w-[90%]">
                        <div className="w-7 h-7 rounded-full bg-purple-600/10 flex-shrink-0 flex items-center justify-center border border-purple-500/25">
                          <Bot className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="space-y-2 pt-0.5">
                          {msg.parsed?.feedback && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-100 text-[10px] leading-relaxed">
                              <span className="block text-[8px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Previous Answer Feedback</span>
                              <ReactMarkdown>{msg.parsed.feedback}</ReactMarkdown>
                            </div>
                          )}
                          {msg.parsed?.question && (
                            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-slate-200 leading-relaxed text-xs shadow-sm">
                              <span className="block text-[8px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">Interviewer Prompt</span>
                              <ReactMarkdown>{msg.parsed.question}</ReactMarkdown>
                              {msg.parsed.hints && msg.parsed.hints.length > 0 && (
                                <div className="mt-2.5 pt-2.5 border-t border-slate-800">
                                  <span className="text-[8px] text-slate-500 uppercase tracking-wider block mb-1">Answer Hints</span>
                                  <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-0.5">
                                    {msg.parsed.hints.map((h, i) => <li key={i}>{h}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2.5 max-w-[90%] flex-row-reverse">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center border border-slate-700">
                          <User className="w-4 h-4 text-slate-350" />
                        </div>
                        <div className="bg-purple-600 text-white p-3 rounded-xl leading-relaxed shadow-sm text-xs border border-purple-500/10 whitespace-pre-wrap">
                          {msg.content.startsWith('I have updated my code:') ? (
                            <div className="space-y-1">
                              <span className="font-bold text-[9px] text-purple-200 block uppercase">Submitted Code Solution</span>
                              <p className="text-[10px] text-purple-100">
                                {msg.content.split('\n\nExplanation/Question: ')[1] || 'No comments added.'}
                              </p>
                            </div>
                          ) : (
                            msg.content
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-2.5 max-w-[90%] animate-pulse">
                    <div className="w-7 h-7 rounded-full bg-purple-600/10 flex-shrink-0 flex items-center justify-center border border-purple-500/25">
                      <Bot className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat input form */}
              <div className="p-3 border-t border-slate-900 bg-slate-950 flex-shrink-0">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inputValue.trim()) {
                      handleCodeSubmit();
                    }
                  }} 
                  className="relative flex items-center"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Explain approach / submit code with comment..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-3 pr-10 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputValue.trim()}
                    className="absolute right-1.5 p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Code Editor & Compiler (65% width) */}
        <section className="flex-1 flex flex-col bg-slate-950">
          
          {/* Toolbar */}
          <div className="h-14 border-b border-slate-900 bg-slate-900/40 px-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-purple-400" />
              <span className="text-xs font-semibold text-slate-200">Solution Canvas</span>
              
              <select 
                value={executionMode}
                onChange={(e) => setExecutionMode(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 outline-none cursor-pointer font-semibold text-emerald-400"
              >
                <option value="docker">Docker Container</option>
                <option value="local">Local Browser (JS)</option>
                <option value="api">Cloud API (Gemini)</option>
              </select>

              {/* Language Dropdown */}
              <select 
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-slate-855 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 outline-none cursor-pointer font-medium"
              >
                <option value="javascript">JavaScript (ES6)</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++17</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleRunTests}
                disabled={isRunningTests || isSubmittingPractice}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 fill-slate-200" />
                Run Code Tests
              </button>

              {leftPaneTab === 'problem' && (
                <button 
                  onClick={handleSubmitPractice}
                  disabled={isSubmittingPractice || isRunningTests}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  {isSubmittingPractice ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  Submit Practice
                </button>
              )}
              
              {leftPaneTab === 'chat' && (
                <button 
                  onClick={handleEvaluateAll}
                  disabled={evaluating}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Complete Assessment (+150 XP)
                </button>
              )}
            </div>
          </div>

          {/* IDE Input Textarea */}
          <div className="flex-1 p-2 relative bg-slate-950 overflow-hidden flex">
            <div className="w-10 text-right pr-3 select-none text-[11px] font-mono text-slate-650 border-r border-slate-905/60 pt-2 leading-relaxed">
              {Array.from({ length: 40 }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              className="flex-1 bg-transparent font-mono text-xs text-slate-200 outline-none resize-none pt-2 pl-3 leading-relaxed focus:ring-0 overflow-y-auto"
              spellCheck={false}
            />
          </div>

          {/* Compiler Terminal output */}
          <div className="h-52 border-t border-slate-900 bg-slate-950 flex flex-col flex-shrink-0">
            <div className="h-8 bg-slate-900/60 border-b border-slate-900 px-4 flex items-center gap-2 text-slate-400 text-xs font-mono select-none">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span>Compilation Output Console</span>
            </div>
            <div className="flex-1 p-4 font-mono text-[10px] text-slate-350 leading-relaxed overflow-y-auto whitespace-pre-wrap select-text bg-slate-950 shadow-inner">
              {terminalOutput}
            </div>
          </div>

        </section>
      </main>

      {/* Practice Success Modal */}
      {showPracticeSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-display text-white">Challenge Completed!</h3>
            <p className="text-slate-355 text-sm leading-relaxed">
              You successfully solved <strong className="text-purple-400">"{QUESTION_BANK[selectedDifficulty].find(x => x.id === selectedQuestionId)?.title}"</strong> in <span className="text-emerald-400 font-bold font-mono">{practiceTimeResult}</span> using <span className="capitalize">{language}</span>!
            </p>
            <p className="text-slate-500 text-xs">
              This solution was verified against all test cases. Your practice progress is saved and will not clutter your interview history logs.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => setShowPracticeSuccess(false)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-lg shadow-emerald-600/20 text-sm cursor-pointer"
              >
                Awesome, Keep Practicing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
