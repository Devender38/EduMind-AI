import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";

interface PDFToolbarProps {
  pageNumber: number;
  numPages: number;
  scale: number;

  onPrevPage: () => void;
  onNextPage: () => void;

  onZoomIn: () => void;
  onZoomOut: () => void;

  onRotate: () => void;
}

export default function PDFToolbar({
  pageNumber,
  numPages,
  scale,

  onPrevPage,
  onNextPage,

  onZoomIn,
  onZoomOut,

  onRotate,
}: PDFToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-5 py-3">

      {/* Left */}

      <div className="flex items-center gap-2">

        <button
          onClick={onPrevPage}
          disabled={pageNumber <= 1}
          className="rounded-lg bg-zinc-800 p-2 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={onNextPage}
          disabled={pageNumber >= numPages}
          className="rounded-lg bg-zinc-800 p-2 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>

        <span className="ml-3 text-sm text-gray-300">
          Page {pageNumber} / {numPages || "--"}
        </span>

      </div>

      {/* Right */}

      <div className="flex items-center gap-2">

        <button
          onClick={onZoomOut}
          className="rounded-lg bg-zinc-800 p-2 transition hover:bg-zinc-700"
        >
          <ZoomOut size={18} />
        </button>

        <span className="w-16 text-center text-sm font-medium text-white">
          {(scale * 100).toFixed(0)}%
        </span>

        <button
          onClick={onZoomIn}
          className="rounded-lg bg-zinc-800 p-2 transition hover:bg-zinc-700"
        >
          <ZoomIn size={18} />
        </button>

        <button
          onClick={onRotate}
          className="ml-2 rounded-lg bg-zinc-800 p-2 transition hover:bg-zinc-700"
        >
          <RotateCw size={18} />
        </button>

      </div>

    </div>
  );
}