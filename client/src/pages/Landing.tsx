import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  FileText,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Zap,
  CalendarRange,
  Layers,
  Award,
  CheckCircle2,
  Play,
  X,
  Star,
  Clock,
  ShieldCheck,
  GraduationCap,
  TrendingUp,
  ChevronDown,
  Cpu,
  HelpCircle,
  Network,
  Mic,
  Code2,
  Terminal,
  Heart,
} from "lucide-react";

export default function Landing() {
  const [activeTab, setActiveTab] = useState<"chat" | "planner" | "flashcard" | "notes" | "mindmap">("chat");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does EduMind AI prevent AI hallucinations?",
      a: "EduMind AI uses advanced RAG 3.0 (Retrieval-Augmented Generation) with FAISS vector similarity and cross-document ranking. Every response is strictly grounded in your uploaded documents and provides exact page citations and confidence scores.",
    },
    {
      q: "Is EduMind AI completely free to use?",
      a: "Yes! EduMind AI is 100% free and open for students, scholars, and researchers. You get full access to document upload, 1-Day Exam Cram planning, 3D flashcards, interactive mind maps, and page-cited AI chat without any paywalls.",
    },
    {
      q: "Can I upload large 500+ page textbook PDFs?",
      a: "Yes! EduMind AI supports high-density academic textbooks, slide decks, research papers, and syllabi up to 100MB with automated OCR, hierarchical chunking, and math formula preservation.",
    },
    {
      q: "How does the 1-Day Exam Cram Study Planner work?",
      a: "Our neural planner scans your document's chapter structure, identifies high-yield exam topics, calculates concept difficulty, and crafts an hour-by-hour active recall timetable with scheduled flashcard drills and formula reviews.",
    },
    {
      q: "Who developed EduMind AI?",
      a: "EduMind AI was architected and engineered by Devender and Harsh Roy as a state-of-the-art AI academic companion designed to eliminate study burnout and accelerate deep learning.",
    },
    {
      q: "Is my personal research and document data secure?",
      a: "Your files are stored in an encrypted private vault with TLS 1.3 encryption. Your data is never used to train public foundation models and can be permanently deleted at any time.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07090e] text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* ========================================================
          ANIMATED AURORA & MESH BACKGROUND GRADIENTS
          ======================================================== */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Animated Mesh Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-25" />
        <div className="absolute inset-0 bg-radial-vignette" />

        {/* Ambient AI Robot Background Watermark */}
        <div className="absolute top-10 -right-20 h-[750px] w-[750px] opacity-10 blur-[1px] pointer-events-none select-none mix-blend-screen hidden lg:block">
          <img
            src="/ai-robot-hero.png"
            alt="EduMind AI Companion"
            className="h-full w-full object-contain filter drop-shadow-[0_0_100px_rgba(34,211,238,0.35)]"
          />
        </div>

        {/* Floating Glowing Cool Orbs */}
        <div className="animate-mesh-drift-1 absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-cyan-500/20 via-sky-400/10 to-transparent blur-[120px]" />
        <div className="animate-mesh-drift-2 absolute top-1/3 -right-20 h-[550px] w-[550px] rounded-full bg-gradient-to-bl from-indigo-500/15 via-blue-600/10 to-transparent blur-[140px]" />
        <div className="animate-pulse-glow absolute top-2/3 left-10 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-teal-400/10 via-cyan-600/10 to-transparent blur-[130px]" />
      </div>

      {/* ========================================================
          TOP NAVIGATION BAR (FROSTED GLASS)
          ======================================================== */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07090e]/80 backdrop-blur-2xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-8">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/25 ring-1 ring-white/20 transition group-hover:scale-105">
              <Brain size={22} className="text-white" />
              <div className="absolute inset-0 rounded-2xl bg-cyan-400 opacity-0 blur transition group-hover:opacity-40" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                EduMind <span className="text-gradient-cyan">AI</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  RAG 3.0 Platform
                </span>
              </div>
            </div>
          </Link>

          {/* Nav Anchor Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#features" className="transition hover:text-cyan-400">
              Features
            </a>
            <a href="#interactive-demo" className="transition hover:text-cyan-400">
              Live Sandbox
            </a>
            <a href="#comparison" className="transition hover:text-cyan-400">
              Why EduMind
            </a>
            <a href="#developers" className="transition hover:text-cyan-400">
              Developers
            </a>
            <a href="#faq" className="transition hover:text-cyan-400">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-300">
              <Code2 size={13} className="text-cyan-400" />
              <span>Devender & Harsh Roy</span>
            </div>

            <Link
              to="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-md transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40 hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================
          HERO SECTION (CLEAN, ELEGANT, PROFESSIONAL ANIMATED UI)
          ======================================================== */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 lg:pt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Hero Content */}
            <div className="text-center lg:col-span-7 lg:text-left space-y-6">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 shadow-inner backdrop-blur-xl">
                <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                <span>Next-Gen RAG Study Platform • 100% Free Forever</span>
              </div>

              {/* Hero Main Heading */}
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-6xl xl:text-7xl leading-[1.12]">
                Master Any Subject with{" "}
                <span className="text-gradient-cool block sm:inline">
                  AI-Powered Intelligence
                </span>
              </h1>

              {/* Subtitle */}
              <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Upload textbooks, research papers, and lecture slides. Instantly generate{" "}
                <strong className="text-white">Active Recall study plans</strong>,{" "}
                <strong className="text-cyan-300">3D flashcard decks</strong>,{" "}
                <strong className="text-indigo-300">interactive mind maps</strong>, and chat with pinpoint page citations.
              </p>

              {/* Main Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/register"
                  className="group relative flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-xl shadow-cyan-500/25 transition hover:scale-105 hover:shadow-cyan-500/40"
                >
                  <Sparkles size={18} />
                  <span>Start Learning Free</span>
                  <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                </Link>

                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-900/60 px-7 py-3.5 text-sm sm:text-base font-semibold text-slate-200 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-slate-800/80 hover:text-white"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                    <Play size={12} className="ml-0.5 fill-current" />
                  </div>
                  <span>Watch Walkthrough</span>
                </button>
              </div>

              {/* Developer & Social Proof Banner */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-400 pt-4">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5">
                  <Terminal size={14} className="text-cyan-400" />
                  <span>Architected by <strong className="text-white font-semibold">Devender</strong> & <strong className="text-white font-semibold">Harsh Roy</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold text-white">4.9/5</span>
                  <span>rating by scholars</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-400" />
                  <span>100% Free & Open</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Perfectly Fitted AI Mascot Showcase */}
            <div className="relative flex items-center justify-center lg:col-span-5">
              {/* Backlight Glow Halo */}
              <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-cyan-500/25 via-blue-600/15 to-purple-600/15 blur-3xl" />
              
              {/* Central AI Robot Container */}
              <div className="relative w-full max-w-md">
                {/* Robot Main Avatar Card */}
                <div className="relative z-10 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-[#07090e] p-6 shadow-2xl shadow-cyan-500/15 backdrop-blur-2xl transition duration-500 hover:scale-[1.01]">
                  {/* Top Header Badge */}
                  <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-bold text-white">EduMind Neural Assistant</span>
                    </div>
                    <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                      ONLINE
                    </span>
                  </div>

                  {/* Robot Hero Image */}
                  <div className="relative mx-auto flex items-center justify-center max-h-[300px]">
                    <img
                      src="/ai-robot-hero.png"
                      alt="EduMind AI Study Robot"
                      className="max-h-[280px] w-auto object-contain filter drop-shadow-[0_15px_30px_rgba(34,211,238,0.2)] animate-float"
                    />
                  </div>

                  {/* Mascot Interactive Status Footer */}
                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                      <Sparkles size={14} className="text-cyan-400" />
                      <span>Ready to analyze your textbook</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-300">100% Grounded</span>
                  </div>
                </div>

                {/* Floating Glassmorphic Stat Badges */}
                <div className="animate-float absolute -top-3 -left-4 z-20 hidden sm:flex items-center gap-2.5 rounded-2xl border border-cyan-500/30 bg-slate-900/95 p-2.5 shadow-xl backdrop-blur-xl">
                  <div className="rounded-xl bg-cyan-500/20 p-1.5 text-cyan-400">
                    <Zap size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">99.8% Precision</div>
                    <div className="text-[9px] text-slate-400">Zero Hallucination RAG</div>
                  </div>
                </div>

                <div className="animate-float-delayed absolute -bottom-3 -right-4 z-20 hidden sm:flex items-center gap-2.5 rounded-2xl border border-indigo-500/30 bg-slate-900/95 p-2.5 shadow-xl backdrop-blur-xl">
                  <div className="rounded-xl bg-indigo-500/20 p-1.5 text-indigo-400">
                    <TrendingUp size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">10x Study Velocity</div>
                    <div className="text-[9px] text-slate-400">Active Recall Engine</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            TRUSTED BY STUDENTS AT TOP UNIVERSITIES TICKER
            ======================================================== */}
        <div className="mx-auto mt-14 max-w-7xl px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
            Trusted by top scholars and researchers at
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
            {["Stanford University", "MIT", "Oxford", "Harvard", "Cambridge", "UC Berkeley", "Imperial College"].map(
              (uni, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wider text-slate-400"
                >
                  <GraduationCap size={15} className="text-cyan-400" />
                  <span>{uni}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* ========================================================
            INTERACTIVE LIVE PLAYGROUND / PRODUCT SHOWCASE
            ======================================================== */}
        <div id="interactive-demo" className="mx-auto mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-[#07090e] p-3 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl sm:p-5">
            {/* Top Glowing Edge Line */}
            <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            {/* Window Controls Bar */}
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 text-xs font-medium text-slate-400">
                  EduMind Interactive Sandbox • Neural RAG Workspace
                </span>
              </div>

              {/* Mode Selector Tabs */}
              <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-950/80 p-1 border border-white/10">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "chat"
                      ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <MessageSquare size={13} />
                  <span>AI Chat</span>
                </button>

                <button
                  onClick={() => setActiveTab("notes")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "notes"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileText size={13} />
                  <span>Notes</span>
                </button>

                <button
                  onClick={() => setActiveTab("mindmap")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "mindmap"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Network size={13} />
                  <span>Mind Map</span>
                </button>

                <button
                  onClick={() => setActiveTab("planner")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "planner"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <CalendarRange size={13} />
                  <span>Exam Cram</span>
                </button>

                <button
                  onClick={() => setActiveTab("flashcard")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "flashcard"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Layers size={13} />
                  <span>3D Flashcards</span>
                </button>
              </div>
            </div>

            {/* Playground Interactive Canvas */}
            <div className="relative min-h-[360px] p-4 sm:p-6">
              {/* TAB 1: AI CHAT */}
              {activeTab === "chat" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-start justify-end gap-3">
                    <div className="max-w-lg rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 p-4 text-xs sm:text-sm font-medium text-white shadow-lg">
                      <p>
                        Can you explain the difference between Backpropagation and Gradient Descent with a math analogy?
                      </p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-xs font-bold text-blue-300">
                      You
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shrink-0">
                      <Brain size={18} />
                    </div>
                    <div className="max-w-2xl rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5 text-xs sm:text-sm text-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                        <Sparkles size={14} />
                        <span>EduMind AI Neural Synthesis</span>
                        <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-300 border border-cyan-400/20">
                          Cited from Chapter 4, Page 82
                        </span>
                      </div>
                      <p className="leading-relaxed">
                        Think of a mountain climber navigating a foggy hill in reverse:
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-4">
                        <li>
                          <strong className="text-white">Backpropagation</strong> is the <em>map maker</em> (computing partial derivatives of loss with respect to weights via the chain rule layer-by-layer backwards).
                        </li>
                        <li>
                          <strong className="text-white">Gradient Descent</strong> is the <em>actual step taken</em> (updating weights according to learning rate and gradient direction).
                        </li>
                      </ul>
                      <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400 border-t border-white/5">
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 size={13} /> 99.8% Vector Match
                        </span>
                        <span>•</span>
                        <span>Source: DeepLearning_MIT_Press.pdf</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI NOTES GENERATOR */}
              {activeTab === "notes" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-cyan-400" />
                        <h4 className="text-sm font-bold text-white">Lecture-Grade Exam Master Notes</h4>
                      </div>
                      <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                        Markdown & PDF Export Ready
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                      <h5 className="font-bold text-cyan-300 text-sm">1. Quantum Computing Foundations</h5>
                      <p>
                        Quantum computing harnesses superposition and entanglement to solve computational problems in polynomial time that are intractable on classical Turing architectures.
                      </p>
                      <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/30 p-3 text-[11px]">
                        <strong className="text-cyan-200">⚡ Must-Know Formula:</strong> |ψ⟩ = α|0⟩ + β|1⟩ where |α|² + |β|² = 1
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INTERACTIVE MIND MAP */}
              {activeTab === "mindmap" && (
                <div className="flex flex-col items-center justify-center py-6 animate-in fade-in duration-300 space-y-4">
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/60 px-5 py-3 text-center shadow-lg">
                      <div className="text-xs font-bold text-indigo-300">Central Node</div>
                      <div className="text-sm font-extrabold text-white">Machine Learning</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-8 flex-wrap justify-center">
                    <div className="rounded-xl border border-cyan-500/30 bg-slate-900 px-4 py-2 text-xs font-semibold text-cyan-300">
                      Supervised Learning (Regression, Classification)
                    </div>
                    <div className="rounded-xl border border-blue-500/30 bg-slate-900 px-4 py-2 text-xs font-semibold text-blue-300">
                      Unsupervised Learning (Clustering, PCA)
                    </div>
                    <div className="rounded-xl border border-purple-500/30 bg-slate-900 px-4 py-2 text-xs font-semibold text-purple-300">
                      Reinforcement Learning (Q-Learning, Policy)
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Zoom, pan, and click nodes to explore connected concepts and citations.
                  </p>
                </div>
              )}

              {/* TAB 4: STUDY PLANNER */}
              {activeTab === "planner" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Zap size={18} className="text-amber-400" />
                      <h4 className="text-sm font-bold text-white">1-Day Exam Cram Schedule</h4>
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                        High Yield
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> Total: 6.5 Hours
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3.5 space-y-2">
                      <div className="text-xs font-semibold text-cyan-400">08:00 - 11:00 AM • Block 1</div>
                      <h5 className="text-sm font-bold text-white">Core Theoretical Foundations</h5>
                      <p className="text-[11px] text-slate-400">
                        Master loss surfaces, activation functions, and vanishing gradients.
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 size={12} /> Active Recall Drill #1
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3.5 space-y-2">
                      <div className="text-xs font-semibold text-blue-400">01:00 - 04:00 PM • Block 2</div>
                      <h5 className="text-sm font-bold text-white">Mathematical Derivations</h5>
                      <p className="text-[11px] text-slate-400">
                        Matrix calculus backprop chain rule & optimizer variants (Adam, RMSProp).
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-blue-400">
                        <Sparkles size={12} /> Practice Problem Set
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3.5 space-y-2">
                      <div className="text-xs font-semibold text-purple-400">06:00 - 08:30 PM • Block 3</div>
                      <h5 className="text-sm font-bold text-white">Final Exam Simulation</h5>
                      <p className="text-[11px] text-slate-400">
                        Timed active flashcard test and high-frequency misconception review.
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-purple-400">
                        <Award size={12} /> 100% Target
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: 3D FLASHCARD */}
              {activeTab === "flashcard" && (
                <div className="flex flex-col items-center justify-center py-4 animate-in fade-in duration-300">
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="group relative h-52 w-full max-w-md cursor-pointer perspective-1000"
                  >
                    <div
                      className={`relative h-full w-full rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 shadow-2xl transition-all duration-500 transform-style-preserve-3d ${
                        isFlipped ? "rotate-y-180" : ""
                      }`}
                    >
                      {/* Front Side */}
                      <div className="absolute inset-0 flex flex-col justify-between p-6 backface-hidden">
                        <div className="flex items-center justify-between text-xs font-semibold text-indigo-400">
                          <span>Card 04 of 28</span>
                          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px]">
                            Click to Flip 🔄
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-base font-bold text-white sm:text-lg">
                            What is the primary advantage of Layer Normalization over Batch Normalization in Transformers?
                          </p>
                        </div>
                        <p className="text-center text-[11px] text-slate-400">
                          Active Recall Spaced Repetition Drill
                        </p>
                      </div>

                      {/* Back Side */}
                      <div className="absolute inset-0 flex flex-col justify-between p-6 rotate-y-180 backface-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 rounded-3xl">
                        <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
                          <span>Answer & Explanation</span>
                          <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px]">
                            Verified
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-cyan-100">
                            Layer Normalization normalizes across features per token independently of batch size, allowing sequential variable-length inputs without cross-batch dependencies.
                          </p>
                        </div>
                        <div className="flex justify-center gap-3 text-xs">
                          <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 font-semibold text-emerald-300">
                            Easy
                          </span>
                          <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 font-semibold text-amber-300">
                            Good
                          </span>
                          <span className="rounded-lg bg-rose-500/20 px-2.5 py-1 font-semibold text-rose-300">
                            Again
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FEATURE MATRIX (6 CORE CAPABILITIES)
          ======================================================== */}
      <section id="features" className="relative py-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300">
              <Cpu size={14} />
              <span>Full Cognitive Stack</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Everything You Need to Ace Any Exam
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-slate-400">
              Replace fragmented tools with a single unified, intelligent cognition engine.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Multi-Format PDF Ingestion",
                desc: "Upload 500+ page textbook PDFs, research papers, and slides. Automatic OCR and vector chunking preserve math equations and figures.",
                icon: FileText,
                color: "text-cyan-400",
                badge: "OCR Enabled",
                border: "border-cyan-500/20",
                gradient: "from-cyan-500/10 to-transparent",
              },
              {
                title: "Pinpoint Page Citation Chat",
                desc: "Ask complex queries and get answers backed by exact page citations and confidence scores. Zero hallucination guarantee.",
                icon: MessageSquare,
                color: "text-blue-400",
                badge: "Strict Grounding",
                border: "border-blue-500/20",
                gradient: "from-blue-500/10 to-transparent",
              },
              {
                title: "Active Recall Study Planner",
                desc: "Custom AI study schedules tailored to your exams: 1-Day Hour-by-Hour Exam Crams, 7-Day Sprints, and 4-Week Mastery Curriculums.",
                icon: CalendarRange,
                color: "text-amber-400",
                badge: "3 Modes",
                border: "border-amber-500/20",
                gradient: "from-amber-500/10 to-transparent",
              },
              {
                title: "Interactive Mind Map Visualizer",
                desc: "Explore conceptual relationships and topic hierarchies in an interactive node graph with live drill-downs into citations.",
                icon: Network,
                color: "text-indigo-400",
                badge: "Hierarchical Graph",
                border: "border-indigo-500/20",
                gradient: "from-indigo-500/10 to-transparent",
              },
              {
                title: "Smart 3D Flashcards & Quizzes",
                desc: "Test your comprehension with auto-generated active recall flashcards, instant answer verification, and detailed explanations.",
                icon: Award,
                color: "text-emerald-400",
                badge: "Instant Feedback",
                border: "border-emerald-500/20",
                gradient: "from-emerald-500/10 to-transparent",
              },
              {
                title: "AI Voice Tutor & Audio Study",
                desc: "Hands-free voice conversations with intelligent conversational reasoning and natural text-to-speech audio explanations.",
                icon: Mic,
                color: "text-purple-400",
                badge: "Real-time TTS",
                border: "border-purple-500/20",
                gradient: "from-purple-500/10 to-transparent",
              },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className={`group relative overflow-hidden rounded-3xl border ${feat.border} bg-gradient-to-b ${feat.gradient} p-7 backdrop-blur-xl transition duration-300 hover:scale-[1.02] hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-500/10`}
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3 shadow-inner">
                      <Icon size={22} className={feat.color} />
                    </div>
                    <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-semibold text-slate-300">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-white transition group-hover:text-cyan-300">
                    {feat.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          WHY EDUMIND AI (COMPARISON MATRIX)
          ======================================================== */}
      <section id="comparison" className="relative py-20 bg-gradient-to-b from-slate-950/60 to-[#07090e] border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
              Traditional Studying vs <span className="text-gradient-cyan">EduMind AI</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-slate-400">
              Why high-performing students finish studying in 1/4th the time with straight A's.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 text-xs sm:text-sm">
              {/* Metric Column */}
              <div className="p-6 sm:p-7 space-y-5 bg-slate-950/40">
                <h3 className="text-sm sm:text-base font-bold text-slate-300">Study Dimensions</h3>
                <div className="space-y-5 text-slate-400 font-medium">
                  <div>Reading 500-page Textbook</div>
                  <div>Answering Complex Questions</div>
                  <div>Study Schedule Creation</div>
                  <div>Exam Recall Testing</div>
                  <div>Source Reliability</div>
                </div>
              </div>

              {/* Old Way */}
              <div className="p-6 sm:p-7 space-y-5 bg-rose-950/10">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm sm:text-base">
                  <X size={17} />
                  <span>Traditional Method</span>
                </div>
                <div className="space-y-5 text-slate-300">
                  <div>30–40 hours of manual highlighting</div>
                  <div>Flipping through indexes & guesswork</div>
                  <div>Ad-hoc cramming without structure</div>
                  <div>Passive re-reading with rapid decay</div>
                  <div>Prone to memory bias & confusion</div>
                </div>
              </div>

              {/* EduMind AI */}
              <div className="p-6 sm:p-7 space-y-5 bg-cyan-950/20">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm sm:text-base">
                  <CheckCircle2 size={17} />
                  <span>EduMind AI (RAG 3.0)</span>
                </div>
                <div className="space-y-5 text-cyan-100 font-semibold">
                  <div>Instant AI synthesis & chapter roadmaps</div>
                  <div>Exact page citations in &lt; 1.2 seconds</div>
                  <div>Hour-by-hour 1-Day & 7-Day active schedules</div>
                  <div>3D flashcards + Adaptive MCQs with feedback</div>
                  <div>100% grounded zero-hallucination precision</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          DEVELOPERS & CREATORS SECTION (DEVENDER & HARSH ROY)
          ======================================================== */}
      <section id="developers" className="relative py-24 border-t border-white/10 bg-gradient-to-b from-[#07090e] via-slate-950 to-[#07090e]">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
              <Code2 size={14} />
              <span>Engineering & Innovation</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
              Meet the Developers Behind <span className="text-gradient-cyan">EduMind AI</span>
            </h2>
            <p className="mx-auto max-w-xl text-sm text-slate-400">
              Architected with precision by passionate engineers dedicated to revolutionizing AI-assisted education.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Developer 1: Devender */}
            <div className="group relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-[#07090e] p-8 shadow-2xl backdrop-blur-2xl transition duration-300 hover:scale-[1.02] hover:border-cyan-400">
              <div className="flex items-start justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black text-2xl shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/40">
                  D
                </div>
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-[11px] font-bold text-cyan-300 border border-cyan-500/30">
                  Lead Software Architect
                </span>
              </div>

              <div className="mt-6 space-y-2">
                <h3 className="text-2xl font-black text-white group-hover:text-cyan-300 transition">
                  Devender
                </h3>
                <p className="text-xs font-semibold text-cyan-400">
                  Full Stack Engineer & AI Systems Architect
                </p>
                <p className="text-xs text-slate-300 leading-relaxed pt-2">
                  Specializing in distributed RAG architectures, real-time vector indexing with FAISS, and high-performance full-stack web applications.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-white/10">
                {["RAG 3.0", "FastAPI", "React 19", "MongoDB", "Vector Embeddings"].map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-300 border border-white/10"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Developer 2: Harsh Roy */}
            <div className="group relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-[#07090e] p-8 shadow-2xl backdrop-blur-2xl transition duration-300 hover:scale-[1.02] hover:border-indigo-400">
              <div className="flex items-start justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-2xl shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400/40">
                  H
                </div>
                <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-[11px] font-bold text-indigo-300 border border-indigo-500/30">
                  Co-Architect & UI/UX Lead
                </span>
              </div>

              <div className="mt-6 space-y-2">
                <h3 className="text-2xl font-black text-white group-hover:text-indigo-300 transition">
                  Harsh Roy
                </h3>
                <p className="text-xs font-semibold text-indigo-400">
                  Senior AI Engineer & UI/UX Specialist
                </p>
                <p className="text-xs text-slate-300 leading-relaxed pt-2">
                  Focusing on responsive design systems, cognitive ergonomics, voice synthesis, and interactive visualization algorithms.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-white/10">
                {["Mind Mapping", "TTS Voice AI", "TailwindCSS", "Node.js", "Prompt Engineering"].map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-300 border border-white/10"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FAQ SECTION (INTERACTIVE ACCORDION)
          ======================================================== */}
      <section id="faq" className="relative py-20 border-t border-white/10 bg-gradient-to-b from-[#07090e] via-slate-950 to-[#07090e]">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300">
              <HelpCircle size={14} />
              <span>Got Questions?</span>
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
              Everything you need to know about our RAG 3.0 cognitive study engine.
            </p>
          </div>

          <div className="mt-12 space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl transition duration-200"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-white transition hover:text-cyan-300"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-cyan-400" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-0 text-xs sm:text-sm leading-relaxed text-slate-300 border-t border-white/5 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          BOTTOM CALL TO ACTION (100% FREE FOREVER)
          ======================================================== */}
      <section className="relative overflow-hidden border-t border-white/10 py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-950/40 via-slate-950 to-indigo-950/40" />

        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold text-cyan-300">
            <Sparkles size={14} />
            <span>100% Free & Open Academic Platform</span>
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-5xl">
            Ready to Supercharge Your Study Velocity?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-300">
            Upload your first document in seconds and experience the future of AI-powered active recall learning.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="group flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-9 py-3.5 text-base font-bold text-white shadow-xl shadow-cyan-500/30 transition hover:scale-105 hover:shadow-cyan-500/50"
            >
              <Sparkles size={18} />
              <span>Create Free Account</span>
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          ENTERPRISE FOOTER WITH DEVELOPER CREDITS
          ======================================================== */}
      <footer className="border-t border-white/10 bg-[#07090e] py-12 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white">
                  <Brain size={18} />
                </div>
                <span className="text-lg font-bold text-white">EduMind AI</span>
              </div>
              <p className="max-w-sm text-xs text-slate-400 leading-relaxed">
                Empowering students, researchers, and universities worldwide with next-generation RAG 3.0 cognition, active recall, and zero-hallucination learning.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All AI Systems Operational (99.99% Uptime)</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white">AI Citation Chat</a></li>
                <li><a href="#features" className="hover:text-white">Exam Cram Planner</a></li>
                <li><a href="#features" className="hover:text-white">3D Flashcards</a></li>
                <li><a href="#features" className="hover:text-white">Interactive Mind Map</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white">Developers</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="text-white font-medium">Devender</li>
                <li className="text-white font-medium">Harsh Roy</li>
                <li><span className="text-slate-400">Open Source RAG 3.0</span></li>
                <li><span className="text-slate-400">Full Stack AI Architecture</span></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white">Account</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-white">Create Free Account</Link></li>
                <li><Link to="/dashboard" className="hover:text-white">Student Dashboard</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Architected & Built with</span>
              <Heart size={13} className="text-rose-500 fill-current" />
              <span>by <strong className="text-slate-200">Devender</strong> and <strong className="text-slate-200">Harsh Roy</strong></span>
            </div>
            <div>
              © {new Date().getFullYear()} EduMind AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================
          INTERACTIVE DEMO MODAL
          ======================================================== */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/20 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div className="flex items-center gap-2">
                <Play size={18} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-white">EduMind AI Platform Walkthrough</h3>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 space-y-6 text-center">
              <div className="relative mx-auto flex h-48 w-full max-w-lg items-center justify-center rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/60 to-slate-950 p-6">
                <div className="space-y-2">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 animate-pulse">
                    <Brain size={30} />
                  </div>
                  <h4 className="text-base font-bold text-white">Interactive RAG Session Active</h4>
                  <p className="text-xs text-slate-400">
                    Upload documents, chat with page citations, generate 1-Day exam schedules, and test your recall with 3D flashcards.
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Link
                  to="/register"
                  className="rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-bold text-white hover:bg-cyan-400"
                >
                  Get Started Immediately
                </Link>
                <button
                  onClick={() => setIsDemoModalOpen(false)}
                  className="rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}