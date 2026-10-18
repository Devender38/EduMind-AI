import { useState } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import ConversationSidebar from "../components/dashboard/ConversationSidebar";
import DocumentList from "../components/dashboard/DocumentList";
import ChatBox from "../components/dashboard/ChatBox";
import { createConversation, type Conversation } from "../api/conversation.api";
import { type DocumentItem } from "../api/document.api";

export default function ChatPage() {
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [refreshKey] = useState(0);
  const [mobileTab, setMobileTab] = useState<"chat" | "docs">("chat");

  const handleDocumentSelect = async (doc: DocumentItem) => {
    setSelectedDocument(doc);
    setMobileTab("chat");
    try {
      const conv = await createConversation(doc._id, doc.title);
      setSelectedConversation(conv);
    } catch (err) {
      console.error("Failed creating conversation:", err);
    }
  };

  const handleConversationSelect = (conv: Conversation) => {
    setSelectedConversation(conv);
    setMobileTab("chat");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600/10 p-2.5 text-blue-400 ring-1 ring-blue-500/20 shrink-0">
              <MessageSquare size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">AI Study Tutor & Chat</h1>
              <p className="text-xs text-zinc-400">
                Ask questions, clarify concepts, and get instant citations from your documents.
              </p>
            </div>
          </div>

          {selectedDocument && (
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-1.5 text-xs text-zinc-300 shrink-0">
              <Sparkles size={14} className="text-blue-400" />
              <span className="truncate max-w-[200px]">Active: <strong className="text-white">{selectedDocument.title}</strong></span>
            </div>
          )}
        </div>

        {/* Mobile View Switcher (Visible only on phone/tablet screens) */}
        <div className="flex 2xl:hidden rounded-2xl border border-white/10 bg-slate-900/80 p-1 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setMobileTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition ${
              mobileTab === "chat"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <MessageSquare size={14} />
            <span>AI Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("docs")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition ${
              mobileTab === "docs"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Documents & History</span>
          </button>
        </div>

        {/* Chat Layout Grid */}
        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-12">
          {/* Documents & Sessions Sidebars */}
          <div className={`space-y-6 2xl:col-span-4 ${mobileTab === "docs" ? "block" : "hidden 2xl:block"}`}>
            <DocumentList
              refreshKey={refreshKey}
              selectedDocument={selectedDocument}
              onSelect={handleDocumentSelect}
            />
            <ConversationSidebar
              refreshKey={refreshKey}
              selectedConversation={selectedConversation}
              onSelect={handleConversationSelect}
            />
          </div>

          {/* Main Full Chat Box */}
          <div className={`2xl:col-span-8 ${mobileTab === "chat" ? "block" : "hidden 2xl:block"}`}>
            <ChatBox
              document={selectedDocument}
              conversation={selectedConversation}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
