import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatRole } from "@/lib/chatStorage";

interface MessageBubbleProps {
  role: ChatRole;
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser ? "bg-zinc-100 text-zinc-900 whitespace-pre-wrap" : "bg-zinc-800 text-zinc-100"
        }`}
      >
        {isUser ? (
          content
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              h1: ({ children }) => (
                <h1 className="mb-2 mt-3 text-base font-semibold first:mt-0">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="mb-2 mt-3 text-base font-semibold first:mt-0">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="mb-1.5 mt-3 text-sm font-semibold first:mt-0">{children}</h3>
              ),
              ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5">{children}</ul>,
              ol: ({ children }) => (
                <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>
              ),
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => (
                <strong className="font-semibold text-zinc-50">{children}</strong>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline underline-offset-2"
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="rounded bg-zinc-900 px-1 py-0.5 text-xs">{children}</code>
              ),
              blockquote: ({ children }) => (
                <blockquote className="mb-2 border-l-2 border-zinc-600 pl-3 text-zinc-300">
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="my-3 border-zinc-700" />,
              table: ({ children }) => (
                <div className="mb-2 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border-b border-zinc-600 px-2 py-1 font-semibold">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border-b border-zinc-700 px-2 py-1">{children}</td>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
