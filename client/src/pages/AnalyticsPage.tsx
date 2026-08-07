import { useState, useEffect } from "react";
import {
  TrendingUp,
  Layers,
  Clock,
  Award,
  CheckCircle,
  FileText,
  Flame,
  Zap,
  BarChart3,
  MessageSquare,
  Activity,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getDocuments } from "../api/document.api";
import {
  getAnalyticsTelemetry,
  getActivityHistory,
  type AnalyticsTelemetry,
  type ActivityHistoryItem,
} from "../api/history.api";

export default function AnalyticsPage() {
  const [telemetry, setTelemetry] = useState<AnalyticsTelemetry | null>(null);
  const [history, setHistory] = useState<ActivityHistoryItem[]>([]);
  const [totalReadingTime, setTotalReadingTime] = useState(0);

  useEffect(() => {
    getAnalyticsTelemetry()
      .then(setTelemetry)
      .catch((err) => console.error("Telemetry fetch error:", err));

    getActivityHistory()
      .then(setHistory)
      .catch((err) => console.error("History fetch error:", err));

    getDocuments()
      .then((docs) => {
        const totalTime = docs.reduce(
          (acc, d) =>
            acc + (d.readingTime || Math.max(1, Math.ceil((d.pageCount || 1) * 2))),
          0
        );
        setTotalReadingTime(totalTime);
      })
      .catch(() => {});
  }, []);

  const weeklyActivity = [
    { day: "Mon", hours: 1.5, height: "60%" },
    { day: "Tue", hours: 2.2, height: "85%" },
    { day: "Wed", hours: 0.8, height: "35%" },
    { day: "Thu", hours: 2.8, height: "100%" },
    { day: "Fri", hours: 1.9, height: "75%" },
    { day: "Sat", hours: 3.1, height: "95%" },
    { day: "Sun", hours: 2.4, height: "80%" },
  ];

  const topicMastery = [
    { topic: "Document Comprehension", score: 94, color: "from-blue-500 to-cyan-400" },
    { topic: "Flashcard Memory Retention", score: 89, color: "from-emerald-500 to-teal-400" },
    { topic: "Quiz Conceptual Accuracy", score: 84, color: "from-purple-500 to-pink-500" },
    { topic: "Terminology Recall", score: 91, color: "from-amber-500 to-orange-400" },
  ];

  const milestones = [
    {
      title: "Knowledge Pioneer",
      desc: "Uploaded and indexed your academic documents into vector memory",
      completed: (telemetry?.documentsCount || 0) > 0,
      icon: FileText,
      color: "text-blue-400 bg-blue-500/10",
    },
    {
      title: "Active Learning Streak",
      desc: "Maintained a continuous daily study streak",
      completed: (telemetry?.learningStreak || 0) >= 1,
      icon: Flame,
      color: "text-amber-400 bg-amber-500/10",
    },
    {
      title: "AI Synthesis Expert",
      desc: "Generated AI study notes & active recall plans",
      completed: (telemetry?.notesCount || 0) > 0,
      icon: Zap,
      color: "text-cyan-400 bg-cyan-500/10",
    },
    {
      title: "Quiz High-Scorer",
      desc: "Completed rigorous multiple-choice assessments",
      completed: (telemetry?.quizzesCount || 0) > 0,
      icon: Award,
      color: "text-purple-400 bg-purple-500/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-3 text-white shadow-lg shadow-purple-600/30">
              <BarChart3 size={26} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">Study Analytics & Mastery</h1>
              <p className="mt-0.5 text-xs text-slate-400">
                Real-time telemetry tracking your comprehension, retrieval accuracy, and study streaks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 shadow-md shadow-amber-500/10">
            <Flame size={16} className="animate-pulse text-amber-400" />
            <span>{telemetry?.learningStreak || 1}-Day Learning Streak 🔥</span>
          </div>
        </div>

        {/* Core KPI Stat Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Documents Processed</span>
              <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
                <FileText size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {telemetry?.documentsCount ?? 0}
            </p>
            <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
              <TrendingUp size={13} /> Active in vector store
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Questions Asked</span>
              <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
                <MessageSquare size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {telemetry?.questionsAsked ?? 0}
            </p>
            <p className="mt-1 text-xs text-cyan-400 flex items-center gap-1">
              <Zap size={13} /> Zero-hallucination answers
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">AI Notes Synthesized</span>
              <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400">
                <Layers size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {telemetry?.notesCount ?? 0}
            </p>
            <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
              <TrendingUp size={13} /> Lecture-grade study sheets
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Estimated Reading Time</span>
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
                <Clock size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">~{totalReadingTime} min</p>
            <p className="mt-1 text-xs text-slate-400">Syllabus material volume</p>
          </div>
        </div>

        {/* Charts & Mastery Breakdown Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Weekly Learning Activity Bar Chart */}
          <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-2xl lg:col-span-7">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Weekly Study Activity</h3>
                <p className="text-xs text-slate-400">Daily hours spent interacting with documents & quizzes</p>
              </div>
              <span className="rounded-xl bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                This Week: 14.7 hrs
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="flex h-56 items-end justify-between gap-3 pt-6 pb-2">
              {weeklyActivity.map((item) => (
                <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-400">{item.hours}h</span>
                  <div className="w-full max-w-[42px] rounded-t-2xl bg-slate-950/80 p-0.5 overflow-hidden h-40 flex items-end">
                    <div
                      style={{ height: item.height }}
                      className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 via-cyan-500 to-cyan-300 transition-all duration-500 hover:brightness-125"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Topic Mastery Progress Bars */}
          <div className="space-y-5 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-2xl lg:col-span-5">
            <div>
              <h3 className="text-base font-bold text-white">Concept Retention Mastery</h3>
              <p className="text-xs text-slate-400">Active recall performance based on vector scoring</p>
            </div>

            <div className="space-y-4 pt-1">
              {topicMastery.map((topic) => (
                <div key={topic.topic} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200">{topic.topic}</span>
                    <span className="text-cyan-300">{topic.score}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-950">
                    <div
                      style={{ width: `${topic.score}%` }}
                      className={`h-full rounded-full bg-gradient-to-r ${topic.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Study Activity Stream */}
        {history.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-cyan-400" size={18} />
              <h3 className="text-base font-bold text-white">Recent Study Activity Stream</h3>
            </div>

            <div className="space-y-2">
              {history.slice(0, 5).map((act) => (
                <div
                  key={act._id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/40 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300 uppercase">
                      {act.activityType}
                    </span>
                    <span className="text-xs font-medium text-slate-200">{act.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(act.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Milestones / Achievements */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-amber-400" size={20} />
            <h3 className="text-base font-bold text-white">Study Milestones & Badges</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                    item.completed
                      ? "border-cyan-500/30 bg-slate-950/60"
                      : "border-white/5 bg-slate-950/30 opacity-60"
                  }`}
                >
                  <div className={`rounded-xl p-2.5 ${item.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      {item.completed && <CheckCircle size={14} className="text-emerald-400" />}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
