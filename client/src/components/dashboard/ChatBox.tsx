
import { useEffect, useRef, useState } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Copy,
  Check,
  FileText,
  Mic,
  Bookmark,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { askAI } from "../../api/chat.api";
import { getMessages, type Conversation } from "../../api/conversation.api";
import { createBookmark } from "../../api/bookmark.api";
import type { DocumentItem } from "../../api/document.api";
import VoiceTutorModal from "./VoiceTutorModal";

interface ChatBoxProps {
  document: DocumentItem | null;
  conversation: Conversation | null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export default function ChatBox({
  document,
  conversation,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [bookmarkedId, setBookmarkedId] = useState("");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!conversation) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "👋 Select or upload a PDF document and ask any question to get zero-hallucination, verified answers.",
        },
      ]);
      return;
    }

    loadMessages();
  }, [conversation]);

  const loadMessages = async () => {
    try {
      if (!conversation) return;

      const history = await getMessages(conversation._id);

      if (history.length === 0) {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: `📄 **${document?.title || "Document"}** selected.\n\nAsk me anything! All answers are strictly grounded in your uploaded text.`,
          },
        ]);
        return;
      }

      setMessages(
        history.map((msg: any) => ({
          id: msg._id,
          role: msg.role,
          content: msg.message,
          sources: msg.sources || [],
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("Unable to load chat messages.");
    }
  };

  const copyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 2000);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Copy failed");
    }
  };

  const bookmarkAnswer = async (id: string, text: string) => {
    try {
      await createBookmark({
        documentId: document?._id,
        type: "answer",
        title: question || "Important AI Explanation",
        content: text.substring(0, 400),
        metadata: { messageId: id },
      });
      setBookmarkedId(id);
      setTimeout(() => setBookmarkedId(""), 2500);
      toast.success("Saved to Bookmarks!");
    } catch {
      toast.error("Failed to bookmark answer.");
    }
  };

  const typeMessage = async (fullText: string, sources: string[] = []) => {
    let current = "";
    const aiId = Date.now().toString();

    setMessages((prev) => [
      ...prev,
      {
        id: aiId,
        role: "assistant",
        content: "",
        sources: [],
      },
    ]);

    const words = fullText.split(" ");
    for (let i = 0; i < words.length; i++) {
      current += words[i] + " ";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiId
            ? {
                ...msg,
                content: current,
                sources: i === words.length - 1 ? sources : [],
              }
            : msg
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 14));
    }
  };

  const sendMessage = async () => {
    const text = question.trim();
    if (!text) return;

    if (!conversation) {
      toast.error("Select a document first.");
      return;
    }

    const tempUserId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: tempUserId,
      role: "user",
      content: text,
      sources: [],
    };

    // Optimistically show user message immediately
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");

    try {
      setLoading(true);
      const res = await askAI({
        question: text,
        conversationId: conversation?._id,
        documentId: document?._id,
      });

      await typeMessage(res.answer, res.sources || []);
      await loadMessages();
    } catch (err: any) {
      console.error("Chat error:", err);
      const isTimeout = err?.code === "ECONNABORTED" || err?.message?.includes("timeout");
      const errorMsg = isTimeout
        ? "AI took longer than usual to respond. Please retry."
        : (err?.response?.data?.message || "AI request failed. Please try again.");
      
      toast.error(errorMsg);

      // Add a helpful assistant error message in chat timeline
      const errorBubble: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ **Request Notice**: ${errorMsg}\n\n*Tip: Check if your AI engine is processing large document chunks.*`,
        sources: [],
      };
      setMessages((prev) => [...prev, errorBubble]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <div className="flex h-[720px] flex-col rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Sparkles className="text-cyan-400" size={20} />
              Zero-Hallucination AI Chat
            </h2>
            {document && (
              <div className="mt-1 flex items-center gap-2 text-xs text-cyan-300">
                <FileText size={14} />
                <span className="truncate max-w-sm">{document.title}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsVoiceOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-300 shadow-md shadow-cyan-500/10 transition hover:bg-cyan-500/20 active:scale-95"
          >
            <Mic size={14} className="animate-pulse text-cyan-400" />
            <span>Voice Tutor</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-4 shadow-xl backdrop-blur-xl ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    : "border border-white/10 bg-slate-950/70 text-slate-200"
                }`}
              >
                {/* Top Action Header */}
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {msg.role === "assistant" ? (
                      <div className="rounded-lg bg-cyan-500/20 p-1 text-cyan-400">
                        <Bot size={15} />
                      </div>
                    ) : (
                      <div className="rounded-lg bg-white/20 p-1 text-white">
                        <User size={15} />
                      </div>
                    )}
                    <span className="text-xs font-bold">
                      {msg.role === "assistant" ? "EduMind RAG" : "You"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => bookmarkAnswer(msg.id, msg.content)}
                        title="Bookmark Answer"
                        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-amber-300"
                      >
                        {bookmarkedId === msg.id ? (
                          <Check size={14} className="text-amber-400" />
                        ) : (
                          <Bookmark size={14} />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => copyMessage(msg.id, msg.content)}
                      title="Copy content"
                      className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    >
                      {copiedId === msg.id ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Markdown Content */}
                <div className="prose prose-invert max-w-none text-xs leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* Grounded Sources & Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 border-t border-white/10 pt-3">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                      📑 Grounded Document Citations ({msg.sources.length})
                    </p>
                    <div className="space-y-1.5">
                      {msg.sources.map((source, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5 text-[11px] text-slate-300"
                        >
                          <span className="font-mono text-[9px] text-cyan-400 mr-2">
                            [Citation #{index + 1}]
                          </span>
                          {source.length > 200
                            ? source.substring(0, 200) + "..."
                            : source}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-cyan-400 font-medium p-2">
              <Loader2 className="animate-spin" size={16} />
              <span>Scanning document vectors and generating grounded response...</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex gap-2">
            <textarea
              rows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!conversation || loading}
              placeholder={
                document
                  ? "Ask any question about this document..."
                  : "Select a document first..."
              }
              className="flex-1 resize-none rounded-2xl border border-white/10 bg-slate-950/70 p-3.5 text-xs text-white outline-none transition focus:border-cyan-500 disabled:opacity-50"
            />

            <button
              onClick={sendMessage}
              disabled={loading || !conversation || !question.trim()}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
            <span>
              Press <b className="text-slate-400">Enter</b> to send,{" "}
              <b className="text-slate-400">Shift + Enter</b> for a newline.
            </span>
            <span className="text-cyan-400/80">⚡ 100% Grounded Context</span>
          </div>
        </div>
      </div>

      {/* Voice Tutor Modal */}
      <VoiceTutorModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        document={document}
      />
    </>
  );
}