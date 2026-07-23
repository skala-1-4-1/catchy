"use client";

import { useEffect, useRef } from "react";
import type { ChatSession } from "@/lib/chatStorage";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

interface ChatViewProps {
  session: ChatSession;
  isLoading: boolean;
  onSend: (value: string) => void;
  streamingMessageIndex?: number | null;
  onStreamComplete?: () => void;
}

export default function ChatView({
  session,
  isLoading,
  onSend,
  streamingMessageIndex = null,
  onStreamComplete,
}: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages.length, isLoading]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {session.messages.map((message, index) => (
            <MessageBubble
              key={index}
              role={message.role}
              content={message.content}
              streaming={index === streamingMessageIndex}
              onStreamComplete={onStreamComplete}
            />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="border-t border-zinc-800 px-4 py-4 sm:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <ChatInput onSend={onSend} isLoading={isLoading} placeholder="메시지를 입력하세요" />
        </div>
      </div>
    </div>
  );
}
