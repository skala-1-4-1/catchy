export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

const STORAGE_KEY = "review-chat-sessions";

function readSessions(): ChatSession[] {
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

function writeSessions(sessions: ChatSession[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function makeTitle(content: string): string {
  const trimmed = content.trim().replace(/\s+/g, " ");
  if (!trimmed) return "새 대화";
  return trimmed.length > 24 ? `${trimmed.slice(0, 24)}...` : trimmed;
}

export function getSessions(): ChatSession[] {
  return readSessions().sort((a, b) => b.createdAt - a.createdAt);
}

export function getSession(sessionId: string): ChatSession | null {
  return readSessions().find((session) => session.id === sessionId) ?? null;
}

export function createSession(firstMessage: string): ChatSession {
  const session: ChatSession = {
    id: crypto.randomUUID(),
    title: makeTitle(firstMessage),
    createdAt: Date.now(),
    messages: [{ role: "user", content: firstMessage }],
  };
  const sessions = readSessions();
  sessions.push(session);
  writeSessions(sessions);
  return session;
}

export function addMessageToSession(
  sessionId: string,
  message: ChatMessage,
): ChatSession | null {
  const sessions = readSessions();
  const index = sessions.findIndex((session) => session.id === sessionId);
  if (index === -1) return null;

  sessions[index] = {
    ...sessions[index],
    messages: [...sessions[index].messages, message],
  };
  writeSessions(sessions);
  return sessions[index];
}

export function deleteSession(sessionId: string): void {
  writeSessions(readSessions().filter((session) => session.id !== sessionId));
}
