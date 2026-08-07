import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Loader2,
  Bot,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { askQuestion } from "../../api/chat.api";
import type { DocumentItem } from "../../api/document.api";

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
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let current = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setTranscript(current);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event);
          setIsListening(false);
          toast.error("Microphone listening stopped.");
        };

        recognitionRef.current = recognition;
      }

      synthRef.current = window.speechSynthesis;
    }

    return () => {
      stopListening();
      stopSpeaking();
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    stopSpeaking();
    setTranscript("");
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleAskVoiceQuestion = async () => {
    if (!transcript.trim()) {
      toast.error("Please speak or enter a question.");
      return;
    }
    stopListening();

    try {
      setIsThinking(true);
      const res = await askQuestion(transcript, document?._id);
      setAiResponse(res.answer);
      speakText(res.answer);
    } catch (err: any) {
      toast.error("Voice tutor failed to answer.");
    } finally {
      setIsThinking(false);
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    stopSpeaking();

    // Clean markdown symbols for natural speech
    const cleanText = text
      .replace(/[#*_`~-]/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .substring(0, 1000);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlayingAudio(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-[#07090e] p-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-2xl bg-cyan-500/20 p-2.5 text-cyan-400 ring-1 ring-cyan-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Voice Tutor</h3>
              <p className="text-xs text-slate-400">
                {document ? `Document: ${document.title}` : "Interactive Speech Assistant"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              stopListening();
              onClose();
            }}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Central Waveform / Visualizer */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative flex items-center justify-center">
            {/* Pulsing rings when listening */}
            {isListening && (
              <>
                <div className="absolute h-32 w-32 animate-ping rounded-full bg-cyan-500/20" />
                <div className="absolute h-24 w-24 animate-pulse rounded-full bg-cyan-500/30" />
              </>
            )}

            {/* Mic button */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
                isListening
                  ? "bg-rose-600 text-white shadow-rose-600/40 ring-4 ring-rose-500/30"
                  : "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-500/30 hover:scale-105"
              }`}
            >
              {isListening ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
          </div>

          <p className="mt-4 text-xs font-semibold text-slate-300">
            {isListening
              ? "Listening... Speak your question clearly"
              : "Tap microphone to speak to your AI Tutor"}
          </p>
        </div>

        {/* Transcript Box */}
        <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <User size={13} className="text-cyan-400" />
              Your Question
            </span>
            {transcript && (
              <button
                onClick={() => setTranscript("")}
                className="text-[10px] text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          <input
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your spoken transcript will appear here..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />

          <div className="flex justify-end pt-1">
            <button
              onClick={handleAskVoiceQuestion}
              disabled={isThinking || !transcript.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-600/30 transition hover:bg-cyan-500 disabled:opacity-50"
            >
              {isThinking ? (
                <Loader2 className="animate-spin" size={13} />
              ) : (
                <Sparkles size={13} />
              )}
              <span>{isThinking ? "Reasoning..." : "Ask Voice Tutor"}</span>
            </button>
          </div>
        </div>

        {/* AI Answer Voice Output */}
        {aiResponse && (
          <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <Bot size={14} />
                <span>AI Tutor Voice Response</span>
              </div>

              <button
                onClick={isPlayingAudio ? stopSpeaking : () => speakText(aiResponse)}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span>{isPlayingAudio ? "Stop Voice" : "Replay"}</span>
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed max-h-40 overflow-y-auto">
              {aiResponse}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
