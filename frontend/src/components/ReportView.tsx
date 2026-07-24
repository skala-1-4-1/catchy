"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReportSession } from "@/lib/reportStorage";
import { useTypewriter } from "@/lib/useTypewriter";

interface ReportViewProps {
  session: ReportSession;
  streaming?: boolean;
  onStreamComplete?: () => void;
}

export default function ReportView({
  session,
  streaming = false,
  onStreamComplete,
}: ReportViewProps) {
  const displayedResult = useTypewriter(session.result ?? "", streaming, onStreamComplete);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  useEffect(() => {
    if (streaming) shouldAutoScroll.current = true;
  }, [streaming, session.id]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleScroll() {
      if (!container) return;
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      shouldAutoScroll.current = distanceFromBottom < 80;
    }

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useLayoutEffect(() => {
    if (!streaming || !shouldAutoScroll.current) return;
    const container = containerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [displayedResult, streaming]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-4xl pb-12">
          {session.status === "analyzing" && <AnalyzingState fileName={session.fileName} />}
          {session.status === "error" && (
            <div className="flex flex-col items-center gap-2 py-32 text-center">
              <p className="text-sm text-red-400">
                {session.error ?? "분석 중 오류가 발생했습니다."}
              </p>
            </div>
          )}
          {session.status === "done" && session.result && (
            <article className="text-sm leading-relaxed text-zinc-100">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {displayedResult}
              </ReactMarkdown>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalyzingState({ fileName }: { fileName: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
      <span className="flex gap-2">
        <span className="h-3 w-3 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.2s]" />
        <span className="h-3 w-3 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.1s]" />
        <span className="h-3 w-3 animate-bounce rounded-full bg-zinc-400" />
      </span>
      <p className="text-lg font-medium text-zinc-100">분석 중입니다...</p>
      <p className="max-w-sm text-sm text-zinc-500">
        {fileName} 파일을 분석하고 있어요. 카테고리 수에 따라 시간이 다소 걸릴 수 있습니다.
      </p>
    </div>
  );
}

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mb-4 mt-6 text-2xl font-bold first:mt-0">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mb-3 mt-8 border-b border-zinc-800 pb-2 text-xl font-semibold first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mb-2 mt-6 text-base font-semibold first:mt-0">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 last:mb-0">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-3 list-disc space-y-1.5 pl-5">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-3 list-decimal space-y-1.5 pl-5">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-zinc-50">{children}</strong>
  ),
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 underline underline-offset-2"
    >
      {children}
    </a>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs">{children}</code>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="mb-3 border-l-2 border-zinc-600 pl-3 text-zinc-300">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-zinc-800" />,
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="mb-3 overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full border-collapse text-left text-xs">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border-b border-zinc-700 bg-zinc-900 px-3 py-2 font-semibold">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border-b border-zinc-800 px-3 py-2 align-top">{children}</td>
  ),
};
