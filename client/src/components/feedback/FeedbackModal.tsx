import { useState, useEffect } from "react";
import {
  Star,
  MessageSquareHeart,
  X,
  Send,
  Loader2,
  Sparkles,
  CheckCircle2,
  Users,
  PenLine,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  submitFeedback,
  getRecentFeedbacks,
  type FeedbackItem,
} from "../../api/feedback.api";
import { useAuthStore } from "../../store/authStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "General Review",
  "AI Answers",
  "Cute Voice Tutor",
  "Feature Request",
  "Bug / Issue",
];

const QUICK_SUGGESTIONS = [
  "Loved the Cute Voice! 🎀",
  "ChatGPT Structured Answers 🤖",
  "Clean & Fast UI ✨",
  "Helpful for Exams 🎓",
];

const RATING_LABELS: Record<number, string> = {
  1: "Needs Work 😕",
  2: "Fair 😐",
  3: "Good 🙂",
  4: "Very Good! 😊",
  5: "Outstanding! 🚀✨",
};

export default function FeedbackModal({ isOpen, onClose }: Props) {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<"write" | "reviews">("write");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<string>("General Review");
  const [message, setMessage] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [recentFeedbacks, setRecentFeedbacks] = useState<FeedbackItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadReviews();
      setSubmittedSuccess(false);
    }
  }, [isOpen]);

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const list = await getRecentFeedbacks();
      setRecentFeedbacks(list);
    } catch {
      // ignore
    } finally {
      setLoadingReviews(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a short review message.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitFeedback({
        rating,
        category,
        message: message.trim(),
        quickTags: selectedTags,
      });

      toast.success(res.message || "Feedback submitted! Thank you! 🌟");
      setSubmittedSuccess(true);
      setMessage("");
      setSelectedTags([]);
      loadReviews();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative my-auto flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-[#07090e] shadow-2xl">
        
        {/* Sticky Header - never cut off */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-pink-500/15 p-2 text-pink-400 ring-1 ring-pink-500/30">
              <MessageSquareHeart size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1 sm:text-base">
                EduMind Feedback
                <Sparkles size={13} className="text-amber-400" />
              </h3>
              <p className="text-[10px] text-slate-400 sm:text-[11px]">
                Aapka review website ko aur behtar banata hai
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex-shrink-0 px-4 pt-3 sm:px-6">
          <div className="flex rounded-xl border border-white/10 bg-slate-950/70 p-1">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                tab === "write"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <PenLine size={13} />
              <span>Write Review</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("reviews")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                tab === "reviews"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users size={13} />
              <span>Reviews ({recentFeedbacks.length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
          {tab === "write" ? (
            submittedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Review Received!</h4>
                  <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
                    Thank you for sharing your feedback. Aapka review successfully save ho gaya hai!
                  </p>
                </div>

                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => setSubmittedSuccess(false)}
                    className="rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    Write Another
                  </button>
                  <button
                    onClick={() => setTab("reviews")}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-600/20"
                  >
                    View Reviews
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Clean Star Rating Card */}
                <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-3 text-center">
                  <p className="text-[11px] font-medium text-slate-400 mb-1.5">
                    Rate your overall experience:
                  </p>

                  <div className="flex items-center justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoverRating || rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                        >
                          <Star
                            size={24}
                            className={`transition-colors ${
                              active
                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                                : "text-slate-700 hover:text-slate-500"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-1 text-xs font-bold text-amber-400">
                    {RATING_LABELS[hoverRating || rating]}
                  </p>
                </div>

                {/* Category Selector - Compact pills */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                    Category:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                          category === cat
                            ? "bg-blue-600 text-white font-semibold shadow-sm"
                            : "border border-white/10 bg-slate-900/80 text-slate-400 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Message Textarea */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-300">
                    Your Review & Suggestions:
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Website kaisa laga? AI answers, voice ya features par apna review likhein..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/80 p-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-blue-500"
                  />
                </div>

                {/* Quick Suggestion Chips */}
                <div>
                  <p className="mb-1 text-[10px] font-medium text-slate-400">
                    Quick tags (optional):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {QUICK_SUGGESTIONS.map((tag) => {
                      const selected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition ${
                            selected
                              ? "bg-pink-500/20 text-pink-300 border border-pink-500/30 font-semibold"
                              : "border border-white/5 bg-slate-900/50 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {tag} {selected && "✓"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-500 active:scale-98 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Review 🌟</span>
                    </>
                  )}
                </button>
              </form>
            )
          ) : (
            /* Community Reviews Tab */
            <div className="space-y-2.5">
              {loadingReviews ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Loader2 size={20} className="mx-auto animate-spin text-blue-500" />
                  <p className="text-xs">Loading reviews...</p>
                </div>
              ) : recentFeedbacks.length === 0 ? (
                <div className="py-10 text-center text-slate-400 space-y-2">
                  <p className="text-xs font-semibold text-slate-300">No reviews yet!</p>
                  <p className="text-[11px] text-slate-500">Be the first student to review EduMind AI.</p>
                  <button
                    onClick={() => setTab("write")}
                    className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    Write First Review
                  </button>
                </div>
              ) : (
                recentFeedbacks.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-xl border border-white/5 bg-slate-950/70 p-3 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-[11px] font-bold text-white">
                          {item.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-none">{item.userName}</p>
                          <p className="text-[9px] text-slate-500 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={
                              star <= item.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-800"
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      "{item.message}"
                    </p>

                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      <span className="rounded-md bg-white/5 border border-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">
                        {item.category}
                      </span>
                      {item.quickTags &&
                        item.quickTags.map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-blue-300"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
