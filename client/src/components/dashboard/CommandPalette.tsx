import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  MessageSquare,
  Layers,
  Brain,
  Bookmark,
  CalendarRange,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDocuments, type DocumentItem } from "../../api/document.api";
import { getBookmarks, type BookmarkItem } from "../../api/bookmark.api";
import { getNotes, type NoteItem } from "../../api/notes.api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument?: (doc: DocumentItem) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectDocument,
}: Props) {
  const [query, setQuery] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      getDocuments().then(setDocuments).catch(() => {});
      getBookmarks().then(setBookmarks).catch(() => {});
      getNotes().then(setNotes).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredBookmarks = bookmarks.filter((b) =>
    b.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-20 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900 via-slate-950 to-[#07090e] p-5 shadow-2xl backdrop-blur-2xl">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-white/10 pb-4">
          <Search size={18} className="text-cyan-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, AI notes, bookmarks, flashcards... (Esc to close)"
            className="w-full bg-transparent pl-3 pr-8 text-sm text-white outline-none placeholder:text-slate-500"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 space-y-4 overflow-y-auto pt-4">
          {/* Quick Actions */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Quick Navigation
            </span>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                onClick={() => {
                  navigate("/dashboard");
                  onClose();
                }}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-2.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/40 hover:bg-slate-900 hover:text-white"
              >
                <Sparkles size={14} className="text-cyan-400" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  navigate("/chat");
                  onClose();
                }}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-2.5 text-xs font-semibold text-slate-300 transition hover:border-blue-400/40 hover:bg-slate-900 hover:text-white"
              >
                <MessageSquare size={14} className="text-blue-400" />
                <span>AI Chat</span>
              </button>

              <button
                onClick={() => {
                  navigate("/planner");
                  onClose();
                }}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-2.5 text-xs font-semibold text-slate-300 transition hover:border-amber-400/40 hover:bg-slate-900 hover:text-white"
              >
                <CalendarRange size={14} className="text-amber-400" />
                <span>Study Planner</span>
              </button>

              <button
                onClick={() => {
                  navigate("/analytics");
                  onClose();
                }}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-2.5 text-xs font-semibold text-slate-300 transition hover:border-purple-400/40 hover:bg-slate-900 hover:text-white"
              >
                <Brain size={14} className="text-purple-400" />
                <span>Analytics</span>
              </button>
            </div>
          </div>

          {/* Documents Section */}
          {filteredDocs.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Documents ({filteredDocs.length})
              </span>
              <div className="mt-2 space-y-1.5">
                {filteredDocs.slice(0, 4).map((doc) => (
                  <div
                    key={doc._id}
                    onClick={() => {
                      onSelectDocument?.(doc);
                      onClose();
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 p-2.5 transition hover:border-cyan-500/30 hover:bg-slate-900/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText size={15} className="text-cyan-400" />
                      <span className="text-xs font-medium text-white">
                        {doc.title}
                      </span>
                    </div>
                    <ArrowRight size={13} className="text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {filteredNotes.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                AI Notes ({filteredNotes.length})
              </span>
              <div className="mt-2 space-y-1.5">
                {filteredNotes.slice(0, 3).map((note) => (
                  <div
                    key={note._id}
                    onClick={() => {
                      navigate("/dashboard");
                      onClose();
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 p-2.5 transition hover:border-blue-500/30 hover:bg-slate-900/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers size={15} className="text-blue-400" />
                      <div>
                        <span className="text-xs font-medium text-white">
                          {note.title}
                        </span>
                        <span className="ml-2 rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-300">
                          {note.noteType}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookmarks Section */}
          {filteredBookmarks.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Bookmarks ({filteredBookmarks.length})
              </span>
              <div className="mt-2 space-y-1.5">
                {filteredBookmarks.slice(0, 3).map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 p-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bookmark size={15} className="text-amber-400" />
                      <span className="text-xs font-medium text-white">
                        {b.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">{b.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredDocs.length === 0 &&
            filteredNotes.length === 0 &&
            filteredBookmarks.length === 0 && (
              <p className="py-8 text-center text-xs text-slate-500">
                No matching results found for &quot;{query}&quot;.
              </p>
            )}
        </div>
      </div>
    </div>
  );
}
