import { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  Search,
  Trash2,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  type Conversation,
  getConversations,
  deleteConversation,
} from "../../api/conversation.api";

interface Props {
  refreshKey: number;
  selectedConversation: Conversation | null;
  onSelect: (
    conversation: Conversation
  ) => void;
}

export default function ConversationSidebar({
  refreshKey,
  selectedConversation,
  onSelect,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadConversations();
  }, [refreshKey]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load conversations.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    e: React.MouseEvent,
    id: string
  ) => {
    e.stopPropagation();

    if (!window.confirm("Delete this conversation?")) return;

    try {
      await deleteConversation(id);
      toast.success("Conversation deleted.");
      setConversations((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch {
      toast.error("Delete failed.");
    }
  };

  const filtered = useMemo(() => {
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-2xl">
        <div className="flex h-36 flex-col items-center justify-center gap-3 text-blue-400">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-xs font-semibold text-slate-300">Loading Sessions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-[#07090e] p-6 shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            AI Threads
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
              {conversations.length}
            </span>
          </h2>
          <p className="text-[11px] text-slate-400">Previous Q&A sessions</p>
        </div>

        <span className="text-[11px] text-slate-500 font-medium">History</span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={14}
          className="absolute left-3.5 top-3 text-slate-400"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search threads..."
          className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-2.5 pl-9 pr-4 text-xs text-white outline-none transition focus:border-blue-500 focus:shadow-md focus:shadow-blue-500/10 placeholder:text-slate-500"
        />
      </div>

      {/* List */}
      <div className="max-h-[500px] space-y-2.5 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 p-8 text-center">
            <MessageSquare className="text-slate-500 animate-float" size={32} />
            <p className="mt-2 text-xs font-semibold text-slate-300">No chat threads</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Ask a question to begin a thread.</p>
          </div>
        ) : (
          filtered.map((conversation) => {
            const active = selectedConversation?._id === conversation._id;

            return (
              <div
                key={conversation._id}
                onClick={() => onSelect(conversation)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-3.5 transition-all duration-300 ${
                  active
                    ? "border-blue-500/50 bg-gradient-to-r from-blue-950/50 via-slate-900/80 to-indigo-950/50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30"
                    : "border-white/10 bg-slate-950/60 hover:border-blue-500/30 hover:bg-slate-900/60"
                }`}
              >
                {/* Active indicator */}
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-600" />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 overflow-hidden">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition ${
                        active
                          ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/40"
                          : "bg-slate-900 text-slate-400 group-hover:text-blue-400"
                      }`}
                    >
                      <MessageSquare size={18} />
                    </div>

                    <div className="overflow-hidden">
                      <h3
                        className={`truncate text-xs font-bold transition ${
                          active ? "text-blue-200" : "text-white group-hover:text-blue-300"
                        }`}
                      >
                        {conversation.title}
                      </h3>

                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Clock size={11} />
                        <span>{new Date(conversation.createdAt).toLocaleDateString()}</span>
                      </div>

                      {active && (
                        <div className="mt-2 flex items-center gap-1 text-[9px] font-semibold text-blue-400">
                          <Sparkles size={9} /> Active Session
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, conversation._id)}
                    title="Delete thread"
                    className="rounded-lg p-1.5 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}