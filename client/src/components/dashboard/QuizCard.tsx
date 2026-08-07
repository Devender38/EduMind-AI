import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Brain,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  RotateCcw,
  Check,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getQuiz,
  regenerateQuiz,
  type QuizQuestion,
} from "../../api/quiz.api";
import { logActivity } from "../../api/history.api";
import type { DocumentItem } from "../../api/document.api";

interface Props {
  document: DocumentItem | null;
}

// Robust text normalizer that strips option letters like "A)", "Option B:", etc.
export const normalizeText = (text: string): string => {
  return (text || "")
    .trim()
    .toLowerCase()
    .replace(/^[a-d]\s*[\)\.\:\-]\s*/i, "")
    .replace(/^option\s*[a-d]\s*[\)\.\:\-]?\s*/i, "")
    .replace(/[^a-z0-9]/g, "");
};

// Robust multi-strategy answer matcher
export const checkIsCorrect = (
  selectedOption: string,
  correctAnswer: string,
  optionIndex: number
): boolean => {
  if (!selectedOption || !correctAnswer) return false;

  const rawSel = selectedOption.trim().toLowerCase();
  const rawAns = correctAnswer.trim().toLowerCase();

  // 1. Direct match
  if (rawSel === rawAns) return true;

  // 2. Letter match ('a', 'b', 'c', 'd' or 'option a')
  const letter = String.fromCharCode(65 + optionIndex).toLowerCase();
  if (
    rawAns === letter ||
    rawAns === `option ${letter}` ||
    rawAns === `${letter})` ||
    rawAns === `${letter}.` ||
    rawAns === `(${letter})`
  ) {
    return true;
  }

  // 3. Numeric index match
  if (rawAns === String(optionIndex) || rawAns === String(optionIndex + 1)) {
    return true;
  }

  // 4. Normalized stripped string comparison
  const normSel = normalizeText(selectedOption);
  const normAns = normalizeText(correctAnswer);
  if (
    normSel &&
    normAns &&
    (normSel === normAns || normSel.includes(normAns) || normAns.includes(normSel))
  ) {
    return true;
  }

  return false;
};

export default function QuizCard({ document }: Props) {
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [instantMode, setInstantMode] = useState(true); // Default to instant feedback

  const loadQuiz = useCallback(async () => {
    if (!document) return;
    try {
      setLoading(true);
      const data = await getQuiz(document._id);
      setQuestions(data.quiz || []);
      setAnswers({});
      setCurrent(0);
      setSubmitted(false);
    } catch (err) {
      console.error("Failed loading quiz:", err);
      toast.error("Failed loading quiz.");
    } finally {
      setLoading(false);
    }
  }, [document]);

  const handleRegenerate = async () => {
    if (!document || regenerating) return;
    try {
      setRegenerating(true);
      const data = await regenerateQuiz(document._id);
      setQuestions(data.quiz || []);
      setAnswers({});
      setCurrent(0);
      setSubmitted(false);
      toast.success("New AI Quiz generated!");
    } catch (err) {
      console.error("Failed regenerating quiz:", err);
      toast.error("Failed generating new quiz.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleSelectOption = (option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [current]: option,
    }));
  };

  // Calculate score using bulletproof matcher
  const score = useMemo(() => {
    let count = 0;
    questions.forEach((q, idx) => {
      const selected = answers[idx];
      if (selected) {
        const optIdx = q.options.findIndex((opt) => opt === selected);
        if (checkIsCorrect(selected, q.answer, optIdx >= 0 ? optIdx : 0)) {
          count++;
        }
      }
    });
    return count;
  }, [questions, answers]);

  const handleSubmitQuiz = async () => {
    setSubmitted(true);
    toast.success(`Quiz Completed! Score: ${score}/${questions.length}`);

    // Log to telemetry
    if (document) {
      logActivity({
        documentId: document._id,
        activityType: "quiz",
        title: `Completed Quiz on ${document.title} (${score}/${questions.length})`,
        metadata: {
          score,
          totalQuestions: questions.length,
          accuracy: Math.round((score / questions.length) * 100),
        },
      }).catch(console.error);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrent(0);
    setSubmitted(false);
  };

  useEffect(() => {
    if (!document) {
      setQuestions([]);
      return;
    }
    loadQuiz();
  }, [document, loadQuiz]);

  if (!document) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center backdrop-blur-2xl shadow-xl">
        <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-500" />
        <h3 className="text-lg font-bold text-white">No Document Selected</h3>
        <p className="mt-1 text-xs text-slate-400">
          Select or upload a document to generate an interactive AI practice quiz.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center backdrop-blur-2xl shadow-xl">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-purple-400" />
        <h3 className="text-lg font-bold text-white">Generating AI Practice Quiz...</h3>
        <p className="mt-1 text-xs text-slate-400">
          Synthesizing high-yield multiple choice questions with explanations from {document.title}.
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center backdrop-blur-2xl shadow-xl">
        <Brain className="mx-auto mb-3 h-10 w-10 text-slate-500" />
        <h3 className="text-lg font-bold text-white">No Quiz Generated Yet</h3>
        <p className="mt-1 text-xs text-slate-400">
          Click below to generate a comprehensive practice quiz from this document.
        </p>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition hover:scale-105 disabled:opacity-50"
        >
          {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {regenerating ? "Synthesizing Quiz..." : "Generate AI Practice Quiz"}
        </button>
      </div>
    );
  }

  const question = questions[current];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = ((current + 1) / questions.length) * 100;
  const accuracyPercent =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // Selected option index for current question
  const currentSelectedOption = answers[current];
  const currentSelectedOptIdx = question?.options?.findIndex(
    (opt) => opt === currentSelectedOption
  );

  // Check if current question is correctly answered
  const isCurrentCorrect = currentSelectedOption
    ? checkIsCorrect(currentSelectedOption, question?.answer, currentSelectedOptIdx)
    : false;

  // Show answer feedback if submitted OR in instant feedback mode with selection
  const showFeedback = submitted || (instantMode && Boolean(currentSelectedOption));

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-purple-500/15 p-2.5 text-purple-400 ring-1 ring-purple-500/30">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">AI Practice Quiz</h2>
              <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                {questions.length} MCQs
              </span>
              {question?.difficulty && (
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-white/10">
                  {question.difficulty}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {submitted
                ? `Completed! Accuracy: ${accuracyPercent}% (${score}/${questions.length})`
                : `${answeredCount} of ${questions.length} questions answered`}
            </p>
          </div>
        </div>

        {/* Header Actions & Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Instant Mode Toggle */}
          <button
            onClick={() => setInstantMode(!instantMode)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition ${
              instantMode
                ? "bg-purple-600/20 text-purple-300 border-purple-500/40"
                : "bg-slate-800/80 text-slate-400 border-white/10 hover:text-white"
            }`}
            title="Toggle instant answer checking"
          >
            <Zap size={13} className={instantMode ? "text-purple-400" : ""} />
            <span>Instant Feedback: {instantMode ? "ON" : "OFF"}</span>
          </button>

          {submitted && (
            <button
              onClick={handleRetake}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retake
            </button>
          )}

          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            title="Generate a completely new AI quiz"
            className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-600/15 px-3.5 py-1.5 text-xs font-bold text-purple-300 transition hover:bg-purple-600/25 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
            {regenerating ? "Generating..." : "New Quiz"}
          </button>
        </div>
      </div>

      {/* Score Results Banner (When Submitted) */}
      {submitted && (
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/50 p-6 shadow-xl">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-500/20 ring-1 ring-purple-500/40">
                <Award className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {accuracyPercent >= 85
                    ? "Mastery Level Achieved! 🌟"
                    : accuracyPercent >= 60
                    ? "Great Effort! 👍"
                    : "Needs More Review 📚"}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  You scored <strong className="text-purple-300">{score}</strong> out of{" "}
                  <strong className="text-purple-300">{questions.length}</strong> (
                  <strong className="text-purple-300">{accuracyPercent}%</strong> accuracy)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRetake}
                className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-700"
              >
                Retake Quiz
              </button>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition hover:scale-105"
              >
                New Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Number Pills Navigation */}
      <div className="flex flex-wrap items-center gap-2">
        {questions.map((q, idx) => {
          const isAnswered = answers[idx] !== undefined;
          const isCurrent = idx === current;
          const userChoice = answers[idx];
          const choiceIdx = q.options.findIndex((opt) => opt === userChoice);
          const isCorrect = userChoice
            ? checkIsCorrect(userChoice, q.answer, choiceIdx)
            : false;

          let pillClass =
            "h-8 w-8 rounded-xl text-xs font-bold transition flex items-center justify-center ";

          if (submitted || (instantMode && isAnswered)) {
            pillClass += isCorrect
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 ring-1 ring-emerald-500/30"
              : "bg-rose-500/20 text-rose-400 border border-rose-500/40 ring-1 ring-rose-500/30";
          } else if (isCurrent) {
            pillClass += "bg-purple-600 text-white shadow-md shadow-purple-600/40 ring-2 ring-purple-400/40";
          } else if (isAnswered) {
            pillClass += "bg-slate-800 text-purple-300 border border-purple-500/30";
          } else {
            pillClass += "bg-slate-950/60 text-slate-400 hover:bg-slate-800 border border-white/5";
          }

          return (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={pillClass}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-slate-400">
          <span>Question {current + 1} of {questions.length}</span>
          <span>{Math.round(progressPercent)}% completed</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Current Question Body */}
      <div className="space-y-5 rounded-3xl border border-white/10 bg-slate-950/70 p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-xs font-black text-purple-300 ring-1 ring-purple-500/30">
            {current + 1}
          </span>
          <div className="space-y-1">
            <h3 className="text-base font-bold leading-relaxed text-white md:text-lg">
              {question.question}
            </h3>
            {question.chapter && (
              <p className="text-[11px] font-semibold text-slate-400">
                Topic: <span className="text-purple-300">{question.chapter}</span>
              </p>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-2">
          {question.options.map((option, optIdx) => {
            const isSelected = answers[current] === option;
            const isThisOptionCorrect = checkIsCorrect(option, question.answer, optIdx);

            let optionStyle =
              "w-full rounded-2xl border p-4 text-left text-xs sm:text-sm font-medium transition flex items-center justify-between ";

            if (showFeedback) {
              if (isThisOptionCorrect) {
                optionStyle +=
                  "border-emerald-500/60 bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/40";
              } else if (isSelected && !isThisOptionCorrect) {
                optionStyle +=
                  "border-rose-500/60 bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/40";
              } else {
                optionStyle +=
                  "border-white/5 bg-slate-900/40 text-slate-500 opacity-60";
              }
            } else {
              if (isSelected) {
                optionStyle +=
                  "border-purple-500 bg-purple-500/20 text-white ring-2 ring-purple-500/40";
              } else {
                optionStyle +=
                  "border-white/10 bg-slate-900/60 text-slate-300 hover:border-purple-500/40 hover:bg-slate-800/80";
              }
            }

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(option)}
                disabled={submitted}
                className={optionStyle}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      showFeedback && isThisOptionCorrect
                        ? "bg-emerald-500 text-white"
                        : showFeedback && isSelected && !isThisOptionCorrect
                        ? "bg-rose-500 text-white"
                        : isSelected
                        ? "bg-purple-600 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="leading-relaxed">{option}</span>
                </div>

                {showFeedback && isThisOptionCorrect && (
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="hidden sm:inline">Correct Answer</span>
                  </div>
                )}
                {showFeedback && isSelected && !isThisOptionCorrect && (
                  <div className="flex items-center gap-1 text-xs font-bold text-rose-400 shrink-0">
                    <XCircle className="h-5 w-5" />
                    <span className="hidden sm:inline">Your Choice</span>
                  </div>
                )}
                {!showFeedback && isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-purple-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Detailed Explanation Box (When feedback is visible) */}
        {showFeedback && (
          <div
            className={`mt-4 rounded-2xl border p-4 space-y-2 text-xs leading-relaxed animate-in fade-in duration-300 ${
              isCurrentCorrect
                ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-200"
                : "border-rose-500/30 bg-rose-950/30 text-rose-200"
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {isCurrentCorrect ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-emerald-300">Correct! Great reasoning.</span>
                </>
              ) : (
                <>
                  <XCircle size={16} className="text-rose-400" />
                  <span className="text-rose-300">
                    Incorrect. The correct choice is: {question.answer}
                  </span>
                </>
              )}
            </div>

            {question.explanation && (
              <p className="text-slate-300 pt-1 border-t border-white/10">
                <strong className="text-white">Explanation:</strong> {question.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation & Submit Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="flex items-center gap-3">
          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition hover:scale-105"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            !submitted && (
              <button
                onClick={handleSubmitQuiz}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:scale-105"
              >
                <Check className="h-4 w-4" />
                Submit Quiz
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}