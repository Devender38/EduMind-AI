import { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Loader2,
  FileText,
  Clock,
  BookOpen,
  Hash,
  RefreshCw,
  Copy,
  Check,
  Tag,
  Sparkles,
  AlignLeft,
  Download,
  Volume2,
  VolumeX,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getSummary,
  regenerateSummary,
} from "../../api/summary.api";
import type { DocumentItem } from "../../api/document.api";

interface Props {
  document: DocumentItem | null;
}

export default function SummaryCard({ document }: Props) {
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const [summary, setSummary] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [readingTime, setReadingTime] = useState(0);
  const [pages, setPages] = useState(0);
  const [chunks, setChunks] = useState(0);

  const loadSummary = useCallback(async () => {
    if (!document) return;
    try {
      setLoading(true);
      const data = await getSummary(document._id);
      setSummary(data.summary || "");
      setKeywords(data.keywords || []);
      setReadingTime(data.reading_time || 1);
      setPages(data.page_count || 1);
      setChunks(data.chunk_count || 1);
    } catch (err) {
      console.error("Failed loading summary:", err);
    } finally {
      setLoading(false);
    }
  }, [document]);

  const handleRegenerate = async () => {
    if (!document || regenerating) return;
    try {
      setRegenerating(true);
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
      }
      const data = await regenerateSummary(document._id);
      setSummary(data.summary || "");
      setKeywords(data.keywords || []);
      setReadingTime(data.reading_time || 1);
      setPages(data.page_count || 1);
      setChunks(data.chunk_count || 1);
      toast.success("Detailed full-explanation summary regenerated!");
    } catch (err) {
      console.error("Failed regenerating summary:", err);
      toast.error("Failed to regenerate summary");
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast.success("Summary copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy summary");
    }
  };

  const handleDownload = () => {
    if (!summary || !document) return;
    const blob = new Blob([summary], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${document.title.replace(/\.[^/.]+$/, "")}_Summary.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Study guide downloaded as Markdown!");
  };

  const handleToggleSpeech = () => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported on this browser.");
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    if (!summary) return;

    // Strip markdown formatting for cleaner audio
    const plainText = summary
      .replace(/#{1,6}\s?/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`{1,3}[^`]*`{1,3}/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    toast.success("Reading summary aloud...");
  };

  // Clean up speech synthesis when component unmounts or document changes
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [document]);

  useEffect(() => {
    if (!document) {
      setSummary("");
      setKeywords([]);
      return;
    }
    loadSummary();
  }, [document, loadSummary]);

  if (!document) {
    return (
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8 text-center backdrop-blur-xl">
        <BookOpen className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
        <h3 className="text-lg font-semibold text-zinc-300">No Document Selected</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Upload or select a document on the left to generate an in-depth AI study guide and summary.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-12 text-center backdrop-blur-xl">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-emerald-500" />
        <h3 className="text-lg font-semibold text-zinc-200">Analyzing Document & Generating In-Depth Explanation...</h3>
        <p className="mt-1 text-sm text-zinc-400">Synthesizing executive overview, step-by-step mechanics, theoretical framework, comparisons, and glossary.</p>
      </div>
    );
  }

  const wordCount = summary ? summary.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="space-y-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-6 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 ring-1 ring-emerald-500/20">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Full-Explanation Study Guide</h2>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                In-Depth AI Summary
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Comprehensive conceptual breakdown and mechanics for <span className="text-zinc-300 font-medium">{document.title}</span>
            </p>
          </div>
        </div>

        {/* Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {summary && (
            <>
              {/* TTS Read Aloud */}
              <button
                onClick={handleToggleSpeech}
                title={speaking ? "Stop reading" : "Read aloud"}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                  speaking
                    ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                    : "border-zinc-800 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/60 hover:text-white"
                }`}
              >
                {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                {speaking ? "Stop Audio" : "Listen"}
              </button>

              {/* Download Markdown */}
              <button
                onClick={handleDownload}
                title="Download as Markdown file"
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-800/60 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700/60 hover:text-white"
              >
                <Download className="h-3.5 w-3.5 text-zinc-400" />
                Export
              </button>

              {/* Copy */}
              <button
                onClick={handleCopy}
                title="Copy summary to clipboard"
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-800/60 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700/60 hover:text-white"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </>
          )}

          {/* Regenerate */}
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            title="Regenerate comprehensive summary"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-600/10 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-600/20 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
            {regenerating ? "Analyzing..." : "Regenerate"}
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Reading Time</p>
            <p className="text-sm font-semibold text-white">~{readingTime} min</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
            <AlignLeft className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Word Count</p>
            <p className="text-sm font-semibold text-white">{wordCount.toLocaleString()} words</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Pages</p>
            <p className="text-sm font-semibold text-white">{pages} {pages === 1 ? "Page" : "Pages"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
            <Hash className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Knowledge Chunks</p>
            <p className="text-sm font-semibold text-white">{chunks} Chunks</p>
          </div>
        </div>
      </div>

      {/* Keywords / Key Topics Tags */}
      {keywords.length > 0 && (
        <div className="space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <Tag className="h-3.5 w-3.5 text-emerald-400" />
            <span>Key Topics & Core Focus Areas</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 transition hover:border-emerald-500/40 hover:bg-emerald-500/20"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Formatted Markdown Content */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 md:p-8">
        {summary ? (
          <div className="prose prose-invert max-w-none space-y-4 text-sm leading-relaxed text-zinc-300 md:text-base">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="mt-8 mb-4 border-b border-zinc-800 pb-2 text-2xl font-extrabold text-white first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mt-7 mb-3 border-b border-zinc-800/80 pb-2 text-xl font-bold text-emerald-400 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-6 mb-3 flex items-center gap-2 text-lg font-bold text-emerald-300 first:mt-0">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="mt-4 mb-2 text-base font-semibold text-white">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="mb-3 leading-relaxed text-zinc-300">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-4 list-disc space-y-2 pl-6 text-zinc-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-4 list-decimal space-y-2 pl-6 text-zinc-300">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">
                    {children}
                  </strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-4 border-l-4 border-emerald-500/60 bg-emerald-500/5 py-3 pl-4 italic text-zinc-200 rounded-r-xl">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="my-6 overflow-x-auto rounded-xl border border-zinc-800">
                    <table className="w-full text-left text-sm text-zinc-300">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-zinc-900 text-xs font-semibold uppercase tracking-wider text-emerald-300 border-b border-zinc-800">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-3 font-semibold text-white">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border-b border-zinc-800/60 px-4 py-3">
                    {children}
                  </td>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="my-4 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 font-mono text-xs text-zinc-200">
                    {children}
                  </pre>
                ),
              }}
            >
              {summary}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="py-8 text-center text-zinc-500">
            <Sparkles className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
            <p>No summary generated yet. Click below to generate.</p>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
            >
              {regenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Generate Full-Explanation Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}