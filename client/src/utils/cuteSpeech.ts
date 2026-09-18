/**
 * Cute Voice Speech Synthesis Engine
 * Automatically detects the sweetest, warmest natural voice available (e.g. Microsoft Jenny, Zira, Google Female)
 * and adjusts pitch & rate to sound friendly, cute, and clear!
 */

let currentSpeakingId: string | null = null;
let stateListeners: Array<(speakingId: string | null) => void> = [];

// Ensure voices are loaded across browsers
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    // Warm up voices
    window.speechSynthesis.getVoices();
  };
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

export const getCuteVoice = (): SpeechSynthesisVoice | null => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Check for premium natural / online female voices (like Jenny, Zira, Aria)
  const naturalFemale = voices.find(
    (v) =>
      v.name.toLowerCase().includes("natural") &&
      (v.name.toLowerCase().includes("jenny") ||
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("aria") ||
        v.name.toLowerCase().includes("female"))
  );
  if (naturalFemale) return naturalFemale;

  // 2. High quality recognized sweet female voices
  const sweetNames = [
    "jenny",
    "zira",
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

  // 3. Any English female voice
  const anyEnglishFemale = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("woman"))
  );
  if (anyEnglishFemale) return anyEnglishFemale;

  // 4. Any English voice
  const anyEnglish = voices.find((v) => v.lang.startsWith("en"));
  return anyEnglish || voices[0] || null;
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
    // Clean emojis
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, "")
    .trim();
};

export const speakWithCuteVoice = (
  text: string,
  messageId: string,
  onFinish?: () => void
) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  // If user clicks same message, toggle stop
  if (currentSpeakingId === messageId) {
    stopCuteSpeech();
    return;
  }

  // Cancel any existing speech
  stopCuteSpeech();

  const clean = cleanTextForSpeech(text);
  if (!clean) return;

  // Limit to ~1500 chars for smooth reading without browser stalls
  const readableText = clean.slice(0, 1500);

  const utterance = new SpeechSynthesisUtterance(readableText);
  const voice = getCuteVoice();
  if (voice) {
    utterance.voice = voice;
  }

  // Tuned parameters for a cute, pleasant, energetic tone
  utterance.pitch = 1.18; // Sweet and warm pitch
  utterance.rate = 1.04;  // Natural, engaging pace
  utterance.volume = 1.0;

  utterance.onstart = () => {
    notifyState(messageId);
  };

  const handleEnd = () => {
    if (currentSpeakingId === messageId) {
      notifyState(null);
      if (onFinish) onFinish();
    }
  };

  utterance.onend = handleEnd;
  utterance.onerror = handleEnd;

  window.speechSynthesis.speak(utterance);
};

export const stopCuteSpeech = () => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  notifyState(null);
};

export const isSpeakingMessage = (messageId: string): boolean => {
  return currentSpeakingId === messageId;
};
