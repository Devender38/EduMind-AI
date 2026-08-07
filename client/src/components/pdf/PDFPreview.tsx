import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FileText, Loader2 } from "lucide-react";

import PDFToolbar from "./PDFToolbar";

import type { DocumentItem } from "../../api/document.api";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// PDF Worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFPreviewProps {
  document: DocumentItem | null;
}

export default function PDFPreview({
  document,
}: PDFPreviewProps) {
  const [numPages, setNumPages] = useState(0);

  const [pageNumber, setPageNumber] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [scale, setScale] =
    useState(1);

  const [rotation, setRotation] =
    useState(0);

  const onLoadSuccess = ({
    numPages,
  }: {
    numPages: number;
  }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  };

  if (!document) {
    return (
      <div className="flex h-[750px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">

        <div className="text-center">

          <FileText
            size={70}
            className="mx-auto mb-5 text-zinc-600"
          />

          <h2 className="text-2xl font-bold text-white">
            No PDF Selected
          </h2>

          <p className="mt-2 text-gray-400">
            Upload or select a document
            to preview it here.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg">

      <PDFToolbar
        pageNumber={pageNumber}
        numPages={numPages}
        scale={scale}
        onPrevPage={() =>
          setPageNumber((prev) =>
            Math.max(prev - 1, 1)
          )
        }
        onNextPage={() =>
          setPageNumber((prev) =>
            Math.min(prev + 1, numPages)
          )
        }
        onZoomIn={() =>
          setScale((prev) =>
            Math.min(prev + 0.2, 3)
          )
        }
        onZoomOut={() =>
          setScale((prev) =>
            Math.max(prev - 0.2, 0.6)
          )
        }
        onRotate={() =>
          setRotation((prev) =>
            (prev + 90) % 360
          )
        }
      />

      <div className="flex h-[700px] justify-center overflow-auto bg-zinc-950 p-6">

        {loading && (
          <div className="flex items-center gap-3">

            <Loader2
              size={30}
              className="animate-spin text-blue-500"
            />

            <span className="text-gray-300">
              Loading PDF...
            </span>

          </div>
        )}

        <Document
          file={document.fileUrl}
          loading=""
          onLoadSuccess={onLoadSuccess}
          onLoadError={(err) => {
            console.error(err);
            setLoading(false);
          }}
        >
          <Page
            pageNumber={pageNumber}
            width={700 * scale}
            rotate={rotation}
            renderAnnotationLayer
            renderTextLayer
          />
        </Document>

      </div>

    </div>
  );
}