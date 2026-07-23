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
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-100"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
