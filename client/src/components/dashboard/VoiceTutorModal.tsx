import { useState, useEffect, useRef, useMemo } from "react";
import {
  Mic,
  Square,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  X,
  Sparkles,
  Loader2,
  Bot,
  User,
  Copy,
  Check,
  Radio,
  Send,
  RefreshCw,
  BookOpen,
  Settings2,
  Globe,
  GraduationCap,
  Lightbulb,
  Zap,
  HelpCircle,
  FileText,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  askVoiceTutor,
  transcribeVoice,
  type VoiceTutorRequest,
} from "../../api/chat.api";
import type { DocumentItem } from "../../api/document.api";
import { ChatGPTMarkdown } from "../common/ChatGPTMarkdown";
import {
  speakWithCuteVoice,
  stopCuteSpeech,
  pauseCuteSpeech,
  resumeCuteSpeech,
  addSpeechStateListener,
  getSystemVoices,
  type SpeechOptions,
} from "../../utils/cuteSpeech";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

export type PedagogicalLevel = "beginner" | "intermediate" | "advanced";
export type PedagogicalMode =
  | "explain"
  | "simplify"
  | "example"
  | "quiz"
  | "summarize"
  | "followup";

export interface ConversationTurn {
  id: string;
  question: string;
  answer: string;
  sources?: string[];
  suggestedFollowups?: string[];
  timestamp: Date;
  level: PedagogicalLevel;
  language: string;
}

export const SUPPORTED_LANGUAGES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸", ttsCode: "en-US" },
  { code: "en-IN", label: "English (India)", flag: "🇮🇳", ttsCode: "en-IN" },
  { code: "hi-IN", label: "हिन्दी (Hindi)", flag: "🇮🇳", ttsCode: "hi-IN" },
  { code: "hinglish", label: "Hinglish (Roman)", flag: "🇮🇳", ttsCode: "hi-IN" },
  { code: "bn-IN", label: "বাংলা (Bengali)", flag: "🇮🇳", ttsCode: "bn-IN" },
  { code: "ta-IN", label: "தமிழ் (Tamil)", flag: "🇮🇳", ttsCode: "ta-IN" },
  { code: "te-IN", label: "తెలుగు (Telugu)", flag: "🇮🇳", ttsCode: "te-IN" },
  { code: "mr-IN", label: "मराठी (Marathi)", flag: "🇮🇳", ttsCode: "mr-IN" },
  { code: "es-ES", label: "Español (Spanish)", flag: "🇪🇸", ttsCode: "es-ES" },
  { code: "fr-FR", label: "Français (French)", flag: "🇫🇷", ttsCode: "fr-FR" },
];

export default function VoiceTutorModal({
  isOpen,
  onClose,
  document,
}: Props) {
  // Saved Preferences
  const [speechLang, setSpeechLang] = useState<string>(() => {
    return localStorage.getItem("edumind_voice_lang") || "en-US";
  });
  const [level, setLevel] = useState<PedagogicalLevel>(() => {
    return (
      (localStorage.getItem("edumind_voice_level") as PedagogicalLevel) ||
      "beginner"
    );
  });
  const [speakingRate, setSpeakingRate] = useState<number>(() => {
    const saved = localStorage.getItem("edumind_voice_rate");
    return saved ? parseFloat(saved) : 1.0;
  });
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    const saved = localStorage.getItem("edumind_voice_autospeak");
    return saved !== null ? saved === "true" : true;
  });
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  // UI & Conversation State
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Save preferences changes to localStorage
  useEffect(() => {
    localStorage.setItem("edumind_voice_lang", speechLang);
  }, [speechLang]);

  useEffect(() => {
    localStorage.setItem("edumind_voice_level", level);
  }, [level]);

  useEffect(() => {
    localStorage.setItem("edumind_voice_rate", String(speakingRate));
  }, [speakingRate]);

  useEffect(() => {
    localStorage.setItem("edumind_voice_autospeak", String(autoSpeak));
  }, [autoSpeak]);

  // Global Audio listener for sync
  useEffect(() => {
    const unsubscribe = addSpeechStateListener((speakingId, paused) => {
      setSpeakingMessageId(speakingId);
      setIsAudioPaused(paused);
    });

    return () => {
      unsubscribe();
      stopRecording();
      stopCuteSpeech();
    };
  }, []);

  // Cleanup on modal close
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      stopCuteSpeech();
      setSpeakingMessageId(null);
      setIsAudioPaused(false);
    }
  }, [isOpen]);

  // Scroll to bottom when new history turn appears or while thinking
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history.length, isThinking]);

  // Available system voices filtered by current language code
  const availableVoices = useMemo(() => {
    const all = getSystemVoices();
    const clean = speechLang.toLowerCase().slice(0, 2);
    return all.filter((v) => v.lang.toLowerCase().startsWith(clean));
  }, [speechLang]);

  // =============================
  // Microphone & Speech to Text
  // =============================
  const startRecording = async () => {
    stopSpeaking();

    // Prime Web Audio / Speech Synthesis gesture
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }
    }

    // Try Web Speech Recognition for live text feedback if supported
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = speechLang === "hinglish" ? "hi-IN" : speechLang;

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setInputQuery(currentTranscript);
          }
        };

        recognition.onerror = () => {
          // Handled gracefully via MediaRecorder fallback
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.warn("SpeechRecognition init skipped:", e);
      }
    }

    // Start Hardware MediaRecorder
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 1200) {
          setIsTranscribing(false);
          return;
        }

        // If Web Speech already provided transcript, verify and submit
        if (inputQuery.trim().length > 3) {
          const query = inputQuery.trim();
          setIsTranscribing(false);
          await handleSendQuery(query);
          return;
        }

        await handleTranscribeBlob(audioBlob, mimeType);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      toast.error(
        "Microphone access denied. Please enable microphone permissions in your browser."
      );
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
      setIsRecording(false);
    }
  };

  const handleTranscribeBlob = async (blob: Blob, mimeType: string) => {
    try {
      setIsTranscribing(true);
      toast.loading("Recognizing speech with AI...", { id: "transcribing" });

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        try {
          const transcribedText = await transcribeVoice(base64Audio, mimeType);
          toast.dismiss("transcribing");

          if (!transcribedText || transcribedText.trim() === "") {
            toast.error("No speech detected. Please speak closer to your microphone.");
            setIsTranscribing(false);
            return;
          }

          toast.success("Voice recognized!");
          setIsTranscribing(false);
          setInputQuery(transcribedText);
          await handleSendQuery(transcribedText);
        } catch (e: any) {
          toast.dismiss("transcribing");
          toast.error("Speech transcription failed. You can type your question.");
          setIsTranscribing(false);
        }
      };
    } catch {
      setIsTranscribing(false);
      toast.dismiss("transcribing");
    }
  };

  // =============================
  // AI Voice Tutor Query Flow
  // =============================
  const handleSendQuery = async (
    questionText: string,
    mode: PedagogicalMode = "explain"
  ) => {
    const trimmed = questionText.trim();
    if (!trimmed || isThinking) return;

    stopSpeaking();
    setInputQuery("");

    const turnId = `vt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Prime speech synthesis in user event
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }
    }

    try {
      setIsThinking(true);

      // Build conversation history array for context
      const historyContext = history.slice(-4).map((h) => ({
        role: "user" as const,
        content: h.question,
      })).concat(
        history.slice(-4).map((h) => ({
          role: "assistant" as const,
          content: h.answer,
        }))
      );

      const payload: VoiceTutorRequest = {
        question: trimmed,
        documentId: document?._id,
        language: speechLang,
        level,
        mode,
        history: historyContext,
      };

      const res = await askVoiceTutor(payload);

      const newTurn: ConversationTurn = {
        id: turnId,
        question: trimmed,
        answer: res.answer,
        sources: res.sources,
        suggestedFollowups: res.suggestedFollowups,
        timestamp: new Date(),
        level,
        language: speechLang,
      };

      setHistory((prev) => [...prev, newTurn]);

      // Automatically speak answer if autoSpeak is enabled
      if (autoSpeak) {
        speakText(res.answer, turnId);
      }
    } catch (err: any) {
      console.error("Voice tutor request error:", err);
      toast.error(
        err?.response?.data?.message || "Voice Tutor failed to respond. Please try again."
      );
    } finally {
      setIsThinking(false);
    }
  };

  // =============================
  // Audio Controls
  // =============================
  const speakText = (text: string, messageId: string) => {
    stopCuteSpeech();
    const options: SpeechOptions = {
      rate: speakingRate,
      voiceName: selectedVoiceName || undefined,
    };

    speakWithCuteVoice(
      text,
      messageId,
      () => {
        setSpeakingMessageId(null);
        setIsAudioPaused(false);
      },
      speechLang,
      options
    );
  };

  const handleTogglePlayPause = (text: string, messageId: string) => {
    if (speakingMessageId === messageId) {
      if (isAudioPaused) {
        resumeCuteSpeech();
      } else {
        pauseCuteSpeech();
      }
    } else {
      speakText(text, messageId);
    }
  };

  const stopSpeaking = () => {
    stopCuteSpeech();
    setSpeakingMessageId(null);
    setIsAudioPaused(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Explanation copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    stopSpeaking();
    stopRecording();
    setHistory([]);
    setInputQuery("");
    toast.success("Lesson reset. Ready for a new topic!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative my-auto flex h-[92vh] max-h-[940px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#090d16] shadow-2xl backdrop-blur-2xl">
        
        {/* =============================
            Sticky Top Header Toolbar
            ============================= */}
        <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6 bg-slate-950/90 backdrop-blur-md z-20">
          
          {/* Title & Document Badge */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 ring-1 ring-cyan-500/40">
              <Sparkles size={20} className="animate-pulse" />
              {speakingMessageId && !isAudioPaused && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-cyan-500" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  AI Voice Tutor
                </h3>
                <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  Multilingual AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <BookOpen size={11} className="text-cyan-400 flex-shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-xs">
                  {document ? document.title : "General Knowledge Tutor"}
                </span>
              </p>
            </div>
          </div>

          {/* Controls: Language, Level, Settings, Close */}
          <div className="flex items-center gap-2">
            
            {/* Preferred Language Selector */}
            <div className="relative">
              <select
                value={speechLang}
                onChange={(e) => {
                  setSpeechLang(e.target.value);
                  stopSpeaking();
                }}
                className="appearance-none rounded-xl border border-white/10 bg-slate-900/90 px-3 py-1.5 pr-7 text-xs font-semibold text-slate-200 outline-none hover:border-cyan-500/40 focus:border-cyan-500/50 cursor-pointer transition"
                title="Select preferred teaching & speech language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
              <Globe
                size={12}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* Teaching Level Selector */}
            <div className="hidden sm:flex items-center rounded-xl bg-slate-900/90 border border-white/10 p-0.5">
              {(["beginner", "intermediate", "advanced"] as PedagogicalLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  title={`Teaching level: ${lvl}`}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                    level === lvl
                      ? lvl === "beginner"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : lvl === "intermediate"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-purple-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Audio Settings Dropdown Toggle */}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              title="Voice & Speed Settings"
              className={`rounded-xl border border-white/10 p-2 text-xs font-semibold transition ${
                showSettings
                  ? "bg-cyan-600/30 border-cyan-500/50 text-cyan-300"
                  : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Settings2 size={16} />
            </button>

            {/* Reset Session */}
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                title="Start New Topic"
                className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                <RefreshCw size={13} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {/* Close Modal */}
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                stopRecording();
                onClose();
              }}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* =============================
            Collapsible Settings Drawer
            ============================= */}
        {showSettings && (
          <div className="flex-shrink-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 sm:px-6 backdrop-blur-md animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              
              {/* Speed Controller */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Sliders size={13} className="text-cyan-400" />
                  Speaking Speed: <span className="text-cyan-300 font-bold">{speakingRate}x</span>
                </label>
                <div className="flex items-center gap-1 bg-slate-900 border border-white/10 rounded-xl p-1">
                  {[
                    { label: "Slow (0.8x)", val: 0.8 },
                    { label: "Normal (1.0x)", val: 1.0 },
                    { label: "Fast (1.25x)", val: 1.25 },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setSpeakingRate(s.val)}
                      className={`flex-1 rounded-lg py-1 text-[11px] font-semibold transition ${
                        speakingRate === s.val
                          ? "bg-cyan-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Volume2 size={13} className="text-cyan-400" />
                  Voice Profile:
                </label>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="">Default AI Voice</option>
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-Speech Toggle */}
              <div className="flex flex-col justify-center">
                <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Zap size={13} className="text-cyan-400" />
                  Hands-Free Audio:
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs mt-1">
                  <input
                    type="checkbox"
                    checked={autoSpeak}
                    onChange={(e) => setAutoSpeak(e.target.checked)}
                    className="h-4 w-4 rounded accent-cyan-600"
                  />
                  <span>Auto-speak explanations aloud</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* =============================
            Scrollable Lesson Conversation
            ============================= */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 space-y-6">
          
          {/* Welcome Screen (When no turns yet) */}
          {history.length === 0 && !isThinking && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
              
              {/* Central Pulsing Microphone */}
              <div className="relative flex items-center justify-center pt-2">
                {isRecording && (
                  <>
                    <div className="absolute h-40 w-40 animate-ping rounded-full bg-rose-500/20" />
                    <div className="absolute h-32 w-32 animate-pulse rounded-full bg-rose-500/40" />
                  </>
                )}

                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                  className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full shadow-2xl transition-all duration-300 disabled:opacity-50 ${
                    isRecording
                      ? "bg-rose-600 text-white shadow-rose-600/50 ring-4 ring-rose-500/40 scale-105 animate-pulse"
                      : "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-500/30 hover:scale-105 active:scale-95 ring-4 ring-cyan-500/20"
                  }`}
                  title={isRecording ? "Stop recording" : "Speak to Voice Tutor"}
                >
                  {isRecording ? (
                    <Square size={32} className="fill-current" />
                  ) : (
                    <Mic size={38} />
                  )}
                </button>
              </div>

              {/* Status Indicator */}
              <div>
                <p className="text-base font-bold text-white">
                  {isRecording ? (
                    <span className="text-rose-400 flex items-center justify-center gap-2">
                      <Radio size={16} className="animate-spin text-rose-400" />
                      Listening to your voice... Tap red button to finish
                    </span>
                  ) : isTranscribing ? (
                    <span className="text-cyan-400 flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-cyan-400" />
                      Transcribing speech with AI...
                    </span>
                  ) : (
                    <span>Tap microphone and ask anything to your AI Tutor</span>
                  )}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Speaks in {SUPPORTED_LANGUAGES.find((l) => l.code === speechLang)?.label || speechLang} • Level: {level}
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="w-full max-w-xl rounded-2xl border border-white/5 bg-slate-900/40 p-4">
                <p className="text-xs font-semibold text-slate-400 mb-2.5 text-left flex items-center gap-1.5">
                  <Lightbulb size={13} className="text-amber-400" />
                  Suggested Study Prompts:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Explain the core concept simply",
                    "Give me a real-world example",
                    "How does this work step-by-step?",
                    "Test my understanding with a question",
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSendQuery(q)}
                      className="text-left rounded-xl border border-white/10 bg-slate-950/80 px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:border-cyan-500/50 hover:bg-cyan-950/20 hover:text-white transition flex items-center justify-between group"
                    >
                      <span>{q}</span>
                      <span className="text-slate-500 group-hover:text-cyan-400 transition">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Conversation Turns History */}
          {history.map((turn, idx) => {
            const isSpeakingThis = speakingMessageId === turn.id;
            return (
              <div key={turn.id} className="space-y-4">
                
                {/* User Query Bubble */}
                <div className="flex items-start justify-end gap-3">
                  <div className="max-w-2xl rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                        Student Query
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      {turn.question}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 mt-1 ring-1 ring-cyan-500/30">
                    <User size={16} />
                  </div>
                </div>

                {/* AI Tutor Structured Explanation Bubble */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white mt-1 shadow-md">
                    <Bot size={18} />
                  </div>

                  <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-xl backdrop-blur-xl">
                    
                    {/* Tutor Header Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950/90 px-4 py-2.5 sm:px-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          EduMind AI Tutor
                        </span>
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                          {turn.level}
                        </span>
                        {isSpeakingThis && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                            {isAudioPaused ? "Voice Paused" : "Speaking Lesson"}
                          </span>
                        )}
                      </div>

                      {/* Audio Controls & Actions */}
                      <div className="flex items-center gap-1.5">
                        {/* Play/Pause Button */}
                        <button
                          type="button"
                          onClick={() => handleTogglePlayPause(turn.answer, turn.id)}
                          className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                            isSpeakingThis && !isAudioPaused
                              ? "bg-cyan-600 text-white shadow-sm"
                              : "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25"
                          }`}
                          title={isSpeakingThis && !isAudioPaused ? "Pause Voice" : "Listen Aloud"}
                        >
                          {isSpeakingThis && !isAudioPaused ? (
                            <>
                              <Pause size={13} />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play size={13} />
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        {/* Stop Voice button when active */}
                        {isSpeakingThis && (
                          <button
                            type="button"
                            onClick={stopSpeaking}
                            className="flex items-center gap-1 rounded-xl bg-rose-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-rose-500 transition shadow-sm"
                            title="Stop speaking"
                          >
                            <VolumeX size={13} />
                            <span>Stop</span>
                          </button>
                        )}

                        {/* Replay voice from start */}
                        <button
                          type="button"
                          onClick={() => speakText(turn.answer, turn.id)}
                          className="rounded-xl border border-white/10 bg-slate-800/80 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                          title="Replay from start"
                        >
                          <RotateCcw size={13} />
                        </button>

                        {/* Copy button */}
                        <button
                          type="button"
                          onClick={() => handleCopy(turn.answer, turn.id)}
                          className="rounded-xl border border-white/10 bg-slate-800/80 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                          title="Copy explanation"
                        >
                          {copiedId === turn.id ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Markdown Formatted Body */}
                    <div className="p-4 sm:p-6 text-sm">
                      <ChatGPTMarkdown content={turn.answer} />
                    </div>

                    {/* Quick Pedagogical Action Chips */}
                    {idx === history.length - 1 && (
                      <div className="border-t border-white/10 bg-slate-950/70 p-3 sm:px-5">
                        <p className="text-[11px] font-semibold text-slate-400 mb-2">
                          💡 Deepen Your Understanding:
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleSendQuery(
                                `Explain this more simply using a daily life analogy: "${turn.question}"`,
                                "simplify"
                              )
                            }
                            className="rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition"
                          >
                            💡 Explain more simply
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleSendQuery(
                                `Give me 2 practical real-world examples of: "${turn.question}"`,
                                "example"
                              )
                            }
                            className="rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition"
                          >
                            🧪 Give another example
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleSendQuery(
                                `Test my understanding with a conceptual quiz question on: "${turn.question}"`,
                                "quiz"
                              )
                            }
                            className="rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition"
                          >
                            🎯 Test my understanding
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleSendQuery(
                                `Provide a crisp bulleted summary of: "${turn.question}"`,
                                "summarize"
                              )
                            }
                            className="rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition"
                          >
                            📝 Summarize lesson
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* AI Thinking State */}
          {isThinking && (
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-md animate-pulse">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white">
                <Bot size={18} />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">EduMind AI Tutor</span>
                  <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Formulating structured lesson in{" "}
                  {SUPPORTED_LANGUAGES.find((l) => l.code === speechLang)?.label || speechLang}...
                </p>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* =============================
            Sticky Bottom Input Area
            ============================= */}
        <div className="flex-shrink-0 border-t border-white/10 bg-slate-950/95 px-3 py-3 sm:px-5 sm:py-3.5 backdrop-blur-lg">
          
          {/* Active Recording Notice */}
          {isRecording && (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-rose-500/20 border border-rose-500/40 px-3 py-1.5 text-xs font-semibold text-rose-300 animate-pulse">
              <span className="flex items-center gap-1.5">
                <Radio size={14} className="animate-spin text-rose-400" />
                Listening to microphone... Speak clearly
              </span>
              <button
                type="button"
                onClick={stopRecording}
                className="rounded-lg bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white hover:bg-rose-500 transition"
              >
                Done & Send
              </button>
            </div>
          )}

          {isTranscribing && (
            <div className="mb-2 flex items-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-cyan-300">
              <Loader2 size={14} className="animate-spin text-cyan-400" />
              <span>Transcribing your speech with AI...</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            {/* Microphone Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing || isThinking}
              title={isRecording ? "Stop recording" : "Speak with microphone"}
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl shadow-md transition ${
                isRecording
                  ? "bg-rose-600 text-white animate-pulse ring-2 ring-rose-400"
                  : "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25"
              }`}
            >
              {isRecording ? (
                <Square size={17} className="fill-current" />
              ) : (
                <Mic size={20} />
              )}
            </button>

            {/* Input field */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  isRecording
                    ? "Listening to speech..."
                    : `Ask topic in ${SUPPORTED_LANGUAGES.find((l) => l.code === speechLang)?.label || "preferred language"}...`
                }
                disabled={isRecording || isTranscribing}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition disabled:opacity-60"
              />
              {inputQuery && (
                <button
                  type="button"
                  onClick={() => setInputQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Stop Voice quick button if speaking */}
            {speakingMessageId && (
              <button
                type="button"
                onClick={stopSpeaking}
                title="Stop Tutor Voice"
                className="flex h-11 items-center gap-1.5 rounded-2xl bg-rose-600/20 border border-rose-500/40 px-3 text-xs font-bold text-rose-300 hover:bg-rose-600/30 transition flex-shrink-0"
              >
                <VolumeX size={16} />
                <span className="hidden sm:inline">Mute</span>
              </button>
            )}

            {/* Send Button */}
            <button
              type="submit"
              disabled={isThinking || !inputQuery.trim() || isRecording || isTranscribing}
              className="flex h-11 items-center gap-1.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 sm:px-5 text-xs font-bold text-white shadow-md shadow-cyan-600/30 transition hover:brightness-110 active:scale-95 disabled:opacity-50 flex-shrink-0"
            >
              {isThinking ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
