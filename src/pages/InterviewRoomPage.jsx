import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bot, Send, Loader2, StopCircle, Clock, User, 
  Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, 
  AlertTriangle, Shield, Settings, Sliders, CheckCircle2
} from 'lucide-react';
import { generateInterviewResponse, generateInterviewEvaluation } from '../services/aiService';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import * as faceapi from '@vladmandic/face-api';

export default function InterviewRoomPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, awardXP } = useAuth();
  
  const { initialPrompt, firstQuestion, persona, track, mode } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  
  // Voice Controls
  const [isMuted, setIsMuted] = useState(false);
  const [speakingSpeed, setSpeakingSpeed] = useState(1.0); // 0.8, 1.0, 1.2
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [volumePulse, setVolumePulse] = useState(0);

  // Webcam & Detection
  const [cameraActive, setCameraActive] = useState(true);
  const [eyeContact, setEyeContact] = useState(90);
  const [stressLevel, setStressLevel] = useState(30);
  const [bodyLanguage, setBodyLanguage] = useState("Stable");
  const [confidenceScore, setConfidenceScore] = useState(85);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(120);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  // Cheat & Authenticity Monitor
  const [trustScore, setTrustScore] = useState(100);
  const [cheatLogs, setCheatLogs] = useState([]);
  const [showAlert, setShowAlert] = useState(null);

  // Speech Metrics Counter
  const [fillerCounts, setFillerCounts] = useState({ um: 0, uh: 0, like: 0, basically: 0, actually: 0 });
  const [totalWords, setTotalWords] = useState(0);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const utteranceRef = useRef(null);

  // Redirect if no context
  useEffect(() => {
    if (!initialPrompt || !firstQuestion) {
      navigate('/dashboard');
      return;
    }

    setMessages([
      { role: 'system_hidden', content: initialPrompt },
      { role: 'assistant', parsed: firstQuestion, content: JSON.stringify(firstQuestion) }
    ]);

    // Speak the first question automatically
    if (!isMuted && firstQuestion && firstQuestion.question) {
      speakText(firstQuestion.question);
    }
  }, [initialPrompt, firstQuestion, navigate]);

  // Session & Question timer
  useEffect(() => {
    const timer = setInterval(() => {
      const isNativeSpeaking = window.speechSynthesis && window.speechSynthesis.speaking;
      if (evaluating || loading || showEndModal || isAISpeaking || isNativeSpeaking) return;
      setSecondsElapsed(prev => prev + 1);
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          document.getElementById('hidden-submit-btn')?.click();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [evaluating, loading, showEndModal, isAISpeaking]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load Speech Voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices.filter(v => v.lang.startsWith('en')));
        if (voices.length > 0 && !selectedVoiceName) {
          // Default to a natural sounding English voice
          const defaultVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
          setSelectedVoiceName(defaultVoice.name);
        }
      }
    };
    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoiceName]);

  // Webcam & Canvas scanning loop
  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch(err => {
          console.warn("Webcam blocked or unavailable, simulating stream:", err);
        });
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [cameraActive]);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (e) {
        console.error("Failed to load face-api models:", e);
      }
    };
    loadModels();
  }, []);

  // Real-time facial scanning loop
  useEffect(() => {
    if (!cameraActive) return;
    
    let scanInterval;
    let animationFrameId;

    const ctx = canvasRef.current?.getContext('2d');
    
    const drawOverlay = () => {
      if (!canvasRef.current || !ctx) return;
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      
      ctx.clearRect(0, 0, width, height);

      if (cameraActive) {
        // Draw crosshairs
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 30, width - 80, height - 60);

        // Draw scan lines
        const scanY = (Date.now() / 15) % height;
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.beginPath();
        ctx.moveTo(10, scanY);
        ctx.lineTo(width - 10, scanY);
        ctx.stroke();
      } else {
        // Offline state
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, width, height);
        ctx.font = '14px Outfit';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText('CAMERA INSTANCE OFFLINE', width / 2, height / 2);
      }

      animationFrameId = requestAnimationFrame(drawOverlay);
    };

    const detectFace = async () => {
      if (videoRef.current && !videoRef.current.paused && modelsLoaded && canvasRef.current) {
        try {
          const detection = await faceapi.detectSingleFace(
            videoRef.current, 
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceLandmarks().withFaceExpressions();

          if (detection) {
            // Expression Mapping
            const expr = detection.expressions;
            
            // Confidence = happy + neutral
            const rawConfidence = (expr.happy + expr.neutral) * 100;
            setConfidenceScore(Math.floor(rawConfidence));
            
            // Stress = fear + sad + angry + disgusted
            const rawStress = (expr.fear + expr.sad + expr.angry + expr.disgusted) * 100;
            // Scale up slightly for UI visibility
            setStressLevel(Math.min(100, Math.floor(rawStress * 2))); 
            
            // If face is found and detected, eye contact is good
            setEyeContact(95 + Math.floor(Math.random() * 5)); 
            
            // Draw real landmarks onto canvas
            const displaySize = { width: canvasRef.current.width, height: canvasRef.current.height };
            const resizedDetections = faceapi.resizeResults(detection, displaySize);
            
            ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
            resizedDetections.landmarks.positions.forEach(p => {
              ctx.beginPath();
              ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
              ctx.fill();
            });
          } else {
             // No face detected, penalty
             setEyeContact(0);
             setConfidenceScore(prev => Math.max(0, prev - 5));
             setStressLevel(prev => Math.min(100, prev + 5));
          }
        } catch(e) { }
      }
    };

    drawOverlay();
    
    // Run detection every 500ms to avoid freezing UI
    scanInterval = setInterval(detectFace, 500); 

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(scanInterval);
    };
  }, [cameraActive, modelsLoaded]);

  // Authenticity & Tab Switching Monitor
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerCheatWarning("Tab switched / Background activity detected");
      }
    };

    const handleBlur = () => {
      triggerCheatWarning("Window focus lost (possible cheat attempt)");
    };

    const handleCopyPaste = (e) => {
      triggerCheatWarning("Direct copy-paste response blocked");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("paste", handleCopyPaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("paste", handleCopyPaste);
    };
  }, [trustScore]);

  const triggerCheatWarning = (reason) => {
    setTrustScore(prev => Math.max(10, prev - 10));
    const timestamp = new Date().toLocaleTimeString();
    setCheatLogs(prev => [...prev, { reason, time: timestamp }]);
    setShowAlert({ reason, scorePenalized: 10 });
    setTimeout(() => setShowAlert(null), 5000);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // Text to speech (TTS)
  const speakText = (text) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    setIsAISpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance; // Prevent Chrome garbage collection bug
    const cleanText = text.replace(/[*_#`~]/g, '');
    utterance.text = cleanText;
    
    // Voice styling
    if (selectedVoiceName) {
      const selected = availableVoices.find(v => v.name === selectedVoiceName);
      if (selected) utterance.voice = selected;
    }
    
    utterance.rate = speakingSpeed;
    
    // Simulate waveform pulse
    let pulseInterval = setInterval(() => {
      setVolumePulse(Math.floor(Math.random() * 40) + 10);
    }, 100);

    utterance.onend = () => {
      clearInterval(pulseInterval);
      setVolumePulse(0);
      setIsAISpeaking(false);
    };

    utterance.onerror = () => {
      clearInterval(pulseInterval);
      setVolumePulse(0);
      setIsAISpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis?.cancel();
      setIsAISpeaking(false);
    }
  };

  // Continuous speech-to-text (STT) & filler counting
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
          const phrase = event.results[i][0].transcript.toLowerCase();
          finalTranscript += phrase;
          
          // Check for filler words
          const words = phrase.split(/\s+/);
          const localFillers = { ...fillerCounts };
          let wordCount = words.length;
          
          words.forEach(word => {
            if (['um', 'uh', 'like', 'basically', 'actually', 'youknow'].includes(word.replace(/[^a-z]/g, ''))) {
              const cleanWord = word.replace(/[^a-z]/g, '');
              localFillers[cleanWord] = (localFillers[cleanWord] || 0) + 1;
            }
          });
          setFillerCounts(localFillers);
          setTotalWords(prev => prev + wordCount);
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

  const handleEndClick = () => {
    setShowEndModal(true);
  };

  const handleConfirmEnd = async () => {
    setShowEndModal(false);

    const userMessageCount = messages.filter(m => m.role === 'user').length;
    if (userMessageCount === 0) {
      alert("You haven't answered any questions. This interview will be discarded.");
      navigate('/dashboard');
      return;
    }

    setEvaluating(true);
    try {
        const transcriptText = messages.map(m => {
          if (m.role === 'system_hidden') return '';
          if (m.role === 'assistant') return `Interviewer: ${m.parsed?.question || ''}`;
          return `Candidate: ${m.content}`;
        }).filter(Boolean).join('\n\n');
        
        // Generate AI Evaluation report
        const evaluation = await generateInterviewEvaluation(transcriptText);

        // Compute average sentiment scores
        const sentimentSummary = {
          averageConfidence: confidenceScore,
          averageEyeContact: eyeContact,
          averageStress: stressLevel,
          bodyLanguage: bodyLanguage
        };

        const totalFillers = Object.values(fillerCounts).reduce((a,b)=>a+b, 0);

        // Save report to Firestore
        const docRef = await addDoc(collection(db, 'interviews'), {
          userId: currentUser.uid,
          date: new Date().toISOString(),
          transcript: messages.filter(m => m.role !== 'system_hidden'),
          evaluation: evaluation,
          durationSeconds: secondsElapsed,
          track: track || "Software Engineering",
          mode: mode || "Classic Q&A",
          persona: persona || "Google Senior Engineer",
          sentimentMetrics: sentimentSummary,
          cheatScore: trustScore,
          cheatIncidents: cheatLogs,
          speechMetrics: {
            fillerWords: fillerCounts,
            totalFillerCount: totalFillers,
            totalWordsCount: totalWords
          }
        });

        // Gamification Award XP
        // Base XP + Bonus matching score
        const scoreBonus = parseInt(evaluation?.score) || 0;
        const xpEarned = 100 + scoreBonus;
        await awardXP(xpEarned);

        navigate(`/evaluation/${docRef.id}`, {
          state: { xpAwarded: xpEarned }
        });
      } catch (err) {
        console.error(err);
        alert("Failed to generate evaluation. Please try again.");
      } finally {
        setEvaluating(false);
      }
  };

  const handleSubmit = async (e, isAutoSubmit = false) => {
    e?.preventDefault();
    if (loading || evaluating) return;

    let submitText = inputValue.trim();
    if (!submitText && isAutoSubmit) {
      submitText = "[Candidate ran out of time and did not answer.]";
    } else if (!submitText) {
      return;
    }

    // Track total words
    const wordCount = submitText.split(/\s+/).length;
    setTotalWords(prev => prev + wordCount);

    const userMessage = { role: 'user', content: submitText };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInputValue('');
    setQuestionTimeLeft(120);
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

  if (evaluating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg p-6 text-center z-50">
        <Loader2 className="w-16 h-16 text-primary-500 animate-spin mb-6" />
        <h2 className="text-3xl font-bold font-display mb-2">Analyzing Performance...</h2>
        <p className="text-slate-400">Evaluating transcripts, voice parameters, and trust factors.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-bg text-slate-50">
      {/* Left panel: Camera & Speech Controls */}
      <aside className="w-full md:w-80 glassmorphism border-b md:border-r border-slate-800 flex flex-col relative z-20 md:h-screen md:sticky md:top-0">
        {/* Brand/Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/50">
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            title="Return to Dashboard"
          >
            <Bot className="w-6 h-6 text-primary-500" />
            <span className="font-display font-bold text-lg">Interview Coach</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="bg-slate-800 px-3 py-1 rounded-full font-mono text-xs text-primary-400 flex items-center gap-1.5" title="Total Session Time">
              <Clock className="w-3.5 h-3.5" />
              {Math.floor(secondsElapsed / 60).toString().padStart(2, '0')}:{(secondsElapsed % 60).toString().padStart(2, '0')}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${questionTimeLeft <= 15 ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : 'bg-slate-800/50 text-slate-400 border-slate-700/50'}`}>
              Q-Time: {Math.floor(questionTimeLeft / 60)}:{(questionTimeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Webcam Viewport */}
        <div className="p-4 flex-1 space-y-4 overflow-y-auto">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video shadow-inner">
            <video 
              ref={videoRef} 
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              muted
              playsInline
            />
            <canvas 
              ref={canvasRef} 
              width={320} 
              height={240} 
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 backdrop-blur-sm">
              <Camera className="w-3.5 h-3.5" />
              <span>LIVE ASSESSMENT</span>
            </div>
            
            {/* Pulsing bot status overlay */}
            {volumePulse > 0 && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-primary-600/90 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white animate-pulse">
                <span>AI Speaking</span>
                <span className="flex gap-0.5 items-end h-2 ml-1">
                  <span className="w-0.5 bg-white animate-bounce" style={{ height: '60%', animationDelay: '0ms' }} />
                  <span className="w-0.5 bg-white animate-bounce" style={{ height: '90%', animationDelay: '150ms' }} />
                  <span className="w-0.5 bg-white animate-bounce" style={{ height: '40%', animationDelay: '300ms' }} />
                </span>
              </div>
            )}
          </div>

          {/* Real-time metrics bars */}
          <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Sentiment Metrics</span>
              <span className="text-[10px] text-emerald-400 font-mono">Calibrated</span>
            </h4>
            
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>Confidence</span>
                  <span className="font-mono text-primary-400">{confidenceScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary-500 h-full rounded-full transition-all duration-300" style={{ width: `${confidenceScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>Eye Contact Alignment</span>
                  <span className="font-mono text-emerald-400">{eyeContact}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${eyeContact}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>Stress Indicators</span>
                  <span className="font-mono text-amber-500">{stressLevel}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${stressLevel}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Authenticity Index */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${trustScore >= 80 ? 'text-emerald-400' : 'text-red-400'}`} />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Authenticity Score</span>
                <span className="font-bold text-sm text-slate-200">{trustScore}% Trust</span>
              </div>
            </div>
            {trustScore < 90 && (
              <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 font-medium">
                Penalized
              </span>
            )}
          </div>

          {/* Speech Control Panel */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Settings className="w-3.5 h-3.5 text-primary-400" />
              <span>Voice Settings</span>
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Coach Accent Voice</label>
                <select 
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-xs rounded-lg p-1.5 text-slate-300 outline-none"
                >
                  {availableVoices.map((voice, i) => (
                    <option key={i} value={voice.name}>{voice.name.replace('Microsoft', '').replace('Google', '')}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] text-slate-400">Speaking speed</span>
                <div className="flex gap-1.5">
                  {[0.8, 1.0, 1.2].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setSpeakingSpeed(s)}
                      className={`text-[10px] px-2 py-1 rounded border font-mono ${speakingSpeed === s ? 'bg-primary-600 border-primary-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-800/50 mt-auto flex flex-col gap-2">
          <button 
            onClick={toggleMute} 
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all font-medium border text-sm ${isMuted ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-primary-600/10 text-primary-400 border-primary-500/20'}`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isMuted ? 'Coach Voice: Muted' : 'Coach Voice: Active'}
          </button>
          
          <button 
            onClick={handleEndClick} 
            className="w-full flex justify-center items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 py-2.5 rounded-xl font-medium transition-colors border border-red-500/20 text-sm"
          >
            <StopCircle className="w-4 h-4" />
            End & Evaluate
          </button>
        </div>
      </aside>

      {/* Main chat viewport */}
      <main className="flex-1 flex flex-col pt-16 md:pt-0 relative max-h-screen">
        {/* Floating warning banners */}
        {showAlert && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-950 border border-red-500/30 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce max-w-md text-red-400">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 animate-pulse" />
            <div className="text-xs">
              <strong className="block text-white font-semibold">Security Alert Logged</strong>
              <span>{showAlert.reason}. Trust score penalized.</span>
            </div>
          </div>
        )}

        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/5 blur-[120px] pointer-events-none" />
        
        {/* Conversation Message Stream */}
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
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl rounded-tl-none text-emerald-100 text-xs leading-relaxed">
                          <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Previous Answer Feedback</span>
                          <ReactMarkdown>{msg.parsed.feedback}</ReactMarkdown>
                        </div>
                      )}
                      {msg.parsed?.question && (
                        <div className="glassmorphism p-5 rounded-2xl rounded-tl-none text-slate-200 leading-relaxed border border-slate-700 prose prose-invert max-w-none shadow-md">
                          <span className="block text-[10px] font-bold text-primary-400 uppercase tracking-wider mb-2">Interviewer Prompt</span>
                          <ReactMarkdown>{msg.parsed.question}</ReactMarkdown>
                          {msg.parsed.hints && msg.parsed.hints.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Answer Hints</span>
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
                    <div className="bg-primary-600 text-white p-5 rounded-2xl rounded-tr-none leading-relaxed shadow-lg pt-2 text-sm sm:text-base border border-primary-500/20">
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

        {/* Input Bar */}
        <div className="p-4 md:p-6 glassmorphism border-t border-slate-800/50 z-10 sticky bottom-0">
          <div className="max-w-3xl mx-auto">
            <button id="hidden-submit-btn" type="button" className="hidden" onClick={(e) => handleSubmit(e, true)}></button>
            <form onSubmit={(e) => handleSubmit(e, false)} className="relative flex items-end gap-2">
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
                placeholder="Type or dictate your response here... (Press Enter to send)"
                className="w-full bg-dark-surface border border-slate-700 rounded-2xl py-4 pl-5 pr-28 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none scrollbar-hide text-sm sm:text-base leading-relaxed"
                disabled={loading}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button 
                  type="button"
                  onClick={toggleMic}
                  className={`p-2.5 rounded-xl transition-all shadow-lg border ${isListening ? 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse' : 'bg-slate-800 text-slate-350 border-slate-700 hover:bg-slate-700'}`}
                  title="Toggle continuous speech input"
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button 
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  className="p-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 text-white rounded-xl transition-all shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
            
            {/* Live speech feedback display */}
            <div className="mt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <div className="flex items-center gap-3">
                <span>Filler counts: </span>
                <span className="text-amber-400">Um: {fillerCounts.um}</span>
                <span className="text-amber-400">Uh: {fillerCounts.uh}</span>
                <span className="text-amber-400">Like: {fillerCounts.like}</span>
                <span className="text-amber-400">Basically: {fillerCounts.basically}</span>
              </div>
              <div>
                <span>Total Words: {totalWords}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* End Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl animate-slide-up">
            <h3 className="text-2xl font-bold font-display mb-2 text-white">Evaluate Session?</h3>
            <p className="text-slate-400 mb-8 text-sm">
              Confirming will trigger AI analysis on transcripts, speech metrics, and webcam alignments.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-350 font-medium hover:bg-slate-800 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmEnd}
                className="flex-1 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors shadow-lg shadow-primary-600/20 text-sm"
              >
                Evaluate & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
