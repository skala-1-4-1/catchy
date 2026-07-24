"use client";

import { useEffect, useRef, useState } from "react";
import ReportView from "@/components/ReportView";
import UploadPanel from "@/components/UploadPanel";
import Sidebar from "@/components/Sidebar";
import {
  completeSession,
  createSession,
  deleteSession,
  failSession,
  getSessions,
  type ReportSession,
} from "@/lib/reportStorage";
import { requestReport } from "@/lib/api";

function extractTitle(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s*(.+)$/m);
  if (!match) return fallback;
  const cleaned = match[1].replace(/^[^\p{L}\p{N}]+/u, "").trim();
  return cleaned || fallback;
}

export default function ReportApp() {
  const [sessions, setSessions] = useState<ReportSession[]>(() => getSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [streamingSessionId, setStreamingSessionId] = useState<string | null>(null);
  const [animatedSessionIds, setAnimatedSessionIds] = useState<Set<string>>(new Set());
  const previousActiveSessionId = useRef<string | null>(null);

  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? null;

  function markAnimated(id: string) {
    setAnimatedSessionIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }

  useEffect(() => {
    const previousId = previousActiveSessionId.current;
    if (previousId && previousId !== activeSessionId && previousId === streamingSessionId) {
      // navigated away mid-animation: don't let it resume/replay from the top later
      markAnimated(previousId);
      setStreamingSessionId(null);
    }
    previousActiveSessionId.current = activeSessionId;
  }, [activeSessionId, streamingSessionId]);

  async function handleUpload(file: File) {
    if (isUploading) return;

    const session = createSession(file.name);
    setSessions(getSessions());
    setActiveSessionId(session.id);
    setIsUploading(true);

    try {
      const result = await requestReport(file);
      completeSession(session.id, result, extractTitle(result, file.name));
      setStreamingSessionId(session.id);
    } catch (error) {
      console.error("[report] 백엔드 요청 실패:", error);
      failSession(
        session.id,
        "분석에 실패했습니다. 파일 형식을 확인하거나 잠시 후 다시 시도해주세요.",
      );
    }
    setSessions(getSessions());
    setIsUploading(false);
  }

  function handleNewUpload() {
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
        onNewUpload={handleNewUpload}
        onDeleteSession={handleDeleteSession}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        {activeSession ? (
          <ReportView
            session={activeSession}
            streaming={
              activeSession.id === streamingSessionId &&
              !animatedSessionIds.has(activeSession.id)
            }
            onStreamComplete={() => {
              markAnimated(activeSession.id);
              setStreamingSessionId(null);
            }}
          />
        ) : (
          <UploadPanel onUpload={handleUpload} isLoading={isUploading} />
        )}
      </main>
    </div>
  );
}
