import { useState, useEffect, useRef } from "react";
import {
  Network,
  Sparkles,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

import { generateMindMap, type MindMapNode } from "../../api/mindmap.api";
import type { DocumentItem } from "../../api/document.api";

interface Props {
  document: DocumentItem | null;
}

export default function MindMapVisualizer({ document }: Props) {
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<MindMapNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document?._id) {
      loadMindMap();
    } else {
      setTreeData(null);
    }
  }, [document?._id]);

  const loadMindMap = async () => {
    if (!document?._id) return;
    try {
      setLoading(true);
      const data = await generateMindMap(document._id);
      setTreeData(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load concept mind map.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCollapse = (nodeId: string) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleDownloadSVG = () => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector("svg");
    if (!svgEl) {
      toast.error("Mind map SVG not ready.");
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${(document?.title || "mindmap").toLowerCase().replace(/\s+/g, "_")}_mindmap.svg`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Mind map SVG downloaded.");
  };

  if (!document) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center backdrop-blur-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
          <Network size={32} />
        </div>
        <h3 className="mt-4 text-base font-bold text-white">Select a Document</h3>
        <p className="mt-1 max-w-sm text-xs text-slate-400">
          Select a document to generate an interactive AI concept mind map with zoom, branch collapsing, and SVG export.
        </p>
      </div>
    );
  }

  // Recursive Node Renderer for the Tree Visualizer
  const renderTreeNode = (node: MindMapNode, depth: number = 0) => {
    const isCollapsed = collapsedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const branchColors = ["#0ea5e9", "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];
    const color = node.color || branchColors[depth % branchColors.length];

    return (
      <div key={node.id} className="relative flex flex-col items-start my-2">
        {/* Node Pill */}
        <div
          onClick={() => hasChildren && toggleCollapse(node.id)}
          style={{ borderColor: `${color}40`, backgroundColor: `${color}15` }}
          className={`group flex items-center gap-2 rounded-2xl border px-3.5 py-2 shadow-lg backdrop-blur-xl transition-all duration-200 ${
            hasChildren ? "cursor-pointer hover:scale-105" : "cursor-default"
          }`}
        >
          <div
            style={{ backgroundColor: color }}
            className="h-2.5 w-2.5 rounded-full ring-2 ring-white/20 animate-pulse"
          />

          <span className="text-xs font-bold text-white group-hover:text-cyan-200">
            {node.label}
          </span>

          {hasChildren && (
            <span className="text-slate-400">
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </span>
          )}
        </div>

        {/* Children Branches */}
        {hasChildren && !isCollapsed && (
          <div className="relative ml-6 pl-4 border-l-2 border-dashed border-white/10 space-y-2 mt-2">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-500/10 p-2.5 text-indigo-400 ring-1 ring-indigo-500/20">
            <Network size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Interactive Concept Mind Map</h2>
            <p className="text-xs text-slate-400">
              Explore hierarchical concept clusters extracted from {document.title}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="rounded-xl border border-white/10 bg-slate-950/60 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>

          <span className="min-w-[44px] text-center text-xs font-bold text-slate-300">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
            className="rounded-xl border border-white/10 bg-slate-950/60 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>

          <button
            onClick={() => setZoom(1)}
            className="rounded-xl border border-white/10 bg-slate-950/60 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            title="Reset Zoom"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={handleDownloadSVG}
            disabled={!treeData}
            className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
          >
            <Download size={14} />
            <span>Export SVG</span>
          </button>
        </div>
      </div>

      {/* Interactive Mind Map Canvas */}
      <div
        ref={containerRef}
        className="relative min-h-[480px] overflow-auto rounded-3xl border border-white/10 bg-gradient-to-b from-slate-950 via-[#07090e] to-slate-950 p-8 shadow-2xl backdrop-blur-2xl"
      >
        {loading ? (
          <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
            <Loader2 className="animate-spin text-indigo-400" size={36} />
            <h4 className="mt-4 text-sm font-bold text-white">
              Synthesizing Concept Graph...
            </h4>
            <p className="mt-1 text-xs text-slate-400">
              Structuring chapters and sub-nodes from {document.title}.
            </p>
          </div>
        ) : treeData ? (
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              transition: "transform 0.15s ease-out",
            }}
            className="p-4 inline-block min-w-full"
          >
            {renderTreeNode(treeData)}
          </div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <Sparkles className="text-indigo-400" size={32} />
            <h4 className="mt-3 text-sm font-bold text-white">Generate Mind Map</h4>
            <p className="mt-1 text-xs text-slate-400">
              Extract interactive nodes from this document.
            </p>
            <button
              onClick={loadMindMap}
              className="mt-4 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              Generate Mind Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
