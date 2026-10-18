/**
 * Enhanced Multilingual Cute Voice & TTS Audio Engine
 * Features:
 * 1. Web SpeechSynthesis with Chrome GC prevention, sentence chunking & Windows SAPI stability.
 * 2. Full multilingual voice resolution (English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Spanish, French).
 * 3. Play, Pause, Resume, Stop, and Replay controls.
 * 4. Adjustable speaking speed (0.8x Slow, 1.0x Normal, 1.25x Fast), pitch, and volume.
 * 5. High-reliability HTML5 Audio fallback using backend Google MP3 TTS stream.
 */

export interface SpeechOptions {
  rate?: number; // 0.8, 1.0, 1.25
  pitch?: number;
  volume?: number;
  voiceName?: string;
}

let currentSpeakingId: string | null = null;
let isPaused = false;
let stateListeners: Array<(speakingId: string | null, isPaused: boolean) => void> = [];
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

// Mobile Audio Unlock: iOS Safari & Android Chrome require initial user interaction to play speech
let isAudioUnlockedOnMobile = false;
export const unlockAudioForMobile = () => {
  if (isAudioUnlockedOnMobile || typeof window === "undefined") return;
  isAudioUnlockedOnMobile = true;
  try {
    if ("speechSynthesis" in window) {
      const silent = new SpeechSynthesisUtterance("");
      silent.volume = 0;
      silent.rate = 2;
      window.speechSynthesis.speak(silent);
    }
  } catch {
    // ignore
  }
};

if (typeof window !== "undefined") {
  const unlockEvents = ["touchstart", "touchend", "click"];
  const handleFirstInteraction = () => {
    unlockAudioForMobile();
    unlockEvents.forEach((evt) =>
      window.removeEventListener(evt, handleFirstInteraction)
    );
  };
  unlockEvents.forEach((evt) =>
    window.addEventListener(evt, handleFirstInteraction, { passive: true })
  );
}

export const addSpeechStateListener = (
  cb: (speakingId: string | null, isPaused: boolean) => void
) => {
  stateListeners.push(cb);
  return () => {
    stateListeners = stateListeners.filter((l) => l !== cb);
  };
};

const notifyState = (speakingId: string | null, paused: boolean = false) => {
  currentSpeakingId = speakingId;
  isPaused = paused;
  stateListeners.forEach((fn) => fn(speakingId, paused));
};

export const getSystemVoices = (): SpeechSynthesisVoice[] => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  try {
    return window.speechSynthesis.getVoices() || [];
  } catch {
    return [];
  }
};

export const getCuteVoice = (
  langCode: string = "en-US",
  preferredName?: string
): SpeechSynthesisVoice | null => {
  const voices = getSystemVoices();
  if (!voices || voices.length === 0) return null;

  if (preferredName) {
    const directMatch = voices.find((v) => v.name === preferredName);
    if (directMatch) return directMatch;
  }

  const cleanLang = langCode.toLowerCase();

  // 1. Bengali
  if (cleanLang.startsWith("bn")) {
    const bnVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("bn") ||
        v.name.toLowerCase().includes("bengali") ||
        v.name.toLowerCase().includes("bangla")
    );
    if (bnVoice) return bnVoice;
  }

  // 2. Tamil
  if (cleanLang.startsWith("ta")) {
    const taVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("ta") ||
        v.name.toLowerCase().includes("tamil")
    );
    if (taVoice) return taVoice;
  }

  // 3. Telugu
  if (cleanLang.startsWith("te")) {
    const teVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("te") ||
        v.name.toLowerCase().includes("telugu")
    );
    if (teVoice) return teVoice;
  }

  // 4. Marathi
  if (cleanLang.startsWith("mr")) {
    const mrVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("mr") ||
        v.name.toLowerCase().includes("marathi")
    );
    if (mrVoice) return mrVoice;
  }

  // 5. Spanish
  if (cleanLang.startsWith("es")) {
    const esVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("es") ||
        v.name.toLowerCase().includes("spanish") ||
        v.name.toLowerCase().includes("monica") ||
        v.name.toLowerCase().includes("paul")
    );
    if (esVoice) return esVoice;
  }

  // 6. French
  if (cleanLang.startsWith("fr")) {
    const frVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("fr") ||
        v.name.toLowerCase().includes("french") ||
        v.name.toLowerCase().includes("hortense") ||
        v.name.toLowerCase().includes("julie")
    );
    if (frVoice) return frVoice;
  }

  // 7. Hindi & Hinglish
  if (cleanLang.startsWith("hi") || cleanLang.includes("hinglish")) {
    const hindiVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("hi") ||
        v.name.toLowerCase().includes("hindi") ||
        v.name.toLowerCase().includes("swara") ||
        v.name.toLowerCase().includes("madhur") ||
        v.name.toLowerCase().includes("kalpana")
    );
    if (hindiVoice) return hindiVoice;

    // Fallback to Indian English for Hinglish
    const indianVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === "en-in" ||
        v.name.toLowerCase().includes("india") ||
        v.name.toLowerCase().includes("neerja") ||
        v.name.toLowerCase().includes("prabhat")
    );
    if (indianVoice) return indianVoice;
  }

  // 8. Indian English
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

  // 9. Premium Natural / Sweet Voices
  const naturalFemale = voices.find(
    (v) =>
      v.name.toLowerCase().includes("natural") &&
      (v.name.toLowerCase().includes("jenny") ||
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("aria") ||
        v.name.toLowerCase().includes("female"))
  );
  if (naturalFemale) return naturalFemale;

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

  // 10. Any voice matching language code prefix
  const matchingLang = voices.find((v) =>
    v.lang.toLowerCase().startsWith(cleanLang.slice(0, 2))
  );
  if (matchingLang) return matchingLang;

  return voices[0] || null;
};

export const cleanTextForSpeech = (markdown: string): string => {
  return markdown
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "Code block provided in the lesson notes.")
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

const splitIntoSpeechChunks = (text: string, maxLen: number = 140): string[] => {
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
  const clean = cleanTextForSpeech(text).slice(0, 700);
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
  langCode: string = "en-US",
  options?: SpeechOptions
) => {
  // If user clicks currently speaking message, stop it
  if (currentSpeakingId === messageId && !isPaused) {
    stopCuteSpeech();
    return;
  }

  stopCuteSpeech();

  const clean = cleanTextForSpeech(text);
  if (!clean) return;

  const rate = options?.rate ?? 1.0;
  const pitch = options?.pitch ?? 1.0;
  const volume = options?.volume ?? 1.0;

  const readableText = clean.slice(0, 950);
  const chunks = splitIntoSpeechChunks(readableText, 140);

  if (chunks.length === 0) return;

  // 1. Try Browser SpeechSynthesis using small sentence chunks
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.resume();

      const voice = getCuteVoice(langCode, options?.voiceName);
      const voiceLang = voice ? voice.lang : langCode;

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
          notifyState(null, false);
          if (onFinish) onFinish();
        }
      };

      chunks.forEach((chunk) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        if (voice) utterance.voice = voice;
        utterance.lang = voiceLang;
        utterance.pitch = pitch;
        utterance.rate = rate;
        utterance.volume = volume;

        utterance.onstart = () => {
          notifyState(messageId, false);

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

          // Fall back to backend MP3 TTS stream if not explicitly cancelled
          if (e?.error !== "interrupted" && e?.error !== "canceled") {
            console.log("SpeechSynthesis error, falling back to backend TTS stream");
            currentAudio = playAudioTTSFallback(readableText, langCode, () => {
              notifyState(null, false);
              if (onFinish) onFinish();
            });
            notifyState(messageId, false);
          }
        };

        activeUtterances.push(utterance);
        window.speechSynthesis.speak(utterance);
      });

      notifyState(messageId, false);
      return;
    } catch (err) {
      console.warn("SpeechSynthesis execution error:", err);
    }
  }

  // 2. Direct Backend MP3 audio stream fallback
  currentAudio = playAudioTTSFallback(readableText, langCode, () => {
    notifyState(null, false);
    if (onFinish) onFinish();
  });
  notifyState(messageId, false);
};

export const pauseCuteSpeech = () => {
  if (currentAudio) {
    try {
      currentAudio.pause();
      notifyState(currentSpeakingId, true);
    } catch {
      // ignore
    }
    return;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        notifyState(currentSpeakingId, true);
      }
    } catch {
      // ignore
    }
  }
};

export const resumeCuteSpeech = () => {
  if (currentAudio && isPaused) {
    try {
      currentAudio.play().catch(() => {});
      notifyState(currentSpeakingId, false);
    } catch {
      // ignore
    }
    return;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        notifyState(currentSpeakingId, false);
      }
    } catch {
      // ignore
    }
  }
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

  notifyState(null, false);
};

export const isSpeakingMessage = (messageId: string): boolean => {
  return currentSpeakingId === messageId && !isPaused;
};

export const isSpeakingOrPaused = (messageId: string): boolean => {
  return currentSpeakingId === messageId;
};
