import { useState } from "react";
import {
  MessageSquare,
  Layers,
  Brain,
  FileText,
  CalendarRange,
  Sparkles,
  Zap,
  GraduationCap,
  Network,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import Flashcards from "../components/dashboard/Flashcards";
import StatsCards from "../components/dashboard/StatsCards";
import UploadCard from "../components/dashboard/UploadCard";
import DocumentList from "../components/dashboard/DocumentList";
import ConversationSidebar from "../components/dashboard/ConversationSidebar";
import ChatBox from "../components/dashboard/ChatBox";
import SummaryCard from "../components/dashboard/SummaryCard";
import QuizCard from "../components/dashboard/QuizCard";
import StudyPlanner from "../components/dashboard/StudyPlanner";
import NotesGenerator from "../components/dashboard/NotesGenerator";
import MindMapVisualizer from "../components/dashboard/MindMapVisualizer";

import type { DocumentItem } from "../api/document.api";
import type { Conversation } from "../api/conversation.api";
import { createConversation } from "../api/conversation.api";

type StudyTab =
  | "chat"
  | "notes"
  | "mindmap"
  | "flashcards"
  | "quiz"
  | "summary"
  | "planner";

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<StudyTab>("chat");

  const [selectedDocument, setSelectedDocument] =
    useState<DocumentItem | null>(null);

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const refreshDashboard = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // ===============================
  // Upload Success
  // ===============================
  const handleUploadSuccess = async (document: DocumentItem) => {
    setSelectedDocument(document);

    try {
      const conversation = await createConversation(
        document._id,
        document.title
      );

      setSelectedConversation(conversation);
      refreshDashboard();
    } catch (err) {
      console.error("Failed creating conversation on upload:", err);
    }
  };

  // ===============================
  // Document Selected
  // ===============================
  const handleDocumentSelect = async (document: DocumentItem) => {
    setSelectedDocument(document);

    try {
      const conversation = await createConversation(
        document._id,
        document.title
      );

      setSelectedConversation(conversation);
    } catch (err) {
      console.error("Failed selecting document conversation:", err);
    }
  };

  // ===============================
  // Conversation Selected
  // ===============================
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setActiveTab("chat");
  };

  const tabs = [
    {
      id: "chat" as StudyTab,
      label: "AI Neural Chat",
      icon: MessageSquare,
      color: "text-blue-400",
      activeBg:
        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30",
    },
    {
      id: "notes" as StudyTab,
      label: "AI Notes",
      icon: FileText,
      color: "text-cyan-400",
      activeBg:
        "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30",
    },
    {
      id: "mindmap" as StudyTab,
      label: "Mind Map",
      icon: Network,
      color: "text-indigo-400",
      activeBg:
        "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30",
    },
    {
      id: "flashcards" as StudyTab,
      label: "3D Flashcards",
      icon: Layers,
      color: "text-cyan-400",
      activeBg:
        "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-600/30",
    },
    {
      id: "quiz" as StudyTab,
      label: "Practice Quiz",
      icon: Brain,
      color: "text-purple-400",
      activeBg:
        "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30",
    },
    {
      id: "summary" as StudyTab,
      label: "Deep Summary",
      icon: Sparkles,
      color: "text-emerald-400",
      activeBg:
        "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30",
    },
    {
      id: "planner" as StudyTab,
      label: "Study Planner",
      icon: CalendarRange,
      color: "text-amber-400",
      activeBg:
        "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Animated Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-indigo-950/40 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
                <Sparkles size={13} className="text-cyan-400 animate-pulse" />
                <span>AI Cognition Workspace Active</span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Welcome back,{" "}
                <span className="text-gradient-cyan">
                  {user?.name || "Student"}
                </span>{" "}
                ✨
              </h1>

              <p className="max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
                Your neural vectors and study memory are synchronized. Select a document below to chat with citations, drill 3D flashcards, explore interactive mind maps, or generate high-yield notes.
              </p>
            </div>

            {/* Quick Mode Switches */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab("chat")}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-slate-800 hover:text-white"
              >
                <Zap size={14} className="text-cyan-400" />
                <span>Ask AI</span>
              </button>

              <button
                onClick={() => setActiveTab("notes")}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-slate-800 hover:text-white"
              >
                <FileText size={14} className="text-cyan-400" />
                <span>AI Notes</span>
              </button>

              <button
                onClick={() => setActiveTab("mindmap")}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 backdrop-blur-xl transition hover:border-indigo-400/40 hover:bg-slate-800 hover:text-white"
              >
                <Network size={14} className="text-indigo-400" />
                <span>Mind Map</span>
              </button>

              <button
                onClick={() => setActiveTab("planner")}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 backdrop-blur-xl transition hover:bg-amber-500/20"
              >
                <GraduationCap size={14} className="text-amber-400" />
                <span>Exam Cram</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Live Stats */}
        <StatsCards refreshKey={refreshKey} />

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-12">
          {/* Left Panel: Upload + Document List */}
          <div className="space-y-6 2xl:col-span-3">
            <UploadCard onUploadSuccess={handleUploadSuccess} />
            <DocumentList
              refreshKey={refreshKey}
              selectedDocument={selectedDocument}
              onSelect={handleDocumentSelect}
            />
          </div>

          {/* Center-Left: Conversation Sidebar */}
          <div className="2xl:col-span-2">
            <ConversationSidebar
              refreshKey={refreshKey}
              selectedConversation={selectedConversation}
              onSelect={handleConversationSelect}
            />
          </div>

          {/* Right Main Interactive Work Area */}
          <div className="space-y-6 2xl:col-span-7">
            {/* Study Mode Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-900/80 p-2.5 shadow-xl backdrop-blur-2xl">
              <div className="flex flex-wrap items-center gap-1.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? `${tab.activeBg}`
                          : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {selectedDocument && (
                <div className="flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="max-w-[180px] truncate">
                    {selectedDocument.title}
                  </span>
                </div>
              )}
            </div>

            {/* Tab Views Container */}
            <div className="animate-in fade-in duration-300">
              {activeTab === "chat" && (
                <ChatBox
                  document={selectedDocument}
                  conversation={selectedConversation}
                />
              )}

              {activeTab === "notes" && (
                <NotesGenerator document={selectedDocument} />
              )}

              {activeTab === "mindmap" && (
                <MindMapVisualizer document={selectedDocument} />
              )}

              {activeTab === "flashcards" && (
                <Flashcards
                  key={selectedDocument?._id || "none"}
                  document={selectedDocument}
                />
              )}

              {activeTab === "quiz" && (
                <QuizCard
                  key={selectedDocument?._id || "none"}
                  document={selectedDocument}
                />
              )}

              {activeTab === "summary" && (
                <SummaryCard document={selectedDocument} />
              )}

              {activeTab === "planner" && (
                <StudyPlanner document={selectedDocument} />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}