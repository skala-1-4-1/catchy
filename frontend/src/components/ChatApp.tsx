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

// TODO: 실제 백엔드(/api/report) 연동 예정. 지금은 목업 응답만 반환.
async function requestMockAnswer(prompt: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return `"${prompt}"에 대한 리뷰 분석 결과를 준비 중입니다. (임시 응답입니다)`;
}

export default function ChatApp() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => getSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? null;

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
    const answer = await requestMockAnswer(content);
    addMessageToSession(sessionId, { role: "assistant", content: answer });
    setSessions(getSessions());
    setIsLoading(false);
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
          <ChatView session={activeSession} isLoading={isLoading} onSend={handleSend} />
        ) : (
          <Landing onSend={handleSend} isLoading={isLoading} />
        )}
      </main>
    </div>
  );
}
