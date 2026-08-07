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

  const handleDocumentSelect = async (doc: DocumentItem) => {
    setSelectedDocument(doc);
    try {
      const conv = await createConversation(doc._id, doc.title);
      setSelectedConversation(conv);
    } catch (err) {
      console.error("Failed creating conversation:", err);
    }
  };

  const handleConversationSelect = (conv: Conversation) => {
    setSelectedConversation(conv);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600/10 p-2.5 text-blue-400 ring-1 ring-blue-500/20">
              <MessageSquare size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Study Tutor & Chat</h1>
              <p className="text-xs text-zinc-400">
                Ask questions, clarify concepts, and get instant citations from your documents.
              </p>
            </div>
          </div>

          {selectedDocument && (
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-1.5 text-xs text-zinc-300">
              <Sparkles size={14} className="text-blue-400" />
              <span>Active Context: <strong className="text-white">{selectedDocument.title}</strong></span>
            </div>
          )}
        </div>

        {/* Chat Layout Grid */}
        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-12">
          {/* Documents & Sessions Sidebars */}
          <div className="space-y-6 2xl:col-span-4">
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
          <div className="2xl:col-span-8">
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
