import { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
  Sparkles,
  X,
  ShieldCheck,
  FileUp,
} from "lucide-react";
import toast from "react-hot-toast";

import { uploadDocument } from "../../api/document.api";
import type { DocumentItem } from "../../api/document.api";

interface UploadCardProps {
  onUploadSuccess: (document: DocumentItem) => void;
}

export default function UploadCard({
  onUploadSuccess,
}: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("Maximum file size is 25MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF.");
      return;
    }

    try {
      setUploading(true);
      setProgress(5);
      setStage("Uploading PDF to Secure Vault...");

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 25) {
            setStage("Uploading PDF to Cloud...");
          } else if (prev < 50) {
            setStage("Extracting Text & OCR...");
          } else if (prev < 75) {
            setStage("Generating Neural Embeddings...");
          } else {
            setStage("Indexing Vector Space...");
          }

          if (prev >= 95) return prev;
          return prev + 5;
        });
      }, 300);

      const document = await uploadDocument(selectedFile);

      clearInterval(interval);
      setProgress(100);
      setStage("Synthesis Complete ✅");
      toast.success("PDF uploaded and vectorized successfully!");

      onUploadSuccess(document);
      setSelectedFile(null);

      setTimeout(() => {
        setProgress(0);
        setStage("");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Upload Failed"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-[#07090e] p-6 shadow-2xl backdrop-blur-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400 ring-1 ring-cyan-500/20">
            <FileUp size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Upload Material</h2>
            <p className="text-[11px] text-slate-400">PDFs, Textbook Chapters, Lecture Notes</p>
          </div>
        </div>

        <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300">
          Max 25MB
        </span>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files[0]);
          }
        }}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-cyan-500/30 bg-slate-950/60 p-7 text-center transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/5 hover:shadow-lg hover:shadow-cyan-500/10"
      >
        <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20 transition group-hover:scale-110 group-hover:bg-cyan-500/20">
          <UploadCloud size={28} className="animate-float" />
        </div>

        <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition">
          Drag & Drop PDF Here
        </p>

        <p className="mt-1 text-xs text-slate-400">
          or <span className="font-semibold text-cyan-400 underline decoration-cyan-400/40">browse files</span> from your computer
        </p>

        <input
          hidden
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => {
            if (e.target.files?.length) {
              handleFileSelect(e.target.files[0]);
            }
          }}
        />
      </div>

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-3.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-400">
                <FileText size={20} />
              </div>

              <div className="overflow-hidden">
                <p className="truncate text-xs font-bold text-white">
                  {selectedFile.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for AI Ingestion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!uploading && (
                <>
                  <CheckCircle2
                    size={16}
                    className="text-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={handleClearFile}
                    title="Remove selected file"
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-red-400"
                  >
                    <X size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="mt-5 space-y-2 animate-in fade-in duration-300">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-cyan-300 flex items-center gap-1.5">
              <Sparkles size={13} className="animate-spin text-cyan-400" />
              {stage}
            </span>
            <span className="text-white font-bold">{progress}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-950 border border-white/10">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300"
            />
          </div>
        </div>
      )}

      {/* Main Upload CTA Button */}
      <button
        onClick={handleUpload}
        disabled={uploading || !selectedFile}
        className="group relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            <span>Processing Vector Ingestion...</span>
          </>
        ) : (
          <>
            <UploadCloud size={16} className="transition group-hover:-translate-y-0.5" />
            <span>Start AI Document Ingestion</span>
          </>
        )}
      </button>

      <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-500">
        <ShieldCheck size={12} className="text-cyan-400" />
        <span>End-to-End Vector Encryption • Auto-OCR</span>
      </div>
    </div>
  );
}