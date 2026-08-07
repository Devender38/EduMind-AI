import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  Trash2,
  HardDrive,
  Calendar,
  MessageSquare,
  Sparkles,
  Loader2,
  Clock,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import UploadCard from "../components/dashboard/UploadCard";
import { getDocuments, deleteDocument, type DocumentItem } from "../api/document.api";

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "processing">("all");
  const [showUpload, setShowUpload] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadDocuments();
  }, [refreshKey]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      await deleteDocument(id);
      toast.success("Document deleted.");
      setDocuments((prev) => prev.filter((d) => d._id !== id));
    } catch {
      toast.error("Failed to delete document.");
    }
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        (doc.title || doc.fileName).toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" ? true : doc.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [documents, search, filter]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Document Library</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage your uploaded study materials, research papers, and lecture notes.
            </p>
          </div>

          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
          >
            <Plus size={18} />
            {showUpload ? "Hide Upload" : "Upload New PDF"}
          </button>
        </div>

        {/* Optional Upload Area */}
        {showUpload && (
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6 backdrop-blur-xl">
            <UploadCard
              onUploadSuccess={() => {
                setShowUpload(false);
                setRefreshKey((k) => k + 1);
              }}
            />
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-zinc-500" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by document title or filename..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition focus:border-blue-500"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-2">
            {(["all", "completed", "processing"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "border border-zinc-800 bg-zinc-800/60 text-zinc-400 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="mt-4 text-sm text-zinc-400">Loading your documents...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-12 text-center">
            <FileText className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
            <h3 className="text-lg font-semibold text-zinc-200">No Documents Found</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {search ? "No documents match your search query." : "Upload your first PDF to begin learning."}
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              <Plus size={16} />
              Upload PDF
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocs.map((doc) => (
              <div
                key={doc._id}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 p-6 backdrop-blur-xl transition duration-200 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5"
              >
                {/* Top Section */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400 ring-1 ring-blue-500/20">
                      <FileText size={24} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          doc.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                            : doc.status === "processing"
                            ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                            : "bg-blue-500/15 text-blue-400"
                        }`}
                      >
                        {doc.status}
                      </span>

                      <button
                        onClick={(e) => handleDelete(e, doc._id)}
                        title="Delete Document"
                        className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-white line-clamp-2">
                    {doc.title || doc.fileName}
                  </h3>

                  {/* Metadata */}
                  <div className="mt-3 space-y-1.5 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-zinc-500" />
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <HardDrive size={13} className="text-zinc-500" />
                      <span>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>

                    {doc.pageCount ? (
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-zinc-500" />
                        <span>{doc.pageCount} Pages • ~{doc.readingTime || Math.max(1, Math.ceil(doc.pageCount * 2))} min read</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-6 flex items-center gap-2 border-t border-zinc-800/80 pt-4">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600/15 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-600 hover:text-white"
                  >
                    <Sparkles size={14} />
                    Study Hub
                  </button>

                  <button
                    onClick={() => navigate("/chat")}
                    title="Open AI Chat"
                    className="rounded-xl border border-zinc-800 bg-zinc-800/60 p-2 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
                  >
                    <MessageSquare size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
