import { useState, useEffect } from "react";
import {
  FileText,
  MessageSquare,
  Bot,
  Award,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { getDashboardStats, type DashboardStats } from "../../api/dashboard.api";

interface StatsCardsProps {
  refreshKey: number;
}

export default function StatsCards({
  refreshKey,
}: StatsCardsProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    totalQuestions: 0,
    totalResponses: 0,
    storageUsed: "0 MB",
    quizzesTaken: 0,
    averageScore: 0,
    recentActivity: [],
  });

  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Dashboard Stats Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  const cards = [
    {
      title: "Active Documents",
      value: stats.totalDocuments,
      subtitle: `${stats.storageUsed} vectorized`,
      icon: <FileText className="text-cyan-400" size={22} />,
      border: "border-cyan-500/20 hover:border-cyan-400/50",
      gradient: "from-cyan-500/10 via-blue-600/5 to-transparent",
      badge: "In Memory",
      badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
    },
    {
      title: "Questions Asked",
      value: stats.totalQuestions,
      subtitle: "Live neural queries",
      icon: <MessageSquare className="text-blue-400" size={22} />,
      border: "border-blue-500/20 hover:border-blue-400/50",
      gradient: "from-blue-500/10 via-indigo-600/5 to-transparent",
      badge: "Real-Time",
      badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    },
    {
      title: "AI Study Responses",
      value: stats.totalResponses,
      subtitle: "RAG synthesized answers",
      icon: <Bot className="text-purple-400" size={22} />,
      border: "border-purple-500/20 hover:border-purple-400/50",
      gradient: "from-purple-500/10 via-pink-600/5 to-transparent",
      badge: "Llama 3 70B",
      badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/20",
    },
    {
      title: "Quiz Mastery Score",
      value: stats.averageScore > 0 ? `${stats.averageScore}%` : "No Quizzes",
      subtitle: `${stats.quizzesTaken} tests completed`,
      icon: <Award className="text-amber-400" size={22} />,
      border: "border-amber-500/20 hover:border-amber-400/50",
      gradient: "from-amber-500/10 via-orange-600/5 to-transparent",
      badge: stats.averageScore >= 80 ? "Mastery Achieved" : "Active Recall",
      badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Live Indicator Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Real-Time Live Cognition Metrics
          </span>
          <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-slate-400 flex items-center gap-1">
            <Sparkles size={10} className="text-cyan-400" />
            Auto-Synced
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <TrendingUp size={14} className="text-emerald-400" />
          <span>Vector memory & live chat telemetry active</span>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`group relative overflow-hidden rounded-2xl border ${card.border} bg-gradient-to-b ${card.gradient} bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10`}
          >
            {/* Ambient Corner Glow on Hover */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-cyan-500/10 blur-2xl transition group-hover:bg-cyan-500/25" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  {card.title}
                </p>

                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white group-hover:text-cyan-200 transition">
                  {loading ? (
                    <span className="inline-block h-8 w-16 animate-pulse rounded-lg bg-white/10" />
                  ) : (
                    card.value
                  )}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {card.subtitle}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="rounded-xl border border-white/10 bg-slate-950/80 p-2.5 shadow-inner transition group-hover:scale-110 group-hover:border-cyan-500/30">
                  {card.icon}
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}