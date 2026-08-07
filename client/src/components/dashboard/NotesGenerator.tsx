import { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Bookmark,
  Download,
  GraduationCap,
  Zap,
  ListOrdered,
  Layers,
  BookOpen,
  Printer,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";

import {
  generateNotes,
  getNotes,
  type NoteItem,
} from "../../api/notes.api";
import { createBookmark } from "../../api/bookmark.api";
import type { DocumentItem } from "../../api/document.api";

interface Props {
  document: DocumentItem | null;
}

type NoteType = "detailed" | "exam" | "revision" | "one_page" | "bullet";

export default function NotesGenerator({ document }: Props) {
  const [selectedType, setSelectedType] = useState<NoteType>("detailed");
  const [loading, setLoading] = useState(false);
  const [currentNote, setCurrentNote] = useState<NoteItem | null>(null);
  const [savedNotes, setSavedNotes] = useState<NoteItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (document?._id) {
      loadSavedNotes();
    } else {
      setCurrentNote(null);
      setSavedNotes([]);
    }
  }, [document?._id]);

  const loadSavedNotes = async () => {
    if (!document?._id) return;
    try {
      const notes = await getNotes(document._id);
      setSavedNotes(notes);
      if (notes.length > 0) {
        setCurrentNote(notes[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (typeToGenerate?: NoteType) => {
    if (!document?._id) {
      toast.error("Please select a document first.");
      return;
    }

    const type = typeToGenerate || selectedType;
    try {
      setLoading(true);
      const note = await generateNotes(document._id, type);
      setCurrentNote(note);
      setSavedNotes((prev) => [note, ...prev.filter((n) => n._id !== note._id)]);
      toast.success(`${type.toUpperCase()} notes synthesized! ✨`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate notes.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentNote?.content) return;
    navigator.clipboard.writeText(currentNote.content);
    setCopied(true);
    toast.success("Notes copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = async () => {
    if (!currentNote) return;
    try {
      await createBookmark({
        documentId: document?._id,
        type: "note",
        title: currentNote.title,
        content: currentNote.content.substring(0, 300) + "...",
        metadata: { noteId: currentNote._id, noteType: currentNote.noteType },
      });
      setIsBookmarked(true);
      toast.success("Saved to your Bookmarks collection!");
    } catch {
      toast.error("Failed to bookmark note.");
    }
  };

  const handleExportMarkdown = () => {
    if (!currentNote) return;
    const blob = new Blob([currentNote.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${currentNote.title.toLowerCase().replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Markdown file downloaded.");
  };

  const handlePrint = () => {
    window.print();
  };

  const noteTypes: { id: NoteType; label: string; icon: any; desc: string }[] = [
    {
      id: "detailed",
      label: "Class Lecture Notes",
      icon: BookOpen,
      desc: "Full textbook-grade lecture notes & theoretical background",
    },
    {
      id: "exam",
      label: "High-Yield Exam Notes",
      icon: GraduationCap,
      desc: "Must-know formulas, likely exam questions & traps",
    },
    {
      id: "revision",
      label: "Rapid Revision Sprint",
      icon: Zap,
      desc: "Active recall summaries & comparison matrices",
    },
    {
      id: "one_page",
      label: "One-Page Cheat Sheet",
      icon: Layers,
      desc: "Condensed high-density 1-page summary",
    },
    {
      id: "bullet",
      label: "Hierarchical Bullets",
      icon: ListOrdered,
      desc: "Structured nested bullet outline",
    },
  ];

  if (!document) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center backdrop-blur-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
          <FileText size={32} />
        </div>
        <h3 className="mt-4 text-base font-bold text-white">Select a Document</h3>
        <p className="mt-1 max-w-sm text-xs text-slate-400">
          Select a document from your library to generate lecture-grade notes, exam cheat sheets, and active recall guides.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Note Type Selector Bar */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-2xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="text-cyan-400" size={18} />
              AI Notes Generator
            </h2>
            <p className="text-xs text-slate-400">
              Select a format to synthesize structured academic notes.
            </p>
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={15} />
            ) : (
              <Sparkles size={15} />
            )}
            <span>{loading ? "Synthesizing Notes..." : "Generate AI Notes"}</span>
          </button>
        </div>

        {/* Note Type Cards Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {noteTypes.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedType(t.id);
                  if (savedNotes.some((n) => n.noteType === t.id)) {
                    setCurrentNote(
                      savedNotes.find((n) => n.noteType === t.id) || null
                    );
                  } else {
                    handleGenerate(t.id);
                  }
                }}
                className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all ${
                  isSelected
                    ? "border-cyan-500/50 bg-gradient-to-b from-cyan-950/60 to-slate-900 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                    : "border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-slate-900/60"
                }`}
              >
                <div
                  className={`rounded-xl p-2 ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "bg-slate-900 text-slate-400"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <span
                  className={`mt-2 text-xs font-bold ${
                    isSelected ? "text-cyan-200" : "text-white"
                  }`}
                >
                  {t.label}
                </span>
                <span className="mt-0.5 line-clamp-2 text-[10px] text-slate-400">
                  {t.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Viewer */}
      {loading ? (
        <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center backdrop-blur-2xl">
          <Loader2 className="animate-spin text-cyan-400" size={36} />
          <h4 className="mt-4 text-sm font-bold text-white">
            Extracting Deep Concepts & Formulas...
          </h4>
          <p className="mt-1 text-xs text-slate-400">
            Synthesizing zero-hallucination {selectedType} notes from{" "}
            {document.title}.
          </p>
        </div>
      ) : currentNote ? (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-2xl">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/60 px-6 py-3.5">
            <div>
              <h3 className="text-sm font-bold text-white">{currentNote.title}</h3>
              <p className="text-[10px] text-slate-400">
                Type: {currentNote.noteType.toUpperCase()} • Created:{" "}
                {new Date(currentNote.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                {copied ? (
                  <Check size={13} className="text-emerald-400" />
                ) : (
                  <Copy size={13} />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={handleBookmark}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  isBookmarked
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                    : "border-white/10 bg-slate-900 text-slate-300 hover:border-white/20 hover:text-white"
                }`}
              >
                <Bookmark size={13} />
                <span>{isBookmarked ? "Saved" : "Bookmark"}</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
              >
                <Download size={13} />
                <span>Export .MD</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                <Printer size={13} />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Markdown Content */}
          <div className="prose prose-invert max-w-none p-6 text-sm text-slate-200 leading-relaxed overflow-x-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {currentNote.content}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center backdrop-blur-2xl">
          <Sparkles className="text-cyan-400" size={32} />
          <h4 className="mt-3 text-sm font-bold text-white">No Notes Generated Yet</h4>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            Click &quot;Generate AI Notes&quot; above to synthesize lecture-grade notes for this document.
          </p>
          <button
            onClick={() => handleGenerate()}
            className="mt-4 rounded-2xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 transition hover:bg-cyan-500"
          >
            Synthesize Notes Now
          </button>
        </div>
      )}
    </div>
  );
}
