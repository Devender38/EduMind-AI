/**
 * Dual-Engine Cute Voice & TTS Audio Player
 * 1. Web SpeechSynthesis with Chrome GC prevention, sentence chunking & Windows SAPI stability.
 * 2. HTML5 Audio fallback that plays multi-chunk MP3 stream from backend if browser SpeechSynthesis is muted or blocked.
 */

let currentSpeakingId: string | null = null;
let stateListeners: Array<(speakingId: string | null) => void> = [];
let activeUtterances: SpeechSynthesisUtterance[] = [];
let currentAudio: HTMLAudioElement | null = null;
let heartbeatTimer: any = null;

// Ensure voices are loaded across browsers
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    try {
      window.speechSynthesis.getVoices();
    } catch {
      // ignore
    }
  };
  try {
    window.speechSynthesis.getVoices();
  } catch {
    // ignore
  }
}

export const addSpeechStateListener = (cb: (speakingId: string | null) => void) => {
  stateListeners.push(cb);
  return () => {
    stateListeners = stateListeners.filter((l) => l !== cb);
  };
};

const notifyState = (speakingId: string | null) => {
  currentSpeakingId = speakingId;
  stateListeners.forEach((fn) => fn(speakingId));
};

export const getCuteVoice = (langCode: string = "en-US"): SpeechSynthesisVoice | null => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  let voices: SpeechSynthesisVoice[];
  try {
    voices = window.speechSynthesis.getVoices();
  } catch {
    return null;
  }
  if (!voices || voices.length === 0) return null;

  const cleanLang = langCode.toLowerCase();

  // 1. If Hindi requested
  if (cleanLang.startsWith("hi")) {
    const hindiVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("hi") ||
        v.name.toLowerCase().includes("hindi") ||
        v.name.toLowerCase().includes("swara") ||
        v.name.toLowerCase().includes("madhur")
    );
    if (hindiVoice) return hindiVoice;
  }

  // 2. If Indian English requested
  if (cleanLang === "en-in" || cleanLang.startsWith("en-in")) {
    const inVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === "en-in" ||
        v.name.toLowerCase().includes("india") ||
        v.name.toLowerCase().includes("neerja") ||
        v.name.toLowerCase().includes("prabhat")
    );
    if (inVoice) return inVoice;
  }

  // 3. Premium natural female voices
  const naturalFemale = voices.find(
    (v) =>
      v.name.toLowerCase().includes("natural") &&
      (v.name.toLowerCase().includes("jenny") ||
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("aria") ||
        v.name.toLowerCase().includes("female"))
  );
  if (naturalFemale) return naturalFemale;

  // 4. Recognized sweet female voices
  const sweetNames = [
    "jenny",
    "zira",
    "neerja",
    "aria",
    "samantha",
    "victoria",
    "karen",
    "google uk english female",
    "google us english female",
    "female",
  ];

  for (const name of sweetNames) {
    const match = voices.find((v) => v.name.toLowerCase().includes(name));
    if (match) return match;
  }

  // 5. Any voice matching language
  const matchingLang = voices.find((v) =>
    v.lang.toLowerCase().startsWith(cleanLang.slice(0, 2))
  );
  if (matchingLang) return matchingLang;

  // 6. Default to first available
  return voices[0] || null;
};

export const cleanTextForSpeech = (markdown: string): string => {
  return markdown
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "Code block omitted.")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Remove markdown links but keep anchor text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove markdown headings
    .replace(/#{1,6}\s+/g, "")
    // Remove bold and italic markers
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    // Remove blockquotes
    .replace(/^\s*>\s+/gm, "")
    // Remove horizontal lines
    .replace(/[-*_]{3,}/g, "")
    // Remove bullets and symbols
    .replace(/^[\s*•\-–]+\s+/gm, "")
    // Remove emojis
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu,
      ""
    )
    // Replace newlines with period space for smooth reading
    .replace(/[\r\n]+/g, ". ")
    // Remove special brackets that trip up Windows SAPI
    .replace(/[[\]{}()<>]/g, "")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Splits text into safe, small sentence chunks (max ~150 chars).
 * Windows Chromium SpeechSynthesis crashes with synthesis-failed if utterances are too long.
 */
const splitIntoSpeechChunks = (text: string, maxLen: number = 150): string[] => {
  if (!text) return [];

  const rawSentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if ((current + " " + trimmed).trim().length <= maxLen) {
      current = (current + " " + trimmed).trim();
    } else {
      if (current) chunks.push(current);

      if (trimmed.length > maxLen) {
        const words = trimmed.split(/\s+/);
        let wordChunk = "";
        for (const w of words) {
          if ((wordChunk + " " + w).trim().length <= maxLen) {
            wordChunk = (wordChunk + " " + w).trim();
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = w;
          }
        }
        current = wordChunk;
      } else {
        current = trimmed;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
};

// High-reliability Audio player using our backend MP3 TTS stream
const playAudioTTSFallback = (
  text: string,
  langCode: string = "en",
  onEnd?: () => void
): HTMLAudioElement => {
  const clean = cleanTextForSpeech(text).slice(0, 600);
  const API_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "https://edumind-server.onrender.com/api"
      : "http://localhost:5000/api");
  const url = `${API_URL}/chat/tts?text=${encodeURIComponent(
    clean
  )}&lang=${encodeURIComponent(langCode)}`;

  const audio = new Audio(url);
  audio.crossOrigin = "anonymous";
  audio.volume = 1.0;

  audio.onended = () => {
    if (onEnd) onEnd();
  };
  audio.onerror = (e) => {
    console.warn("Backend TTS playback error:", e);
    if (onEnd) onEnd();
  };

  audio.play().catch((err) => {
    console.warn("Audio playback gesture error:", err);
    if (onEnd) onEnd();
  });

  return audio;
};

export const speakWithCuteVoice = (
  text: string,
  messageId: string,
  onFinish?: () => void,
  langCode: string = "en-US"
) => {
  // If user clicks currently speaking message, stop it
  if (currentSpeakingId === messageId) {
    stopCuteSpeech();
    return;
  }

  stopCuteSpeech();

  const clean = cleanTextForSpeech(text);
  if (!clean) return;

  const readableText = clean.slice(0, 800);
  const chunks = splitIntoSpeechChunks(readableText, 140);

  if (chunks.length === 0) return;

  // 1. Try Browser SpeechSynthesis using small sentence chunks
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.resume();

      const voice = getCuteVoice(langCode);
      const voiceLang = voice ? voice.lang : "en-US";

      activeUtterances = [];
      (window as any)._activeSpeechUtterances = activeUtterances;

      let hasEncounteredError = false;
      let completedChunks = 0;

      const handleEnd = () => {
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
        activeUtterances = [];
        (window as any)._activeSpeechUtterances = null;

        if (currentSpeakingId === messageId) {
          notifyState(null);
          if (onFinish) onFinish();
        }
      };

      chunks.forEach((chunk) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        if (voice) utterance.voice = voice;
        utterance.lang = voiceLang;
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          notifyState(messageId);

          if (heartbeatTimer) clearInterval(heartbeatTimer);
          heartbeatTimer = setInterval(() => {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.resume();
            } else {
              clearInterval(heartbeatTimer);
            }
          }, 3000);
        };

        utterance.onend = () => {
          completedChunks++;
          if (completedChunks === chunks.length) {
            handleEnd();
          }
        };

        utterance.onerror = (e: any) => {
          console.warn("SpeechSynthesis chunk error:", e?.error || e);
          if (hasEncounteredError) return;
          hasEncounteredError = true;

          handleEnd();

          // If browser SpeechSynthesis fails, fall back to backend MP3 TTS stream
          if (e?.error !== "interrupted") {
            console.log("SpeechSynthesis error, falling back to backend TTS stream");
            currentAudio = playAudioTTSFallback(readableText, langCode, () => {
              notifyState(null);
              if (onFinish) onFinish();
            });
            notifyState(messageId);
          }
        };

        activeUtterances.push(utterance);
        window.speechSynthesis.speak(utterance);
      });

      notifyState(messageId);
      return;
    } catch (err) {
      console.warn("SpeechSynthesis execution error:", err);
    }
  }

  // 2. Direct Backend MP3 audio stream fallback
  currentAudio = playAudioTTSFallback(readableText, langCode, () => {
    notifyState(null);
    if (onFinish) onFinish();
  });
  notifyState(messageId);
};

export const stopCuteSpeech = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  activeUtterances = [];
  (window as any)._activeSpeechUtterances = null;

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // ignore
    }
  }

  notifyState(null);
};

export const isSpeakingMessage = (messageId: string): boolean => {
  return currentSpeakingId === messageId;
};
