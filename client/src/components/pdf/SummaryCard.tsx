import {
  FileText,
  Clock,
  FileDigit,
  Brain,
} from "lucide-react";

import type { DocumentItem } from "../../api/document.api";

interface SummaryCardProps {
  document: DocumentItem | null;
}

export default function SummaryCard({
  document,
}: SummaryCardProps) {
  if (!document) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-xl font-bold">
          AI Summary
        </h2>

        <div className="text-center text-gray-400 py-10">
          Select a document to view its summary.
        </div>
      </div>
    );
  }

  const fileSize =
    (document.fileSize / 1024 / 1024).toFixed(2);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">

      <div className="mb-6 flex items-center gap-3">

        <Brain
          size={24}
          className="text-blue-400"
        />

        <h2 className="text-xl font-bold">
          AI Document Summary
        </h2>

      </div>

      {/* Summary */}

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">

        <h3 className="mb-3 text-lg font-semibold">
          Summary
        </h3>

        <p className="leading-7 text-gray-300">
          AI summary will appear here after
          the summarization feature is added.

          Currently this document has been
          successfully uploaded and indexed
          inside EduMind AI.
        </p>

      </div>

      {/* Stats */}

      <div className="mt-6 grid grid-cols-2 gap-4">

        <div className="rounded-xl bg-zinc-950 p-4">

          <div className="flex items-center gap-2">

            <FileText
              size={18}
              className="text-blue-400"
            />

            <span className="text-sm text-gray-400">
              File Name
            </span>

          </div>

          <p className="mt-2 truncate font-semibold">
            {document.fileName}
          </p>

        </div>

        <div className="rounded-xl bg-zinc-950 p-4">

          <div className="flex items-center gap-2">

            <FileDigit
              size={18}
              className="text-green-400"
            />

            <span className="text-sm text-gray-400">
              File Size
            </span>

          </div>

          <p className="mt-2 font-semibold">
            {fileSize} MB
          </p>

        </div>

        <div className="rounded-xl bg-zinc-950 p-4">

          <div className="flex items-center gap-2">

            <Clock
              size={18}
              className="text-yellow-400"
            />

            <span className="text-sm text-gray-400">
              Uploaded
            </span>

          </div>

          <p className="mt-2 font-semibold">
            {new Date(
              document.createdAt
            ).toLocaleDateString()}
          </p>

        </div>

        <div className="rounded-xl bg-zinc-950 p-4">

          <div className="flex items-center gap-2">

            <Brain
              size={18}
              className="text-purple-400"
            />

            <span className="text-sm text-gray-400">
              Status
            </span>

          </div>

          <p className="mt-2 font-semibold capitalize">
            {document.status}
          </p>

        </div>

      </div>

      {/* Future AI Features */}

      <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">

        <h3 className="mb-3 text-lg font-semibold text-blue-300">
          Coming Soon
        </h3>

        <ul className="space-y-2 text-gray-300">

          <li>• AI Summary</li>

          <li>• Key Points</li>

          <li>• Important Topics</li>

          <li>• Reading Time</li>

          <li>• Flashcards</li>

          <li>• Quiz Generator</li>

        </ul>

      </div>

    </div>
  );
}