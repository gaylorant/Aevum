import {
  CHAT_HISTORY_KEY,
  CHAT_SESSION_CONTEXT_KEY,
} from "@/lib/constants";
import type { ChatMessage, SessionContext } from "@/types/chat";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function createSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateSessionContext(): SessionContext {
  const existing = readJson<SessionContext | null>(CHAT_SESSION_CONTEXT_KEY, null);
  if (existing?.sessionId) {
    return existing;
  }

  const context: SessionContext = {
    sessionId: createSessionId(),
    createdAt: new Date().toISOString(),
  };
  writeJson(CHAT_SESSION_CONTEXT_KEY, context);
  return context;
}

export function loadChatHistory(): ChatMessage[] {
  return readJson<ChatMessage[]>(CHAT_HISTORY_KEY, []);
}

export function saveChatHistory(messages: ChatMessage[]): void {
  writeJson(CHAT_HISTORY_KEY, messages);
}

export function wipeChatSession(): void {
  localStorage.removeItem(CHAT_SESSION_CONTEXT_KEY);
  localStorage.removeItem(CHAT_HISTORY_KEY);
}

export function getLastUserMessage(messages: ChatMessage[]): ChatMessage | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === "user") {
      return messages[i];
    }
  }
  return null;
}
