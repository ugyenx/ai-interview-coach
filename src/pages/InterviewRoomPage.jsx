import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, Send, Loader2, StopCircle, Clock, User, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { generateInterviewResponse, generateInterviewEvaluation } from '../services/aiService';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

export default function InterviewRoomPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const { initialPrompt, firstQuestion } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!initialPrompt || !firstQuestion) {
      navigate('/dashboard'); // Kick out if no context
      return;
    }

    setMessages([
      { role: 'system_hidden', content: initialPrompt },
      { role: 'assistant', parsed: firstQuestion, content: JSON.stringify(firstQuestion) }
    ]);
  }, [initialPrompt, firstQuestion, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const speakText = (text) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Remove markdown symbols for better speech
    const cleanText = text.replace(/[*_#`~]/g, '');
    utterance.text = cleanText;
    window.speechSynthesis.speak(utterance);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis?.cancel();
    }
  };

  const toggleMic = (e) => {
    e.preventDefault();
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
         setInputValue(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + finalTranscript);
      }
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndClick = () => {
    setShowEndModal(true);
  };

  const handleCancelEnd = () => {
    setShowEndModal(false);
  };

  const handleConfirmEnd = async () => {
    setShowEndModal(false);

    // Check if the user hasn't submitted any answers
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    if (userMessageCount === 0) {
      alert("You haven't answered any questions. This interview will be discarded.");
      navigate('/dashboard');
      return;
    }

    setEvaluating(true);
    try {
        // Format transcript for the AI
        const transcriptText = messages.map(m => {
          if (m.role === 'system_hidden') return '';
          if (m.role === 'assistant') return `Interviewer: ${m.parsed?.question || ''}`;
          return `Candidate: ${m.content}`;
        }).filter(Boolean).join('\n\n');
        
        // Call evaluation service
        const evaluation = await generateInterviewEvaluation(transcriptText);

        // Save to Firestore
        const docRef = await addDoc(collection(db, 'interviews'), {
          userId: currentUser.uid,
          date: new Date().toISOString(),
          transcript: messages.filter(m => m.role !== 'system_hidden'),
          evaluation: evaluation,
          durationSeconds: secondsElapsed
        });

        // Redirect to evaluation page
        navigate(`/evaluation/${docRef.id}`);
      } catch (err) {
        console.error(err);
        alert("Failed to generate evaluation. Please try again.");
      } finally {
        setEvaluating(false);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading || evaluating) return;

    const userMessage = { role: 'user', content: inputValue.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    try {
      const apiMessages = newMessages.map(msg => ({
        role: msg.role === 'system_hidden' ? 'user' : msg.role,
        content: msg.content
      }));

      const response = await generateInterviewResponse(apiMessages);
      
      setMessages([...newMessages, { 
        role: 'assistant', 
        parsed: response, 
        content: JSON.stringify(response) 
      }]);

      if (!isMuted) {
        let textToSpeak = "";
        if (response.feedback) textToSpeak += response.feedback + ". ";
        if (response.question) textToSpeak += response.question;
        speakText(textToSpeak);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to get a response from AI. Please try again.");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  // If evaluating, show full screen loader
  if (evaluating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg p-6 text-center z-50">
        <Loader2 className="w-16 h-16 text-primary-500 animate-spin mb-6" />
        <h2 className="text-3xl font-bold font-display mb-2">Analyzing Performance...</h2>
        <p className="text-slate-400">Please wait while the AI generates your feedback report.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-dark-bg">
      <aside className="w-full md:w-64 glassmorphism border-b md:border-r border-slate-800 flex flex-col md:h-screen fixed md:relative z-20">
        <div className="p-4 md:p-6 flex items-center justify-between md:justify-start gap-2 border-b border-slate-800/50">
          <div className="flex items-center gap-2 font-display text-xl font-bold">
            <Bot className="w-6 h-6 md:w-7 md:h-7 text-primary-500" />
            <span className="hidden md:inline">InterviewAI</span>
          </div>
          <div className="md:hidden flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full font-mono text-sm text-primary-400">
            <Clock className="w-4 h-4" />
            {formatTime(secondsElapsed)}
          </div>
        </div>
        
        <div className="hidden md:flex flex-col items-center justify-center py-10 px-4">
          <div className="w-24 h-24 rounded-full border-4 border-primary-500/20 flex items-center justify-center mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
            <span className="font-mono text-2xl font-bold text-primary-400">{formatTime(secondsElapsed)}</span>
          </div>
          <span className="text-slate-400 text-sm mb-6">Session Duration</span>
          
          <button 
            onClick={toggleMute} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium border ${isMuted ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-primary-500/10 text-primary-400 border-primary-500/20'}`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isMuted ? 'Voice Off' : 'Voice On'}
          </button>
        </div>

        <div className="p-4 mt-auto hidden md:block">
          <button onClick={handleEndClick} className="w-full flex justify-center items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 px-4 py-3 rounded-xl font-medium transition-colors border border-red-500/20">
            <StopCircle className="w-5 h-5" />
            End Interview
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col pt-16 md:pt-0 relative max-h-screen">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
            {messages.filter(m => m.role !== 'system_hidden').map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' ? (
                  <div className="flex gap-4 max-w-[85%]">
                    <div className="w-10 h-10 rounded-full bg-primary-600/20 flex-shrink-0 flex items-center justify-center border border-primary-500/30">
                      <Bot className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="space-y-3 pt-1">
                      {msg.parsed?.feedback && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl rounded-tl-none text-emerald-100 text-sm leading-relaxed">
                          <span className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Feedback</span>
                          <ReactMarkdown>{msg.parsed.feedback}</ReactMarkdown>
                        </div>
                      )}
                      {msg.parsed?.question && (
                        <div className="glassmorphism p-5 rounded-2xl rounded-tl-none text-slate-200 leading-relaxed border border-slate-700 prose prose-invert max-w-none">
                          <ReactMarkdown>{msg.parsed.question}</ReactMarkdown>
                          {msg.parsed.hints && msg.parsed.hints.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                              <span className="text-xs text-primary-400 uppercase tracking-wider block mb-1">Hints</span>
                              <ul className="list-disc list-inside text-xs text-slate-400">
                                {msg.parsed.hints.map((h, i) => <li key={i}>{h}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 max-w-[85%] flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center border border-slate-600">
                      <User className="w-5 h-5 text-slate-300" />
                    </div>
                    <div className="bg-primary-600 text-white p-5 rounded-2xl rounded-tr-none leading-relaxed shadow-lg pt-1">
                      {msg.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-4 max-w-[85%] animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-primary-600/20 flex-shrink-0 flex items-center justify-center border border-primary-500/30">
                  <Bot className="w-5 h-5 text-primary-400" />
                </div>
                <div className="glassmorphism p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 md:p-6 glassmorphism border-t border-slate-800/50 z-10 sticky bottom-0">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
              <textarea 
                rows={Math.min(5, Math.max(1, inputValue.split('\n').length))}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Type your answer here... (Press Enter to submit, Shift+Enter for new line)"
                className="w-full bg-dark-surface border border-slate-700 rounded-2xl py-4 pl-5 pr-28 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none scrollbar-hide text-sm sm:text-base"
                disabled={loading}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button 
                  type="button"
                  onClick={toggleMic}
                  className={`p-2 rounded-xl transition-all shadow-lg border ${isListening ? 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button 
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  className="p-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 text-white rounded-xl transition-all shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
            <div className="mt-4 md:hidden">
              <button onClick={handleEndClick} className="w-full flex justify-center items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 px-4 py-2 rounded-xl font-medium transition-colors border border-red-500/20 text-sm">
                <StopCircle className="w-4 h-4" />
                End Interview
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* End Interview Custom Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl animate-slide-up">
            <h3 className="text-2xl font-bold font-display mb-2 text-white">End Interview?</h3>
            <p className="text-slate-400 mb-8">
              Are you sure you want to conclude the mock interview? Your session will be evaluated by the AI.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={handleCancelEnd}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmEnd}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors shadow-lg shadow-red-600/20"
              >
                End & Evaluate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
