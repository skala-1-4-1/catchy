"use client";

import { useState } from "react";
import ChatView from "@/components/ChatView";
import Landing from "@/components/Landing";
import Sidebar from "@/components/Sidebar";
import {
  addMessageToSession,
  createSession,
  deleteSession,
  getSessions,
  type ChatSession,
} from "@/lib/chatStorage";
import { requestReport } from "@/lib/api";

export default function ChatApp() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => getSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingSessionId, setStreamingSessionId] = useState<string | null>(null);

  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? null;
  const streamingMessageIndex =
    activeSession && activeSession.id === streamingSessionId
      ? activeSession.messages.length - 1
      : null;

  async function handleSend(content: string) {
    if (isLoading) return;

    let sessionId = activeSessionId;

    if (!sessionId) {
      const session = createSession(content);
      sessionId = session.id;
      setActiveSessionId(sessionId);
    } else {
      addMessageToSession(sessionId, { role: "user", content });
    }
    setSessions(getSessions());

    setIsLoading(true);
    console.log("[chat] 전송:", content);
    try {
      const answer = await requestReport(content);
      console.log("[chat] 응답:", answer);
      addMessageToSession(sessionId, { role: "assistant", content: answer });
    } catch (error) {
      console.error("[chat] 백엔드 요청 실패:", error);
      addMessageToSession(sessionId, {
        role: "assistant",
        content: "백엔드 연결에 실패했습니다. 서버가 켜져 있는지 확인해주세요.",
      });
    }
    setSessions(getSessions());
    setIsLoading(false);
    setStreamingSessionId(sessionId);
  }

  function handleNewChat() {
    setActiveSessionId(null);
  }

  function handleDeleteSession(id: string) {
    deleteSession(id);
    setSessions(getSessions());
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  }

  return (
    <div className="flex h-dvh bg-zinc-900 text-zinc-100">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((prev) => !prev)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        {activeSession ? (
          <ChatView
            session={activeSession}
            isLoading={isLoading}
            onSend={handleSend}
            streamingMessageIndex={streamingMessageIndex}
            onStreamComplete={() => setStreamingSessionId(null)}
          />
        ) : (
          <Landing onSend={handleSend} isLoading={isLoading} />
        )}
      </main>
    </div>
  );
}
