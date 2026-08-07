import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Search,
  Trash2,
  Loader2,
  Calendar,
  HardDrive,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getDocuments,
  deleteDocument,
} from "../../api/document.api";

import type { DocumentItem } from "../../api/document.api";

interface Props {
  refreshKey: number;
  selectedDocument: DocumentItem | null;
  onSelect: (
    document: DocumentItem
  ) => void;
}

export default function DocumentList({
  refreshKey,
  selectedDocument,
  onSelect,
}: Props) {
  const [documents, setDocuments] =
    useState<DocumentItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadDocuments();
  }, [refreshKey]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getDocuments();
      setDocuments(docs);
      if (docs.length > 0 && !selectedDocument) {
        onSelect(docs[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Unable to load documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    e: React.MouseEvent,
    id: string
  ) => {
    e.stopPropagation();

    if (!window.confirm("Delete this document from memory?")) return;

    try {
      await deleteDocument(id);
      toast.success("Document deleted.");
      setDocuments((prev) =>
        prev.filter((doc) => doc._id !== id)
      );
    } catch {
      toast.error("Delete failed.");
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) =>
      (doc.title || doc.fileName)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [documents, search]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-2xl">
        <div className="flex h-36 flex-col items-center justify-center gap-3 text-cyan-400">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-xs font-semibold text-slate-300">Retrieving Vectorized Documents...</span>
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
            Library
            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
              {documents.length}
            </span>
          </h2>
          <p className="text-[11px] text-slate-400">Select a document to study</p>
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          RAG Memory
        </span>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search
          size={14}
          className="absolute left-3.5 top-3 text-slate-400"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter documents..."
          className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-2.5 pl-9 pr-4 text-xs text-white outline-none transition focus:border-cyan-500 focus:shadow-md focus:shadow-cyan-500/10 placeholder:text-slate-500"
        />
      </div>

      {/* Document Items List */}
      <div className="max-h-[420px] space-y-2.5 overflow-y-auto pr-1">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 p-8 text-center">
            <FolderOpen className="text-slate-500 animate-float" size={32} />
            <p className="mt-2 text-xs font-semibold text-slate-300">No documents found</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Upload a PDF above to begin studying.</p>
          </div>
        ) : (
          filteredDocuments.map((doc) => {
            const active = selectedDocument?._id === doc._id;

            return (
              <div
                key={doc._id}
                onClick={() => onSelect(doc)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-3.5 transition-all duration-300 ${
                  active
                    ? "border-cyan-500/50 bg-gradient-to-r from-cyan-950/50 via-slate-900/80 to-blue-950/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                    : "border-white/10 bg-slate-950/60 hover:border-cyan-500/30 hover:bg-slate-900/60"
                }`}
              >
                {/* Active Indicator Bar */}
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-600" />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 overflow-hidden">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition ${
                        active
                          ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/40"
                          : "bg-slate-900 text-slate-400 group-hover:text-cyan-400"
                      }`}
                    >
                      <FileText size={18} />
                    </div>

                    <div className="overflow-hidden">
                      <h3
                        className={`truncate text-xs font-bold transition ${
                          active ? "text-cyan-200" : "text-white group-hover:text-cyan-300"
                        }`}
                      >
                        {doc.title || doc.fileName}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <HardDrive size={11} />
                          {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            doc.status === "completed"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                              : doc.status === "processing"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/20 animate-pulse"
                              : doc.status === "uploaded"
                              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
                              : "bg-rose-500/15 text-rose-300 border border-rose-500/20"
                          }`}
                        >
                          {doc.status === "completed" && <CheckCircle2 size={10} />}
                          {doc.status === "processing" && <Clock size={10} />}
                          {doc.status === "failed" && <AlertCircle size={10} />}
                          {doc.status}
                        </span>

                        {active && (
                          <span className="flex items-center gap-0.5 text-[9px] font-semibold text-cyan-400">
                            <Sparkles size={9} /> Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, doc._id)}
                    title="Delete document"
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