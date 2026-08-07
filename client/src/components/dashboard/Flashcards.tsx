import { useEffect, useState, useCallback } from "react";
import {
  Layers,
  Loader2,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Award,
  Check,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getFlashcards,
  regenerateFlashcards,
  type Flashcard,
} from "../../api/flashcard.api";
import { logActivity } from "../../api/history.api";
import type { DocumentItem } from "../../api/document.api";

interface Props {
  document: DocumentItem | null;
}

export default function Flashcards({ document }: Props) {
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [allCards, setAllCards] = useState<Flashcard[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [reviewLater, setReviewLater] = useState<Set<number>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [reviewOnlyWeak, setReviewOnlyWeak] = useState(false);

  const loadFlashcards = useCallback(async () => {
    if (!document) return;
    try {
      setLoading(true);
      const data = await getFlashcards(document._id);
      const fetched = data.flashcards || [];
      setAllCards(fetched);
      setCards(fetched);
      setCurrent(0);
      setFlipped(false);
      setMastered(new Set());
      setReviewLater(new Set());
      setIsCompleted(false);
      setReviewOnlyWeak(false);
    } catch (err) {
      console.error("Failed loading flashcards:", err);
      toast.error("Failed loading flashcards.");
    } finally {
      setLoading(false);
    }
  }, [document]);

  const handleRegenerate = async () => {
    if (!document || regenerating) return;
    try {
      setRegenerating(true);
      const data = await regenerateFlashcards(document._id);
      const fetched = data.flashcards || [];
      setAllCards(fetched);
      setCards(fetched);
      setCurrent(0);
      setFlipped(false);
      setMastered(new Set());
      setReviewLater(new Set());
      setIsCompleted(false);
      setReviewOnlyWeak(false);
      toast.success("New AI flashcard deck synthesized!");
    } catch (err) {
      console.error("Failed regenerating flashcards:", err);
      toast.error("Failed generating new flashcards.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleShuffle = () => {
    if (cards.length <= 1) return;
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrent(0);
    setFlipped(false);
  };

  const toggleMastered = (index: number) => {
    setMastered((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
        setReviewLater((r) => {
          const rNext = new Set(r);
          rNext.delete(index);
          return rNext;
        });
      }
      return next;
    });
  };

  const toggleReviewLater = (index: number) => {
    setReviewLater((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
        setMastered((m) => {
          const mNext = new Set(m);
          mNext.delete(index);
          return mNext;
        });
      }
      return next;
    });
  };

  const handleCompleteSession = async () => {
    setIsCompleted(true);
    toast.success("Flashcard study session submitted!");

    if (document) {
      const total = cards.length;
      const masteredCount = mastered.size;
      const accuracy = total > 0 ? Math.round((masteredCount / total) * 100) : 0;

      logActivity({
        documentId: document._id,
        activityType: "flashcard",
        title: `Studied ${total} Flashcards for ${document.title} (${masteredCount} Mastered)`,
        metadata: {
          totalCards: total,
          mastered: masteredCount,
          needsReview: reviewLater.size,
          retentionRate: accuracy,
        },
      }).catch(console.error);
    }
  };

  const handleRestart = () => {
    setCards(allCards);
    setCurrent(0);
    setFlipped(false);
    setIsCompleted(false);
    setReviewOnlyWeak(false);
  };

  const handleReviewWeakCards = () => {
    const weakCards = allCards.filter((_, idx) => reviewLater.has(idx));
    if (weakCards.length === 0) {
      toast("No cards marked for review! Great job.", { icon: "👏" });
      return;
    }
    setCards(weakCards);
    setCurrent(0);
    setFlipped(false);
    setIsCompleted(false);
    setReviewOnlyWeak(true);
  };

  useEffect(() => {
    if (!document) {
      setAllCards([]);
      setCards([]);
      return;
    }
    loadFlashcards();
  }, [document, loadFlashcards]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cards.length === 0 || isCompleted) return;
      if (e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (current < cards.length - 1) {
          setCurrent((c) => c + 1);
          setFlipped(false);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (current > 0) {
          setCurrent((c) => c - 1);
          setFlipped(false);
        }
      } else if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleMastered(current);
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        toggleReviewLater(current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cards.length, current, isCompleted]);

  if (!document) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center backdrop-blur-2xl shadow-xl">
        <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-500" />
        <h3 className="text-lg font-bold text-white">No Document Selected</h3>
        <p className="mt-1 text-xs text-slate-400">
          Upload or pick a document on the left to drill active recall flashcards.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center backdrop-blur-2xl shadow-xl">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-400" />
        <h3 className="text-lg font-bold text-white">Generating AI Study Flashcards...</h3>
        <p className="mt-1 text-xs text-slate-400">
          Extracting high-yield concepts, definitions, and active recall cues from {document.title}.
        </p>
      </div>
    );
  }

  if (cards.length === 0 && !reviewOnlyWeak) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center backdrop-blur-2xl shadow-xl">
        <Layers className="mx-auto mb-3 h-10 w-10 text-slate-500" />
        <h3 className="text-lg font-bold text-white">No Flashcards Available</h3>
        <p className="mt-1 text-xs text-slate-400">
          Click below to generate 20–30 high-yield flashcards with AI.
        </p>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-105 disabled:opacity-50"
        >
          {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {regenerating ? "Generating Flashcards..." : "Generate AI Flashcard Deck"}
        </button>
      </div>
    );
  }

  // Session Completion View
  if (isCompleted) {
    const total = cards.length;
    const masteredCount = mastered.size;
    const reviewCount = reviewLater.size;
    const retentionRate = total > 0 ? Math.round((masteredCount / total) * 100) : 0;

    return (
      <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30">
          <Award className="h-10 w-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-white">
            Deck Study Session Completed! 🎉
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You reviewed <strong className="text-white">{total} cards</strong> from{" "}
            <span className="text-cyan-300">{document.title}</span>. Here is your memory retention report:
          </p>
        </div>

        {/* Retention Score Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-lg mx-auto pt-2">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4">
            <div className="text-2xl font-black text-emerald-400">{masteredCount}</div>
            <div className="text-[11px] font-semibold text-emerald-300">Cards Mastered</div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4">
            <div className="text-2xl font-black text-amber-400">{reviewCount}</div>
            <div className="text-[11px] font-semibold text-amber-300">Needs Review</div>
          </div>

          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-4">
            <div className="text-2xl font-black text-cyan-400">{retentionRate}%</div>
            <div className="text-[11px] font-semibold text-cyan-300">Active Retention</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          {reviewCount > 0 && (
            <button
              onClick={handleReviewWeakCards}
              className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20"
            >
              <Filter className="h-4 w-4" />
              Drill Weak Cards ({reviewCount})
            </button>
          )}

          <button
            onClick={handleRestart}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-700"
          >
            <RotateCcw className="h-4 w-4" />
            Restart Full Deck
          </button>

          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-105"
          >
            <Sparkles className="h-4 w-4" />
            Generate New Deck
          </button>
        </div>
      </div>
    );
  }

  const card = cards[current];
  const isMastered = mastered.has(current);
  const isReview = reviewLater.has(current);
  const progressPercent = ((current + 1) / cards.length) * 100;

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-500/15 p-2.5 text-blue-400 ring-1 ring-blue-500/30">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">AI Study Flashcards</h2>
              <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                {cards.length} Cards {reviewOnlyWeak && "(Weak Only)"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Click card or press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">Space</kbd> to flip
            </p>
          </div>
        </div>

        {/* Action Buttons & Submit Session */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShuffle}
            title="Shuffle deck"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <Shuffle className="h-3.5 w-3.5 text-slate-400" />
            Shuffle
          </button>

          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            title="Regenerate flashcards with AI"
            className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-600/15 px-3 py-1.5 text-xs font-bold text-blue-300 transition hover:bg-blue-600/25 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
            {regenerating ? "Synthesizing..." : "New Deck"}
          </button>

          <button
            onClick={handleCompleteSession}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:scale-105"
          >
            <Check className="h-3.5 w-3.5" />
            Submit Session
          </button>
        </div>
      </div>

      {/* Progress & Stats Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
          <span>Card {current + 1} of {cards.length}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle className="h-3.5 w-3.5" /> {mastered.size} Mastered
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <HelpCircle className="h-3.5 w-3.5" /> {reviewLater.size} Review
            </span>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div className="perspective-1000">
        <div
          onClick={() => setFlipped(!flipped)}
          style={{
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className="transform-style-preserve-3d relative min-h-[300px] w-full cursor-pointer rounded-3xl border border-white/10 shadow-2xl transition hover:border-cyan-500/40"
        >
          {/* Front (Question) */}
          <div className="backface-hidden absolute inset-0 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-950/98 to-[#07090e] p-8 text-center border border-white/10">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300 ring-1 ring-cyan-500/30">
                Question
              </span>
              <span className="text-[11px] text-slate-500">Click or Space to flip</span>
            </div>

            <div className="my-auto py-4">
              <p className="text-base sm:text-lg font-bold leading-relaxed text-white md:text-xl">
                {card.question}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/5 pt-3">
              <span>Card {current + 1} of {cards.length}</span>
              <span className="text-[10px] text-cyan-400/80">Press M to master • R for review</span>
            </div>
          </div>

          {/* Back (Answer) */}
          <div
            style={{ transform: "rotateY(180deg)" }}
            className="backface-hidden absolute inset-0 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-emerald-950/50 via-slate-950/98 to-[#07090e] p-8 text-center ring-1 ring-emerald-500/30 border border-emerald-500/20"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/30">
                Answer Key
              </span>
              <span className="text-[11px] text-slate-500">Click to flip back</span>
            </div>

            <div className="my-auto py-4">
              <p className="text-sm sm:text-base font-normal leading-relaxed text-slate-200 md:text-lg">
                {card.answer}
              </p>
            </div>

            {/* Quick Tagging Buttons */}
            <div className="flex items-center justify-center gap-3 border-t border-white/5 pt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMastered(current);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  isMastered
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                {isMastered ? "Mastered! ✨" : "Mark Mastered"}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleReviewLater(current);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  isReview
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                    : "border border-amber-500/30 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                }`}
              >
                <HelpCircle className="h-4 w-4" />
                {isReview ? "Marked for Review ⚠️" : "Needs Review"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          disabled={current === 0}
          onClick={() => {
            setCurrent((c) => c - 1);
            setFlipped(false);
          }}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrent(0);
              setFlipped(false);
            }}
            title="Restart deck from start"
            className="rounded-xl border border-white/10 bg-slate-800/80 p-2.5 text-slate-400 transition hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {current < cards.length - 1 ? (
          <button
            onClick={() => {
              setCurrent((c) => c + 1);
              setFlipped(false);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:scale-105"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleCompleteSession}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:scale-105"
          >
            <Check className="h-4 w-4" />
            Complete & Submit Session
          </button>
        )}
      </div>
    </div>
  );
}