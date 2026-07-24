export type ReportStatus = "analyzing" | "done" | "error";

export interface ReportSession {
  id: string;
  title: string;
  fileName: string;
  createdAt: number;
  status: ReportStatus;
  result: string | null;
  error: string | null;
}

const STORAGE_KEY = "review-report-sessions";

function readSessions(): ReportSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: ReportSession[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getSessions(): ReportSession[] {
  return readSessions().sort((a, b) => b.createdAt - a.createdAt);
}

export function createSession(fileName: string): ReportSession {
  const session: ReportSession = {
    id: crypto.randomUUID(),
    title: fileName,
    fileName,
    createdAt: Date.now(),
    status: "analyzing",
    result: null,
    error: null,
  };
  const sessions = readSessions();
  sessions.push(session);
  writeSessions(sessions);
  return session;
}

export function completeSession(
  sessionId: string,
  result: string,
  title: string,
): ReportSession | null {
  const sessions = readSessions();
  const index = sessions.findIndex((session) => session.id === sessionId);
  if (index === -1) return null;

  sessions[index] = { ...sessions[index], status: "done", result, title };
  writeSessions(sessions);
  return sessions[index];
}

export function failSession(sessionId: string, error: string): ReportSession | null {
  const sessions = readSessions();
  const index = sessions.findIndex((session) => session.id === sessionId);
  if (index === -1) return null;

  sessions[index] = { ...sessions[index], status: "error", error };
  writeSessions(sessions);
  return sessions[index];
}

export function deleteSession(sessionId: string): void {
  writeSessions(readSessions().filter((session) => session.id !== sessionId));
}
