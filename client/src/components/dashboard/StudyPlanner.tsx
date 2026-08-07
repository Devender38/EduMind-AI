import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  CalendarRange,
  Zap,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Download,
  Volume2,
  VolumeX,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";

import { type DocumentItem } from "../../api/document.api";
import { getStudyPlan, generateStudyPlan } from "../../api/planner.api";

interface StudyPlannerProps {
  document: DocumentItem | null;
}

type PlanType = "cram_1day" | "weekly" | "monthly";

export default function StudyPlanner({ document }: StudyPlannerProps) {
  const [planType, setPlanType] = useState<PlanType>("weekly");
  const [planContent, setPlanContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  const isGeneratingRef = useRef(false);

  useEffect(() => {
    if (document) {
      loadCachedPlan(document._id, planType);
    } else {
      setPlanContent("");
    }
  }, [document?._id, planType]);

  const loadCachedPlan = async (docId: string, type: PlanType) => {
    try {
      setLoading(true);
      const res = await getStudyPlan(docId, type);
      setPlanContent(res.plan || "");
    } catch (err: any) {
      console.error("Failed fetching study plan:", err);
      setPlanContent("");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (force: boolean = false) => {
    if (!document || isGeneratingRef.current) return;

    try {
      isGeneratingRef.current = true;
      setGenerating(true);
      toast.loading(`Synthesizing ${getPlanTitle(planType)} with AI...`, { id: "plan-gen" });

      const res = await generateStudyPlan(document._id, planType, force);
      setPlanContent(res.plan || "");
      toast.success(`${getPlanTitle(planType)} generated successfully!`, { id: "plan-gen" });
    } catch (err: any) {
      console.error("Study plan generation error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to generate study plan. Please try again.",
        { id: "plan-gen" }
      );
    } finally {
      isGeneratingRef.current = false;
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!planContent) return;
    navigator.clipboard.writeText(planContent);
    setCopied(true);
    toast.success("Study plan copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!planContent || !document) return;
    const blob = new Blob([planContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${document.title.replace(/\s+/g, "_")}_${planType}_study_plan.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded study plan as Markdown!");
  };

  const toggleSpeech = () => {
    if (!planContent) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const cleanText = planContent
      .replace(/#+/g, "")
      .replace(/\*/g, "")
      .replace(/\[\s*\]/g, "")
      .replace(/\[x\]/g, "completed")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 1500));
    utterance.rate = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const toggleTask = (taskKey: string) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));
  };

  const getPlanTitle = (type: PlanType) => {
    switch (type) {
      case "cram_1day":
        return "1-Day Exam Cram Schedule";
      case "weekly":
        return "7-Day Active Recall Sprint";
      case "monthly":
        return "4-Week Mastery Curriculum";
    }
  };

  if (!document) {
    return (
      <div className="flex h-[550px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center backdrop-blur-xl">
        <div className="rounded-2xl bg-blue-500/10 p-4 text-blue-400 ring-1 ring-blue-500/20">
          <CalendarRange size={36} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">No Document Selected</h3>
        <p className="mt-1 max-w-sm text-xs text-zinc-400">
          Select a document from the library to generate custom 1-Day Exam Cram, Weekly, or Monthly study schedules.
        </p>
      </div>
    );
  }

  const tabs = [
    {
      id: "cram_1day" as PlanType,
      label: "1-Day Exam Cram",
      sub: "Hour-by-hour sprint",
      icon: Zap,
      activeClass: "bg-amber-600 text-white shadow-lg shadow-amber-600/20",
    },
    {
      id: "weekly" as PlanType,
      label: "7-Day Roadmap",
      sub: "Weekly active recall",
      icon: Calendar,
      activeClass: "bg-blue-600 text-white shadow-lg shadow-blue-600/20",
    },
    {
      id: "monthly" as PlanType,
      label: "4-Week Mastery",
      sub: "Monthly curriculum",
      icon: Layers,
      activeClass: "bg-purple-600 text-white shadow-lg shadow-purple-600/20",
    },
  ];

  const isBusy = loading || generating;

  return (
    <div className="flex h-[750px] flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-2xl backdrop-blur-xl">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 border-b border-zinc-800 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-600/10 p-2.5 text-blue-400 ring-1 ring-blue-500/20">
            <CalendarRange size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              AI Study Plan Generator
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                Active Recall Powered
              </span>
            </h2>
            <p className="text-xs text-zinc-400 line-clamp-1">
              Document: <strong className="text-zinc-200">{document.title}</strong>
            </p>
          </div>
        </div>

        {/* Schedule Mode Selector Pills */}
        <div className="flex items-center gap-2 rounded-xl bg-zinc-950/80 p-1 border border-zinc-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = planType === tab.id;
            return (
              <button
                key={tab.id}
                disabled={isBusy}
                onClick={() => setPlanType(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? tab.activeClass
                    : "text-zinc-400 hover:text-white"
                } disabled:opacity-50`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Actions Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSpeech}
            disabled={!planContent || isBusy}
            title={speaking ? "Stop Narration" : "Listen to Plan"}
            className={`rounded-xl border p-2 text-xs font-semibold transition ${
              speaking
                ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                : "border-zinc-800 bg-zinc-800/60 text-zinc-400 hover:text-white"
            } disabled:opacity-40`}
          >
            {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={handleCopy}
            disabled={!planContent || isBusy}
            title="Copy Plan"
            className="rounded-xl border border-zinc-800 bg-zinc-800/60 p-2 text-xs text-zinc-400 transition hover:text-white disabled:opacity-40"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>

          <button
            onClick={handleDownload}
            disabled={!planContent || isBusy}
            title="Export Markdown"
            className="rounded-xl border border-zinc-800 bg-zinc-800/60 p-2 text-xs text-zinc-400 transition hover:text-white disabled:opacity-40"
          >
            <Download size={16} />
          </button>

          {planContent && (
            <button
              onClick={() => handleGenerate(true)}
              disabled={isBusy}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-50"
            >
              <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
              <span>{generating ? "Synthesizing..." : "Regenerate"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {generating ? (
          <div className="flex h-full flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
              <Sparkles className="absolute inset-0 m-auto text-blue-400 animate-pulse" size={24} />
            </div>
            <div className="text-center max-w-sm">
              <h4 className="text-base font-bold text-white">Synthesizing {getPlanTitle(planType)}...</h4>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                Analyzing core textbook concepts, balancing cognitive load, and assembling active recall checkpoint schedules.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
          </div>
        ) : !planContent ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-8">
            <div className="rounded-2xl bg-zinc-800/60 p-4 ring-1 ring-zinc-700">
              <BookOpen size={36} className="text-blue-400" />
            </div>
            <h4 className="mt-4 text-base font-bold text-white">{getPlanTitle(planType)}</h4>
            <p className="mt-1 text-xs text-zinc-400 max-w-md leading-relaxed">
              No study plan has been generated yet for this schedule format. Click below to synthesize an AI-tailored study plan based on <strong>{document.title}</strong>.
            </p>
            <button
              onClick={() => handleGenerate(false)}
              className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
            >
              <Sparkles size={15} />
              Generate {getPlanTitle(planType)}
            </button>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none space-y-4 text-sm leading-relaxed text-zinc-200">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h3: ({ node: _node, ...props }) => (
                  <h3
                    className="mt-6 flex items-center gap-2 border-b border-zinc-800 pb-2 text-lg font-bold text-white first:mt-0"
                    {...props}
                  />
                ),
                h4: ({ node: _node, ...props }) => (
                  <h4
                    className="mt-4 rounded-xl bg-zinc-800/40 px-3 py-1.5 text-sm font-semibold text-blue-400"
                    {...props}
                  />
                ),
                ul: ({ node: _node, ...props }) => (
                  <ul className="my-2 space-y-2 list-none pl-0" {...props} />
                ),
                li: ({ node: _node, children, ...props }) => {
                  const taskText = String(children);
                  const isChecked = checkedTasks[taskText] || false;
                  return (
                    <li
                      onClick={() => toggleTask(taskText)}
                      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                        isChecked
                          ? "border-emerald-500/40 bg-emerald-500/10 text-zinc-400 line-through"
                          : "border-zinc-800/80 bg-zinc-950/40 text-zinc-200 hover:border-blue-500/40"
                      }`}
                      {...props}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTask(taskText)}
                        className="mt-0.5 h-4 w-4 rounded accent-blue-600 cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1">{children}</div>
                    </li>
                  );
                },
                p: ({ node: _node, ...props }) => (
                  <p className="my-2 text-xs leading-relaxed text-zinc-300" {...props} />
                ),
              }}
            >
              {planContent}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
