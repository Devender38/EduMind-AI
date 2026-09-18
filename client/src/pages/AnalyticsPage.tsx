import { useState, useEffect, useCallback, useRef } from "react";
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
  RefreshCw,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getDocuments } from "../api/document.api";
import {
  getAnalyticsTelemetry,
  getActivityHistory,
  type AnalyticsTelemetry,
  type ActivityHistoryItem,
} from "../api/history.api";
import toast from "react-hot-toast";

export default function AnalyticsPage() {
  const [telemetry, setTelemetry] = useState<AnalyticsTelemetry | null>(null);
  const [history, setHistory] = useState<ActivityHistoryItem[]>([]);
  const [totalReadingTime, setTotalReadingTime] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const isFetchingRef = useRef(false);

  const fetchAnalyticsData = useCallback(async (isManual = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isManual) {
      setRefreshing(true);
    }

    try {
      const [telemetryData, historyData, docs] = await Promise.all([
        getAnalyticsTelemetry(),
        getActivityHistory(undefined, 20),
        getDocuments(),
      ]);

      setTelemetry(telemetryData);
      setHistory(historyData || []);

      if (Array.isArray(docs)) {
        const totalTime = docs.reduce(
          (acc, d) =>
            acc + (d.readingTime || Math.max(1, Math.ceil((d.pageCount || 1) * 2))),
          0
        );
        setTotalReadingTime(totalTime);
      }

      setLastUpdated(new Date());

      if (isManual) {
        toast.success("Analytics synchronized!");
      }
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      if (isManual) {
        toast.error("Failed to refresh analytics.");
      }
    } finally {
      isFetchingRef.current = false;
      if (isManual) {
        setRefreshing(false);
      }
    }
  }, []);

  // Real-time polling & sync listeners
  useEffect(() => {
    fetchAnalyticsData();

    // 1. Live interval: fetch every 6 seconds
    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 6000);

    // 2. Refresh on window focus
    const handleFocus = () => {
      fetchAnalyticsData();
    };
    window.addEventListener("focus", handleFocus);

    // 3. Custom event listener from other components
    const handleRefreshEvent = () => {
      fetchAnalyticsData();
    };
    window.addEventListener("refreshDashboard", handleRefreshEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("refreshDashboard", handleRefreshEvent);
    };
  }, [fetchAnalyticsData]);

  // Dynamic Weekly Activity calculation from telemetry
  const weeklyData = telemetry?.weeklyActivity || [];
  const maxHours = Math.max(...weeklyData.map((d) => d.hours || 0), 1);
  const totalWeeklyHours = weeklyData
    .reduce((acc, d) => acc + (d.hours || 0), 0)
    .toFixed(1);

  // Dynamic Topic Mastery based on user real quiz score
  const quizAvg = telemetry?.averageQuizScore ?? 84;
  const topicMastery = [
    {
      topic: "Document Comprehension",
      score: Math.min(100, Math.max(70, (telemetry?.documentsCount || 1) * 15 + 60)),
      color: "from-blue-500 to-cyan-400",
    },
    {
      topic: "Flashcard Memory Retention",
      score: 88,
      color: "from-emerald-500 to-teal-400",
    },
    {
      topic: "Quiz Conceptual Accuracy",
      score: (telemetry?.quizzesCount || 0) > 0 ? quizAvg : 0,
      color: "from-purple-500 to-pink-500",
    },
    {
      topic: "AI Study Questioning",
      score: Math.min(100, Math.max(60, (telemetry?.questionsAsked || 1) * 8 + 50)),
      color: "from-amber-500 to-orange-400",
    },
  ];

  const milestones = [
    {
      title: "Document Library",
      desc: "Uploaded study materials and notes into your workspace",
      completed: (telemetry?.documentsCount || 0) > 0,
      icon: FileText,
      color: "text-blue-400 bg-blue-500/10",
    },
    {
      title: "Daily Streak",
      desc: "Kept an active daily study habit",
      completed: (telemetry?.learningStreak || 0) >= 1,
      icon: Flame,
      color: "text-amber-400 bg-amber-500/10",
    },
    {
      title: "Notes Creator",
      desc: "Generated structured revision notes and summaries",
      completed: (telemetry?.notesCount || 0) > 0,
      icon: Zap,
      color: "text-cyan-400 bg-cyan-500/10",
    },
    {
      title: "Quiz Master",
      desc: "Completed practice assessments and quizzes",
      completed: (telemetry?.quizzesCount || 0) > 0,
      icon: Award,
      color: "text-purple-400 bg-purple-500/10",
    },
  ];

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(dateStr).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

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
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-extrabold text-white">Study Analytics</h1>
                {/* Live indicator badge */}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  Live
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400 flex items-center gap-2">
                <span>Track your study progress, quiz scores, and reading time.</span>
                <span className="text-[10px] text-slate-500">
                  • Synced: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Manual refresh button */}
            <button
              onClick={() => fetchAnalyticsData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-500/30 hover:bg-slate-800 hover:text-white disabled:opacity-50"
              title="Sync latest study telemetry"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin text-cyan-400" : "text-slate-400"} />
              <span>{refreshing ? "Syncing..." : "Refresh"}</span>
            </button>

            <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 shadow-md shadow-amber-500/10">
              <Flame size={16} className="animate-pulse text-amber-400" />
              <span>{telemetry?.learningStreak || 1}-Day Learning Streak 🔥</span>
            </div>
          </div>
        </div>

        {/* Core KPI Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Card 1: Documents */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-2xl transition hover:border-blue-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Documents</span>
              <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
                <FileText size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {telemetry?.documentsCount ?? 0}
            </p>
            <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
              <TrendingUp size={13} /> Uploaded files
            </p>
          </div>

          {/* Card 2: Questions Asked */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-2xl transition hover:border-cyan-500/30">
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
              <Zap size={13} /> Messages sent
            </p>
          </div>

          {/* Card 3: Quizzes Completed */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-2xl transition hover:border-amber-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Quizzes Taken</span>
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400">
                <Award size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {telemetry?.quizzesCount ?? 0}
              </span>
              {(telemetry?.quizzesCount || 0) > 0 && (
                <span className="rounded-full bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  {telemetry?.averageQuizScore ?? 0}% avg
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-amber-400 flex items-center gap-1">
              <Sparkles size={13} /> Practice quizzes
            </p>
          </div>

          {/* Card 4: Study Notes */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-2xl transition hover:border-purple-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Study Notes</span>
              <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400">
                <Layers size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {telemetry?.notesCount ?? 0}
            </p>
            <p className="mt-1 text-xs text-purple-400 flex items-center gap-1">
              <TrendingUp size={13} /> Created notes
            </p>
          </div>

          {/* Card 5: Estimated Reading Time */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-2xl transition hover:border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Reading Time</span>
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
                <Clock size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">~{totalReadingTime} min</p>
            <p className="mt-1 text-xs text-slate-400">Estimated volume</p>
          </div>
        </div>

        {/* Charts & Mastery Breakdown Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Weekly Learning Activity Bar Chart */}
          <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-2xl lg:col-span-7">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Weekly Study Activity</span>
                </h3>
                <p className="text-xs text-slate-400">Study activity across the week</p>
              </div>
              <span className="rounded-xl bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                This Week: {totalWeeklyHours} hrs
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="flex h-56 items-end justify-between gap-3 pt-6 pb-2">
              {weeklyData.length > 0 ? (
                weeklyData.map((item) => {
                  const heightPercent = maxHours > 0 ? Math.max(15, Math.round((item.hours / maxHours) * 100)) : 15;
                  return (
                    <div key={item.date} className="flex flex-1 flex-col items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-400">{item.hours}h</span>
                      <div className="w-full max-w-[42px] rounded-t-2xl bg-slate-950/80 p-0.5 overflow-hidden h-40 flex items-end">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-xl transition-all duration-500 hover:brightness-125 ${
                            item.count > 0
                              ? "bg-gradient-to-t from-blue-600 via-cyan-500 to-cyan-300"
                              : "bg-slate-800/40"
                          }`}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-400">{item.day}</span>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-40 w-full items-center justify-center text-xs text-slate-500">
                  No activity recorded this week yet.
                </div>
              )}
            </div>
          </div>

          {/* Topic Performance Progress Bars */}
          <div className="space-y-5 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-2xl lg:col-span-5">
            <div>
              <h3 className="text-base font-bold text-white">Topic Performance</h3>
              <p className="text-xs text-slate-400">Progress across your study topics and quizzes</p>
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
                      className={`h-full rounded-full bg-gradient-to-r ${topic.color} transition-all duration-700`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Study Activity Stream */}
        {history.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="text-cyan-400" size={18} />
                <h3 className="text-base font-bold text-white">Recent Study Activity</h3>
              </div>
              <span className="text-xs text-slate-400">Live feed</span>
            </div>

            <div className="space-y-2">
              {history.slice(0, 7).map((act) => (
                <div
                  key={act._id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/40 p-3 transition hover:border-white/10 hover:bg-slate-950/70"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${
                        act.activityType === "quiz"
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                          : act.activityType === "chat"
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
                          : act.activityType === "flashcard"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                          : "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                      }`}
                    >
                      {act.activityType}
                    </span>
                    <span className="text-xs font-medium text-slate-200">{act.title}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    {formatRelativeTime(act.createdAt)}
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
            <h3 className="text-base font-bold text-white">Achievements & Milestones</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                    item.completed
                      ? "border-cyan-500/30 bg-slate-950/60 shadow-md shadow-cyan-500/5"
                      : "border-white/5 bg-slate-950/30 opacity-50"
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
