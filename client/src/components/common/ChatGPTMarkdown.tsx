import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Terminal } from "lucide-react";
import toast from "react-hot-toast";

interface ChatGPTMarkdownProps {
  content: string;
  className?: string;
}

export const ChatGPTMarkdown: React.FC<ChatGPTMarkdownProps> = ({
  content,
  className = "",
}) => {
  return (
    <div className={`text-slate-200 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-5 mb-3 text-xl sm:text-2xl font-bold tracking-tight text-white border-b border-white/10 pb-2 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-4 mb-2.5 text-lg sm:text-xl font-bold tracking-tight text-white first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-3.5 mb-2 text-base sm:text-lg font-bold text-cyan-300 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-3 mb-1.5 text-sm sm:text-base font-semibold text-slate-200">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-2.5 text-sm sm:text-base leading-relaxed text-slate-200">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-300">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="my-3 list-disc pl-6 space-y-1.5 text-slate-200 marker:text-cyan-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal pl-6 space-y-1.5 text-slate-200 marker:text-cyan-400">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm sm:text-base leading-relaxed text-slate-200 pl-1">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3.5 border-l-4 border-cyan-500 bg-cyan-950/20 pl-4 py-2 italic text-slate-300 rounded-r-xl border-y border-r border-white/5">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-4 border-t border-white/10" />
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-white/10 shadow-md">
              <table className="min-w-full text-left text-xs sm:text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-800/90 text-white font-bold border-b border-white/10">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 font-bold text-white border-r border-white/5 last:border-r-0">
              {children}
            </th>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/5 bg-slate-950/40">
              {children}
            </tbody>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-slate-300 border-r border-white/5 last:border-r-0">
              {children}
            </td>
          ),
          pre: ({ children }) => (
            <div className="my-3.5 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-lg">
              {children}
            </div>
          ),
          code: ({ className, children, ...props }: any) => {
            const rawString = String(children).replace(/\n$/, "");
            const hasMultipleLines = rawString.includes("\n");

            if (!hasMultipleLines && !className) {
              return (
                <code
                  className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-xs text-cyan-200 border border-white/10 font-semibold"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock rawString={rawString} className={className} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const CodeBlock: React.FC<{ rawString: string; className?: string }> = ({
  rawString,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const lang = className ? className.replace("language-", "") : "code";

  const handleCopy = () => {
    navigator.clipboard.writeText(rawString);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between bg-slate-900/90 px-4 py-2 text-xs text-slate-400 border-b border-white/10 font-mono">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
          <Terminal size={13} />
          <span>{lang}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 text-xs sm:text-sm font-mono text-slate-200 leading-relaxed">
        <code>{rawString}</code>
      </div>
    </div>
  );
};
