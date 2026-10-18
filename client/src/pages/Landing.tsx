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
  TrendingUp,
  ChevronDown,
  Cpu,
  HelpCircle,
  Network,
  Mic,
  Terminal,
  Users,
  UploadCloud,
  Volume2,
  Globe,
  Flame,
  ArrowUpRight,
  BookOpen,
  Target,
  Sliders,
  Check,
  Compass,
  Menu,
} from "lucide-react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "chat" | "planner" | "flashcard" | "notes" | "mindmap"
  >("chat");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [heroPrompt, setHeroPrompt] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<
    "cram" | "research" | "commute" | "visual"
  >("cram");
  const [pagesToStudy, setPagesToStudy] = useState<number>(250);

  const handleSelectPrompt = (
    prompt: string,
    targetTab: "chat" | "planner" | "flashcard" | "notes" | "mindmap"
  ) => {
    setActiveTab(targetTab);
    const demoSection = document.getElementById("interactive-demo");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" });
    }
  };

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
      q: "How does the Multilingual AI Voice Tutor work?",
      a: "Our Voice Tutor speaks 9+ languages (English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Spanish, French). It teaches step-by-step with real-world analogies, line-by-line code explanations, and checks your understanding with follow-up questions.",
    },
    {
      q: "How does the Study Planner work?",
      a: "The planner analyzes your study document, organizes key topics, and creates a clear, structured study timetable with scheduled practice reviews (1-Day Exam Cram, 7-Day Sprint, or 4-Week Mastery).",
    },
    {
      q: "Is my personal research and document data secure?",
      a: "Your files are stored securely with 256-bit encryption. Your data is strictly private to your account and can be deleted at any time.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07090e] text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute inset-0 bg-radial-vignette" />

        {/* Soft Background Accents */}
        <div className="absolute -top-40 left-1/4 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full bg-indigo-500/10 blur-[140px]" />
        <div className="absolute bottom-1/4 left-10 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[160px]" />
      </div>

      {/* ========================================================
          TOP NAVIGATION BAR
          ======================================================== */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07090e]/80 backdrop-blur-2xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-8">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-md shadow-cyan-500/20 ring-1 ring-white/20 transition group-hover:scale-105">
              <Brain size={22} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                EduMind <span className="text-gradient-cyan">AI</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-medium text-slate-400">
                  Study Operating System
                </span>
              </div>
            </div>
          </Link>

          {/* Nav Anchor Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#how-it-works" className="transition hover:text-cyan-400">
              How It Works
            </a>
            <a href="#interactive-demo" className="transition hover:text-cyan-400">
              Live Preview
            </a>
            <a
              href="#voice-tutor"
              className="transition hover:text-cyan-400 flex items-center gap-1"
            >
              <Mic size={12} className="text-cyan-400" />
              <span>Voice Tutor</span>
            </a>
            <a href="#features" className="transition hover:text-cyan-400">
              Features
            </a>
            <a href="#workflows" className="transition hover:text-cyan-400">
              Workflows
            </a>
            <a href="#calculator" className="transition hover:text-cyan-400">
              Calculator
            </a>
            <a href="#faq" className="transition hover:text-cyan-400">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-md transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="hidden sm:inline-flex group relative items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40 hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile navigation"
              className="flex lg:hidden items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Sheet */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#07090e]/95 px-6 py-4 backdrop-blur-2xl lg:hidden animate-in fade-in slide-in-from-top-3 duration-200">
            <nav className="flex flex-col space-y-3 text-sm font-semibold text-slate-300">
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-cyan-400 transition"
              >
                How It Works
              </a>
              <a
                href="#interactive-demo"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-cyan-400 transition"
              >
                Live Preview
              </a>
              <a
                href="#voice-tutor"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-1.5 hover:text-cyan-400 transition"
              >
                <Mic size={15} className="text-cyan-400" />
                <span>AI Voice Tutor</span>
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-cyan-400 transition"
              >
                Features
              </a>
              <a
                href="#workflows"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-cyan-400 transition"
              >
                Study Workflows
              </a>
              <a
                href="#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-cyan-400 transition"
              >
                Cram Time Calculator
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-cyan-400 transition"
              >
                FAQ
              </a>
              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/25"
                >
                  <span>Get Started Free</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ========================================================
          HERO SECTION
          ======================================================== */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 lg:pt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Hero Content */}
            <div className="text-center lg:col-span-7 lg:text-left space-y-6">
              
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-xl">
                <Sparkles size={14} className="text-cyan-400" />
                <span>🚀 #1 AI Study & Cognition Platform • 100% Free</span>
              </div>

              {/* Hero Main Heading */}
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-6xl xl:text-7xl leading-[1.12]">
                Master Any Subject in{" "}
                <span className="text-gradient-cool block sm:inline">
                  1/4th the Time
                </span>
              </h1>

              {/* Subtitle */}
              <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Stop spending 30+ hours highlighting boring PDFs. Upload your textbooks, lecture notes, or research papers — get <strong className="text-white">exact page citations</strong>, <strong className="text-white">3D flashcards</strong>, <strong className="text-white">hour-by-hour exam cram schedules</strong>, and an <strong className="text-white">interactive voice tutor</strong> in seconds.
              </p>

              {/* Interactive Try-it Prompt Bar */}
              <div className="rounded-2xl border border-white/15 bg-slate-900/80 p-2 shadow-2xl backdrop-blur-xl max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2 px-2">
                  <Sparkles size={16} className="text-cyan-400 shrink-0" />
                  <input
                    type="text"
                    value={heroPrompt}
                    onChange={(e) => setHeroPrompt(e.target.value)}
                    placeholder="Ask or explore any topic (e.g. Backpropagation, Photosynthesis)..."
                    className="w-full bg-transparent py-2 text-xs sm:text-sm text-white outline-none placeholder:text-slate-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && heroPrompt.trim()) {
                        handleSelectPrompt(heroPrompt, "chat");
                      }
                    }}
                  />
                  <Link
                    to="/register"
                    className="flex items-center gap-1 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition shrink-0 shadow-md"
                  >
                    <span>Try Free</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* Popular Study Topic Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/10 mt-1 px-1 text-[11px]">
                  <span className="text-slate-400 font-medium">Popular:</span>
                  {[
                    { label: "⚡ Backpropagation Math", tab: "chat" as const },
                    { label: "📑 Quantum Notes", tab: "notes" as const },
                    { label: "🧠 ML Node Hierarchy", tab: "mindmap" as const },
                    { label: "⏱️ 1-Day Cram Schedule", tab: "planner" as const },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => handleSelectPrompt(chip.label, chip.tab)}
                      className="rounded-lg border border-white/10 bg-slate-950/60 px-2 py-0.5 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
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

              {/* Verified Platform Trust Signals */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5 backdrop-blur-md">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400">
                    <ShieldCheck size={13} />
                  </div>
                  <span className="text-slate-300 font-medium text-[11px]">Strict Page Citations</span>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5 backdrop-blur-md">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400">
                    <Zap size={13} />
                  </div>
                  <span className="text-slate-300 font-medium text-[11px]">&lt; 1.2s Semantic Retrieval</span>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5 backdrop-blur-md">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500/20 text-purple-400">
                    <BookOpen size={13} />
                  </div>
                  <span className="text-slate-300 font-medium text-[11px]">Free For All Students</span>
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
            3-STEP HOW IT WORKS SECTION
            ======================================================== */}
        <div id="how-it-works" className="mx-auto mt-20 max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
              <Zap size={13} />
              <span>Effortless 3-Step Process</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              How EduMind AI Works in 3 Simple Steps
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
              No technical setup required. Drop your study material and let AI do the heavy lifting.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Upload Your Study Material",
                desc: "Upload any textbook PDF, lecture slides, syllabus, or research paper up to 100MB with automated OCR and math formula preservation.",
                icon: UploadCloud,
                badge: "PDF, Slides & Notes",
                color: "text-cyan-400",
                border: "border-cyan-500/30",
              },
              {
                step: "02",
                title: "AI Synthesizes & Indexes",
                desc: "RAG 3.0 vectorizes every paragraph, identifies core exam concepts, extracts formulas, and generates instant 3D flashcards and roadmaps.",
                icon: Brain,
                badge: "Vector Indexing",
                color: "text-indigo-400",
                border: "border-indigo-500/30",
              },
              {
                step: "03",
                title: "Master with Citations & Voice",
                desc: "Ask questions with exact page citations, practice with adaptive flashcards, and learn hands-free with your multilingual AI Voice Tutor.",
                icon: Mic,
                badge: "Zero Hallucination",
                color: "text-purple-400",
                border: "border-purple-500/30",
              },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className={`relative overflow-hidden rounded-3xl border ${st.border} bg-slate-900/60 p-7 backdrop-blur-xl shadow-xl transition duration-300 hover:scale-[1.02] hover:border-cyan-400/50`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-white/20">{st.step}</span>
                    <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
                      {st.badge}
                    </span>
                  </div>

                  <div className="mt-4 inline-flex rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                    <Icon size={24} className={st.color} />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-white">{st.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            INTERACTIVE LIVE PLAYGROUND / PRODUCT SHOWCASE
            ======================================================== */}
        <div id="interactive-demo" className="mx-auto mt-20 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Experience the Live Neural Workspace
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Click the tabs below to test each active recall tool in real time:
            </p>
          </div>

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
                </div>
              )}

              {/* TAB 4: EXAM CRAM PLANNER */}
              {activeTab === "planner" && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="text-sm font-bold text-white">Hour-by-Hour Active Recall Schedule</h4>
                    <span className="text-[10px] text-amber-400 font-bold">1-Day Cram Sprint</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-1.5">
                      <span className="text-[10px] font-bold text-amber-400">08:00 - 10:00 AM</span>
                      <h5 className="text-sm font-bold text-white">Core Definitions & Formulas</h5>
                      <p className="text-[11px] text-slate-400">
                        Read High-Yield Highlights, annotate theorems, and complete formula sheet drill.
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 size={12} /> Milestone Active
                      </div>
                    </div>

                    <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-3.5 space-y-1.5">
                      <span className="text-[10px] font-bold text-blue-400">11:00 AM - 01:00 PM</span>
                      <h5 className="text-sm font-bold text-white">Problem Solving & Proofs</h5>
                      <p className="text-[11px] text-slate-400">
                        Practice textbook exercises with AI instant validation and step verification.
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-blue-400">
                        <Clock size={12} /> Scheduled
                      </div>
                    </div>

                    <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-3.5 space-y-1.5">
                      <span className="text-[10px] font-bold text-purple-400">02:00 - 04:00 PM</span>
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
          NEW: MULTILINGUAL AI VOICE TUTOR SPOTLIGHT
          ======================================================== */}
      <section id="voice-tutor" className="relative py-20 border-t border-white/10 bg-gradient-to-b from-[#07090e] via-slate-950 to-[#07090e]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-cyan-950/20 to-indigo-950/40 p-8 sm:p-12 backdrop-blur-2xl shadow-2xl relative">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-[100px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
                  <Mic size={14} className="text-cyan-400 animate-pulse" />
                  <span>Interactive Audio Classroom</span>
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                  Meet Your 24/7 Multilingual AI Voice Tutor
                </h2>

                <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                  Learn like you are having a conversation with a patient, expert human teacher. The Voice Tutor explains complex topics step-by-step with real-world analogies, answers follow-up queries, tests your comprehension, and speaks in your native language.
                </p>

                {/* Multilingual Flag Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {[
                    "🇺🇸 English",
                    "🇮🇳 हिन्दी",
                    "🇮🇳 Hinglish",
                    "🇮🇳 বাংলা",
                    "🇮🇳 தமிழ்",
                    "🇮🇳 తెలుగు",
                    "🇮🇳 मराठी",
                    "🇪🇸 Español",
                    "🇫🇷 Français",
                  ].map((lang) => (
                    <span
                      key={lang}
                      className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs font-semibold text-slate-300"
                    >
                      {lang}
                    </span>
                  ))}
                </div>

                {/* Pedagogical Feature Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
                    <span>Beginner, Intermediate & Advanced levels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
                    <span>Interrupt tutor anytime & ask follow-ups</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
                    <span>0.8x, 1.0x, 1.25x speaking speed control</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
                    <span>Instant microphone speech-to-text</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:scale-105"
                  >
                    <Mic size={16} />
                    <span>Start Voice Lesson Free</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Right Voice Tutor Audio Visualizer Preview */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                        <Volume2 size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Voice Tutor Active</div>
                        <div className="text-[10px] text-emerald-400 font-semibold">Speaking in Hinglish</div>
                      </div>
                    </div>
                    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                      LIVE
                    </span>
                  </div>

                  {/* Simulated Waveform */}
                  <div className="flex items-center justify-center gap-1.5 h-16 py-2">
                    {[40, 75, 55, 90, 60, 100, 70, 85, 45, 95, 65, 80, 50, 90, 60, 40].map(
                      (h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className="w-1.5 rounded-full bg-gradient-to-t from-cyan-500 to-indigo-500 animate-pulse"
                        />
                      )
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-3.5 text-xs text-slate-300 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-cyan-400">Sample Explanation</span>
                    <p className="leading-relaxed text-[11px] text-slate-300">
                      "Dosto, Simple shabdon me kahein toh: Supervised learning me model ko questions aur answers dono diye jaate hain taaki wo pattern seekh sake..."
                    </p>
                  </div>
                </div>
              </div>
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
              Replace fragmented study tools with a single unified, intelligent cognition engine.
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
                desc: "Hands-free voice conversations in 9+ languages with intelligent conversational pedagogy and natural text-to-speech explanations.",
                icon: Mic,
                color: "text-purple-400",
                badge: "9+ Languages",
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
          ACADEMIC WORKFLOWS / STUDY MODES
          ======================================================== */}
      <section id="workflows" className="relative py-24 border-t border-white/10 bg-gradient-to-b from-[#07090e] via-slate-950 to-[#07090e]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300">
              <Compass size={14} className="text-cyan-400" />
              <span>Tailored Study Workflows</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Engineered for Every Academic Challenge
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-slate-400">
              Whether you have an exam tomorrow morning or a 50-page literature review due next week, EduMind AI adapts to your exact learning style.
            </p>
          </div>

          {/* Workflow Mode Tabs */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {[
              { id: "cram" as const, label: "⚡ Exam In 24 Hours", icon: Flame },
              { id: "research" as const, label: "🔬 Research & Thesis", icon: BookOpen },
              { id: "commute" as const, label: "🎙️ Audio & Commute", icon: Mic },
              { id: "visual" as const, label: "🗺️ Visual Concept Map", icon: Network },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = selectedPersona === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedPersona(tab.id)}
                  className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 scale-[1.02]"
                      : "border border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <TabIcon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Workflow Details Card */}
          <div className="mt-8 rounded-3xl border border-white/15 bg-slate-900/70 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
            {selectedPersona === "cram" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-300">
                    <Flame size={12} />
                    <span>Emergency Cram Protocol (Pareto 80/20 Rule)</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Master 400 Pages in an Afternoon Without Burnout
                  </h3>
                  <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                    <p className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px]">✕</span>
                      <span><strong className="text-white">The Traditional Flaw:</strong> Spending 12 hours highlighting every paragraph until fatigue ruins exam-day recall.</span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">✓</span>
                      <span><strong className="text-white">The EduMind Solution:</strong> Automatic semantic extraction isolates top 20% high-yield concepts that drive 80% of exam questions. Produces hour-by-hour milestones with instant active-recall flashcards.</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                      <div className="text-xs font-semibold text-slate-400">Preparation Time</div>
                      <div className="text-lg font-bold text-cyan-400">4 Hours vs 20 Hours</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                      <div className="text-xs font-semibold text-slate-400">Exam Recall Rate</div>
                      <div className="text-lg font-bold text-emerald-400">+88% Long-Term</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-2xl border border-amber-500/20 bg-slate-950/80 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <CalendarRange size={14} className="text-amber-400" />
                      1-Day Exam Cram Schedule
                    </span>
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      High Yield
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
                      <span className="text-slate-300">09:00 - 10:30 • Core Proofs & Theorems</span>
                      <span className="text-emerald-400 font-semibold">Priority 1</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
                      <span className="text-slate-300">11:00 - 12:30 • 3D Active Flashcard Drills</span>
                      <span className="text-cyan-400 font-semibold">45 Cards</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
                      <span className="text-slate-300">14:00 - 15:30 • High-Frequency Practice Quiz</span>
                      <span className="text-purple-400 font-semibold">15 Questions</span>
                    </div>
                  </div>
                  <Link
                    to="/register"
                    className="block w-full text-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.01] transition"
                  >
                    Generate Cram Schedule Free →
                  </Link>
                </div>
              </div>
            )}

            {selectedPersona === "research" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-300">
                    <BookOpen size={12} />
                    <span>Academic Literature & Thesis Synthesis</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Compare Multiple Research Papers with Mathematical Rigor
                  </h3>
                  <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                    <p className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px]">✕</span>
                      <span><strong className="text-white">The Traditional Flaw:</strong> Skimming 15 PDFs with conflicting terminology and losing track of exact citations for your bibliography.</span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">✓</span>
                      <span><strong className="text-white">The EduMind Solution:</strong> Cross-document RAG indexes methodologies, mathematical models, and datasets. Every assertion is anchored to exact page coordinates with cosine vector similarity.</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                      <div className="text-xs font-semibold text-slate-400">Citation Confidence</div>
                      <div className="text-lg font-bold text-blue-400">99.8% Grounded</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                      <div className="text-xs font-semibold text-slate-400">Literature Synthesis</div>
                      <div className="text-lg font-bold text-emerald-400">10x Speedup</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-2xl border border-blue-500/20 bg-slate-950/80 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <FileText size={14} className="text-blue-400" />
                      Cross-Paper Citation Anchor
                    </span>
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                      Cosine 0.94
                    </span>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3 space-y-2 text-xs">
                    <div className="text-[11px] font-semibold text-cyan-300">Query: Comparative Loss Functions</div>
                    <p className="text-slate-300 leading-relaxed italic">
                      "Cross-entropy converges 2.4x faster on sparse distributions when regularized with Dirichlet priors [Page 14, Sec 3.2]."
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-white/5">
                      <span>Ref: Vaswani et al. • Vector Conf 96%</span>
                      <span className="text-emerald-400 font-medium">Verified Source</span>
                    </div>
                  </div>
                  <Link
                    to="/register"
                    className="block w-full text-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.01] transition"
                  >
                    Upload Research Papers Free →
                  </Link>
                </div>
              </div>
            )}

            {selectedPersona === "commute" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[11px] font-semibold text-purple-300">
                    <Mic size={12} />
                    <span>Multilingual Conversational Audio Tutor</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Turn Transit Time Into An Interactive Audio Lecture
                  </h3>
                  <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                    <p className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px]">✕</span>
                      <span><strong className="text-white">The Traditional Flaw:</strong> Wasting 1–2 hours daily commuting on crowded trains/buses where reading small textbook fonts causes headaches.</span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">✓</span>
                      <span><strong className="text-white">The EduMind Solution:</strong> Put on your earphones. Your AI tutor explains complex topics naturally in English, Hindi, Hinglish, Bengali, Tamil, Spanish, or French with real-life analogies.</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                      <div className="text-xs font-semibold text-slate-400">Supported Languages</div>
                      <div className="text-lg font-bold text-purple-400">9+ Dialects</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                      <div className="text-xs font-semibold text-slate-400">Audio Latency</div>
                      <div className="text-lg font-bold text-cyan-400">Sub-Second Stream</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-2xl border border-purple-500/20 bg-slate-950/80 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Volume2 size={14} className="text-purple-400" />
                      Live Audio Tutor Player
                    </span>
                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                      Hinglish • 1.25x
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 py-4">
                    {[40, 75, 55, 90, 65, 80, 45, 95, 70, 50, 85, 60, 40].map((h, i) => (
                      <span
                        key={i}
                        className="w-1.5 rounded-full bg-gradient-to-t from-purple-500 to-cyan-400 animate-pulse"
                        style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 italic text-center">
                    "Dekho, Backpropagation basically chain rule ka practical form hai..."
                  </p>
                  <Link
                    to="/register"
                    className="block w-full text-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.01] transition"
                  >
                    Try Audio Voice Tutor Free →
                  </Link>
                </div>
              </div>
            )}

            {selectedPersona === "visual" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                    <Network size={12} />
                    <span>Hierarchical Knowledge Graph</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Connect Hidden Links Between Disparate Concepts
                  </h3>
                  <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                    <p className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px]">✕</span>
                      <span><strong className="text-white">The Traditional Flaw:</strong> Linear book reading obscures prerequisites and cross-chapter dependencies, leading to rote memorization.</span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">✓</span>
                      <span><strong className="text-white">The EduMind Solution:</strong> An interactive node map clusters concepts into parent-child graphs. Click any node to drill straight into the exact textbook page and definition.</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                      <div className="text-xs font-semibold text-slate-400">Comprehension Depth</div>
                      <div className="text-lg font-bold text-emerald-400">3.4x Faster Retention</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                      <div className="text-xs font-semibold text-slate-400">Interactive Nodes</div>
                      <div className="text-lg font-bold text-cyan-400">Full Graph Drill-Down</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-2xl border border-emerald-500/20 bg-slate-950/80 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Network size={14} className="text-emerald-400" />
                      Dynamic Topic Clusters
                    </span>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      12 Connected Nodes
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-2.5">
                      <span className="font-bold text-cyan-300">Neural Architecture (Root)</span>
                      <span className="text-[10px] text-slate-400">3 Sub-branches</span>
                    </div>
                    <div className="pl-4 space-y-1.5 border-l-2 border-white/10 ml-3">
                      <div className="flex items-center justify-between rounded-lg bg-slate-900/60 p-2 text-slate-300">
                        <span>├── Activation Functions (ReLU, GELU)</span>
                        <span className="text-[10px] text-emerald-400">Cited P. 48</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-slate-900/60 p-2 text-slate-300">
                        <span>└── Gradient Optimization (AdamW)</span>
                        <span className="text-[10px] text-emerald-400">Cited P. 62</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/register"
                    className="block w-full text-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.01] transition"
                  >
                    Explore Mind Maps Free →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          STUDY VELOCITY & TIME RECLAIM CALCULATOR
          ======================================================== */}
      <section id="calculator" className="relative py-20 border-t border-white/10 bg-gradient-to-b from-slate-950 to-[#07090e]">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300">
              <Sliders size={14} className="text-emerald-400" />
              <span>Interactive Study Velocity Calculator</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              How Many Hours Will You Save This Semester?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
              Drag the slider to your syllabus page count and see the immediate cognitive time reclaim.
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-white/15 bg-slate-900/80 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl space-y-8">
            {/* Slider Control */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-slate-300">
                  Total Pages in Your Study Material:
                </span>
                <span className="text-xl sm:text-2xl font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1 rounded-xl">
                  {pagesToStudy} Pages
                </span>
              </div>

              <input
                type="range"
                min={20}
                max={800}
                step={10}
                value={pagesToStudy}
                onChange={(e) => setPagesToStudy(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              {/* Preset Quick Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 font-medium mr-1">Presets:</span>
                {[
                  { label: "50 Pages (Slides)", val: 50 },
                  { label: "150 Pages (Unit Exam)", val: 150 },
                  { label: "350 Pages (Textbook)", val: 350 },
                  { label: "600 Pages (Semester Syllabi)", val: 600 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setPagesToStudy(preset.val)}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                      pagesToStudy === preset.val
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                        : "border-white/10 bg-slate-950/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-5 text-center space-y-1">
                <div className="text-[11px] font-semibold text-rose-400">Traditional Reading Time</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  ~{Math.round((pagesToStudy * 4.5) / 60)} hrs
                </div>
                <div className="text-[10px] text-slate-400">At standard 250 wpm with manual note taking</div>
              </div>

              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 text-center space-y-1">
                <div className="text-[11px] font-semibold text-cyan-400">With EduMind AI RAG</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  ~{Math.max(1, Math.round((pagesToStudy * 0.7) / 60))} hrs
                </div>
                <div className="text-[10px] text-cyan-300/80">Guided active recall with exact page citations</div>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center space-y-1">
                <div className="text-[11px] font-semibold text-emerald-400">Time Saved For You</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
                  ~{Math.round((pagesToStudy * 3.8) / 60)} hrs
                </div>
                <div className="text-[10px] text-emerald-400/80">Reclaim your sleep & weekend freedom</div>
              </div>
            </div>

            {/* Auto-Generated Deliverables Preview */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <div className="text-xs font-bold text-white mb-3">
                Deliverables automatically generated for your {pagesToStudy} pages:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <div className="text-base font-extrabold text-cyan-400">
                    {Math.round(pagesToStudy * 0.35)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">3D Flashcards</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <div className="text-base font-extrabold text-purple-400">
                    {Math.round(pagesToStudy * 0.12)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Mind Map Nodes</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <div className="text-base font-extrabold text-emerald-400">
                    {Math.round(pagesToStudy * 1.8)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Verified Citations</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                  <div className="text-base font-extrabold text-amber-400">100%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Free & Instant</div>
                </div>
              </div>
            </div>

            {/* Direct CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 text-center sm:text-left">
                Ready to transform your study routine? Upload your first document now.
              </div>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition"
              >
                <span>Generate My Study Plan Free</span>
                <ArrowRight size={15} />
              </Link>
            </div>
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
      <section className="relative overflow-hidden border-t border-white/10 py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-950/40 via-slate-950 to-indigo-950/40" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-cyan-500/20 blur-[130px]" />

        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8 relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 shadow-sm">
            <Sparkles size={14} />
            <span>100% Free & Open Academic Platform</span>
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-6xl">
            Ready to Ace Your Next Exam Without the Stress?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-300">
            Transform your syllabus into actionable mastery. Upload your textbooks or lecture notes in seconds and experience zero-hallucination, vector-grounded active recall.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="group flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-9 py-4 text-base font-bold text-white shadow-xl shadow-cyan-500/30 transition hover:scale-105 hover:shadow-cyan-500/50"
            >
              <Sparkles size={18} />
              <span>Get Started Free — No Credit Card Needed</span>
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
                <li><a href="#voice-tutor" className="hover:text-white">Multilingual Voice Tutor</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white">Study Guides</a></li>
                <li><a href="#interactive-demo" className="hover:text-white">Platform Preview</a></li>
                <li><a href="#faq" className="hover:text-white">Frequently Asked Questions</a></li>
                <li><Link to="/register" className="hover:text-white">Student Sign Up</Link></li>
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
              <span>Architected with passion by <strong className="text-white">Devender</strong> & <strong className="text-white">Harsh Roy</strong></span>
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