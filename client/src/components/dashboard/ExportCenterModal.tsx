import { useState } from "react";
import {
  Download,
  FileText,
  Layers,
  Brain,
  X,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import type { DocumentItem } from "../../api/document.api";
import { getFlashcards } from "../../api/flashcard.api";
import { getQuiz } from "../../api/quiz.api";
import { getSummary } from "../../api/summary.api";
import { getNotes } from "../../api/notes.api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

export default function ExportCenterModal({
  isOpen,
  onClose,
  document,
}: Props) {
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!isOpen) return null;

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportFlashcardsAnki = async () => {
    if (!document?._id) return;
    try {
      setDownloading("cards");
      const res = await getFlashcards(document._id);
      const csvRows = res.flashcards.map(
        (c) => `"${c.question.replace(/"/g, '""')}","${c.answer.replace(/"/g, '""')}"`
      );
      const csvContent = "Front,Back\n" + csvRows.join("\n");
      downloadFile(
        csvContent,
        `${document.title.toLowerCase().replace(/\s+/g, "_")}_anki_deck.csv`,
        "text/csv"
      );
      toast.success("Anki-ready CSV exported successfully!");
    } catch {
      toast.error("Failed exporting flashcards.");
    } finally {
      setDownloading(null);
    }
  };

  const handleExportQuizJSON = async () => {
    if (!document?._id) return;
    try {
      setDownloading("quiz");
      const res = await getQuiz(document._id);
      downloadFile(
        JSON.stringify(res.quiz, null, 2),
        `${document.title.toLowerCase().replace(/\s+/g, "_")}_quiz.json`,
        "application/json"
      );
      toast.success("Practice Quiz JSON exported!");
    } catch {
      toast.error("Failed exporting quiz.");
    } finally {
      setDownloading(null);
    }
  };

  const handleExportSummaryMarkdown = async () => {
    if (!document?._id) return;
    try {
      setDownloading("summary");
      const res = await getSummary(document._id);
      downloadFile(
        res.summary,
        `${document.title.toLowerCase().replace(/\s+/g, "_")}_summary.md`,
        "text/markdown"
      );
      toast.success("Summary Markdown file exported!");
    } catch {
      toast.error("Failed exporting summary.");
    } finally {
      setDownloading(null);
    }
  };

  const handleExportNotes = async () => {
    if (!document?._id) return;
    try {
      setDownloading("notes");
      const notes = await getNotes(document._id);
      if (notes.length === 0) {
        toast.error("No notes found for this document.");
        return;
      }
      const combined = notes
        .map((n) => `# ${n.title}\n\n${n.content}\n\n---\n`)
        .join("\n");
      downloadFile(
        combined,
        `${document.title.toLowerCase().replace(/\s+/g, "_")}_all_notes.md`,
        "text/markdown"
      );
      toast.success("All notes exported into Markdown bundle!");
    } catch {
      toast.error("Failed exporting notes.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900 via-slate-950 to-[#07090e] p-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-2xl bg-cyan-500/20 p-2.5 text-cyan-400 ring-1 ring-cyan-500/30">
              <Download size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Universal Export Center</h3>
              <p className="text-xs text-slate-400">
                {document ? `Document: ${document.title}` : "Select a document to export"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Options Grid */}
        <div className="mt-5 space-y-3">
          {/* Export Flashcards */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-cyan-500/30">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400">
                <Layers size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">3D Flashcards (Anki CSV)</h4>
                <p className="text-[11px] text-slate-400">
                  Ready for direct import into Anki, Quizlet, and RemNote.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportFlashcardsAnki}
              disabled={downloading === "cards" || !document}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-600/20 transition hover:bg-cyan-500 disabled:opacity-50"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Export Quiz */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400">
                <Brain size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Practice Quiz (JSON / LMS)</h4>
                <p className="text-[11px] text-slate-400">
                  Export 20+ MCQs with 4 options, explanations, and answer keys.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportQuizJSON}
              disabled={downloading === "quiz" || !document}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-purple-600/20 transition hover:bg-purple-500 disabled:opacity-50"
            >
              <Download size={13} />
              <span>Export JSON</span>
            </button>
          </div>

          {/* Export AI Summary */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                <FileText size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Executive Study Guide (.MD)</h4>
                <p className="text-[11px] text-slate-400">
                  Comprehensive markdown summary with formulas & key takeaways.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportSummaryMarkdown}
              disabled={downloading === "summary" || !document}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:opacity-50"
            >
              <Download size={13} />
              <span>Export .MD</span>
            </button>
          </div>

          {/* Export Notes Bundle */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">AI Notes Master Bundle</h4>
                <p className="text-[11px] text-slate-400">
                  Export Class Notes, Exam Notes, and Revision Sheets into a single package.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportNotes}
              disabled={downloading === "notes" || !document}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-amber-600/20 transition hover:bg-amber-500 disabled:opacity-50"
            >
              <Download size={13} />
              <span>Export Bundle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
