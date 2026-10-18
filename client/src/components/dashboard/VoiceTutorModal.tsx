import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Square,
  Volume2,
  VolumeX,
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
} from "lucide-react";
import toast from "react-hot-toast";
import { askQuestion, transcribeVoice } from "../../api/chat.api";
import type { DocumentItem } from "../../api/document.api";
import { ChatGPTMarkdown } from "../common/ChatGPTMarkdown";
import {
  speakWithCuteVoice,
  stopCuteSpeech,
  addSpeechStateListener,
} from "../../utils/cuteSpeech";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

export default function VoiceTutorModal({
  isOpen,
  onClose,
  document,
}: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [inputQuery, setInputQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string>("");
  const [speechLang, setSpeechLang] = useState<string>("en-US");
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const responseRef = useRef<HTMLDivElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Listen to global cute voice audio state
    const unsubscribe = addSpeechStateListener((speakingId) => {
      setIsPlayingAudio(speakingId === "voice-tutor-modal");
    });

    return () => {
      unsubscribe();
      stopRecording();
      stopCuteSpeech();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      stopCuteSpeech();
      setIsPlayingAudio(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if ((aiResponse || isThinking) && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [aiResponse, isThinking]);

  // Start Hardware Audio Recording (Bypasses Google SpeechRecognition cloud blocks completely!)
  const startRecording = async () => {
    stopSpeaking();

    // Prime speech synthesis audio context directly in click gesture
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
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
        // Clean up mic tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 1000) {
          setIsTranscribing(false);
          return;
        }

        await handleTranscribeBlob(audioBlob, mimeType);
      };

      mediaRecorder.start(250); // collect in 250ms chunks
      setIsRecording(true);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      toast.error("Microphone access denied. Please allow microphone permissions in your browser.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
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
      toast.loading("Transcribing your speech with AI...", { id: "transcribing" });

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

          // Automatically query Voice Tutor with transcribed question
          await submitQuestion(transcribedText);
        } catch (e: any) {
          toast.dismiss("transcribing");
          toast.error("Speech transcription failed. You can type your question below.");
          setIsTranscribing(false);
        }
      };
    } catch (err) {
      setIsTranscribing(false);
      toast.dismiss("transcribing");
    }
  };

  const submitQuestion = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    setActiveQuestion(trimmed);
    setInputQuery("");
    setTranscript("");

    // Prime speech synthesis in user flow
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }
    }

    try {
      setIsThinking(true);
      const res = await askQuestion(trimmed, document?._id);
      setAiResponse(res.answer);
      // Speak answer
      speakText(res.answer);
    } catch (err: any) {
      toast.error("Voice tutor failed to answer. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  const handleManualSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim()) return;
    await submitQuestion(inputQuery);
  };

  const speakText = (text: string) => {
    stopCuteSpeech();
    setIsPlayingAudio(true);
    speakWithCuteVoice(
      text,
      "voice-tutor-modal",
      () => {
        setIsPlayingAudio(false);
      },
      speechLang
    );
  };

  const stopSpeaking = () => {
    stopCuteSpeech();
    setIsPlayingAudio(false);
  };

  const handleCopy = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(aiResponse);
    setCopied(true);
    toast.success("Answer copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetConversation = () => {
    stopSpeaking();
    stopRecording();
    setAiResponse(null);
    setActiveQuestion("");
    setInputQuery("");
    setTranscript("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative my-auto flex h-[92vh] max-h-[920px] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#090d16] shadow-2xl backdrop-blur-2xl">
        
        {/* Sticky Top Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-4 py-3.5 sm:px-6 bg-slate-950/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  AI Voice Tutor
                </h3>
                <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  Interactive Audio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <BookOpen size={11} className="text-cyan-400" />
                <span className="truncate max-w-[220px] sm:max-w-md">
                  {document ? document.title : "General Knowledge Assistant"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector Pills */}
            <div className="hidden sm:flex items-center rounded-xl bg-slate-900/90 border border-white/10 p-0.5">
              {[
                { label: "EN", code: "en-US", title: "English (US)" },
                { label: "EN-IN", code: "en-IN", title: "English (India)" },
                { label: "हिन्दी", code: "hi-IN", title: "Hindi" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setSpeechLang(lang.code);
                    if (isRecording) stopRecording();
                  }}
                  title={lang.title}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                    speechLang === lang.code
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Reset / New Question Button */}
            {(aiResponse || activeQuestion) && (
              <button
                onClick={handleResetConversation}
                title="Start New Topic"
                className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                <RefreshCw size={12} />
                <span className="hidden sm:inline">New</span>
              </button>
            )}

            {/* Close Modal */}
            <button
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

        {/* Scrollable Conversation Container */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 space-y-5">
          
          {/* Welcome Screen (When no question has been asked yet) */}
          {!activeQuestion && !aiResponse && !isThinking && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
              
              {/* Central Audio Recording Interface */}
              <div className="relative flex items-center justify-center pt-4">
                {/* Live Animated Pulse Waves when recording */}
                {isRecording && (
                  <>
                    <div className="absolute h-40 w-40 animate-ping rounded-full bg-rose-500/20" />
                    <div className="absolute h-32 w-32 animate-pulse rounded-full bg-rose-500/40" />
                  </>
                )}

                {/* Big Mic Button */}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                  className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full shadow-2xl transition-all duration-300 disabled:opacity-50 ${
                    isRecording
                      ? "bg-rose-600 text-white shadow-rose-600/50 ring-4 ring-rose-500/40 scale-105 animate-pulse"
                      : "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-500/30 hover:scale-105 active:scale-95 ring-4 ring-cyan-500/20"
                  }`}
                >
                  {isRecording ? (
                    <Square size={32} className="fill-current" />
                  ) : (
                    <Mic size={38} />
                  )}
                </button>
              </div>

              {/* Status Text */}
              <div>
                <p className="text-base font-bold text-white">
                  {isRecording ? (
                    <span className="text-rose-400 flex items-center justify-center gap-2">
                      <Radio size={16} className="animate-spin text-rose-400" />
                      Listening to your voice... Tap red button to submit
                    </span>
                  ) : isTranscribing ? (
                    <span className="text-cyan-400 flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-cyan-400" />
                      Transcribing speech with AI...
                    </span>
                  ) : (
                    <span>Tap microphone and speak your question</span>
                  )}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Or type any question in the input bar below
                </p>
              </div>

              {/* Quick Topic Suggestions */}
              <div className="w-full max-w-lg rounded-2xl border border-white/5 bg-slate-900/40 p-4">
                <p className="text-xs font-semibold text-slate-400 mb-2.5 text-left">
                  💡 Suggested Questions:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Summarize this document",
                    "Explain key concepts",
                    "Quiz me on this topic",
                    "Give real-world examples",
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => submitQuestion(q)}
                      className="text-left rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs font-medium text-slate-300 hover:border-cyan-500/50 hover:bg-cyan-950/20 hover:text-white transition"
                    >
                      {q} →
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Conversation Flow */}
          {(activeQuestion || isThinking || aiResponse) && (
            <div className="space-y-5 pb-6" ref={responseRef}>
              
              {/* User Question Card */}
              {activeQuestion && (
                <div className="flex items-start justify-between gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 mt-0.5 ring-1 ring-cyan-500/30">
                      <User size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                        Your Question
                      </span>
                      <p className="text-sm sm:text-base font-semibold text-white mt-0.5 leading-snug">
                        {activeQuestion}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                      Analyzing your notes and formulating a structured answer...
                    </p>
                  </div>
                </div>
              )}

              {/* AI Structured Answer Card */}
              {aiResponse && (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
                  
                  {/* Answer Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950/90 px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-sm">
                        <Bot size={16} />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-white">
                          EduMind AI Tutor
                        </span>
                        {isPlayingAudio && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                            Speaking aloud
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Speech Control & Copy */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={isPlayingAudio ? stopSpeaking : () => speakText(aiResponse)}
                        className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-sm ${
                          isPlayingAudio
                            ? "bg-rose-600 text-white shadow-rose-600/40 animate-pulse ring-2 ring-rose-400"
                            : "bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30"
                        }`}
                        title={isPlayingAudio ? "Stop reading voice" : "Listen to answer aloud"}
                      >
                        {isPlayingAudio ? (
                          <>
                            <VolumeX size={14} />
                            <span>Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={14} />
                            <span>Listen Aloud</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                        title="Copy answer"
                      >
                        {copied ? (
                          <>
                            <Check size={13} className="text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ChatGPT Markdown Formatted Answer */}
                  <div className="p-4 sm:p-6">
                    <ChatGPTMarkdown content={aiResponse} />
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>
          )}
        </div>

        {/* Sticky Bottom Interactive Input Bar - Always Accessible */}
        <div className="flex-shrink-0 border-t border-white/10 bg-slate-950/95 px-3 py-3 sm:px-5 sm:py-3.5 backdrop-blur-lg">
          {/* Recording live banner if active */}
          {isRecording && (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-rose-500/20 border border-rose-500/40 px-3 py-1.5 text-xs font-semibold text-rose-300 animate-pulse">
              <span className="flex items-center gap-1.5">
                <Radio size={14} className="animate-spin text-rose-400" />
                Recording microphone... Speak your question now
              </span>
              <button
                type="button"
                onClick={stopRecording}
                className="rounded-lg bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white hover:bg-rose-500"
              >
                Finish & Submit
              </button>
            </div>
          )}

          {isTranscribing && (
            <div className="mb-2 flex items-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-cyan-300">
              <Loader2 size={14} className="animate-spin text-cyan-400" />
              <span>Transcribing speech with AI...</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
            {/* Inline Mic Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing || isThinking}
              title={isRecording ? "Stop recording" : "Record with microphone"}
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl shadow-md transition ${
                isRecording
                  ? "bg-rose-600 text-white animate-pulse ring-2 ring-rose-400"
                  : "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25"
              }`}
            >
              {isRecording ? <Square size={16} className="fill-current" /> : <Mic size={18} />}
            </button>

            {/* Question Textarea / Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  isRecording
                    ? "Listening to speech..."
                    : "Ask a question or speak with mic..."
                }
                disabled={isRecording || isTranscribing}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition disabled:opacity-60"
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

            {/* Send / Ask Button */}
            <button
              type="submit"
              disabled={isThinking || !inputQuery.trim() || isRecording || isTranscribing}
              className="flex h-10 items-center gap-1.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 text-xs font-bold text-white shadow-md shadow-cyan-600/30 transition hover:brightness-110 active:scale-95 disabled:opacity-50 flex-shrink-0"
            >
              {isThinking ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
